import type { Json } from "@liveblocks/client";
import { useRoom, useSelf, useOthers } from "@liveblocks/react";
import * as suspense from "@liveblocks/react/suspense";
import { expectType } from "tsd";

//
// User-provided type augmentations
//
declare global {
  namespace Liveblocks {
    interface Presence {
      cursor: {
        x: number;
        y: number;
      };
    }
  }
}

// ---------------------------------------------------------
// Hook APIs
// ---------------------------------------------------------

const room = useRoom();

// Global presence is now available
expectType<number>(room.getPresence().cursor.x);
expectType<number>(room.getPresence().cursor.y);
expectType<Json | undefined>(room.getPresence().notAPresenceField);

// useSelf()
{
  const me = useSelf();
  expectType<number | undefined>(me?.presence.cursor.x);
  expectType<number | undefined>(me?.presence.cursor.y);
  expectType<Json | undefined>(me?.presence.notAPresenceField);
}

// useSelf() (suspense)
{
  const me = suspense.useSelf();
  expectType<number>(me.presence.cursor.x);
  expectType<number>(me.presence.cursor.y);
  expectType<Json | undefined>(me.presence.notAPresenceField);
}

// useSelf(selector)
{
  const x = useSelf((me) => me.presence.cursor.x);
  expectType<number | null>(x);
}

// useSelf(selector) (suspense)
{
  const x = suspense.useSelf((me) => me.presence.cursor.x);
  expectType<number>(x);
}

// ---------------------------------------------------------

// useOthers()
{
  const others = useOthers();
  expectType<number>(others[13].presence.cursor.x);
  expectType<number>(others[42].presence.cursor.y);
  expectType<boolean>(others[0].canWrite);
}

// useOthers() (suspense)
{
  const others = suspense.useOthers();
  expectType<number>(others[13].presence.cursor.x);
  expectType<number>(others[42].presence.cursor.y);
  expectType<boolean>(others[0].canWrite);
}
