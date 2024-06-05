import type {
  BaseUserMeta,
  BroadcastOptions,
  History,
  Json,
  JsonObject,
  LiveObject,
  LostConnectionEvent,
  LsonObject,
  OthersEvent,
  Room,
  RoomNotificationSettings,
  Status,
  User,
} from "@liveblocks/client";
import type {
  BaseMetadata,
  CommentBody,
  CommentData,
  DRI,
  InboxNotificationData,
  LiveblocksError,
  PartialNullable,
  QueryMetadata,
  Resolve,
  RoomEventMessage,
  RoomInitializers,
  ThreadData,
  ToImmutable,
} from "@liveblocks/core";

export type UseThreadsOptions<M extends BaseMetadata> = {
  /**
   * The query (including metadata) to filter the threads by. If provided, only threads
   * that match the query will be returned. If not provided, all threads will be returned.
   */
  query?: {
    /**
     * The metadata to filter the threads by. If provided, only threads with metadata that matches
     * the provided metadata will be returned. If not provided, all threads will be returned.
     */
    metadata?: Partial<QueryMetadata<M>>;
  };

  /**
   * Whether to scroll to a comment on load based on the URL hash. Defaults to `true`.
   *
   * @example
   * Given the URL `https://example.com/my-room#cm_xxx`, the `cm_xxx` comment will be
   * scrolled to on load if it exists in the page.
   */
  scrollOnLoad?: boolean;
};

import type { PropsWithChildren, Provider } from "react";

import type { CommentsError } from "./comments/errors";

export type UserStateLoading = {
  isLoading: true;
  user?: never;
  error?: never;
};

export type UserStateError = {
  isLoading: false;
  user?: never;
  error: Error;
};

export type UserStateSuccess<T> = {
  isLoading: false;
  user: T;
  error?: never;
};

export type UserState<T> =
  | UserStateLoading
  | UserStateError
  | UserStateSuccess<T>;

export type RoomInfoStateLoading = {
  isLoading: true;
  info?: never;
  error?: never;
};

export type RoomInfoStateError = {
  isLoading: false;
  info?: never;
  error: Error;
};

export type RoomInfoStateSuccess = {
  isLoading: false;
  info: DRI;
  error?: never;
};

export type RoomInfoState =
  | RoomInfoStateLoading
  | RoomInfoStateError
  | RoomInfoStateSuccess;

export type CreateThreadOptions<M extends BaseMetadata> =
  Record<string, never> extends M
    ? { body: CommentBody; metadata?: M }
    : { body: CommentBody; metadata: M };

export type EditThreadMetadataOptions<M extends BaseMetadata> = {
  threadId: string;
  metadata: PartialNullable<M>;
};

export type CreateCommentOptions = {
  threadId: string;
  body: CommentBody;
};

export type EditCommentOptions = {
  threadId: string;
  commentId: string;
  body: CommentBody;
};

export type DeleteCommentOptions = {
  threadId: string;
  commentId: string;
};

export type CommentReactionOptions = {
  threadId: string;
  commentId: string;
  emoji: string;
};

export type ThreadsStateLoading = {
  isLoading: true;
  threads?: never;
  error?: never;
};

export type ThreadsStateResolved<M extends BaseMetadata> = {
  isLoading: false;
  threads: ThreadData<M>[];
  error?: Error;
};

export type ThreadsStateSuccess<M extends BaseMetadata> = {
  isLoading: false;
  threads: ThreadData<M>[];
  error?: never;
};

export type ThreadsState<M extends BaseMetadata> =
  | ThreadsStateLoading
  | ThreadsStateResolved<M>;

export type InboxNotificationsStateLoading = {
  isLoading: true;
  inboxNotifications?: never;
  error?: never;
};

export type InboxNotificationsStateResolved = {
  isLoading: false;
  inboxNotifications: InboxNotificationData[];
  error?: Error;
};

export type InboxNotificationsStateSuccess = {
  isLoading: false;
  inboxNotifications: InboxNotificationData[];
  error?: never;
};

