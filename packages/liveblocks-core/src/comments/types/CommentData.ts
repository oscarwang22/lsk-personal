import type { CommentBody } from "./CommentBody";
import type { DateToString } from "./DateToString";

type CommentReactionUser = {
  id: string;
};

export type CommentReaction = {
  emoji: string;
  createdAt: Date;
  users: CommentReactionUser[];
};

/**
 * Represents a comment.
 */
export type CommentData = {
  type: "comment";
  id: string;
  threadId: string;
  roomId: string;
  userId: string;
  createdAt: Date;
  editedAt?: Date;
  reactions: CommentReaction[];
} & (
  | { body: CommentBody; deletedAt?: never }
  | { body?: never; deletedAt: Date }
);

export type CommentDataPlain = Omit<
  DateToString<CommentData>,
  "reaction" | "body"
> & {
  reactions: DateToString<CommentReaction[]>;
} & (
    | { body: CommentBody; deletedAt?: never }
    | { body?: never; deletedAt: string }
  );
