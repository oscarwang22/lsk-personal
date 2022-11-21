import { useMemo } from "react";

import { Tree } from "../components/Tree";
import { useMe, useOthers } from "../contexts/CurrentRoom";

export function Me() {
  const me = useMe();
  const data = useMemo(() => (me ? [me] : null), [me]);

  return (
    <div className="border-light-300 dark:border-dark-300 relative flex h-1/3 flex-none border-b">
      {data !== null ? <Tree data={data} /> : null}
    </div>
  );
}

export function Others() {
  const others = useOthers();

  return (
    <div className="relative w-full flex-1">
      {others !== null ? <Tree data={others} openByDefault={false} /> : null}
    </div>
  );
}

export function Presence() {
  return (
    <div className="absolute inset-0 flex h-full flex-col">
      <Me />
      <Others />
    </div>
  );
}
