import { assertNever } from "./assert";
import type {
  CreateChildOp,
  LiveNode,
  Op,
  SerializedCrdt,
  StorageUpdate,
} from "./types";
import { OpCode } from "./types";

export type ApplyResult =
  | { reverse: Op[]; modified: StorageUpdate }
  | { modified: false };

export interface Doc {
  //             ^^^ FIXME: Find a better name for "Doc". This is more or less
  //                        the "RoomContext".
  roomId: string;
  generateId: () => string;
  generateOpId: () => string;
  getItem: (id: string) => LiveNode | undefined;
  addItem: (id: string, liveItem: LiveNode) => void;
  deleteItem: (id: string) => void;

  /**
   * Dispatching has three responsibilities:
   * - Sends serialized ops to the WebSocket servers
   * - Add reverse operations to the undo/redo stack
   * - Notify room subscribers with updates (in-client, no networking)
   */
  dispatch: (
    ops: Op[],
    reverseOps: Op[],
    storageUpdates: Map<string, StorageUpdate>
  ) => void;
}

export enum OpSource {
  UNDOREDO_RECONNECT,
  REMOTE,
  ACK,
}

// TODO Temporary helper to help convert from AbstractCrdt -> LiveNode, only
// needed for within this module. The reason is that AbstractCrdt is an
// _abstract_ type, and in our LiveNode union we exhaustively include all
// concrete types.
// TODO Remove me later, if we inline the abstract base methods in the concrete
// classes.
function crdtAsLiveNode(
  value: AbstractCrdt // eslint-disable-line no-restricted-syntax
): LiveNode {
  return value as LiveNode;
}

type HasParent = {
  readonly tag: "HasParent";
  readonly node: LiveNode;
  readonly key: string;
};

type NoParent = {
  readonly tag: "NoParent";
};

type Orphaned = {
  readonly tag: "Orphaned";
  readonly oldKey: string;
};

/**
 * Represents the possible states of the parent field pointers.
 */
type ParentInfo =
  // Both the parent node and the parent key are set. This is a normal child.
  | HasParent

  // Neither are set. This is either the root node (if attached to a document),
  // or it's a dangling node that hasn't been attached yet.
  | NoParent

  // -------------------------------------------------------------------------
  // TODO Refactor this state away!
  // -------------------------------------------------------------------------
  // Tricky case! This state is used after the node is detached from its
  // parent, but we still need to retain the parent key that it was originally
  // attached under. For example we rely on this to derive the reverse Op to
  // add. We should be able to get rid of this case by structuring the code
  // differently!
  | Orphaned;

export abstract class AbstractCrdt {
  //                  ^^^^^^^^^^^^ TODO: Make this an interface
  private __doc?: Doc;
  private __id?: string;

  private __parentInfo: ParentInfo = { tag: "NoParent" };

  /**
   * @internal
   */
  _getParentKeyOrThrow(): string {
    const p = this.__parentInfo;
    switch (p.tag) {
      case "HasParent":
        return p.key;

      case "NoParent":
        throw new Error("Parent key is missing");

      case "Orphaned":
        return p.oldKey;

      default:
        return assertNever(p, "Unknown state");
    }
  }

  /**
   * @internal
   */
  protected get _doc(): Doc | undefined {
    return this.__doc;
  }

  get roomId(): string | null {
    return this.__doc ? this.__doc.roomId : null;
  }

  /**
   * @internal
   */
  get _id(): string | undefined {
    return this.__id;
  }

  /**
   * @internal
   */
  get _parentInfo(): ParentInfo {
    return this.__parentInfo;
  }

  /**
   * @internal
   */
  get _parentNode(): LiveNode | null {
    const p = this.__parentInfo;
    switch (p.tag) {
      case "HasParent":
        return p.node;

      case "NoParent":
        return null;

      case "Orphaned":
        return null;

      default:
        return assertNever(p, "Unknown state");
    }
  }

  /**
   * @internal
   */
  get _parentKey(): string | null {
    const p = this.__parentInfo;
    switch (p.tag) {
      case "HasParent":
        return p.key;

      case "NoParent":
        return null;

      case "Orphaned":
        return p.oldKey;

      default:
        return assertNever(p, "Unknown state");
    }
  }

  /**
   * @internal
   */
  _apply(op: Op, _isLocal: boolean): ApplyResult {
    switch (op.type) {
      case OpCode.DELETE_CRDT: {
        if (this._parentNode != null && this._parentKey != null) {
          return this._parentNode._detachChild(crdtAsLiveNode(this));
        }

        return { modified: false };
      }
    }

    return { modified: false };
  }

  /**
   * @internal
   */
  _setParentLink(newParentNode: LiveNode, newParentKey: string): void {
    const curr = this.__parentInfo;
    switch (curr.tag) {
      case "HasParent":
        if (curr.node !== newParentNode) {
          throw new Error("Cannot attach parent if it already exist");
        } else {
          // Ignore
          this.__parentInfo = {
            tag: "HasParent",
            node: crdtAsLiveNode(newParentNode),
            key: newParentKey,
          };
          return;
        }

      case "Orphaned":
      case "NoParent": {
        this.__parentInfo = {
          tag: "HasParent",
          node: crdtAsLiveNode(newParentNode),
          key: newParentKey,
        };
        return;
      }

      default:
        return assertNever(curr, "Unknown state");
    }
  }

  /**
   * @internal
   */
  _attach(id: string, doc: Doc): void {
    if (this.__id || this.__doc) {
      throw new Error("Cannot attach if CRDT is already attached");
    }

    doc.addItem(id, crdtAsLiveNode(this));

    this.__id = id;
    this.__doc = doc;
  }

  /**
   * @internal
   */
  abstract _attachChild(op: CreateChildOp, source: OpSource): ApplyResult;

  /**
   * @internal
   */
  _detach(): void {
    if (this.__doc && this.__id) {
      this.__doc.deleteItem(this.__id);
    }

    // NOTE: Ideally, we should be able to set `this.__parentInfo = undefined`
    // here, but for now we'll need to retain the last known parent key as
    // a kind of memento :(
    const curr = this.__parentInfo;
    switch (curr.tag) {
      case "HasParent": {
        this.__parentInfo = {
          tag: "Orphaned",
          oldKey: curr.key,
        };
        break;
      }

      case "NoParent": {
        // throw new Error("Node is already detached. Cannot detach twice.");
        this.__parentInfo = { tag: "NoParent" };
        break;
      }

      case "Orphaned": {
        // throw new Error("Node is already detached. Cannot detach twice.");
        this.__parentInfo = { tag: "Orphaned", oldKey: curr.oldKey };
        break;
      }

      default:
        assertNever(curr, "Unknown state");
    }

    this.__doc = undefined;
  }

  /**
   * @internal
   */
  abstract _detachChild(crdt: LiveNode): ApplyResult;
  /**
   * @internal
   */
  abstract _serialize(parentId: string, parentKey: string, doc?: Doc): Op[];

  /**
   * @internal
   */
  abstract _toSerializedCrdt(): SerializedCrdt;
}