export type InboxNotificationsStateError = {
  isLoading: false;
  inboxNotifications?: never;
  error: Error;
};

export type InboxNotificationsState =
  | InboxNotificationsStateLoading
  | InboxNotificationsStateResolved
  | InboxNotificationsStateError;

export type UnreadInboxNotificationsCountStateLoading = {
  isLoading: true;
  count?: never;
  error?: never;
};

export type UnreadInboxNotificationsCountStateSuccess = {
  isLoading: false;
  count: number;
  error?: never;
};

export type UnreadInboxNotificationsCountStateError = {
  isLoading: false;
  count?: never;
  error: Error;
};

export type UnreadInboxNotificationsCountState =
  | UnreadInboxNotificationsCountStateLoading
  | UnreadInboxNotificationsCountStateSuccess
  | UnreadInboxNotificationsCountStateError;

export type RoomNotificationSettingsStateLoading = {
  isLoading: true;
  settings?: never;
  error?: never;
};

export type RoomNotificationSettingsStateError = {
  isLoading: false;
  settings?: never;
  error: Error;
};

export type RoomNotificationSettingsStateSuccess = {
  isLoading: false;
  settings: RoomNotificationSettings;
  error?: never;
};

export type RoomNotificationSettingsState =
  | RoomNotificationSettingsStateLoading
  | RoomNotificationSettingsStateError
  | RoomNotificationSettingsStateSuccess;

export type RoomProviderProps<
  P extends JsonObject,
  S extends LsonObject,
> = Resolve<
  {
    /**
     * The id of the room you want to connect to
     */
    id: string;
    children: React.ReactNode;

    /**
     * Whether or not the room should connect to Liveblocks servers
     * when the RoomProvider is rendered.
     *
     * By default equals to `typeof window !== "undefined"`,
     * meaning the RoomProvider tries to connect to Liveblocks servers
     * only on the client side.
     */
    autoConnect?: boolean;

    /**
     * If you're on React 17 or lower, pass in a reference to
     * `ReactDOM.unstable_batchedUpdates` or
     * `ReactNative.unstable_batchedUpdates` here.
     *
     * @example
     * import { unstable_batchedUpdates } from "react-dom";
     *
     * <RoomProvider ... unstable_batchedUpdates={unstable_batchedUpdates} />
     *
     * This will prevent you from running into the so-called "stale props"
     * and/or "zombie child" problem that React 17 and lower can suffer from.
     * Not necessary when you're on React v18 or later.
     */
    unstable_batchedUpdates?: (cb: () => void) => void;
  } & RoomInitializers<P, S>
>;

/**
 * For any function type, returns a similar function type, but without the
 * first argument.
 */
export type OmitFirstArg<F> = F extends (
  first: any,
  ...rest: infer A
) => infer R
  ? (...args: A) => R
  : never;

export type MutationContext<
  P extends JsonObject,
  S extends LsonObject,
  U extends BaseUserMeta,
> = {
  storage: LiveObject<S>;
  self: User<P, U>;
  others: readonly User<P, U>[];
  setMyPresence: (
    patch: Partial<P>,
    options?: { addToHistory: boolean }
  ) => void;
};

export type ThreadSubscription =
  // The user is not subscribed to the thread
  | {
      status: "not-subscribed";
      unreadSince?: never;
    }
  // The user is subscribed to the thread but has never read it
  | {
      status: "subscribed";
      unreadSince: null;
    }
  // The user is subscribed to the thread and has read it
  | {
      status: "subscribed";
      unreadSince: Date;
    };

