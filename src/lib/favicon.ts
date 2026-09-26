const faviconTimeoutMs = 3500;
const fallbackFaviconBaseUrl = "https://www.google.com/s2/favicons";

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function withTimeout<T>(callback: (signal: AbortSignal) => Promise<T>) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), faviconTimeoutMs);

  return callback(controller.signal).finally(() => clearTimeout(timer));
}

function attributeValue(tag: string, attribute: string) {
  const match = tag.match(new RegExp(`${attribute}\\s*=\\s*["']([^"']+)["']`, "i"));
  return match?.[1]?.trim() ?? "";
}

function extractIconLinks(html: string, pageUrl: string) {
  const links = [...html.matchAll(/<link\b[^>]*>/gi)]
    .map((match) => match[0])
    .map((tag) => ({ rel: attributeValue(tag, "rel").toLowerCase(), href: attributeValue(tag, "href") }))
    .filter((link) => link.href && link.rel.split(/\s+/).some((value) => value === "icon" || value === "shortcut" || value === "apple-touch-icon"))
    .map((link) => {
      try {
        return new URL(link.href, pageUrl).toString();
      } catch {
        return "";
      }
    })
    .filter((url) => isHttpUrl(url));

  return [...new Set(links)];
}

async function isReachableIcon(url: string) {
  try {
    const response = await withTimeout((signal) => fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal,
      headers: { "user-agent": "CompanyDashboard/1.0 favicon-discovery" },
    }));
    return response.ok;
  } catch {
    return false;
  }
}

function fallbackFaviconUrl(serviceUrl: string) {
  const hostname = new URL(serviceUrl).hostname;
  return `${fallbackFaviconBaseUrl}?domain=${encodeURIComponent(hostname)}&sz=128`;
}

/**
 * Finds a usable favicon without making the browser or the user upload an image.
 * The Google favicon endpoint is intentionally the last remote fallback; the UI
 * still has its own letter/Lucide fallback if that image cannot be loaded.
 */
export async function resolveFaviconUrl(serviceUrl: string) {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(serviceUrl);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") return null;
  } catch {
    return null;
  }

  try {
    const response = await withTimeout((signal) => fetch(parsedUrl, {
      redirect: "follow",
      signal,
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent": "CompanyDashboard/1.0 favicon-discovery",
      },
    }));

    if (response.ok) {
      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("text/html") || contentType.includes("application/xhtml+xml")) {
        const html = (await response.text()).slice(0, 500_000);
        const iconLinks = extractIconLinks(html, response.url || parsedUrl.toString());
        for (const iconLink of iconLinks) {
          if (await isReachableIcon(iconLink)) return iconLink;
        }
      }
    }
  } catch {
    // A service can be private, slow, or intentionally block server-side fetches.
    // Standard paths and the external fallback below still give the card an icon.
  }

  const standardIconPaths = ["/favicon.ico", "/favicon.png", "/apple-touch-icon.png"];
  for (const path of standardIconPaths) {
    const iconUrl = new URL(path, parsedUrl.origin).toString();
    if (await isReachableIcon(iconUrl)) return iconUrl;
  }

  return fallbackFaviconUrl(serviceUrl);
}
