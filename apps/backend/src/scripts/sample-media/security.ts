const URL_WITH_QUERY_PATTERN = /https:\/\/[^\s"'<>]+/gi;

export function redactSourceUrl(value: string): string {
  try {
    const parsed = new URL(value);
    parsed.search = '';
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return '[invalid-url]';
  }
}

export function sanitizeReportText(value: string): string {
  return value.replace(URL_WITH_QUERY_PATTERN, (match) =>
    redactSourceUrl(match),
  );
}

export function safeErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return sanitizeReportText(message).slice(0, 2_000);
}