export type SharedContextBundle<U extends BaseUserMeta> = {
  classic: {
    /**
     * Returns user info from a given user ID.
     *
     * @example
     * const { user, error, isLoading } = useUser("user-id");
     */
    useUser(userId: string): UserState<U["info"]>;

    /**
     * Returns room info from a given room ID.
     *
     * @example
     * const { info, error, isLoading } = useRoomInfo("room-id");
     */
    useRoomInfo(roomId: string): RoomInfoState;
  };

  suspense: {
    /**
     * Returns user info from a given user ID.
     *
     * @example
     * const { user } = useUser("user-id");
     */
    useUser(userId: string): UserStateSuccess<U["info"]>;

    /**
     * Returns room info from a given room ID.
     *
     * @example
     * const { info } = useRoomInfo("room-id");
     */
    useRoomInfo(roomId: string): RoomInfoStateSuccess;
  };
};

/**
 * Properties that are the same in RoomContext and RoomContext["suspense"].
 */
type RoomContextBundleCommon<
  P extends JsonObject,
  S extends LsonObject,
  U extends BaseUserMeta,
  E extends Json,
  M extends BaseMetadata,
> = {
  /**
   * You normally don't need to directly interact with the RoomContext, but
   * it can be necessary if you're building an advanced app where you need to
   * set up a context bridge between two React renderers.
   */
  RoomContext: React.Context<Room<P, S, U, E, M> | null>;

  /**
   * Makes a Room available in the component hierarchy below.
   * Joins the room when the component is mounted, and automatically leaves
   * the room when the component is unmounted.
   */
  RoomProvider(props: RoomProviderProps<P, S>): JSX.Element;

  /**
   * Returns the Room of the nearest RoomProvider above in the React component
   * tree.
   */
  useRoom(): Room<P, S, U, E, M>;

  /**
   * Returns the current connection status for the Room, and triggers
   * a re-render whenever it changes. Can be used to render a status badge.
   */
  useStatus(): Status;

  /**
   * @deprecated It's recommended to use `useMutation` for writing to Storage,
   * which will automatically batch all mutations.
   *
   * Returns a function that batches modifications made during the given function.
   * All the modifications are sent to other clients in a single message.
   * All the modifications are merged in a single history item (undo/redo).
   * All the subscribers are called only after the batch is over.
   */
  useBatch<T>(): (callback: () => T) => T;

  /**
   * Returns a callback that lets you broadcast custom events to other users in the room
   *
   * @example
   * const broadcast = useBroadcastEvent();
   *
   * broadcast({ type: "CUSTOM_EVENT", data: { x: 0, y: 0 } });
   */
  useBroadcastEvent(): (event: E, options?: BroadcastOptions) => void;

  /**
   * Get informed when users enter or leave the room, as an event.
   *
   * @example
   * useOthersListener({ type, user, others }) => {
   *   if (type === 'enter') {
   *     // `user` has joined the room
   *   } else if (type === 'leave') {
   *     // `user` has left the room
   *   }
   * })
   */
  useOthersListener(callback: (event: OthersEvent<P, U>) => void): void;

  /**
   * Get informed when reconnecting to the Liveblocks servers is taking
   * longer than usual. This typically is a sign of a client that has lost
   * internet connectivity.
   *
   * This isn't problematic (because the Liveblocks client is still trying to
   * reconnect), but it's typically a good idea to inform users about it if
   * the connection takes too long to recover.
   *
   * @example
   * useLostConnectionListener(event => {
   *   if (event === 'lost') {
   *     toast.warn('Reconnecting to the Liveblocks servers is taking longer than usual...')
   *   } else if (event === 'failed') {
   *     toast.warn('Reconnecting to the Liveblocks servers failed.')
   *   } else if (event === 'restored') {
   *     toast.clear();
   *   }
   * })
   */
  useLostConnectionListener(
    callback: (event: LostConnectionEvent) => void
  ): void;

  /**
   * useErrorListener is a React hook that allows you to respond to potential room
   * connection errors.
   *
   * @example
   * useErrorListener(er => {
   *   console.error(er);
   * })
   */
  useErrorListener(callback: (err: LiveblocksError) => void): void;

  /**
   * useEventListener is a React hook that allows you to respond to events broadcast
   * by other users in the room.
   *
   * @example
   * useEventListener(({ connectionId, event }) => {
   *   if (event.type === "CUSTOM_EVENT") {
   *     // Do something
   *   }
   * });
   */
  useEventListener(callback: (data: RoomEventMessage<P, U, E>) => void): void;

  /**
   * Returns the room.history
   */
  useHistory(): History;

  /**
   * Returns a function that undoes the last operation executed by the current client.
   * It does not impact operations made by other clients.
   */
  useUndo(): () => void;

  /**
   * Returns a function that redoes the last operation executed by the current client.
   * It does not impact operations made by other clients.
   */
  useRedo(): () => void;

  /**
   * Returns whether there are any operations to undo.
   */
  useCanUndo(): boolean;

  /**
   * Returns whether there are any operations to redo.
   */
  useCanRedo(): boolean;

  /**
   * Returns the mutable (!) Storage root. This hook exists for
   * backward-compatible reasons.
   *
   * @example
   * const [root] = useStorageRoot();
   */
  useStorageRoot(): [root: LiveObject<S> | null];

  /**
   * Returns the presence of the current user of the current room, and a function to update it.
   * It is different from the setState function returned by the useState hook from React.
   * You don't need to pass the full presence object to update it.
   *
   * @example
   * const [myPresence, updateMyPresence] = useMyPresence();
   * updateMyPresence({ x: 0 });
   * updateMyPresence({ y: 0 });
   *
   * // At the next render, "myPresence" will be equal to "{ x: 0, y: 0 }"
   */
  useMyPresence(): [
    P,
    (patch: Partial<P>, options?: { addToHistory: boolean }) => void,
  ];

  /**
   * useUpdateMyPresence is similar to useMyPresence but it only returns the function to update the current user presence.
   * If you don't use the current user presence in your component, but you need to update it (e.g. live cursor), it's better to use useUpdateMyPresence to avoid unnecessary renders.
   *
   * @example
   * const updateMyPresence = useUpdateMyPresence();
   * updateMyPresence({ x: 0 });
   * updateMyPresence({ y: 0 });
   *
   * // At the next render, the presence of the current user will be equal to "{ x: 0, y: 0 }"
   */
  useUpdateMyPresence(): (
    patch: Partial<P>,
    options?: { addToHistory: boolean }
  ) => void;

  /**
   * Create a callback function that lets you mutate Liveblocks state.
   *
   * The first argument that gets passed into your callback will be
   * a "mutation context", which exposes the following:
   *
   *   - `root` - The mutable Storage root.
   *              You can normal mutation on Live structures with this, for
   *              example: root.get('layers').get('layer1').set('fill',
   *              'red')
   *
   *   - `setMyPresence` - Call this with a new (partial) Presence value.
   *
   *   - `self` - A read-only version of the latest self, if you need it to
   *              compute the next state.
   *
   *   - `others` - A read-only version of the latest others list, if you
   *                need it to compute the next state.
   *
   * useMutation is like React's useCallback, except that the first argument
   * that gets passed into your callback will be a "mutation context".
   *
   * If you want get access to the immutable root somewhere in your mutation,
   * you can use `root.ToImmutable()`.
   *
   * @example
   * const fillLayers = useMutation(
   *   ({ root }, color: Color) => {
   *     ...
   *   },
   *   [],
   * );
   *
   * fillLayers('red');
   *
   * const deleteLayers = useMutation(
   *   ({ root }) => {
   *     ...
   *   },
   *   [],
   * );
   *
   * deleteLayers();
   */
  useMutation<
    F extends (context: MutationContext<P, S, U>, ...args: any[]) => any,
  >(
    callback: F,
    deps: readonly unknown[]
  ): OmitFirstArg<F>;

  /**
   * Returns an object that lets you get information about all the users
   * currently connected in the room.
   *
   * @example
   * const others = useOthers();
   *
   * // Example to map all cursors in JSX
   * return (
   *   <>
   *     {others.map((user) => {
   *        if (user.presence.cursor == null) {
   *          return null;
   *        }
   *        return <Cursor key={user.connectionId} cursor={user.presence.cursor} />
   *      })}
   *   </>
   * )
   */
  useOthers(): readonly User<P, U>[];

  /**
   * Extract arbitrary data based on all the users currently connected in the
   * room (except yourself).
   *
   * The selector function will get re-evaluated any time a user enters or
   * leaves the room, as well as whenever their presence data changes.
   *
   * The component that uses this hook will automatically re-render if your
   * selector function returns a different value from its previous run.
   *
   * By default `useOthers()` uses strict `===` to check for equality. Take
   * extra care when returning a computed object or list, for example when you
   * return the result of a .map() or .filter() call from the selector. In
   * those cases, you'll probably want to use a `shallow` comparison check.
   *
   * @example
   * const avatars = useOthers(users => users.map(u => u.info.avatar), shallow);
   * const cursors = useOthers(users => users.map(u => u.presence.cursor), shallow);
   * const someoneIsTyping = useOthers(users => users.some(u => u.presence.isTyping));
   *
   */
  useOthers<T>(
    selector: (others: readonly User<P, U>[]) => T,
    isEqual?: (prev: T, curr: T) => boolean
  ): T;

  /**
   * Returns an array of connection IDs. This matches the values you'll get by
   * using the `useOthers()` hook.
   *
   * Roughly equivalent to:
   *   useOthers((others) => others.map(other => other.connectionId), shallow)
   *
   * This is useful in particular to implement efficiently rendering components
   * for each user in the room, e.g. cursors.
   *
   * @example
   * const ids = useOthersConnectionIds();
   * // [2, 4, 7]
   */
  useOthersConnectionIds(): readonly number[];

  /**
   * Related to useOthers(), but optimized for selecting only "subsets" of
   * others. This is useful for performance reasons in particular, because
   * selecting only a subset of users also means limiting the number of
   * re-renders that will be triggered.
   *
   * @example
   * const avatars = useOthersMapped(user => user.info.avatar);
   * //    ^^^^^^^
   * //    { connectionId: number; data: string }[]
   *
   * The selector function you pass to useOthersMapped() is called an "item
   * selector", and operates on a single user at a time. If you provide an
   * (optional) "item comparison" function, it will be used to compare each
   * item pairwise.
   *
   * For example, to select multiple properties:
   *
   * @example
   * const avatarsAndCursors = useOthersMapped(
   *   user => [u.info.avatar, u.presence.cursor],
   *   shallow,  // 👈
   * );
   */
  useOthersMapped<T>(
    itemSelector: (other: User<P, U>) => T,
    itemIsEqual?: (prev: T, curr: T) => boolean
  ): ReadonlyArray<readonly [connectionId: number, data: T]>;

  /**
   * Given a connection ID (as obtained by using `useOthersConnectionIds`), you
   * can call this selector deep down in your component stack to only have the
   * component re-render if properties for this particular user change.
   *
   * @example
   * // Returns only the selected values re-renders whenever that selection changes)
   * const { x, y } = useOther(2, user => user.presence.cursor);
   */
  useOther<T>(
    connectionId: number,
    selector: (other: User<P, U>) => T,
    isEqual?: (prev: T, curr: T) => boolean
  ): T;

  /**
   * Returns a function that creates a thread with an initial comment, and optionally some metadata.
   *
   * @example
   * const createThread = useCreateThread();
   * createThread({ body: {}, metadata: {} });
   */
  useCreateThread(): (options: CreateThreadOptions<M>) => ThreadData<M>;

  /**
   * Returns a function that edits a thread's metadata.
   * To delete an existing metadata property, set its value to `null`.
   *
   * @example
   * const editThreadMetadata = useEditThreadMetadata();
   * editThreadMetadata({ threadId: "th_xxx", metadata: {} })
   */
  useEditThreadMetadata(): (options: EditThreadMetadataOptions<M>) => void;

  /**
   * Returns a function that adds a comment to a thread.
   *
   * @example
   * const createComment = useCreateComment();
   * createComment({ threadId: "th_xxx", body: {} });
   */
  useCreateComment(): (options: CreateCommentOptions) => CommentData;

  /**
   * Returns a function that edits a comment's body.
   *
   * @example
   * const editComment = useEditComment()
   * editComment({ threadId: "th_xxx", commentId: "cm_xxx", body: {} })
   */
  useEditComment(): (options: EditCommentOptions) => void;

  /**
   * Returns a function that deletes a comment.
   * If it is the last non-deleted comment, the thread also gets deleted.
   *
   * @example
   * const deleteComment = useDeleteComment();
   * deleteComment({ threadId: "th_xxx", commentId: "cm_xxx" })
   */
  useDeleteComment(): (options: DeleteCommentOptions) => void;

  /**
   * Returns a function that adds a reaction from a comment.
   *
   * @example
   * const addReaction = useAddReaction();
   * addReaction({ threadId: "th_xxx", commentId: "cm_xxx", emoji: "👍" })
   */
  useAddReaction(): (options: CommentReactionOptions) => void;

  /**
   * Returns a function that removes a reaction on a comment.
   *
   * @example
   * const removeReaction = useRemoveReaction();
   * removeReaction({ threadId: "th_xxx", commentId: "cm_xxx", emoji: "👍" })
   */
  useRemoveReaction(): (options: CommentReactionOptions) => void;

  /**
   * @beta
   *
   * Returns a function that updates the user's notification settings
   * for the current room.
   *
   * @example
   * const updateRoomNotificationSettings = useUpdateRoomNotificationSettings();
   * updateRoomNotificationSettings({ threads: "all" });
   */
  useUpdateRoomNotificationSettings(): (
    settings: Partial<RoomNotificationSettings>
  ) => void;

  /**
   * Returns a function that marks a thread as read.
   *
   * @example
   * const markThreadAsRead = useMarkThreadAsRead();
   * markThreadAsRead("th_xxx");
   */
  useMarkThreadAsRead(): (threadId: string) => void;

  /**
   * Returns the subscription status of a thread.
   *
   * @example
   * const { status, unreadSince } = useThreadSubscription("th_xxx");
   */
  useThreadSubscription(threadId: string): ThreadSubscription;
};

