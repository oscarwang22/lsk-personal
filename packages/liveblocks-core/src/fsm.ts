/**
 * A generic Finite State Machine (FSM) implementation.
 */

type BaseEvent = { readonly type: string };

/**
 * Built-in event thrown by .addTimedTransition().
 */
type TimerEvent = { readonly type: "TIMER" };

/**
 * Built-in events thrown by .onEnterAsync().
 */
type AsyncOKEvent<T> = { readonly type: "ASYNC_OK"; readonly result: T };
type AsyncErrorEvent = {
  readonly type: "ASYNC_ERROR";
  readonly error: unknown;
};
type BuiltinEvent = TimerEvent | AsyncOKEvent<unknown> | AsyncErrorEvent;

type CleanupFn = () => void;
type EnterFn<TContext> = (context: Readonly<TContext>) => void | CleanupFn;

type TargetFn<TContext, TEvent extends BaseEvent, TState extends string> = (
  event: TEvent,
  context: Readonly<TContext>
) => TState | FullTargetSpec<TContext, TEvent, TState>;

type FullTargetSpec<
  TContext,
  TEvent extends BaseEvent,
  TState extends string
> = {
  target: TState;
  assign: (context: Readonly<TContext>, event: TEvent) => Partial<TContext>;
};

type Target<TContext, TEvent extends BaseEvent, TState extends string> =
  | TState // Static, e.g. 'complete'
  | FullTargetSpec<TContext, TEvent, TState>
  | TargetFn<TContext, TEvent, TState>; // Dynamic, e.g. (context) => context.x ? 'complete' : 'other'

type Groups<T extends string> = T extends `${infer G}.${infer Rest}`
  ? G | `${G}.${Groups<Rest>}`
  : never;
type Wildcard<T extends string> = "*" | `${Groups<T>}.*`;

export function distance(state1: string, state2: string): [number, number] {
  if (state1 === state2) {
    return [0, 0];
  }

  const chunks1 = state1.split(".");
  const chunks2 = state2.split(".");
  const minLen = Math.min(chunks1.length, chunks2.length);
  let shared = 0;
  for (; shared < minLen; shared++) {
    if (chunks1[shared] !== chunks2[shared]) {
      break;
    }
  }

  const up = chunks1.length - shared;
  const down = chunks2.length - shared;
  return [up, down];
}

export function patterns<TState extends string>(
  targetState: TState,
  levels: number
): (Wildcard<TState> | TState)[] {
  const parts = targetState.split(".");
  if (levels < 1 || levels > parts.length + 1) {
    throw new Error("Invalid number of levels");
  }

  const result: (Wildcard<TState> | TState)[] = [];
  if (levels > parts.length) {
    result.push("*");
  }

  for (let i = parts.length - levels + 1; i < parts.length; i++) {
    const slice = parts.slice(0, i);
    if (slice.length > 0) {
      result.push((slice.join(".") + ".*") as Wildcard<TState>);
    }
  }

  result.push(targetState);

  return result;
}

enum RunningState {
  NOT_STARTED_YET, // Machine can be set up during this phase
  STARTED,
  STOPPED,
}

export class FSM<
  TContext extends object,
  TEvent extends BaseEvent,
  TState extends string
