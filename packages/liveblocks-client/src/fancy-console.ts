const badge =
  "background:radial-gradient(106.94% 108.33% at -10% -5%,#ff1aa3 0,#ff881a 100%);border-radius:6px;color:#fff;padding:2px 6px";
const bold = "font-weight:600";

function wrap(
  method: "log" | "warn" | "error"
): (message: string, ...args: readonly unknown[]) => void {
  return typeof window === "undefined" || process.env.NODE_ENV === "test"
    ? console[method]
    : (message, ...args) =>
        console[method]("%cliveblocks", badge, message, ...args);
}

export const log = wrap("log");
export const warn = wrap("warn");
export const error = wrap("error");

function wrapBold(
  method: "log" | "warn" | "error"
): (title: string, message: string, ...args: readonly unknown[]) => void {
  return typeof window === "undefined" || process.env.NODE_ENV === "test"
    ? console[method]
    : (title, message, ...args) =>
        console[method](
          `%cliveblocks%c ${title}`,
          badge,
          bold,
          message,
          ...args
        );
}

export const logBold = wrapBold("log");
export const warnBold = wrapBold("warn");
export const errorBold = wrapBold("error");
