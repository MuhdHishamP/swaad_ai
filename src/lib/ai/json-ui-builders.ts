import type { FoodItem } from "@/types";
import { JSON_UI_VERSION, type JsonUiSchema } from "./json-ui-schema";

function normalizeFoodImageSrc(image: string | undefined): string | undefined {
  if (!image) return undefined;
  if (image.startsWith("/") || image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  const fileName = image.split("/").pop();
  return fileName ? `/food-images/${fileName}` : undefined;
}

export function buildWelcomeJsonUi(): JsonUiSchema {
  return {
    version: JSON_UI_VERSION,
    root: {
      component: "stack",
      props: { direction: "vertical", gap: 3 },
      children: [
        {
          component: "badge",
          props: { label: "Welcome to Swaad", tone: "warning" },
        },
        {
          component: "text",
          props: {
            text: "Pick a category to start fast, or tell me your mood and I will curate for you.",
            tone: "muted",
            size: "sm",
          },
        },
        {
          component: "stack",
          props: { direction: "horizontal", gap: 2, align: "start" },
          children: [
            {
              component: "cta_button",
              props: { label: "North Indian", action: "open_menu", variant: "secondary" },
            },
            {
              component: "cta_button",
              props: { label: "South Indian", action: "open_menu", variant: "secondary" },
            },
            {
              component: "cta_button",
              props: { label: "Street Food", action: "open_menu", variant: "secondary" },
            },
          ],
        },
      ],
    },
  };
}

export function buildChefChoiceJsonUi(food?: FoodItem): JsonUiSchema {
  const imageSrc = normalizeFoodImageSrc(food?.image);
  const subtitle = food
    ? `${food.name} is balanced on flavor, value, and crowd appeal.`
    : "Chef's pick based on your request and current menu availability.";

  const children: NonNullable<JsonUiSchema["root"]["children"]> = [
    {
      component: "badge",
      props: { label: "Chef's Choice", tone: "success" },
    },
    {
      component: "text",
      props: {
        text: subtitle,
        size: "sm",
      },
    },
  ];

  if (food) {
    children.push({
      component: "text",
      props: {
        text: `Best with: ${food.category} • ₹${food.price}`,
        tone: "muted",
        size: "sm",
      },
    });
  }

  if (imageSrc) {
    children.push({
      component: "image",
      props: {
        src: imageSrc,
        alt: food?.name || "Chef's choice",
        aspectRatio: "16:9",
      },
    });
  }

  return {
    version: JSON_UI_VERSION,
    root: {
      component: "stack",
      props: { direction: "vertical", gap: 2 },
      children,
    },
  };
}

export function buildDietarySafetyJsonUi(userMessage: string): JsonUiSchema {
  return {
    version: JSON_UI_VERSION,
    root: {
      component: "stack",
      props: { direction: "vertical", gap: 2 },
      children: [
        {
          component: "badge",
          props: { label: "Allergy Safety Check", tone: "danger" },
        },
        {
          component: "text",
          props: {
            text: "I can filter options, but always verify ingredients before ordering if you have allergies.",
            size: "sm",
          },
        },
        {
          component: "text",
          props: {
            text: `Noted: "${userMessage.trim().slice(0, 80)}"`,
            tone: "muted",
            size: "sm",
          },
        },
      ],
    },
  };
}

