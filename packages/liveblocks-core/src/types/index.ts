import type { JsonObject } from "./Json";
import type { LsonObject } from "./Lson";

export type RoomInitializers<
  TPresence extends JsonObject,
  TStorage extends LsonObject
> = Resolve<{
  /**
   * The initial Presence to use and announce when you enter the Room. The
   * Presence is available on all users in the Room (me & others).
   */
  initialPresence: TPresence | ((roomId: string) => TPresence);
  /**
   * The initial Storage to use when entering a new Room.
   */
  initialStorage?: TStorage | ((roomId: string) => TStorage);
  /**
   * Whether or not the room connects to Liveblock servers. Default is true.
   *
   * Usually set to false when the client is used from the server to not call
   * the authentication endpoint or connect via WebSocket.
   */
  shouldInitiallyConnect?: boolean;
}>;

export type AuthorizeResponse = {
  token: string;
};

export type Authentication =
  | {
      type: "public";
      publicApiKey: string;
      url: string;
    }
  | {
      type: "private";
      url: string;
    }
  | {
      type: "custom";
      callback: (room: string) => Promise<AuthorizeResponse>;
    };

export enum WebsocketCloseCodes {
  CLOSE_ABNORMAL = 1006,

  INVALID_MESSAGE_FORMAT = 4000,
  NOT_ALLOWED = 4001,
  MAX_NUMBER_OF_MESSAGES_PER_SECONDS = 4002,
  MAX_NUMBER_OF_CONCURRENT_CONNECTIONS = 4003,
  MAX_NUMBER_OF_MESSAGES_PER_DAY_PER_APP = 4004,
  MAX_NUMBER_OF_CONCURRENT_CONNECTIONS_PER_ROOM = 4005,
  CLOSE_WITHOUT_RETRY = 4999,
}