export type ThreadCreateCallback = (threadId: string) => void;
export type ThreadDeleteCallback = (threadId: string) => void;
export type ComposerFocusCallback = (
  commentId: string | undefined,
  threadId: string | undefined
) => void;
export type IsThreadActiveCallback = (threadId: string) => boolean;

/**
 * @private
 *
 * Private methods and variables used in the core internals, but as a user
 * of Liveblocks, NEVER USE ANY OF THESE DIRECTLY, because bad things
 * will probably happen if you do.
 */
type PrivateRoomContextApi = {
  useCommentsErrorListener<M extends BaseMetadata>(
    callback: (err: CommentsError<M>) => void
  ): void;
  // Thread create callback
  ThreadCreateCallbackProvider: Provider<ThreadCreateCallback | null>;
  useThreadCreateCallback(): ThreadCreateCallback | null;

  // Thread delete callback
  ThreadDeleteCallbackProvider: Provider<ThreadDeleteCallback | null>;
  useThreadDeleteCallback(): ThreadDeleteCallback | null;

  // Composer focus callback
  ComposerFocusCallbackProvider: Provider<ComposerFocusCallback | null>;
  useComposerFocusCallback(): ComposerFocusCallback | null;

  // Is thread active callback
  IsThreadActiveCallbackProvider: Provider<IsThreadActiveCallback | null>;
  useIsThreadActiveCallback(): IsThreadActiveCallback | null;
};

