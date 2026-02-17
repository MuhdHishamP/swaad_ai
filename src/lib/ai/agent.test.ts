import test from "node:test";
import assert from "node:assert/strict";
import type { BaseMessage } from "@langchain/core/messages";
import { __agentTestHooks } from "./agent";
import { JSON_UI_VERSION } from "./json-ui-schema";

function makeToolMessage(payload: unknown): BaseMessage {
  return {
    content: JSON.stringify(payload),
    _getType: () => "tool",
  } as unknown as BaseMessage;
}

test("extractInlineJsonUiFromText parses and strips json_ui tags", () => {
  const input = `Here's a quick card.
<json_ui>{"version":"1","root":{"component":"text","props":{"text":"Offer"}}}</json_ui>
Done.`;

  const result = __agentTestHooks.extractInlineJsonUiFromText(input);

  assert.equal(result.candidates.length, 1);
  assert.equal(result.sanitizedText.includes("<json_ui>"), false);
  assert.equal(result.sanitizedText.includes("Here's a quick card."), true);
});

test("extractJsonUiCandidatesFromMessages reads _uiSchema from tool output", () => {
  const toolMessages: BaseMessage[] = [
    makeToolMessage({
      _uiSchema: {
        version: JSON_UI_VERSION,
        root: {
          component: "text",
          props: { text: "Promo" },
        },
      },
    }),
  ];

  const candidates = __agentTestHooks.extractJsonUiCandidatesFromMessages(toolMessages);
  assert.equal(candidates.length, 1);
});

test("buildResponseBlocks appends json_ui when enabled and payload is valid", () => {
  const inlineCandidate = {
    version: JSON_UI_VERSION,
    root: {
      component: "text",
      props: { text: "Limited offer" },
    },
  };

  const blocks = __agentTestHooks.buildResponseBlocks(
    [],
    "hello",
    "hello",
    [],
    undefined,
    [inlineCandidate],
    { enableJsonUi: true }
  );

  assert.equal(blocks.some((block) => block.type === "json_ui"), true);
});

test("buildResponseBlocks does not append json_ui when disabled", () => {
  const inlineCandidate = {
    version: JSON_UI_VERSION,
    root: {
      component: "text",
      props: { text: "Limited offer" },
    },
  };

  const blocks = __agentTestHooks.buildResponseBlocks(
    [],
    "hello",
    "hello",
    [],
    undefined,
    [inlineCandidate],
    { enableJsonUi: false }
  );

  assert.equal(blocks.some((block) => block.type === "json_ui"), false);
});

test("buildResponseBlocks enforces welcome json_ui on first turn", () => {
  const blocks = __agentTestHooks.buildResponseBlocks(
    [],
    "Hi there",
    "Hi there",
    [],
    undefined,
    [],
    { enableJsonUi: true }
  );

  assert.equal(blocks.some((block) => block.type === "json_ui"), true);
  const serialized = JSON.stringify(blocks);
  assert.equal(serialized.toLowerCase().includes("welcome to swaad"), true);
});

test("buildResponseBlocks enforces chef choice on surprise intent", () => {
  const toolMessages: BaseMessage[] = [
    makeToolMessage({
      _foodItems: [
        {
          id: 1,
          name: "Butter Chicken",
          image: "images/butter_chicken.png",
          description: "desc",
          category: "North Indian",
          type: "Non-Vegetarian",
          spiceLevel: "Mild",
          ingredients: ["Chicken"],
          nutrition: { calories: 1, protein: "1g", carbs: "1g", fat: "1g" },
          price: 379,
          serves: 1,
        },
      ],
    }),
  ];

  const blocks = __agentTestHooks.buildResponseBlocks(
    toolMessages,
    "I found something special for you.",
    "Surprise me with something special",
    [makeToolMessage({ content: "previous" })],
    undefined,
    [],
    { enableJsonUi: true }
  );

  const serialized = JSON.stringify(blocks).toLowerCase();
  assert.equal(serialized.includes("chef's choice"), true);
});

test("buildResponseBlocks does not show generic chef choice without menu items", () => {
  const blocks = __agentTestHooks.buildResponseBlocks(
    [],
    "I can recommend something great for you.",
    "Surprise me with something special",
    [makeToolMessage({ content: "previous" })],
    undefined,
    [],
    { enableJsonUi: true }
  );

  const serialized = JSON.stringify(blocks).toLowerCase();
  assert.equal(serialized.includes("chef's choice"), false);
});

test("buildResponseBlocks enforces allergy warning json_ui", () => {
  const blocks = __agentTestHooks.buildResponseBlocks(
    [],
    "Noted. I will keep that in mind.",
    "I am allergic to peanuts",
    [makeToolMessage({ content: "previous" })],
    undefined,
    [],
    { enableJsonUi: true }
  );

  const serialized = JSON.stringify(blocks).toLowerCase();
  assert.equal(serialized.includes("allergy safety check"), true);
});
