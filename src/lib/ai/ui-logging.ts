export type JsonUiValidationEvent = {
  accepted: boolean;
  reason?: string;
  issueCount?: number;
  issues?: string[];
};

export function logJsonUiValidation(event: JsonUiValidationEvent): void {
  if (event.accepted) {
    console.info("[json_ui] payload accepted");
    return;
  }

  console.warn("[json_ui] payload rejected", {
    reason: event.reason || "unknown",
    issueCount: event.issueCount ?? 0,
    issues: event.issues,
  });
}
