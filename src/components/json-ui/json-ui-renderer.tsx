"use client";

import type { ReactNode } from "react";
import { Component } from "react";
import { useRouter } from "next/navigation";
import type { JsonUiBlock } from "@/types";
import { useCartStore } from "@/stores/cart-store";
import { jsonUiRegistry, type JsonUiComponentType } from "./registry";

interface JsonUiRendererProps {
  schema: JsonUiBlock["schema"];
}

interface JsonUiRenderErrorBoundaryState {
  hasError: boolean;
}

class JsonUiRenderErrorBoundary extends Component<
  { children: ReactNode },
  JsonUiRenderErrorBoundaryState
> {
  state: JsonUiRenderErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): JsonUiRenderErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <JsonUiFallback />;
    }

    return this.props.children;
  }
}

function JsonUiFallback() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--background-secondary)] p-3 text-sm text-[var(--foreground-secondary)]">
      Unable to render this UI card.
    </div>
  );
}

function renderNode(
  node: JsonUiBlock["schema"]["root"],
  depth: number,
  onAction: (action: string, label?: string) => void
): ReactNode {
  if (depth > 8) {
    return null;
  }

  const componentType = node.component as JsonUiComponentType;
  const component = jsonUiRegistry[componentType];
  if (!component) {
    return null;
  }

  const children = (node.children ?? []).map((child, index) => (
    <div key={`${child.component}-${depth}-${index}`}>
      {renderNode(child, depth + 1, onAction)}
    </div>
  ));

  if (componentType === "stack") {
    return jsonUiRegistry.stack(node.props ?? {}, children);
  }

  if (componentType === "cta_button") {
    return jsonUiRegistry.cta_button(node.props ?? {}, onAction);
  }

  if (componentType === "text") {
    return jsonUiRegistry.text(node.props ?? {});
  }

  if (componentType === "badge") {
    return jsonUiRegistry.badge(node.props ?? {});
  }

  if (componentType === "image") {
    return jsonUiRegistry.image(node.props ?? {});
  }

  return null;
}

export function JsonUiRenderer({ schema }: JsonUiRendererProps) {
  const router = useRouter();
  const setCartOpen = useCartStore((s) => s.setCartOpen);
  const allowedActions = new Set(["open_menu", "show_cart", "checkout"]);

  const resolveMenuRoute = (label?: string): string => {
    if (typeof label !== "string" || label.trim().length === 0) return "/menu";

    const normalized = label.trim().toLowerCase();
    const knownCategoryLabels = new Set(["north indian", "south indian", "street food"]);
    if (!knownCategoryLabels.has(normalized)) {
      return "/menu";
    }

    return `/menu?category=${encodeURIComponent(label.trim())}`;
  };

  const handleAction = (action: string, label?: string) => {
    if (!allowedActions.has(action)) {
      console.info("[json_ui] action_ignored", {
        reason: "unknown_action",
        action,
      });
      return;
    }

    const safeLabel = typeof label === "string" ? label : undefined;

    if (action === "open_menu") {
      const target = resolveMenuRoute(safeLabel);
      console.info("[json_ui] action_executed", { action, target, label: safeLabel });
      router.push(target);
      return;
    }

    if (action === "checkout") {
      console.info("[json_ui] action_executed", { action, target: "/checkout" });
      router.push("/checkout");
      return;
    }

    if (action === "show_cart") {
      console.info("[json_ui] action_executed", { action });
      setCartOpen(true);
      return;
    }
  };

  if (!schema?.root) {
    return <JsonUiFallback />;
  }

  return (
    <JsonUiRenderErrorBoundary>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--background-secondary)] p-3">
        {renderNode(schema.root, 1, handleAction)}
      </div>
    </JsonUiRenderErrorBoundary>
  );
}
