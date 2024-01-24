"use client";

import {
  Composer,
  ComposerEditorMentionSuggestionsProps,
} from "@liveblocks/react-comments/primitives";
import { Suspense } from "react";
import { Avatar } from "./Avatar";
import { User } from "./User";

export function MentionSuggestions({
  userIds,
}: ComposerEditorMentionSuggestionsProps) {
  return (
    <Composer.Suggestions className="p-1 bg-secondary border border-primary shadow-lg rounded-lg">
      <Composer.SuggestionsList>
        {userIds.map((userId) => (
          <MentionSuggestion key={userId} userId={userId} />
        ))}
      </Composer.SuggestionsList>
    </Composer.Suggestions>
  );
}

function MentionSuggestion({ userId }: { userId: string }) {
  return (
    <Composer.SuggestionsListItem
      value={userId}
      className="flex items-center gap-2 py-1 px-2 text-sm rounded cursor-pointer min-h-6 min-w-32 [&>img]:rounded-full data-[selected]:bg-tertiary font-medium"
    >
      <Suspense>
        <Avatar userId={userId} width={20} height={20} />
        <User userId={userId} />
      </Suspense>
    </Composer.SuggestionsListItem>
  );
}
