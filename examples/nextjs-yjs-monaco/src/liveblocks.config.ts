import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";
import LiveblocksProvider from "@liveblocks/yjs";

// Try changing the lostConnectionTimeout value to increase
// or reduct the time it takes to reconnect
const client = createClient({
  // authEndpoint: "/api/liveblocks-auth",
  authEndpoint: (_roomId?: string) =>
    Promise.resolve({
      token:
        "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjdiNmM5Y2E0NDViZGJiNzMwNTliMTZiZjRhNTljMGE1In0.eyJpYXQiOjE3MDYyNzMyNzEsImV4cCI6MTcwNjM1OTY3MSwiayI6ImFjYyIsInBpZCI6IjYzNTc4ZWFlYzM4ODRlYjYxZWZkNjc1NSIsInVpZCI6InVzZXItNiIsInVpIjp7Im5hbWUiOiJWaW5jZW50IiwicGljdHVyZSI6Imh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS84Mzg0ND92PTQifSwicGVybXMiOnsibmV4dGpzLXdoaXRlYm9hcmQtYWR2YW5jZWQiOlsicm9vbTp3cml0ZSIsImNvbW1lbnRzOndyaXRlIl19LCJtY3ByIjoyMH0.mTsFCevySWF1n-eU1eXrkurFyDwjSRcvyhJ8onPAyT0c4GAw3sj6e9a7FSi3Dv_NkPifKM6KH5l7P_Uc5yXxnDyv21Fbl4pa3QLhOzsk6Wq9PBhjXB7bMZYZIZ4iNg4302Kjczr5agNDpCyW1duDEvFKd38-48H1PVgIZ81zDkH1EGdfiI3NmRN60BkHfsZbrqlwpAY7dGjvcX392yygIscCmonztiwGoe1GDoLuWhCgkrO4PcsAeb7Gx-PWmYuchKp_7Y4357ywObyi0PaImDetU9s1bAhVYGOJSsROFtK-v_yWvrbaFLzGk_1DD3cI5C5mpKC9jmGovb_AFy0161IQBPdzuU4w3DZVQbXTGuz5RfEs9xrqe_xirxajjhrnbz3ElkCUQZFYEKI3LAufF7-e6DvZ38R0zXDWLTFgBVa592lcUpnqzfSOp4-dnL4xf7G8XY-U-NaG2A8HM8ru5hehUSvqW7-44PqCT-q1w7KmY0JvqcFlrMWF4Ruot44XlpG7rgUuLlneFrJbQxTPjja_yIz5Se8SVQkbBCeRxgVBx7crEug7cnIkLguYQjLPLlWVPy4Gb0gNLalENyP8yNQBHZJSJsvJoCe3dogyilF10aH-T89VAtQ5n-1MrwcmurfiDZg7xUxVEjm6hA05jwCeIYZsUNI6NeXJQxoNUEU",
    }),

  // @ts-expect-error
  baseUrl: "http://127.0.0.1:3333/",
});

// Presence represents the properties that exist on every user in the Room
// and that will automatically be kept in sync. Accessible through the
// `user.presence` property. Must be JSON-serializable.
type Presence = {
  // cursor: { x: number; y: number } | null;
  // ...
};

// Optionally, Storage represents the shared document that persists in the
// Room, even after all users leave. Fields under Storage typically are
// LiveList, LiveMap, LiveObject instances, for which updates are
// automatically persisted and synced to all connected clients.
type Storage = {
  // author: LiveObject<{ firstName: string, lastName: string }>,
  // ...
};

// Optionally, UserMeta represents static/readonly metadata on each user, as
// provided by your own custom auth back end (if used). Useful for data that
// will not change during a session, like a user's name or avatar.
type UserMeta = {
  id: string; // Accessible through `user.id`
  info: {
    name: string;
    color: string;
    picture: string;
  }; // Accessible through `user.info`
};

export type UserAwareness = {
  user?: UserMeta["info"];
};

export type AwarenessList = [number, UserAwareness][];

// Optionally, the type of custom events broadcast and listened to in this
// room. Use a union for multiple events. Must be JSON-serializable.
type RoomEvent = {
  // type: "NOTIFICATION",
  // ...
};

export type TypedLiveblocksProvider = LiveblocksProvider<
  Presence,
  Storage,
  UserMeta,
  RoomEvent
>;

export const {
  suspense: {
    RoomProvider,
    useRoom,
    useMyPresence,
    useUpdateMyPresence,
    useSelf,
    useOthers,
    useOthersMapped,
    useOthersConnectionIds,
    useOther,
    useBroadcastEvent,
    useEventListener,
    useErrorListener,
    useStorage,
    useObject,
    useMap,
    useList,
    useBatch,
    useHistory,
    useUndo,
    useRedo,
    useCanUndo,
    useCanRedo,
    useMutation,
    useStatus,
    useLostConnectionListener,
  },
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent>(client);
