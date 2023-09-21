"use client";

import type { ComponentProps } from "react";
import React, { forwardRef } from "react";

import { classNames } from "../../utils/class-names";

interface Props extends ComponentProps<"button"> {
  variant?: "default" | "outline" | "primary";
}

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "default", className, ...props }, forwardedRef) => {
    return (
      <button
        type="button"
        className={classNames("lb-button", className)}
        data-variant={variant}
        {...props}
        ref={forwardedRef}
      />
    );
  }
);
