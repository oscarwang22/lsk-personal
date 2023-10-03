import { chromium, expect, Page } from "@playwright/test";
import _ from "lodash";
import randomNumber from "../utils/randomNumber";
import type { Json } from "@liveblocks/client";

type IDSelector = `#${string}`;

const WIDTH = 640;
const HEIGHT = 800;

export async function preparePage(url: string, windowPositionX: number = 0) {
  let page: Page;
  const browser = await chromium.launch({
    args: [
      `--no-sandbox`,
      `--disable-setuid-sandbox`,
      `--window-size=${WIDTH},${HEIGHT}`,
      `--window-position=${windowPositionX},0`,
      "--disable-dev-shm-usage",
    ],
  });
  const context = await browser.newContext({
    viewport: { width: 640, height: 800 },
  });
  page = await context.newPage();
  await page.goto(url);

  return page;
}

export async function preparePages(url: string) {
  const firstUrl = new URL(url);
  const secondUrl = new URL(url);
  firstUrl.searchParams.set("bg", "#cafbca");
  secondUrl.searchParams.set("bg", "#e9ddf9");
  return Promise.all([
    preparePage(firstUrl.toString(), 0),
    preparePage(secondUrl.toString(), WIDTH),
  ] as const);
}

/** @deprecated */
// XXX Remove helper eventually!
export async function assertContainText(
  pages: Page[],
  selector: IDSelector,
  value: string
) {
  for (const page of pages) {
    await expect(page.locator(selector)).toContainText(value);
  }
}

export async function waitForJson(
  oneOrMorePages: Page | Page[],
  selector: IDSelector,
  expectedValue: Json
) {
  const pages = Array.isArray(oneOrMorePages)
    ? oneOrMorePages
    : [oneOrMorePages];

  const expectedText = JSON.stringify(expectedValue, null, 2);
  return Promise.all(
    pages.map((page) =>
      expect(page.locator(selector)).toHaveText(expectedText, { timeout: 2000 })
    )
  );
}

export async function expectJson(
  oneOrMorePages: Page | Page[],
  selector: IDSelector,
  expectedValue: Json | undefined
) {
  const pages = Array.isArray(oneOrMorePages)
    ? oneOrMorePages
    : [oneOrMorePages];
  for (const page of pages) {
    if (expectedValue !== undefined) {
      await expect(getJson(page, selector)).resolves.toEqual(expectedValue);
    } else {
      const text = page.locator(selector).innerText();
      await expect(text).toEqual("undefined");
    }
  }
}

export async function getJson(page: Page, selector: IDSelector): Promise<Json> {
  const text = await page.locator(selector).innerText();
  if (!text) {
    throw new Error(`Could not find HTML element #${selector}`);
  }
  return JSON.parse(text);
}

export async function assertJsonContentAreEquals(
  pages: Page[],
  selector: IDSelector
) {
  const firstPageContent = await getJson(pages[0], selector);

  for (const page of pages.slice(1)) {
    const otherPageContent = await getJson(page, selector);
    expect(firstPageContent).toEqual(otherPageContent);
  }

  pages.forEach(async (page) => {
    expect(firstPageContent).toEqual(await getJson(page, selector));
  });
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// XXX Deprecate?
export async function waitForContentToBeEquals(
  pages: Page[],
  selector: IDSelector
) {
  for (let i = 0; i < 20; i++) {
    const firstPageContent = await getJson(pages[0], selector);

    let allEquals = true;
    for (let j = 1; j < pages.length; j++) {
      const otherPageContent = await getJson(pages[j], selector);

      if (!_.isEqual(firstPageContent, otherPageContent)) {
        allEquals = false;
      }
    }

    if (allEquals) {
      return;
    }

    await sleep(100);
  }

  await assertJsonContentAreEquals(pages, selector);
}

export function pickRandomItem<T>(array: T[]) {
  return array[randomNumber(array.length)];
}

export function pickNumberOfUnderRedo() {
  const undoRedoProb = randomNumber(100);

  if (undoRedoProb > 75) {
    return randomNumber(5);
  }

  return 0;
}
