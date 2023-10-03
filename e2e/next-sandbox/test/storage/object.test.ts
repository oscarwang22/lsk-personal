import { Page, test } from "@playwright/test";

import {
  assertContainText,
  assertJsonContentAreEquals,
  nanoSleep,
  pickNumberOfUndoRedo,
  pickRandomItem,
  preparePages,
  waitForContentToBeEquals,
} from "../utils";

function pickRandomAction() {
  return pickRandomItem(["#set", "#delete"]);
}

function pickRandomActionNested() {
  return pickRandomItem(["#set-nested", "#delete"]);
}

const TEST_URL = "http://localhost:3007/storage/object";

test.describe("Storage - LiveObject", () => {
  let pages: [Page, Page];

  test.beforeEach(async ({}, testInfo) => {
    const roomName = `e2e-object-${testInfo.title.replaceAll(
      /[^\w\d_-]+/g,
      "-"
    )}`;
    pages = await preparePages(
      `${TEST_URL}?room=${encodeURIComponent(roomName)}`
    );
  });

  test.afterEach(() =>
    // Close all pages
    Promise.all(pages.map((page) => page.close()))
  );

  test("fuzzy", async () => {
    const [page1, page2] = pages;
    await page1.click("#clear");
    await assertContainText(pages, "#items", "{}");

    const clicks = [];
    for (let i = 0; i < 20; i++) {
      clicks.push(page1.click("#set"));
      await nanoSleep();
    }

    await waitForContentToBeEquals(pages, "#items");

    for (let i = 0; i < 100; i++) {
      // no await to create randomness
      clicks.push(page1.click(pickRandomAction()));
      clicks.push(page2.click(pickRandomAction()));
      await nanoSleep();
    }

    await Promise.all(clicks);
    await waitForContentToBeEquals(pages, "#items");
  });

  test("fuzzy with nested objects", async () => {
    const [page1, page2] = pages;
    await page1.click("#clear");
    await assertContainText(pages, "#items", "{}");

    await assertJsonContentAreEquals(pages, "#items");

    const clicks = [];
    for (let i = 0; i < 20; i++) {
      clicks.push(page1.click("#set-nested"));
    }

    await Promise.all(clicks);
    await waitForContentToBeEquals(pages, "#items");

    for (let i = 0; i < 50; i++) {
      // no await to create randomness
      clicks.push(page1.click(pickRandomActionNested()));
      clicks.push(page2.click(pickRandomActionNested()));
      await nanoSleep();
    }

    await Promise.all(clicks);
    await waitForContentToBeEquals(pages, "#items");
  });

  // TODO: This test is flaky and occasionally fails in CI--make it more robust
  // See https://github.com/liveblocks/liveblocks/runs/8032018966?check_suite_focus=true#step:6:47
  test.skip("fuzzy with nested objects and undo/redo", async () => {
    const [page1, page2] = pages;
    await page1.click("#clear");
    await assertContainText(pages, "#items", "{}");

    await assertJsonContentAreEquals(pages, "#items");

    const clicks = [];
    for (let i = 0; i < 20; i++) {
      clicks.push(page1.click("#set-nested"));
      await nanoSleep();
    }

    await Promise.all(clicks);
    await waitForContentToBeEquals(pages, "#items");

    for (let i = 0; i < 50; i++) {
      const nbofUndoRedo = pickNumberOfUndoRedo();
      if (nbofUndoRedo > 0) {
        for (let y = 0; y < nbofUndoRedo; y++) {
          clicks.push(page1.click("#undo"));
        }
        for (let y = 0; y < nbofUndoRedo; y++) {
          clicks.push(page1.click("#redo"));
        }
      } else {
        clicks.push(page1.click(pickRandomActionNested()));
        clicks.push(page2.click(pickRandomActionNested()));
      }
      await nanoSleep();
    }

    await Promise.all(clicks);
    await waitForContentToBeEquals(pages, "#items");
  });
});
