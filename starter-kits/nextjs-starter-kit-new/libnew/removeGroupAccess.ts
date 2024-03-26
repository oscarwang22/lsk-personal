"use server";

import { auth } from "@/auth";
import { buildDocumentGroups } from "@/lib/server";
import { userAllowedInRoom } from "@/lib/server/utils/userAllowedInRooms";
import { getGroup } from "@/libnew/database/getGroup";
import { liveblocks } from "@/liveblocks.server.config";
import {
  DocumentGroup,
  FetchApiResult,
  RemoveGroupAccessProps,
  Room,
  RoomAccess,
  RoomAccessLevels,
} from "@/types";

/**
 * Remove Group Access
 *
 * Remove a group from a given document with its groupId
 * Uses custom API endpoint
 *
 * @param groupId - The id of the removed group
 * @param documentId - The document id
 */
export async function removeGroupAccess({
  groupId,
  documentId,
}: RemoveGroupAccessProps): Promise<FetchApiResult<DocumentGroup[]>> {
  let session;
  let room;
  let group;
  try {
    // Get session and room
    const result = await Promise.all([
      auth(),
      liveblocks.getRoom(documentId),
      getGroup(groupId),
    ]);
    session = result[0];
    room = result[1];
    group = result[2];
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

  // Check user is logged in
  if (!session) {
    return {
      error: {
        code: 401,
        message: "Not signed in",
        suggestion: "Sign in to remove a user",
      },
    };
  }

  // Check current logged-in user is set as a user with id, ignoring groupIds and default access
  if (
    !userAllowedInRoom({
      accessesAllowed: [RoomAccess.RoomWrite],
      checkAccessLevels: [RoomAccessLevels.USER],
      userId: session.user.info.id,
      groupIds: [],
      room: room as unknown as Room,
    })
  ) {
    return {
      error: {
        code: 403,
        message: "Not allowed access",
        suggestion: "Check that you've been given permission to the document",
      },
    };
  }

  // Check the room `documentId` exists
  if (!room) {
    return {
      error: {
        code: 404,
        message: "Document not found",
        suggestion: "Check that you're on the correct page",
      },
    };
  }

  // Check group exists in system
  if (!group) {
    return {
      error: {
        code: 400,
        message: "Group does not exist",
        suggestion: `Check that that group ${groupId} exists in the system`,
      },
    };
  }

  // If room exists, create groupsAccess element for removing the current group
  const groupsAccesses = {
    [groupId]: null,
  };

  // Update the room with the new collaborators
  let updatedRoom;
  try {
    updatedRoom = await liveblocks.updateRoom(documentId, {
      // TODO fix
      // @ts-ignore
      groupsAccesses,
    });
  } catch (err) {
    return {
      error: {
        code: 401,
        message: "Can't edit group in room",
        suggestion: "Please refresh the page and try again",
      },
    };
  }

  if (!updatedRoom) {
    return {
      error: {
        code: 404,
        message: "Updated room not found",
        suggestion: "Contact an administrator",
      },
    };
  }

  // If successful, convert room to a list of groups and send
  const result: DocumentGroup[] = await buildDocumentGroups(
    updatedRoom as unknown as Room
  );
  return { data: result };
}
