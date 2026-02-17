import test from "node:test";
import assert from "node:assert/strict";
import {
  JSON_UI_MAX_DEPTH,
  JSON_UI_VERSION,
  validateJsonUiSchema,
} from "./json-ui-schema";

test("accepts a valid json_ui payload", () => {
  const result = validateJsonUiSchema({
    version: JSON_UI_VERSION,
    root: {
      component: "stack",
      props: {
        direction: "vertical",
        gap: 2,
      },
      children: [
        {
          component: "text",
          props: {
            text: "Today's special",
            tone: "default",
          },
        },
        {
          component: "badge",
          props: {
            label: "20% off",
            tone: "success",
          },
        },
      ],
    },
  });

  assert.equal(result.ok, true);
});

test("rejects unknown component types", () => {
  const result = validateJsonUiSchema({
    version: JSON_UI_VERSION,
    root: {
      component: "modal",
      props: {},
    },
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.ok(result.issues.some((issue) => issue.includes("component")));
  }
});

test("rejects trees deeper than the configured depth limit", () => {
  const makeDeepTree = (depth: number): unknown => {
    if (depth <= 1) {
      return {
        component: "text",
        props: { text: "leaf" },
      };
    }

    return {
      component: "stack",
      props: { direction: "vertical", gap: 1 },
      children: [makeDeepTree(depth - 1)],
    };
  };

  const result = validateJsonUiSchema({
    version: JSON_UI_VERSION,
    root: makeDeepTree(JSON_UI_MAX_DEPTH + 1),
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.ok(result.issues.some((issue) => issue.includes("depth exceeds limit")));
  }
});

test("rejects oversized payloads", () => {
  const result = validateJsonUiSchema({
    version: JSON_UI_VERSION,
    root: {
      component: "text",
      props: {
        text: "x".repeat(20_000),
      },
    },
  });

  assert.equal(result.ok, false);
});

