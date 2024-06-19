import type { LsonObject } from "../crdts/Lson";
import type { Json, JsonObject } from "../lib/Json";
import type { BaseActivitiesData } from "../protocol/BaseActivitiesData";
import type { BaseRoomInfo } from "../protocol/BaseRoomInfo";
import type { BaseUserMeta } from "../protocol/BaseUserMeta";
import type { BaseMetadata } from "../protocol/Comments";

declare global {
  /**
   * Namespace for user-defined Liveblocks types.
   */
  export interface Liveblocks {
    [key: string]: unknown;
  }
}

// NOTE: When extending this list, make sure to also add respective error
// message docs (in ../../docs/pages/errors/*.mdx).
type ExtendableTypes =
  | "Presence"
  | "Storage"
  | "UserMeta"
  | "RoomEvent"
  | "ThreadMetadata"
  | "RoomInfo"
  | "ActivitiesData";

type MakeErrorString<
  K extends ExtendableTypes,
  Reason extends string = "does not match its requirements",
> = `The type you provided for '${K}' ${Reason}. To learn how to fix this, see https://liveblocks.io/docs/errors/${K}`;

type GetOverride<
  K extends ExtendableTypes,
  B,
  Reason extends string = "does not match its requirements",
> = GetOverrideOrErrorValue<K, B, MakeErrorString<K, Reason>>;

type GetOverrideOrErrorValue<
  K extends ExtendableTypes,
  B,
  ErrorType,
> = unknown extends Liveblocks[K]
  ? B
  : Liveblocks[K] extends B
    ? Liveblocks[K]
    : ErrorType;

// ------------------------------------------------------------------------

export type DP = GetOverride<
  "Presence",
  JsonObject,
  "is not a valid JSON object"
>;

export type DS = GetOverride<
  "Storage",
  LsonObject,
  "is not a valid LSON value"
>;

export type DU = GetOverride<"UserMeta", BaseUserMeta>;

export type DE = GetOverride<"RoomEvent", Json, "is not a valid JSON value">;

export type DM = GetOverride<"ThreadMetadata", BaseMetadata>;

export type DRI = GetOverride<"RoomInfo", BaseRoomInfo>;
export type DAD = GetOverride<"ActivitiesData", BaseActivitiesData>;
