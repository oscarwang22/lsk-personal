import * as RadixPopover from "@radix-ui/react-popover";
import cx from "classnames";
import type { ComponentProps } from "react";
import { useCallback, useState } from "react";

import {
  useCurrentRoomId,
  useRoomIds,
  useSetCurrentRoomId,
} from "../contexts/CurrentRoom";

export function RoomSelector({
  className,
  ...props
}: ComponentProps<typeof RadixPopover.Trigger>) {
  const [isOpen, setOpen] = useState(false);
  const currentRoomId = useCurrentRoomId();
  const setCurrentRoomId = useSetCurrentRoomId();

  const roomIds = useRoomIds();

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
  }, []);

  return (
    <RadixPopover.Root open={isOpen} onOpenChange={handleOpenChange} modal>
      <RadixPopover.Trigger
        className={cx(
          className,
          "flex h-5 items-center pr-1.5 pl-1 font-medium"
        )}
        {...props}
      >
        <span>{currentRoomId}</span>
        <svg
          width="9"
          height="6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="ml-1 translate-y-px text-gray-300"
        >
          <path d="m1 1 3.5 3.5L8 1" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          className="min-w-[120px] max-w-[360px] overflow-hidden rounded bg-gray-800 text-white"
          align="start"
          side="bottom"
          sideOffset={1}
          collisionPadding={6}
        >
          <ul className="flex flex-col">
            {roomIds.map((roomId) => {
              const handleClick = () => {
                setCurrentRoomId(roomId);
                setOpen(false);
              };

              return (
                <li
                  key={roomId}
                  className="w-full border-b border-gray-600 last:border-0"
                >
                  <button
                    onClick={handleClick}
                    className="flex w-full items-center px-2 py-2"
                  >
                    <span className="mr-1.5 h-[12px] w-[12px] flex-none">
                      {currentRoomId === roomId && (
                        <svg
                          width="12"
                          height="12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9.75 2.75 5 8.75l-2.75-2.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                    <span className="truncate font-medium">{roomId}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <RadixPopover.Arrow height={4} className="fill-gray-900" />
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}
