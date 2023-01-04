/**
 * This file is AUTOMATICALLY GENERATED.
 * DO NOT edit this file manually.
 *
 * Instead, update the `ast.grammar` file, and re-run `npm run build-ast`
 */

import invariant from "tiny-invariant";

export function isComment(node: Node): node is Comment {
  return node._kind === "LineComment";
}

export function isDefinition(node: Node): node is Definition {
  return node._kind === "ObjectTypeDef";
}

export function isLiteral(node: Node): node is Literal {
  return node._kind === "StringLiteral";
}

export function isTypeExpr(node: Node): node is TypeExpr {
  return (
    node._kind === "ObjectLiteralExpr" ||
    node._kind === "TypeRef" ||
    isLiteral(node)
  );
}

export type Comment = LineComment;

export type Definition = ObjectTypeDef;

export type Literal = StringLiteral;

export type TypeExpr = Literal | ObjectLiteralExpr | TypeRef;

export type Range = [number, number];

export type Node =
  | Document
  | FieldDef
  | Identifier
  | LineComment
  | ObjectLiteralExpr
  | ObjectTypeDef
  | StringLiteral
  | TypeName
  | TypeRef;

export function isRange(thing: Range): thing is Range {
  return (
    Array.isArray(thing) &&
    thing.length === 2 &&
    typeof thing[0] === "number" &&
    typeof thing[1] === "number"
  );
}

export function isNode(node: Node): node is Node {
  return (
    node._kind === "Document" ||
    node._kind === "FieldDef" ||
    node._kind === "Identifier" ||
    node._kind === "LineComment" ||
    node._kind === "ObjectLiteralExpr" ||
    node._kind === "ObjectTypeDef" ||
    node._kind === "StringLiteral" ||
    node._kind === "TypeName" ||
    node._kind === "TypeRef"
  );
}

export type Document = {
  _kind: "Document";
  definitions: Definition[];
  comments: Comment[] | null;
  range: Range;
};

export type FieldDef = {
  _kind: "FieldDef";
  name: Identifier;
  optional: boolean;
  type: TypeExpr;
  range: Range;
};

export type Identifier = {
  _kind: "Identifier";
  name: string;
  range: Range;
};

export type LineComment = {
  _kind: "LineComment";
  text: string;
  range: Range;
};

export type ObjectLiteralExpr = {
  _kind: "ObjectLiteralExpr";
  fields: FieldDef[];
  range: Range;
};

export type ObjectTypeDef = {
  _kind: "ObjectTypeDef";
  name: TypeName;
  obj: ObjectLiteralExpr;
  range: Range;
};

export type StringLiteral = {
  _kind: "StringLiteral";
  value: string;
  rawValue: string;
  range: Range;
};

export type TypeName = {
  _kind: "TypeName";
  name: string;
  range: Range;
};

export type TypeRef = {
  _kind: "TypeRef";
  name: TypeName;
  args: TypeExpr[];
  range: Range;
};

export function Document(
  definitions: Definition[],
  comments: Comment[] | null = null,
  range: Range = [0, 0]
): Document {
  invariant(
    Array.isArray(definitions) &&
      definitions.length > 0 &&
      definitions.every((item) => isDefinition(item)),
    `Invalid value for "definitions" arg in "Document" call.\nExpected: @Definition+\nGot:      ${JSON.stringify(
      definitions
    )}`
  );

  invariant(
    comments === null ||
      (Array.isArray(comments) && comments.every((item) => isComment(item))),
    `Invalid value for "comments" arg in "Document" call.\nExpected: @Comment*?\nGot:      ${JSON.stringify(
      comments
    )}`
  );

  invariant(
    isRange(range),
    `Invalid value for range in "Document".\nExpected: Range\nGot: ${JSON.stringify(
      range
    )}`
  );
  return {
    _kind: "Document",
    definitions,
    comments,
    range,
  };
}

