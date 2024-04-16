import fs from "fs";
import path from "path";
import { createRequire } from "module";
import dts from "rollup-plugin-dts";
import esbuild from "rollup-plugin-esbuild";
import preserveDirectives from "rollup-preserve-directives";

/**
 * @typedef {Object} Package
 * @property {string} version
 * @property {Record<string, string> | undefined} dependencies
 * @property {Record<string, string> | undefined} peerDependencies
 */

/**
 * @typedef {Object} StyleFile
 * @property {string} entry
 * @property {string} destination
 */

/**
 * @typedef {Object} Options
 * @property {string[]} entries
 * @property {(string | RegExp)[]} external
 * @property {string} srcDir
 * @property {string} distDir
 * @property {StyleFile[]} styles
 * @property {Record<string, (...args: any[]) => string>} stylesCustomFunctions
 */

const disabledWarnings = new Set([
  "EMPTY_BUNDLE",
  "MIXED_EXPORTS",
  "PREFER_NAMED_EXPORTS",
  "UNRESOLVED_IMPORT",
  "THIS_IS_UNDEFINED",
  "INVALID_ANNOTATION",
  "UNUSED_EXTERNAL_IMPORT",
  "MODULE_LEVEL_DIRECTIVE",
]);

const require = createRequire(import.meta.url);

/**
 * @param {string} location
 * @param {Partial<Options>} options
 * @returns {import("rollup").RollupOptions[]}
 */
export function createRollupConfigs(location, options) {
  /** @type {Package} */
  const pkg = createRequire(location)("./package.json");

  const srcDir = options.srcDir ?? "src";
  const distDir = options.srcDir ?? "dist";
  const entries = options.entries ?? [];

  /** @type {import("rollup").RollupOptions} */
  const config = {
    input: entries,
    output: {
      dir: distDir,
      preserveModules: true,
      preserveModulesRoot: srcDir,
      sourcemap: true,
    },
    external: [
      ...Object.keys(pkg.dependencies ?? {}),
      ...Object.keys(pkg.peerDependencies ?? {}),
      ...(options.external ?? []),
    ],
    treeshake: true,
    onwarn(warning, warn) {
      const code = warning.code ?? "";

      if (disabledWarnings.has(code)) {
        return;
      }

      warn(warning);
    },
  };
  /** @type {import("rollup-plugin-esbuild").Options} */
  const esbuildPluginOptions = {
    target: "es2020",
    sourceMap: true,
    define: {
      __VERSION__: JSON.stringify(pkg.version),
    },
  };

  return [
    // Build .js files (and execute once-per-build logic like cleaning the dist directory and processing styles)
    {
      ...config,
      output: {
        ...config.output,
        format: "cjs",
      },
      plugins: [
        // Clean dist directory before building
        cleanDistDir(distDir),

        // Process styles once
        options.styles ? processStyles(options) : null,

        esbuild({
          ...esbuildPluginOptions,
          define: {
            ...esbuildPluginOptions.define,
            TSUP_FORMAT: JSON.stringify("cjs"),
          },
        }),
        preserveDirectives(),
      ].filter(Boolean),
    },

    // Build .mjs files
    {
      ...config,
      output: {
        ...config.output,
        entryFileNames: "[name].mjs",
        format: "esm",
      },
      plugins: [
        esbuild({
          ...esbuildPluginOptions,
          define: {
            ...esbuildPluginOptions.define,
            TSUP_FORMAT: JSON.stringify("esm"),
          },
        }),
        preserveDirectives(),
      ],
    },

    // Build .d.ts and .d.mts files
    ...entries.map((entry) => ({
      input: entry,
      output: [
        {
          file: entry
            .replace(`${srcDir}/`, `${distDir}/`)
            .replace(/\.ts$/, ".d.ts"),
        },
        {
          file: entry
            .replace(`${srcDir}/`, `${distDir}/`)
            .replace(/\.ts$/, ".d.mts"),
        },
      ],
      plugins: [dts()],
    })),
  ];
}

/**
 * @param {string} distDir
 * @returns {import("rollup").Plugin}
 */
function cleanDistDir(distDir) {
  return {
    // name: "clean",
    buildStart: {
      order: "pre",
      handler() {
        fs.rmSync(path.resolve(distDir), { recursive: true, force: true });
      },
    },
  };
}

/**
 * @param {Pick<Options, "styles" | "stylesCustomFunctions">} options
 * @returns {import("rollup").Plugin}
 */
function processStyles({ styles, stylesCustomFunctions }) {
  return {
    // name: "styles",
    buildStart: async () => {
      const hasStylelint = hasDependency("stylelint");
      const { default: postcss } = await import("postcss");

      const processor = postcss(
        [
          hasStylelint ? require("stylelint") : null,
          require("postcss-import"),
          require("postcss-advanced-variables"),
          require("postcss-functions")({
            functions: stylesCustomFunctions ?? {},
          }),
          require("postcss-nesting"),
          require("postcss-combine-duplicated-selectors"),
          require("postcss-sort-media-queries"),
          require("postcss-lightningcss")({ browsers: ">= 1%" }),
          hasStylelint
            ? require("postcss-reporter")({
                clearReportedMessages: true,
                plugins: ["stylelint"],
                noPlugin: true,
                throwError: true,
              })
            : null,
        ].filter(Boolean)
      );

      for (const style of styles) {
        console.log(`🎨 Processing ${style.entry}…`);

        const entry = path.resolve(style.entry);
        const destination = path.resolve(style.destination);

        const { css, map } = await processor.process(
          fs.readFileSync(entry, "utf8"),
          {
            from: entry,
            to: destination,
            map: {
              inline: false,
            },
          }
        );

        createFile(destination, css);
        createFile(`${destination}.map`, map.toString());
      }
    },
  };
}

/**
 * @param {string} dependency
 * @returns {boolean}
 */
function hasDependency(dependency) {
  try {
    require.resolve(dependency);

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * @param {string} file
 * @param {string | NodeJS.ArrayBufferView} data
 */
function createFile(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
}