export type RoomContextBundle<
  P extends JsonObject,
  S extends LsonObject,
  U extends BaseUserMeta,
  E extends Json,
  M extends BaseMetadata,
> = Resolve<
  RoomContextBundleCommon<P, S, U, E, M> &
    SharedContextBundle<U>["classic"] & {
      /**
       * Extract arbitrary data from the Liveblocks Storage state, using an
       * arbitrary selector function.
       *
       * The selector function will get re-evaluated any time something changes in
       * Storage. The value returned by your selector function will also be the
       * value returned by the hook.
       *
       * The `root` value that gets passed to your selector function is
       * a immutable/readonly version of your Liveblocks storage root.
       *
       * The component that uses this hook will automatically re-render if the
       * returned value changes.
       *
       * By default `useStorage()` uses strict `===` to check for equality. Take
       * extra care when returning a computed object or list, for example when you
       * return the result of a .map() or .filter() call from the selector. In
       * those cases, you'll probably want to use a `shallow` comparison check.
       */
      useStorage<T>(
        selector: (root: ToImmutable<S>) => T,
        isEqual?: (prev: T | null, curr: T | null) => boolean
      ): T | null;

      /**
       * Gets the current user once it is connected to the room.
       *
       * @example
       * const me = useSelf();
       * const { x, y } = me.presence.cursor;
       */
      useSelf(): User<P, U> | null;

      /**
       * Extract arbitrary data based on the current user.
       *
       * The selector function will get re-evaluated any time your presence data
       * changes.
       *
       * The component that uses this hook will automatically re-render if your
       * selector function returns a different value from its previous run.
       *
       * By default `useSelf()` uses strict `===` to check for equality. Take extra
       * care when returning a computed object or list, for example when you return
       * the result of a .map() or .filter() call from the selector. In those
       * cases, you'll probably want to use a `shallow` comparison check.
       *
       * Will return `null` while Liveblocks isn't connected to a room yet.
       *
       * @example
       * const cursor = useSelf(me => me.presence.cursor);
       * if (cursor !== null) {
       *   const { x, y } = cursor;
       * }
       *
       */
      useSelf<T>(
        selector: (me: User<P, U>) => T,
        isEqual?: (prev: T, curr: T) => boolean
      ): T | null;

      /**
       * Returns the threads within the current room.
       *
       * @example
       * const { threads, error, isLoading } = useThreads();
       */
      useThreads(options?: UseThreadsOptions<M>): ThreadsState<M>;

      /**
       * @beta
       *
       * Returns the user's notification settings for the current room
       * and a function to update them.
       *
       * @example
       * const [{ settings }, updateSettings] = useRoomNotificationSettings();
       */
      useRoomNotificationSettings(): [
        RoomNotificationSettingsState,
        (settings: Partial<RoomNotificationSettings>) => void,
      ];

      suspense: Resolve<
        RoomContextBundleCommon<P, S, U, E, M> &
          SharedContextBundle<U>["suspense"] & {
            /**
             * Extract arbitrary data from the Liveblocks Storage state, using an
             * arbitrary selector function.
             *
             * The selector function will get re-evaluated any time something changes in
             * Storage. The value returned by your selector function will also be the
             * value returned by the hook.
             *
             * The `root` value that gets passed to your selector function is
             * a immutable/readonly version of your Liveblocks storage root.
             *
             * The component that uses this hook will automatically re-render if the
             * returned value changes.
             *
             * By default `useStorage()` uses strict `===` to check for equality. Take
             * extra care when returning a computed object or list, for example when you
             * return the result of a .map() or .filter() call from the selector. In
             * those cases, you'll probably want to use a `shallow` comparison check.
             */
            useStorage<T>(
              selector: (root: ToImmutable<S>) => T,
              isEqual?: (prev: T, curr: T) => boolean
            ): T;

            /**
             * Gets the current user once it is connected to the room.
             *
             * @example
             * const me = useSelf();
             * const { x, y } = me.presence.cursor;
             */
            useSelf(): User<P, U>;

            /**
             * Extract arbitrary data based on the current user.
             *
             * The selector function will get re-evaluated any time your presence data
             * changes.
             *
             * The component that uses this hook will automatically re-render if your
             * selector function returns a different value from its previous run.
             *
             * By default `useSelf()` uses strict `===` to check for equality. Take extra
             * care when returning a computed object or list, for example when you return
             * the result of a .map() or .filter() call from the selector. In those
             * cases, you'll probably want to use a `shallow` comparison check.
             *
             * Will return `null` while Liveblocks isn't connected to a room yet.
             *
             * @example
             * const cursor = useSelf(me => me.presence.cursor);
             * if (cursor !== null) {
             *   const { x, y } = cursor;
             * }
             *
             */
            useSelf<T>(
              selector: (me: User<P, U>) => T,
              isEqual?: (prev: T, curr: T) => boolean
            ): T;

            /**
             * Returns the threads within the current room.
             *
             * @example
             * const { threads } = useThreads();
             */
            useThreads(options?: UseThreadsOptions<M>): ThreadsStateSuccess<M>;

            /**
             * @beta
             *
             * Returns the user's notification settings for the current room
             * and a function to update them.
             *
             * @example
             * const [{ settings }, updateSettings] = useRoomNotificationSettings();
             */
            useRoomNotificationSettings(): [
              RoomNotificationSettingsStateSuccess,
              (settings: Partial<RoomNotificationSettings>) => void,
            ];
          }
      >;
    }