export function FieldDef(
  name: Identifier,
  optional: boolean,
  type: TypeExpr,
  range: Range = [0, 0]
): FieldDef {
  invariant(
    name._kind === "Identifier",
    `Invalid value for "name" arg in "FieldDef" call.\nExpected: Identifier\nGot:      ${JSON.stringify(
      name
    )}`
  );

  invariant(
    typeof optional === "boolean",
    `Invalid value for "optional" arg in "FieldDef" call.\nExpected: boolean\nGot:      ${JSON.stringify(
      optional
    )}`
  );

  invariant(
    isTypeExpr(type),
    `Invalid value for "type" arg in "FieldDef" call.\nExpected: @TypeExpr\nGot:      ${JSON.stringify(
      type
    )}`
  );

  invariant(
    isRange(range),
    `Invalid value for range in "FieldDef".\nExpected: Range\nGot: ${JSON.stringify(
      range
    )}`
  );
  return {
    _kind: "FieldDef",
    name,
    optional,
    type,
    range,
  };
}

export function Identifier(name: string, range: Range = [0, 0]): Identifier {
  invariant(
    typeof name === "string",
    `Invalid value for "name" arg in "Identifier" call.\nExpected: string\nGot:      ${JSON.stringify(
      name
    )}`
  );

  invariant(
    isRange(range),
    `Invalid value for range in "Identifier".\nExpected: Range\nGot: ${JSON.stringify(
      range
    )}`
  );
  return {
    _kind: "Identifier",
    name,
    range,
  };
}

export function LineComment(text: string, range: Range = [0, 0]): LineComment {
  invariant(
    typeof text === "string",
    `Invalid value for "text" arg in "LineComment" call.\nExpected: string\nGot:      ${JSON.stringify(
      text
    )}`
  );

  invariant(
    isRange(range),
    `Invalid value for range in "LineComment".\nExpected: Range\nGot: ${JSON.stringify(
      range
    )}`
  );
  return {
    _kind: "LineComment",
    text,
    range,
  };
}

export function ObjectLiteralExpr(
  fields: FieldDef[] = [],
  range: Range = [0, 0]
): ObjectLiteralExpr {
  invariant(
    Array.isArray(fields) && fields.every((item) => item._kind === "FieldDef"),
    `Invalid value for "fields" arg in "ObjectLiteralExpr" call.\nExpected: FieldDef*\nGot:      ${JSON.stringify(
      fields
    )}`
  );

  invariant(
    isRange(range),
    `Invalid value for range in "ObjectLiteralExpr".\nExpected: Range\nGot: ${JSON.stringify(
      range
    )}`
  );
  return {
    _kind: "ObjectLiteralExpr",
    fields,
    range,
  };
}

export function ObjectTypeDef(
  name: TypeName,
  obj: ObjectLiteralExpr,
  range: Range = [0, 0]
): ObjectTypeDef {
  invariant(
    name._kind === "TypeName",
    `Invalid value for "name" arg in "ObjectTypeDef" call.\nExpected: TypeName\nGot:      ${JSON.stringify(
      name
    )}`
  );

  invariant(
    obj._kind === "ObjectLiteralExpr",
    `Invalid value for "obj" arg in "ObjectTypeDef" call.\nExpected: ObjectLiteralExpr\nGot:      ${JSON.stringify(
      obj
    )}`
  );

  invariant(
    isRange(range),
    `Invalid value for range in "ObjectTypeDef".\nExpected: Range\nGot: ${JSON.stringify(
      range
    )}`
  );
  return {
    _kind: "ObjectTypeDef",
    name,
    obj,
    range,
  };
}

export function StringLiteral(
  value: string,
  rawValue: string,
  range: Range = [0, 0]
): StringLiteral {
  invariant(
    typeof value === "string",
    `Invalid value for "value" arg in "StringLiteral" call.\nExpected: string\nGot:      ${JSON.stringify(
      value
    )}`
  );

  invariant(
    typeof rawValue === "string",
    `Invalid value for "rawValue" arg in "StringLiteral" call.\nExpected: string\nGot:      ${JSON.stringify(
      rawValue
    )}`
  );

  invariant(
    isRange(range),
    `Invalid value for range in "StringLiteral".\nExpected: Range\nGot: ${JSON.stringify(
      range
    )}`
  );
  return {
    _kind: "StringLiteral",
    value,
    rawValue,
    range,
  };
}

