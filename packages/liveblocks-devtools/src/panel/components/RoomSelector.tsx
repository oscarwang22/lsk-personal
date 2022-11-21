import * as RadixSelect from "@radix-ui/react-select";
import cx from "classnames";
import type { ComponentProps } from "react";
import { useCallback } from "react";

import {
  useCurrentRoomId,
  useRoomIds,
  useSetCurrentRoomId,
} from "../contexts/CurrentRoom";

export function RoomSelector({
  className,
  ...props
}: ComponentProps<typeof RadixSelect.Trigger>) {
  const currentRoomId = useCurrentRoomId();
  const setCurrentRoomId = useSetCurrentRoomId();

  const roomIds = useRoomIds();

  const handleValueChange = useCallback((value: string) => {
    setCurrentRoomId(value);
  }, []);

  return (
    <RadixSelect.Root
      onValueChange={handleValueChange}
      value={currentRoomId ?? undefined}
    >
      <RadixSelect.Trigger
        className={cx(
          className,
          "text-dark-600 hover:text-dark-0 focus-visible:text-dark-0 dark:text-light-600 dark:hover:text-light-0 dark:focus-visible:text-light-0 flex h-5 items-center pr-1.5 pl-1"
        )}
        aria-label="Room"
        {...props}
      >
        <RadixSelect.Value />
        <RadixSelect.Icon className="ml-1 block">
          <svg
            width="9"
            height="6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="translate-y-px opacity-50"
          >
            <path
              d="m1 1 3.5 3.5L8 1"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content className="bg-dark-0 text-light-0 dark:bg-dark-100 dark:border-dark-300 border-dark-0 rounded-lg border p-1">
          <RadixSelect.Viewport>
            {roomIds.map((roomId) => (
              <RadixSelect.Item
                value={roomId}
                key={roomId}
                className={cx(
                  "data-[highlighted]:bg-light-0 data-[highlighted]:text-dark-0 relative flex items-center rounded py-0.5 pr-1.5 pl-6"
                )}
              >
                <RadixSelect.ItemIndicator className="absolute left-1">
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="m12 5-5.5 6L4 8.273"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </RadixSelect.ItemIndicator>
                <RadixSelect.ItemText>{roomId}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