>;

/**
 * Properties that are the same in LiveblocksContext and LiveblocksContext["suspense"].
 */
type LiveblocksContextBundleCommon<M extends BaseMetadata> = {
  /**
   * Makes Liveblocks features outside of rooms (e.g. Notifications) available
   * in the component hierarchy below.
   */
  LiveblocksProvider(props: PropsWithChildren): JSX.Element;

  /**
   * @beta
   *
   * Returns a function that marks an inbox notification as read.
   *
   * @example
   * const markInboxNotificationAsRead = useMarkInboxNotificationAsRead();
   * markInboxNotificationAsRead("in_xxx");
   */
  useMarkInboxNotificationAsRead(): (inboxNotificationId: string) => void;

  /**
   * @beta
   *
   * Returns a function that marks all inbox notifications as read.
   *
   * @example
   * const markAllInboxNotificationsAsRead = useMarkAllInboxNotificationsAsRead();
   * markAllInboxNotificationsAsRead();
   */
  useMarkAllInboxNotificationsAsRead(): () => void;

  /**
   * @beta
   *
   * Returns the thread associated with a `"thread"` inbox notification.
   *
   * @example
   * const thread = useInboxNotificationThread("in_xxx");
   */
  useInboxNotificationThread(inboxNotificationId: string): ThreadData<M>;
};

