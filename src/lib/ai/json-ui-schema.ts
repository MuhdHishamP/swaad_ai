import { z } from "zod";

export const JSON_UI_VERSION = "1";
export const JSON_UI_MAX_DEPTH = 5;
export const JSON_UI_MAX_NODES = 40;
export const JSON_UI_MAX_CHILDREN = 10;
export const JSON_UI_MAX_BYTES = 12_000;

const toneSchema = z.enum(["default", "muted", "success", "warning", "danger"]);
const textAlignSchema = z.enum(["left", "center", "right"]);

const textNodePropsSchema = z
  .object({
    text: z.string().min(1).max(240),
    tone: toneSchema.optional(),
    align: textAlignSchema.optional(),
    size: z.enum(["sm", "md", "lg"]).optional(),
    weight: z.enum(["normal", "medium", "semibold", "bold"]).optional(),
  })
  .strict();

const stackNodePropsSchema = z
  .object({
    direction: z.enum(["vertical", "horizontal"]).default("vertical"),
    gap: z.number().int().min(0).max(8).default(2),
    align: z.enum(["start", "center", "end", "stretch"]).optional(),
    justify: z.enum(["start", "center", "end", "between"]).optional(),
  })
  .strict();

const badgeNodePropsSchema = z
  .object({
    label: z.string().min(1).max(80),
    tone: toneSchema.optional(),
  })
  .strict();

const imageNodePropsSchema = z
  .object({
    src: z.string().min(1).max(500),
    alt: z.string().min(1).max(120),
    aspectRatio: z.enum(["1:1", "4:3", "16:9"]).optional(),
  })
  .strict()
  .refine((value) => value.src.startsWith("/") || /^https?:\/\//.test(value.src), {
    message: "image src must be absolute http(s) URL or a root-relative path",
  });

const ctaButtonNodePropsSchema = z
  .object({
    label: z.string().min(1).max(80),
    action: z.enum(["open_menu", "show_cart", "checkout"]),
    variant: z.enum(["primary", "secondary", "ghost"]).optional(),
  })
  .strict();

interface JsonUiTreeNode {
  children?: JsonUiTreeNode[];
}

const textNodeSchema = z
  .object({
    component: z.literal("text"),
    props: textNodePropsSchema,
    children: z.never().optional(),
  })
  .strict();

const badgeNodeSchema = z
  .object({
    component: z.literal("badge"),
    props: badgeNodePropsSchema,
    children: z.never().optional(),
  })
  .strict();

const imageNodeSchema = z
  .object({
    component: z.literal("image"),
    props: imageNodePropsSchema,
    children: z.never().optional(),
  })
  .strict();

const ctaButtonNodeSchema = z
  .object({
    component: z.literal("cta_button"),
    props: ctaButtonNodePropsSchema,
    children: z.never().optional(),
  })
  .strict();

const jsonUiNodeSchema: z.ZodTypeAny = z.lazy(() =>
  z.discriminatedUnion("component", [
    textNodeSchema,
    badgeNodeSchema,
    imageNodeSchema,
    ctaButtonNodeSchema,
    z
      .object({
        component: z.literal("stack"),
        props: stackNodePropsSchema,
        children: z.array(jsonUiNodeSchema).min(1).max(JSON_UI_MAX_CHILDREN),
      })
      .strict(),
  ])
);

export const jsonUiSchema = z
  .object({
    version: z.literal(JSON_UI_VERSION),
    root: jsonUiNodeSchema,
  })
  .strict()
  .superRefine((value, ctx) => {
    let nodeCount = 0;

    const walk = (node: JsonUiTreeNode, depth: number, path: Array<string | number>) => {
      nodeCount += 1;

      if (depth > JSON_UI_MAX_DEPTH) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `UI tree depth exceeds limit (${JSON_UI_MAX_DEPTH})`,
          path,
        });
      }

      if (nodeCount > JSON_UI_MAX_NODES) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `UI node count exceeds limit (${JSON_UI_MAX_NODES})`,
          path,
        });
      }

      const children = Array.isArray(node.children) ? node.children : [];
      if (children.length > JSON_UI_MAX_CHILDREN) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Child count exceeds limit (${JSON_UI_MAX_CHILDREN})`,
          path: [...path, "children"],
        });
      }

      children.forEach((child, index) => {
        walk(child, depth + 1, [...path, "children", index]);
      });
    };

    walk(value.root as JsonUiTreeNode, 1, ["root"]);

    const byteLength = new TextEncoder().encode(JSON.stringify(value)).length;
    if (byteLength > JSON_UI_MAX_BYTES) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Payload size exceeds limit (${JSON_UI_MAX_BYTES} bytes)`,
        path: [],
      });
    }
  });

export interface JsonUiSchemaNode {
  component: string;
  props?: Record<string, unknown>;
  children?: JsonUiSchemaNode[];
}

export interface JsonUiSchema {
  version: string;
  root: JsonUiSchemaNode;
}

export interface JsonUiValidationFailure {
  ok: false;
  error: "INVALID_JSON_UI_SCHEMA";
  issues: string[];
}

export interface JsonUiValidationSuccess {
  ok: true;
  data: JsonUiSchema;
}

export type JsonUiValidationResult = JsonUiValidationSuccess | JsonUiValidationFailure;

export function validateJsonUiSchema(input: unknown): JsonUiValidationResult {
  const result = jsonUiSchema.safeParse(input);

  if (!result.success) {
    return {
      ok: false,
      error: "INVALID_JSON_UI_SCHEMA",
      issues: result.error.issues.map((issue) =>
        issue.path.length > 0
          ? `${issue.path.join(".")}: ${issue.message}`
          : issue.message
      ),
    };
  }

  return {
    ok: true,
    data: result.data as JsonUiSchema,
  };
}

export function parseJsonUiSchema(input: unknown): JsonUiSchema {
  return jsonUiSchema.parse(input) as JsonUiSchema;
}
