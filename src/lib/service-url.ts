const URL_SCHEME_PATTERN = /^[a-z][a-z\d+.-]*:\/\//i;

/**
 * Accepts regular web URLs as well as hostnames/IP addresses with an optional port.
 * Bare values are stored as HTTP URLs so they remain usable as links in the UI.
 */
export function normalizeServiceUrl(value: string) {
  const trimmedValue = value.trim();
  if (!trimmedValue) return null;

  const candidate = URL_SCHEME_PATTERN.test(trimmedValue) ? trimmedValue : `http://${trimmedValue}`;

  try {
    const parsedUrl = new URL(candidate);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") return null;
    if (!parsedUrl.hostname) return null;
    return parsedUrl.toString();
  } catch {
    return null;
  }
}