export type LiveblocksContextBundle<
  U extends BaseUserMeta,
  M extends BaseMetadata,
> = Resolve<
  LiveblocksContextBundleCommon<M> &
    SharedContextBundle<U>["classic"] & {
      /**
       * @beta
       *
       * Returns the inbox notifications for the current user.
       *
       * @example
       * const { inboxNotifications, error, isLoading } = useInboxNotifications();
       */
      useInboxNotifications(): InboxNotificationsState;

      /**
       * @beta
       *
       * Returns the number of unread inbox notifications for the current user.
       *
       * @example
       * const { count, error, isLoading } = useUnreadInboxNotificationsCount();
       */
      useUnreadInboxNotificationsCount(): UnreadInboxNotificationsCountState;

      suspense: Resolve<
        LiveblocksContextBundleCommon<M> &
          SharedContextBundle<U>["suspense"] & {
            /**
             * @beta
             *
             * Returns the inbox notifications for the current user.
             *
             * @example
             * const { inboxNotifications } = useInboxNotifications();
             */
            useInboxNotifications(): InboxNotificationsStateSuccess;

            /**
             * @beta
             *
             * Returns the number of unread inbox notifications for the current user.
             *
             * @example
             * const { count } = useUnreadInboxNotificationsCount();
             */
            useUnreadInboxNotificationsCount(): UnreadInboxNotificationsCountStateSuccess;
          }
      >;
    }
>;
