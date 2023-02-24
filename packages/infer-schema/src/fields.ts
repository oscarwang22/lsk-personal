import { AST } from "@liveblocks/schema";
import { string } from "decoders";

import type { ChildContext } from "./inference";
import type { JsonObject, PlainLsonFields } from "./plainLson";
import type { InferredSchema } from "./schema";
import type { InferredTypeReference } from "./typeReference";
import {
  inferredTypeReferenceToAst,
  inferTypeReference,
  mergeInferredTypeReferences,
} from "./typeReference";
import { invariant } from "./utils/invariant";
import { isNotUndefined } from "./utils/typeGuards";

export type InferredFields = Record<string, InferredTypeReference>;

const RESERVED_NAMES = new Set(["liveblocksType"]);

const propertyKeyDecoder = string
  .refine((key) => !RESERVED_NAMES.has(key), "cannot be a reserved name")
  .refine((key) => key.length > 0, "cannot be empty")
  .refine((key) => key.match(/\s/) === null, "cannot contain whitespace")
  .refine(
    (key) => key.match(/^[a-zA-Z0-9_]*$/) !== null,
    "can only contain alphanumeric characters and underscores"
  );

function assertValidPropertyKey(key: string) {
  const result = propertyKeyDecoder.decode(key);
  if (!result.ok) {
    throw new Error(`Invalid property key: ${result.error.text}`);
  }
}

export function inferLsonFields(
  fields: PlainLsonFields | JsonObject,
  ctx: Omit<ChildContext, "field">
): InferredFields {
  const fieldEntries = Object.entries(fields)
    .map(([key, value]) => {
      if (value === undefined) {
        return undefined;
      }

      assertValidPropertyKey(key);
      return [key, inferTypeReference(value, { ...ctx, field: key })] as const;
    })
    .filter(isNotUndefined);

  return Object.fromEntries(fieldEntries);
}

export function mergeInferredFields(
  a: InferredFields,
  b: InferredFields
): InferredFields | undefined {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);

  const mergedFields: InferredFields = {};
  for (const key of keys) {
    const valueA = a[key];
    const valueB = b[key];

    if (!valueA || !valueB) {
      const mergedValue = valueA ?? valueB;

      // Should never happen
      invariant(isNotUndefined(mergedValue));

      mergedFields[key] = { ...mergedValue, optional: true };
      continue;
    }

    const mergedValue = mergeInferredTypeReferences(valueA, valueB);
    if (!mergedValue) {
      return undefined;
    }

    mergedFields[key] = mergedValue;
  }

  return mergedFields;
}

export function inferredFieldsToAst(
  fields: InferredFields,
  schema: InferredSchema
): AST.FieldDef[] {
  return Object.entries(fields).map(([name, value]) =>
    AST.fieldDef(
      AST.identifier(name),
      value.optional,
      inferredTypeReferenceToAst(value, schema)
    )
  );
}
