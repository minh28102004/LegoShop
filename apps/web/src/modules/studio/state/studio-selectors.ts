import type {
  PrintText,
  StudioContentField,
  StudioElement,
} from "./studio.types";

export function selectCharacterElements(elements: StudioElement[]) {
  return elements.filter((element) => element.type === "character");
}

export function selectCharacterCount(elements: StudioElement[]): number {
  return selectCharacterElements(elements).length;
}

function findContentValue(
  fields: StudioContentField[],
  values: Record<string, string>,
  candidates: string[],
): string {
  for (const candidate of candidates) {
    const direct = values[candidate]?.trim();
    if (direct) return direct;
  }

  const field = fields.find((item) => {
    const haystack = `${item.key} ${item.label}`.toLowerCase();
    return candidates.some((candidate) =>
      haystack.includes(candidate.toLowerCase()),
    );
  });

  return field ? (values[field.key]?.trim() ?? "") : "";
}

export function selectPrintText(
  fields: StudioContentField[],
  values: Record<string, string>,
): PrintText {
  return {
    title: findContentValue(fields, values, ["title", "name", "recipientName"]),
    date: findContentValue(fields, values, ["date", "graduationDate"]),
    message: findContentValue(fields, values, [
      "message",
      "note",
      "description",
    ]),
  };
}

export function mergePrintTextIntoContentValues(
  fields: StudioContentField[],
  values: Record<string, string>,
  printText: PrintText,
): Record<string, string> {
  const next = { ...values };
  const mappings: Array<[keyof PrintText, string[]]> = [
    ["title", ["title", "name", "recipientName"]],
    ["date", ["date", "graduationDate"]],
    ["message", ["message", "note", "description"]],
  ];

  mappings.forEach(([property, candidates]) => {
    const field = fields.find((item) => {
      const normalized = `${item.key} ${item.label}`.toLowerCase();
      return candidates.some((candidate) =>
        normalized.includes(candidate.toLowerCase()),
      );
    });
    const key = field?.key ?? candidates[0];
    if (key) next[key] = printText[property];
  });

  return next;
}
