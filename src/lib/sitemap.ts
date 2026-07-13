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

export function getLocaleDomain(locale: string): string {
  return (LOCALE_DOMAINS[locale] ?? LOCALE_DOMAINS['de-DE'])[0];
}

// "Annahmestelle"/"Anfahrt"-Seiten sind immer lokale Abgabestellen-/Wegbeschreibungs-Seiten,
// unabhängig vom Ort — dieser Marker allein reicht, um sie sicher zu erkennen.
const LOCAL_PAGE_MARKERS = ['annahmestelle', 'anfahrt'];

// {Thema}-{Stadt}-Landingpages (z. B. dias-digitalisieren-berlin) tragen keinen solchen
// Marker — hier bleibt nur der Städtename als Erkennungsmerkmal. Liste basiert auf den
// tatsächlich existierenden Orts-Landingpages in den DACH-Sitemaps (DE/AT/CH).
const LOCAL_CITY_SUFFIXES = [
  'aachen', 'augsburg', 'berlin', 'bielefeld', 'bochum', 'bonn', 'braunschweig', 'bremen',
  'chemnitz', 'cottbus', 'dortmund', 'dresden', 'duesseldorf', 'duisburg', 'erfurt', 'erlangen',
  'essen', 'euskirchen', 'frankfurt', 'gelsenkirchen', 'guetersloh', 'hamburg', 'hannover',
  'heidelberg', 'karlsruhe', 'kiel', 'koblenz', 'koeln', 'konstanz', 'krefeld', 'kreuztal',
  'leipzig', 'luebeck', 'magdeburg', 'mannheim', 'moenchengladbach', 'muenster', 'oberhausen',
  'paderborn', 'rostock', 'siegburg', 'solingen', 'stuttgart', 'ulm', 'wiesbaden', 'wuppertal',
  'hamm', 'wuerzburg', 'goettingen', 'ingolstadt',
  'wien', 'graz', 'salzburg', 'linz', 'innsbruck', 'klagenfurt', 'dornbirn', 'wels', 'villach',
  'zuerich', 'basel', 'bern', 'luzern', 'lausanne', 'genf', 'lugano', 'winterthur', 'biel', 'st-gallen',
];

function isLocalCityPage(url: string): boolean {
  const path = url.replace(/^https?:\/\/[^/]+/, '').toLowerCase();
  if (LOCAL_PAGE_MARKERS.some((marker) => path.includes(marker))) return true;

  const lastSegment = path.replace(/\/+$/, '').split('/').pop() ?? '';
  const slug = lastSegment.replace(/-\d+$/, ''); // Duplikat-Suffixe wie "-2" abfangen
  return LOCAL_CITY_SUFFIXES.some((city) => slug === city || slug.endsWith(`-${city}`));
}

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
  }).filter((u) => !isLocalCityPage(u));
  sitemapCache.set(locale, urls);
  return urls;
}
