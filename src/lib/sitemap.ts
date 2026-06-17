const LOCALE_DOMAINS: Record<string, string[]> = {
  'de-DE': ['https://mediafix.de'],
  'de-AT': ['https://mediafix.at'],
  'de-CH': ['https://mediafix.ch'],
  'en-GB': ['https://mediafix.co.uk'],
  'en-US': ['https://mediafix.com'],
  'nl-NL': ['https://mediafix.nl'],
  'nl-BE': ['https://mediafix.be'],
  'fr-FR': ['https://mediafix.fr'],
  'fr-BE': ['https://mediafix.be'],
  'fr-CH': ['https://mediafix.ch'],
  'it-IT': ['https://mediafixdigitale.it'],
  'it-CH': ['https://mediafixdigitale.it'],
};

const sitemapCache = new Map<string, string[]>();

async function fetchSitemapXml(url: string): Promise<string[]> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const urls: string[] = [];
    const re = /<loc>(https?:\/\/[^<]+)<\/loc>/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(xml)) !== null) {
      urls.push(m[1].trim());
    }
    return urls;
  } catch {
    return [];
  }
}

export async function getLocaleUrls(locale: string): Promise<string[]> {
  if (sitemapCache.has(locale)) return sitemapCache.get(locale)!;

  const domains = LOCALE_DOMAINS[locale] ?? LOCALE_DOMAINS['de-DE'];
  const fetches = domains.flatMap((domain) => [
    fetchSitemapXml(`${domain}/page-sitemap.xml`),
    fetchSitemapXml(`${domain}/post-sitemap.xml`),
  ]);
  const results = await Promise.all(fetches);
  const seen = new Set<string>();
  const urls = results.flat().filter((u) => {
    if (seen.has(u)) return false;
    seen.add(u);
    return true;
  });
  sitemapCache.set(locale, urls);
  return urls;
}
