"use server";

import { buildDocumentGroups } from "@/lib/server/utils";
import { liveblocks } from "@/liveblocks.server.config";
import {
  DocumentGroup,
  FetchApiResult,
  GetDocumentGroupsProps,
  Room,
} from "@/types";

/**
 * Get Document Groups
 *
 * Get the groupIds attached to a given document
 * Uses custom API endpoint
 *
 * @param documentId - The document id
 */
export async function getDocumentGroups({
  documentId,
}: GetDocumentGroupsProps): Promise<FetchApiResult<DocumentGroup[]>> {
  let room;
  try {
    // Get session and room
    room = await liveblocks.getRoom(documentId);
  } catch (err) {
    console.error(err);
    return {
      error: {
        code: 500,
        message: "Error fetching document",
        suggestion: "Refresh the page and try again",
      },
    };
  }

  if (!room) {
    return {
      error: {
        code: 404,
        message: "Document not found",
        suggestion: "Check that you're on the correct page",
      },
    };
  }

  // If successful, convert room to a list of groups and send
  const result: DocumentGroup[] = await buildDocumentGroups(
    room as unknown as Room
  );
  return { data: result };
}
