import { freeze } from "../lib/freeze";
import type { JsonObject } from "../lib/Json";
import { asArrayWithLegacyMethods } from "../lib/LegacyArray";
import { compact, compactObject } from "../lib/utils";
import type { BaseUserMeta } from "../protocol/BaseUserMeta";
import type { Others } from "../types/Others";
import type { User } from "../types/User";
import { ImmutableRef, merge } from "./ImmutableRef";

type Connection<TUserMeta extends BaseUserMeta> = {
  readonly connectionId: number;
  readonly id: TUserMeta["id"];
  readonly info: TUserMeta["info"];
  readonly isReadOnly: boolean;
};

function makeUser<TPresence extends JsonObject, TUserMeta extends BaseUserMeta>(
  conn: Connection<TUserMeta>,
  presence: TPresence
): User<TPresence, TUserMeta> {
  return freeze(compactObject({ ...conn, presence }));
}

export class OthersRef<
  TPresence extends JsonObject,
  TUserMeta extends BaseUserMeta
> extends ImmutableRef<Others<TPresence, TUserMeta>> {
  // To track "others"
  #connections: { [connectionId: number]: Connection<TUserMeta> };
  #presences: { [connectionId: number]: TPresence };

  //
  // --------------------------------------------------------------
  //
  // CACHES
  // All of these are derived/cached data. Never set these directly.
  //
  // TODO Refactor this internal cache away using the ImmutableRef
  // abstraction/helper. Manually maintaining these caches should no longer be
  // necessary.
  //
  #users: { [connectionId: number]: User<TPresence, TUserMeta> };
  //
  // --------------------------------------------------------------
  //

  constructor() {
    super();

    // Others
    this.#connections = {};
    this.#presences = {};
    this.#users = {};
  }

  protected _toImmutable(): Readonly<Others<TPresence, TUserMeta>> {
    const users = compact(
      Object.keys(this.#presences).map((connectionId) =>
        this.getUser(Number(connectionId))
      )
    );

    return asArrayWithLegacyMethods(users);
  }

  clearOthers(): void {
    this.#connections = {};
    this.#presences = {};
    this.#users = {};
    this.invalidate();
  }

  #getUser(connectionId: number): User<TPresence, TUserMeta> | undefined {
    const conn = this.#connections[connectionId];
    const presence = this.#presences[connectionId];
    if (conn !== undefined && presence !== undefined) {
      return makeUser(conn, presence);
    }

    return undefined;
  }

  getUser(connectionId: number): User<TPresence, TUserMeta> | undefined {
    const cachedUser = this.#users[connectionId];
    if (cachedUser) {
      return cachedUser;
    }

    const computedUser = this.#getUser(connectionId);
    if (computedUser) {
      this.#users[connectionId] = computedUser;
      return computedUser;
    }

    return undefined;
  }

  #invalidateUser(connectionId: number): void {
    if (this.#users[connectionId] !== undefined) {
      delete this.#users[connectionId];
    }
    this.invalidate();
  }

  /**
   * Records a known connection. This records the connection ID and the
   * associated metadata.
   */
  setConnection(
    connectionId: number,
    metaUserId: TUserMeta["id"],
    metaUserInfo: TUserMeta["info"],
    metaIsReadonly: boolean
  ): void {
    this.#connections[connectionId] = freeze({
      connectionId,
      id: metaUserId,
      info: metaUserInfo,
      isReadOnly: metaIsReadonly,
    });
    if (this.#presences[connectionId] !== undefined) {
      this.#invalidateUser(connectionId);
    }
  }

  /**
   * Removes a known connectionId. Removes both the connection's metadata and
   * the presence information.
   */
  removeConnection(connectionId: number): void {
    delete this.#connections[connectionId];
    delete this.#presences[connectionId];
    this.#invalidateUser(connectionId);
  }

  /**
   * Stores a new user from a full presence update. If the user already exists,
   * its known presence data is overwritten.
   */
  setOther(connectionId: number, presence: TPresence): void {
    this.#presences[connectionId] = freeze(compactObject(presence));
    if (this.#connections[connectionId] !== undefined) {
      this.#invalidateUser(connectionId);
    }
  }

  /**
   * Patches the presence data for an existing "other". If we don't know the
   * initial presence data for this user yet, discard this patch and await the
   * full .setOther() call first.
   */
  patchOther(connectionId: number, patch: Partial<TPresence>): void {
    const oldPresence = this.#presences[connectionId];
    if (oldPresence === undefined) {
      return;
    }

    const newPresence = merge(oldPresence, patch);
    if (oldPresence !== newPresence) {
      this.#presences[connectionId] = freeze(newPresence);
      this.#invalidateUser(connectionId);
    }
  }
}
