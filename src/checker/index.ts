import didyoumean from "didyoumean";
import type {
  Definition,
  Document,
  Node,
  ObjectLiteralExpr,
  ObjectTypeDef,
  TypeName,
  TypeRef,
} from "../ast";
import type { ErrorReporter } from "../lib/error-reporting";

const BUILT_IN = "BUILT_IN" as const;
type BUILT_IN = typeof BUILT_IN;

const BUILT_IN_NAMES = [
  "Int",
  "String",
  "LiveList",
  "LiveMap",
  "LiveObject",
] as const;

const CARDINALITIES: Record<string, number> = {
  LiveList: 1,
  LiveMap: 2,
  LiveObject: 1,
};

type RegisteredTypeInfo = {
  definition: BUILT_IN | Definition;
  cardinality: number;
};

type Context = {
  hasErrors: boolean; // TODO: Move this into ErrorReporter
  errorReporter: ErrorReporter;

  // A registry of types by their identifier names
  registeredTypes: Map<string, RegisteredTypeInfo>;
};

function makeContext(errorReporter: ErrorReporter): Context {
  const registeredTypes = new Map(
    BUILT_IN_NAMES.map((name) => [
      name,
      {
        definition: BUILT_IN,

        // Only our hardcoded "Live" objects take params for now, you cannot
        // define your own custom parameterized types
        cardinality: CARDINALITIES[name] ?? 0,
      },
    ])
  );

  return {
    hasErrors: false, // TODO: Move this into ErrorReporter
    errorReporter,
    registeredTypes,
  };
}

function dupes<T>(items: Iterable<T>, keyFn: (item: T) => string): [T, T][] {
  const seen = new Map<string, T>();

  const dupes: [T, T][] = [];
  for (const item of items) {
    const key = keyFn(item);
    const existing = seen.get(key);
    if (existing !== undefined) {
      dupes.push([existing, item]);
    } else {
      seen.set(key, item);
    }
  }

  return dupes;
}

function checkObjectTypeDef(def: ObjectTypeDef, context: Context): void {
  checkNode(def.obj, context);
}

function checkObjectLiteralExpr(
  obj: ObjectLiteralExpr,
  context: Context
): void {
  for (const [first, second] of dupes(obj.fields, (f) => f.name.name)) {
    context.hasErrors = true;
    context.errorReporter.printSemanticError(
      `A field named ${JSON.stringify(
        first.name.name
      )} is defined multiple times (on line ${
        context.errorReporter.lineInfo(first.name.range?.[0] ?? 0).line1
      } and ${
        context.errorReporter.lineInfo(second.name.range?.[0] ?? 0).line1
      })`,
      [],
      second.name.range
    );
  }

  for (const field of obj.fields) {
    checkNode(field.type, context);
  }
}

function checkTypeName(
  node: TypeName,
  context: Context
): RegisteredTypeInfo | undefined {
  const typeDef = context.registeredTypes.get(node.name);
  if (typeDef === undefined) {
    const suggestion = didyoumean(
      node.name,
      Array.from(context.registeredTypes.keys())
    );

    context.hasErrors = true;
    context.errorReporter.printSemanticError(
      `Unknown type ${JSON.stringify(node.name)}`,
      [
        `I didn't understand what ${JSON.stringify(node.name)} refers to.`,
        suggestion ? `Did you mean ${JSON.stringify(suggestion)}?` : null,
      ],
      node.range
    );

    return undefined;
  } else {
    return typeDef;
  }
}

