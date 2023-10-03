import { Page, test, expect } from "@playwright/test";

import {
  expectJson,
  getJson,
  nanoSleep,
  pickRandomItem,
  preparePages,
  sleep,
  waitForContentToBeEquals,
} from "../utils";
import type { Json } from "@liveblocks/client";

function pickRandomAction() {
  return pickRandomItem(["#push", "#delete", "#move", "#undo", "#redo"]);
}

const TEST_URL = "http://localhost:3007/offline/";

test.describe("Offline", () => {
  let pages: [Page, Page];

  test.beforeEach(async ({}, testInfo) => {
    const roomName = `e2e-offline-${testInfo.title.replaceAll(" ", "-")}`;
    pages = await preparePages(`${TEST_URL}?room=${roomName}`);
  });

  test.afterEach(() =>
    // Close all pages
    Promise.all(pages.map((page) => page.close()))
  );

  test.skip("one client offline with offline changes - connection issue (code 1005)", async () => {
    const [page1, page2] = pages;
    await page1.click("#clear");
    await expectJson(pages, "#itemsCount", 0);

    await page1.click("#push");
    await expectJson(pages, "#itemsCount", 1);

    await page1.click("#closeWebsocket");
    await sleep(50); // XXX Remove
    await page1.click("#push");
    await page2.click("#push");
    await expectJson(page1, "#itemsCount", 2);

    // XXX Really needed?
    const firstPageItems = (await getJson(page1, "#items")) as Json[];
    const secondPageItems = (await getJson(page2, "#items")) as Json[];

    expect(firstPageItems.length).toEqual(2);
    expect(secondPageItems.length).toEqual(2);

    await page1.click("#sendCloseEventConnectionError");
    await sleep(3000); // XXX Remove

    await waitForContentToBeEquals(pages, "#items");

    await page1.click("#clear");
    await expectJson(pages, "#itemsCount", 0);
  });

  test.skip("one client offline with offline changes - app server issue (code 4002)", async () => {
    const [page1, page2] = pages;
    await page1.click("#clear");
    await expectJson(pages, "#itemsCount", 0);

    await page1.click("#push");
    await expectJson(pages, "#itemsCount", 1);

    const firstConnectionId = await getJson(page1, "#connectionId");

    await page1.click("#closeWebsocket");
    await sleep(50); // XXX Remove
    await page1.click("#push");
    await page2.click("#push");
    await expectJson(page1, "#itemsCount", 2);

    const firstPageItems = (await getJson(page1, "#items")) as Json[];
    const secondPageItems = (await getJson(page2, "#items")) as Json[];

    expect(firstPageItems.length).toEqual(2);
    expect(secondPageItems.length).toEqual(2);

    await page1.click("#sendCloseEventAppError");
    await sleep(5000); // XXX Remove

    await waitForContentToBeEquals(pages, "#items");

    const connectionIdAfterReconnect = await getJson(page1, "#connectionId");
    expect(connectionIdAfterReconnect).toEqual(firstConnectionId);

    await page1.click("#clear");
    await expectJson(pages, "#itemsCount", 0);
  });

  test.skip("fuzzy", async () => {
    const [page1, page2] = pages;
    await page1.click("#clear");
    await expectJson(pages, "#itemsCount", 0);

    for (let i = 0; i < 10; i++) {
      // no await to create randomness
      page1.click("#push");
      page2.click("#push");
      await nanoSleep();
    }

    await waitForContentToBeEquals(pages, "#items");

    await page1.click("#closeWebsocket");
    await sleep(50); // XXX Remove

    for (let i = 0; i < 50; i++) {
      // no await to create randomness
      page1.click(pickRandomAction());
      page2.click(pickRandomAction());
      await nanoSleep();
    }

    await sleep(2000); // XXX Remove

    await page1.click("#sendCloseEventConnectionError");

    await sleep(3000); // XXX Remove

    await waitForContentToBeEquals(pages, "#items");

    await page1.click("#clear");
    await expectJson(pages, "#itemsCount", 0);
  });
});