export function TypeName(name: string, range: Range = [0, 0]): TypeName {
  invariant(
    typeof name === "string",
    `Invalid value for "name" arg in "TypeName" call.\nExpected: string\nGot:      ${JSON.stringify(
      name
    )}`
  );

  invariant(
    isRange(range),
    `Invalid value for range in "TypeName".\nExpected: Range\nGot: ${JSON.stringify(
      range
    )}`
  );
  return {
    _kind: "TypeName",
    name,
    range,
  };
}

export function TypeRef(
  name: TypeName,
  args: TypeExpr[] = [],
  range: Range = [0, 0]
): TypeRef {
  invariant(
    name._kind === "TypeName",
    `Invalid value for "name" arg in "TypeRef" call.\nExpected: TypeName\nGot:      ${JSON.stringify(
      name
    )}`
  );

  invariant(
    Array.isArray(args) && args.every((item) => isTypeExpr(item)),
    `Invalid value for "args" arg in "TypeRef" call.\nExpected: @TypeExpr*\nGot:      ${JSON.stringify(
      args
    )}`
  );

  invariant(
    isRange(range),
    `Invalid value for range in "TypeRef".\nExpected: Range\nGot: ${JSON.stringify(
      range
    )}`
  );
  return {
    _kind: "TypeRef",
    name,
    args,
    range,
  };
}

interface Visitor<TContext> {
  Document?(node: Document, context: TContext): void;
  FieldDef?(node: FieldDef, context: TContext): void;
  Identifier?(node: Identifier, context: TContext): void;
  LineComment?(node: LineComment, context: TContext): void;
  ObjectLiteralExpr?(node: ObjectLiteralExpr, context: TContext): void;
  ObjectTypeDef?(node: ObjectTypeDef, context: TContext): void;
  StringLiteral?(node: StringLiteral, context: TContext): void;
  TypeName?(node: TypeName, context: TContext): void;
  TypeRef?(node: TypeRef, context: TContext): void;
}

export function visit<TNode extends Node>(
  node: TNode,
  visitor: Visitor<undefined>
): TNode;
export function visit<TNode extends Node, TContext>(
  node: TNode,
  visitor: Visitor<TContext>,
  context: TContext
): TNode;
export function visit<TNode extends Node, TContext>(
  node: TNode,
  visitor: Visitor<TContext | undefined>,
  context?: TContext
): TNode {
  switch (node._kind) {
    case "Document":
      visitor.Document?.(node, context);
      node.definitions.forEach((d) => visit(d, visitor, context));
      // TODO: Implement visiting for _optional_ field node.comments
      break;

    case "FieldDef":
      visitor.FieldDef?.(node, context);
      visit(node.name, visitor, context);
      visit(node.type, visitor, context);
      break;

    case "Identifier":
      visitor.Identifier?.(node, context);
      break;

    case "LineComment":
      visitor.LineComment?.(node, context);
      break;

    case "ObjectLiteralExpr":
      visitor.ObjectLiteralExpr?.(node, context);
      node.fields.forEach((f) => visit(f, visitor, context));
      break;

    case "ObjectTypeDef":
      visitor.ObjectTypeDef?.(node, context);
      visit(node.name, visitor, context);
      visit(node.obj, visitor, context);
      break;

    case "StringLiteral":
      visitor.StringLiteral?.(node, context);
      break;

    case "TypeName":
      visitor.TypeName?.(node, context);
      break;

    case "TypeRef":
      visitor.TypeRef?.(node, context);
      visit(node.name, visitor, context);
      node.args.forEach((a) => visit(a, visitor, context));
      break;
  }

  return node;
}
