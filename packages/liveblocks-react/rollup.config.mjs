import { createRollupConfigs } from "@liveblocks/rollup-config";

export default createRollupConfigs(import.meta.url, {
  entries: ["src/index.ts"],
});
