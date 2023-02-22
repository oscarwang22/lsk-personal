import { inferLsonFields } from "./fields";
import {
  inferObjectType,
  InferredObjectType,
  mergeInferredObjectTypes,
} from "./object";
import {
  InferredScalarType,
  inferScalarType,
  isInferredScalarType,
  mergeInferredScalarTypes,
} from "./scalar";
import { ChildContext, JsonScalar, PlainLson, PlainLsonObject } from "./types";
import { PartialBy } from "./utils/types";

export type InferredType = InferredScalarType | InferredObjectType;

export function isAtomic(type: InferredType): boolean {
  return "atomic" in type && !!type.atomic;
}

export function inferStorageType(value: PlainLsonObject): InferredObjectType {
  const storage: PartialBy<InferredObjectType, "fields"> = {
    names: { Storage: 1 },
    type: "Object",
    live: true,
    atomic: true,
  };

  const fields = inferLsonFields(value.data, {
    json: false,
    parent: storage,
  });
  storage.fields = fields;

  return storage as InferredObjectType;
}

export function inferType(value: PlainLson, ctx: ChildContext): InferredType {
  if (typeof value !== "object" || value === null || value === undefined) {
    return inferScalarType(value as JsonScalar, ctx);
  }

  if (Array.isArray(value)) {
    throw new Error("Not implemented");
  }

  // If we are in a json all objects are plain struct types even if they
  // have a type property
  if (!ctx.json && "liveblocksType" in value) {
    if (value.liveblocksType === "LiveObject") {
      return inferObjectType(value as PlainLsonObject, ctx);
    }

    if (value.liveblocksType === "LiveList") {
      throw new Error("Not implemented");
    }

    if (value.liveblocksType === "LiveMap") {
      throw new Error("Not implemented");
    }
  }

  return inferObjectType(value, ctx);
}

export function mergeInferredTypes(
  a: InferredType,
  b: InferredType
): InferredType | undefined {
  if (isInferredScalarType(a) && isInferredScalarType(b)) {
    return mergeInferredScalarTypes(a, b);
  }

  if (a.type === "Object" && b.type === "Object") {
    return mergeInferredObjectTypes(a, b);
  }

  // TODO: Add missing types
  return undefined;
}