> {
  // Indicates whether this state machine is still being configured, has
  // started, or has terminated
  private runningState: RunningState;

  private currentContext: Readonly<TContext>;

  private states: Set<TState>;
  private currentStateOrNull: TState | null;

  private allowedTransitions: Map<
    TState,
    Map<TEvent["type"], TargetFn<TContext, TEvent, TState>>
  >;

  //
  // The cleanup stack is a stack of (optional) callback functions that will
  // be run when exiting the current state. If a state (or state group) does
  // not have an exit handler, then the entry for that level may be
  // `undefined`, but there will be an explicit entry in the stack for it.
  //
  // This will always be true:
  //
  //   cleanupStack.length == currentState.split('.').length + 1
  //
  // Each stack level represents a different state "group".
  //
  // For example, if you are in a state named `foo.bar.qux`, then the stack
  // will contain the exit handler for `foo.bar.qux` (at the top), then
  // `foo.bar.*`, then `foo.*`, and finally, `*`.
  //
  private cleanupStack: (CleanupFn | null)[];

  private enterFns: Map<TState | Wildcard<TState>, EnterFn<TContext>>;

  // Used to provide better error messages
  private knownEventTypes: Set<string>;

  /**
   * Returns the initial state, which is defined by the first call made to
   * .addState().
   */
  private get initialState(): TState {
    // Return the first state ever defined as the initial state
    const result = this.states.values()[Symbol.iterator]().next();
    if (result.done) {
      throw new Error("No states defined yet");
    } else {
      return result.value;
    }
  }

  public get currentState(): TState {
    if (this.currentStateOrNull === null) {
      throw new Error("Not started yet");
    }
    return this.currentStateOrNull;
  }

  /**
   * Starts the machine by entering the initial state.
   */
  public start(): this {
    if (this.runningState !== RunningState.NOT_STARTED_YET) {
      throw new Error("State machine has already started");
    }

    this.runningState = RunningState.STARTED;
    this.currentStateOrNull = this.initialState;
    this.enter(null);
    return this;
  }

  /**
   * Stops the state machine. Stopping the state machine will call exit
   * handlers for the current state, but not enter a new state.
   */
  public stop(): void {
    if (this.runningState !== RunningState.STARTED) {
      throw new Error("Cannot stop a state machine that isn't started yet");
    }
    this.runningState = RunningState.STOPPED;
    this.exit(null);
    this.currentStateOrNull = null;
  }

  constructor(initialContext: Readonly<TContext>) {
    this.runningState = RunningState.NOT_STARTED_YET;
    this.currentStateOrNull = null;
    this.states = new Set();
    this.enterFns = new Map();
    this.cleanupStack = [];
    this.knownEventTypes = new Set();
    this.allowedTransitions = new Map();
    this.currentContext = Object.assign({}, initialContext);
  }

  public get context(): Readonly<TContext> {
    return this.currentContext;
  }

  /**
   * Define an explicit finite state in the state machine.
   */
  public addState(state: TState): this {
    if (this.runningState !== RunningState.NOT_STARTED_YET) {
      throw new Error("Already started");
    }
    this.states.add(state);
    return this;
  }

  public onEnter(
    nameOrPattern: TState | Wildcard<TState>,
    enterFn: EnterFn<TContext>
  ): this {
    if (this.runningState !== RunningState.NOT_STARTED_YET) {
      throw new Error("Already started");
    } else if (this.enterFns.has(nameOrPattern)) {
      throw new Error(
        // TODO We _currently_ don't support multiple .onEnters() for the same
        // state, but this is not a fundamental limitation. Just not
        // implemented yet. If we wanted to, we could make this an array.
        `enter/exit function for ${nameOrPattern} already exists`
      );
    }

    this.enterFns.set(nameOrPattern, enterFn);
    return this;
  }

  public onEnterAsync<T>(
    nameOrPattern: TState | Wildcard<TState>,
    promiseFn: (context: Readonly<TContext>) => Promise<T>,
    onOK: Target<TContext, AsyncOKEvent<T>, TState>,
    onError: Target<TContext, AsyncErrorEvent, TState>
  ): this {
    return this.onEnter(nameOrPattern, () => {
      let cancelled = false;

      void promiseFn(this.currentContext).then(
        // On OK
        (result: T) => {
          if (!cancelled) {
            this.transition({ type: "ASYNC_OK", result }, onOK);
          }
        },

        // On Error
        (error: unknown) => {
          if (!cancelled) {
            this.transition({ type: "ASYNC_ERROR", error }, onError);
          }
        }
      );

      return () => {
        cancelled = true;
      };
    });
  }

  private getMatches(nameOrPattern: TState | Wildcard<TState>): TState[] {
    const matches: TState[] = [];

    // We're trying to match a group pattern here, i.e. `foo.*` (which might
    // match `foo.bar` and `foo.qux` states)
    if (nameOrPattern.endsWith(".*")) {
      const prefix = nameOrPattern.slice(0, -1); // Strip only the "*", keep the "."
      for (const state of this.states) {
        if (state.startsWith(prefix)) {
          matches.push(state);
        }
      }
    } else {
      // Just a single, explicit state name
      const name = nameOrPattern as TState;
      if (this.states.has(name)) {
        matches.push(name);
      }
    }

    if (matches.length === 0) {
      throw new Error(`No states match ${JSON.stringify(nameOrPattern)}`);
    }

    return matches;
  }

  /**
   * Define all allowed outgoing transitions for a state.
   *
   * The targets for each event can be defined as a function which returns the
   * next state to transition to. These functions can look at the `event` or
   * `context` params to conditionally decide which next state to transition
   * to.
   *
   * If you set it to `null`, then the transition will be explicitly forbidden
   * and throw an error. If you don't define a target for a transition, then
   * such events will get ignored.
   */
  public addTransitions(
    nameOrPattern: TState | Wildcard<TState>,
    mapping: {
      [E in TEvent as E["type"]]?: Target<TContext, E, TState> | null;
    }
  ): this {
    if (this.runningState !== RunningState.NOT_STARTED_YET) {
      throw new Error("Already started");
    }

    for (const src of this.getMatches(nameOrPattern)) {
      let map = this.allowedTransitions.get(src);
      if (map === undefined) {
        map = new Map();
        this.allowedTransitions.set(src, map);
      }

      for (const [type, target_] of Object.entries(mapping)) {
        const targetSpec = target_ as
          | Target<TContext, TEvent, TState>
          | null
          | undefined;
        this.knownEventTypes.add(type);

        if (targetSpec !== undefined && targetSpec !== null) {
          // TODO Disallow overwriting when using a wildcard pattern!
          const targetFn =
            typeof targetSpec === "function" ? targetSpec : () => targetSpec;
          map.set(type, targetFn);
        }
      }
    }
    return this;
  }

  /**
   * Like `.addTransition()`, but takes an (anonymous) transition whenever the
   * timer fires.
   *
   * @param stateOrPattern The state name, or state group pattern name.
   * @param after          Number of milliseconds after which to take the
   *                       transition. If in the mean time, another transition
   *                       is taken, the timer will get cancelled.
   * @param target     The target state to go to.
   */
  public addTimedTransition(
    stateOrPattern: TState | Wildcard<TState>,
    after: number | ((context: Readonly<TContext>) => number),
    target: Target<TContext, TimerEvent, TState>
  ) {
    return this.onEnter(stateOrPattern, () => {
      const ms =
        typeof after === "function" ? after(this.currentContext) : after;
      const timeoutID = setTimeout(() => {
        this.transition({ type: "TIMER" }, target);
      }, ms);

      return () => {
        clearTimeout(timeoutID);
      };
    });
  }

  private getTargetFn(
    eventName: TEvent["type"]
  ): TargetFn<TContext, TEvent, TState> | undefined {
    return this.allowedTransitions.get(this.currentState)?.get(eventName);
  }

  /**
   * Checks to see if the given event can be handled in the current state.
   *
   * XXX Not sure if this method will eventually be needed.
   */
  public can(eventName: TEvent["type"]): boolean {
    return this.getTargetFn(eventName) !== undefined;
  }

  /**
   * Exits the current state, and executes any necessary cleanup functions.
   * Call this before changing the current state to the next state.
   *
   * @param levels Defines how many "levels" of nesting will be exited. For
   * example, if you transition from `foo.bar.qux` to `foo.bar.baz`, then
   * the level is 1. But if you transition from `foo.bar.qux` to `bla.bla`,
   * then the level is 3.
   */
  private exit(levels: number | null) {
    levels = levels ?? this.cleanupStack.length;
    for (let i = 0; i < levels; i++) {
      this.cleanupStack.pop()?.();
    }
  }

  /**
   * Enters the current state, and executes any necessary onEnter handlers.
   * Call this directly _after_ setting the current state to the next state.
   */
  private enter(levels: number | null) {
    const enterPatterns = patterns(
      this.currentState,
      levels ?? this.currentState.split(".").length + 1
    );

    for (const pattern of enterPatterns) {
      const enterFn = this.enterFns.get(pattern);
      const cleanupFn = enterFn?.(this.currentContext);
      if (typeof cleanupFn === "function") {
        this.cleanupStack.push(cleanupFn);
      } else {
        this.cleanupStack.push(null);
      }
    }
  }

  /**
   * Sends an event to the machine, which may cause an internal state
   * transition to happen. When that happens, will trigger side effects.
   */
  public send(event: TEvent): void {
    const targetFn = this.getTargetFn(event.type);
    if (targetFn === undefined) {
      if (this.knownEventTypes.has(event.type)) {
        // XXX Fail silently instead?
        throw new Error(
          `Event ${JSON.stringify(
            event.type
          )} is not allowed from state ${JSON.stringify(this.currentState)}`
        );
      } else {
        throw new Error(`Unknown event ${JSON.stringify(event.type)}`);
      }
    }

    return this.transition(event, targetFn);
  }

  private transition<E extends TEvent | BuiltinEvent>(
    event: E,
    target: Target<TContext, E, TState>
  ) {
    const targetFn = typeof target === "function" ? target : () => target;
    const nextTarget = targetFn(event, this.currentContext);
    let nextState: TState;
    let action:
      | ((context: Readonly<TContext>, event: E) => Partial<TContext>)
      | undefined = undefined;
    if (typeof nextTarget === "string") {
      nextState = nextTarget;
    } else {
      nextState = nextTarget.target;
      action = nextTarget.assign;
    }

    if (!this.states.has(nextState)) {
      throw new Error(`Invalid next state name: ${JSON.stringify(nextState)}`);
    }

    const [up, down] = distance(this.currentState, nextState);
    if (up > 0) {
      this.exit(up);
    }

    this.currentStateOrNull = nextState; // NOTE: Could stay the same, but... there could be an action to execute here
    if (action !== undefined) {
      const patch = action(this.context, event);
      this.currentContext = Object.assign({}, this.currentContext, patch);
    }

    if (down > 0) {
      this.enter(down);
    }
  }

  /**
   * Like .transition(), but will not throw if the event cannot be handled by
   * the current state.
   *
   * XXX Not sure if this method will eventually be needed.
   * XXX Not sure about this API. Is this something the _caller_ would
   * XXX have to worry about? Perhaps better to make this part of the
   * XXX machine's configation instead?
   */
  public sendIfPossible(event: TEvent) {
    if (this.can(event.type)) {
      this.send(event);
    }
  }
}