function checkTypeRef(node: TypeRef, context: Context): void {
  const typeDef = checkTypeName(node.name, context);
  if (typeDef === undefined) {
    return undefined;
  }

  // Check for cardinality mismatch
  if (typeDef.cardinality !== node.args.length) {
    // Too many arguments
    if (typeDef.cardinality < node.args.length) {
      context.hasErrors = true;
      const what =
        typeDef.cardinality === 0
          ? `needs no arguments`
          : `needs only ${typeDef.cardinality} arguments, but ${node.args.length} were found`;
      context.errorReporter.printSemanticError(
        `Too many arguments: type ${JSON.stringify(node.name.name)} ${what}`,
        [`Please remove the excessive arguments`],
        node.args[typeDef.cardinality].range
      );
    }

    // Too few arguments
    else {
      context.hasErrors = true;
      context.errorReporter.printSemanticError(
        `Too few arguments: type ${JSON.stringify(node.name.name)} needs ${
          typeDef.cardinality
        } type arguments`,
        [`Did you mean to write ${JSON.stringify(node.name.name + "<...>")}?`],
        node.range
      );
    }
  }
  // Special check for the LiveMap type
  else if (node.name.name === "LiveMap") {
    if (
      // Pretty ugly hardcoded limit. Yuck, I know, but we'll generalize this later :(
      node.args.length < 1 ||
      node.args[0]?._kind !== "TypeRef" ||
      node.args[0]?.name._kind !== "TypeName" ||
      node.args[0]?.name.name !== "String"
    ) {
      context.hasErrors = true;
      context.errorReporter.printSemanticError(
        `First argument to type "LiveMap" must be of type "String"`,
        [
          `In the future, we may loosen this constraint, but it's not supported right now.`,
        ],
        node.args[0]?.range ?? node.range
      );
    }
  } else if (node.name.name === "LiveObject") {
    if (
      node.args.length !== 1 ||
      node.args[0]?._kind !== "TypeRef" ||
      node.args[0]?.name._kind !== "TypeName" ||
      context.registeredTypes.get(node.args[0]?.name.name)?.definition ===
        BUILT_IN
    ) {
      context.hasErrors = true;
      context.errorReporter.printSemanticError(
        `The argument to a "LiveObject" type must be a (named) object type`,
        node.args[0]?._kind === "ObjectLiteralExpr"
          ? [
              "You cannot use object literal types for now. We may loosen this constraint in the future.",
              "",
              "To fix this, declare the object literal as a named type, and refer to it here.",
            ]
          : [],
        node.args[0]?.range ?? node.range
      );
    }
  }

  for (const arg of node.args) {
    checkNode(arg, context);
  }
}

function checkDocument(document: Document, context: Context): void {
  // Now, first add all definitions to the global registry
  for (const def of document.definitions) {
    const name = def.name.name;
    const existing = context.registeredTypes.get(name);
    if (existing !== undefined) {
      if (existing.definition === BUILT_IN) {
        context.hasErrors = true;
        context.errorReporter.printSemanticError(
          `Type ${JSON.stringify(name)} is a built-in type`,
          [
            'You cannot redefine built-in types like "Int", "String", or "LiveList".',
            "Please use a different name.",
          ],
          def.name.range
        );
      } else {
        context.hasErrors = true;
        context.errorReporter.printSemanticError(
          `A type named ${JSON.stringify(
            name
          )} is defined multiple times (on line ${
            context.errorReporter.lineInfo(
              existing.definition.name.range?.[0] ?? 0
            ).line1
          } and ${
            context.errorReporter.lineInfo(def.name.range?.[0] ?? 0).line1
          })`,
          [
            "You cannot declare types multiple times.",
            "Please remove the duplicate definition, or use a different name.",
          ],
          def.name.range
        );
      }
    } else {
      if (/^live/i.test(name)) {
        context.hasErrors = true;
        context.errorReporter.printSemanticError(
          `The name ${JSON.stringify(name)} is not allowed`,
          [
            'Type names starting with "Live" are reserved for future use.',
            "Please use a different name for your custom type.",
          ],
          def.name.range
        );
      }

      // All good, let's register it!
      context.registeredTypes.set(name, {
        definition: def,
        cardinality: 0, // You cannot define custom types with params in the schema yourself
      });
    }
  }

  if (!context.registeredTypes.has("Storage")) {
    context.hasErrors = true;
    context.errorReporter.throwSemanticError(
      'Missing root definition "Storage"',
      [
        'Every Liveblocks schema requires at least one type definition named "Storage",',
        "which indicated the root of the storage. You can declare a schema like this:",
        "",
        "  type Storage {",
        "    // Your fields here",
        "  }",
      ]
    );
  }

  for (const def of document.definitions) {
    checkNode(def, context);
  }

  if (context.hasErrors) {
    throw new Error("There were errors");
  }
}

function checkNode(node: Node, context: Context): void {
  switch (node._kind) {
    case "Document":
      return checkDocument(node, context);

    case "ObjectTypeDef":
      return checkObjectTypeDef(node, context);

    case "ObjectLiteralExpr":
      return checkObjectLiteralExpr(node, context);

    case "TypeRef":
      return checkTypeRef(node, context);

    // Ignore the following node types
    case "StringLiteral":
    case "TypeName":
      return;

    default:
      throw new Error(`TODO: Implement checker for «${node._kind}» nodes`);
  }
}

function check(doc: Document, errorReporter: ErrorReporter): Document {
  const context = makeContext(errorReporter);
  checkDocument(doc, context);
  return doc;
}

// function checkWithErrorReporter(
//   node: Node,
//   errorReporter: ErrorReporter
// ): boolean {
//   const context = makeContext(errorReporter);
//   return check(node, context);
// }

// export default checkWithErrorReporter;

// Export these only for direct access in unit tests
// export { makeContext, check as checkWithContext };

export { check };
