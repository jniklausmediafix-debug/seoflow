export interface SerpResult {
  position: number;
  title: string;
  url: string;
  domain: string;
  description: string;
}

export interface Keyword {
  keyword: string;
  searchVolume: number;
  cpc: number;
  competition: number;
  competitionLevel: string;
  visible: boolean;
}

export interface Cluster {
  id: string;
  name: string;
  description: string;
  keywords: string[];
}

export const CONTENT_TYPES = [
  { value: 'service_page', label: 'Dienstleistungsseite' },
  { value: 'landing_page', label: 'Landing Page' },
  { value: 'blog_post', label: 'Blog-Beitrag' },
  { value: 'product_page', label: 'Produktseite' },
] as const;

export type ContentTypeValue = typeof CONTENT_TYPES[number]['value'];

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ImagePlaceholder {
  position: string;
  description: string;
  altText: string;
  fireflyPrompt: string;
}

export interface InternalLink {
  anchorText: string;
  urlSuggestion: string;
  position: string;
}

export interface SEOText {
  seoTitle: string;
  seoDescription: string;
  urlSlug?: string;
  h1: string;
  intro: string;
  keyTakeaways?: string[];
  images: ImagePlaceholder[];
  usps: string[];
  preise: string;
  howItWorks: string;
  ursachen: string;
  faq: FAQItem[];
  cta: string;
  expertBio?: string;
  internalLinks?: InternalLink[];
  htmlOutput?: string;
}

export interface CompetitorContent {
  url: string;
  text: string;
}

export const LOCALES = [
  { value: 'de-DE' as const, label: 'Deutschland', flag: '🇩🇪' },
  { value: 'de-AT' as const, label: 'Österreich', flag: '🇦🇹' },
  { value: 'de-CH' as const, label: 'Schweiz DE', flag: '🇨🇭' },
  { value: 'en-GB' as const, label: 'UK / IE', flag: '🇬🇧' },
  { value: 'nl-NL' as const, label: 'Nederland', flag: '🇳🇱' },
  { value: 'nl-BE' as const, label: 'België NL', flag: '🇧🇪' },
  { value: 'fr-FR' as const, label: 'France', flag: '🇫🇷' },
  { value: 'fr-BE' as const, label: 'Belgique FR', flag: '🇧🇪' },
  { value: 'fr-CH' as const, label: 'Schweiz FR', flag: '🇨🇭' },
  { value: 'it-IT' as const, label: 'Italia', flag: '🇮🇹' },
];

export type LocaleValue = typeof LOCALES[number]['value'];

export interface LocaleConfig {
  locationName: string;
  languageName: string;
  whisperLang: string;
  contentLang: string;
  tocTitle: string;
  tocToggleHide: string;
  tocToggleShow: string;
  readTimeFn: (mins: number) => string;
  faqHeadline: string;
  expertLabel: string;
  expertBadge: string;
  expertJobTitle: string;
}

export const LOCALE_CONFIG: Record<LocaleValue, LocaleConfig> = {
  'de-DE': {
    locationName: 'Germany', languageName: 'German', whisperLang: 'de',
    contentLang: 'Deutsch',
    tocTitle: 'Inhaltsverzeichnis', tocToggleHide: 'Ausblenden', tocToggleShow: 'Einblenden',
    readTimeFn: (m) => `Lesedauer: ca. ${m} Minuten`,
    faqHeadline: 'Häufig gestellte Fragen',
    expertLabel: 'Experten-Hinweis', expertBadge: 'Datenrettungs-<br>experte', expertJobTitle: 'MEDIAFIX Datenrettungsexperte',
  },
  'de-AT': {
    locationName: 'Austria', languageName: 'German', whisperLang: 'de',
    contentLang: 'Deutsch',
    tocTitle: 'Inhaltsverzeichnis', tocToggleHide: 'Ausblenden', tocToggleShow: 'Einblenden',
    readTimeFn: (m) => `Lesedauer: ca. ${m} Minuten`,
    faqHeadline: 'Häufig gestellte Fragen',
    expertLabel: 'Experten-Hinweis', expertBadge: 'Datenrettungs-<br>experte', expertJobTitle: 'MEDIAFIX Datenrettungsexperte',
  },
  'de-CH': {
    locationName: 'Switzerland', languageName: 'German', whisperLang: 'de',
    contentLang: 'Deutsch',
    tocTitle: 'Inhaltsverzeichnis', tocToggleHide: 'Ausblenden', tocToggleShow: 'Einblenden',
    readTimeFn: (m) => `Lesedauer: ca. ${m} Minuten`,
    faqHeadline: 'Häufig gestellte Fragen',
    expertLabel: 'Experten-Hinweis', expertBadge: 'Datenrettungs-<br>experte', expertJobTitle: 'MEDIAFIX Datenrettungsexperte',
  },
  'en-GB': {
    locationName: 'United Kingdom', languageName: 'English', whisperLang: 'en',
    contentLang: 'Englisch',
    tocTitle: 'Table of Contents', tocToggleHide: 'Hide', tocToggleShow: 'Show',
    readTimeFn: (m) => `Reading time: approx. ${m} minutes`,
    faqHeadline: 'Frequently Asked Questions',
    expertLabel: 'Expert Tip', expertBadge: 'Data Recovery<br>Expert', expertJobTitle: 'MEDIAFIX Data Recovery Expert',
  },
  'nl-NL': {
    locationName: 'Netherlands', languageName: 'Dutch', whisperLang: 'nl',
    contentLang: 'Niederländisch',
    tocTitle: 'Inhoudsopgave', tocToggleHide: 'Verbergen', tocToggleShow: 'Tonen',
    readTimeFn: (m) => `Leestijd: ca. ${m} minuten`,
    faqHeadline: 'Veelgestelde vragen',
    expertLabel: 'Expertentip', expertBadge: 'Datarecovery<br>expert', expertJobTitle: 'MEDIAFIX Datarecovery Expert',
  },
  'nl-BE': {
    locationName: 'Belgium', languageName: 'Dutch', whisperLang: 'nl',
    contentLang: 'Niederländisch (Belgien)',
    tocTitle: 'Inhoudsopgave', tocToggleHide: 'Verbergen', tocToggleShow: 'Tonen',
    readTimeFn: (m) => `Leestijd: ca. ${m} minuten`,
    faqHeadline: 'Veelgestelde vragen',
    expertLabel: 'Expertentip', expertBadge: 'Datarecovery<br>expert', expertJobTitle: 'MEDIAFIX Datarecovery Expert',
  },
  'fr-FR': {
    locationName: 'France', languageName: 'French', whisperLang: 'fr',
    contentLang: 'Französisch',
    tocTitle: 'Table des matières', tocToggleHide: 'Masquer', tocToggleShow: 'Afficher',
    readTimeFn: (m) => `Temps de lecture : env. ${m} minutes`,
    faqHeadline: 'Questions fréquentes',
    expertLabel: "Conseil d'expert", expertBadge: 'Expert en<br>récupération', expertJobTitle: 'Expert récupération de données MEDIAFIX',
  },
  'fr-BE': {
    locationName: 'Belgium', languageName: 'French', whisperLang: 'fr',
    contentLang: 'Französisch (Belgien)',
    tocTitle: 'Table des matières', tocToggleHide: 'Masquer', tocToggleShow: 'Afficher',
    readTimeFn: (m) => `Temps de lecture : env. ${m} minutes`,
    faqHeadline: 'Questions fréquentes',
    expertLabel: "Conseil d'expert", expertBadge: 'Expert en<br>récupération', expertJobTitle: 'Expert récupération de données MEDIAFIX',
  },
  'fr-CH': {
    locationName: 'Switzerland', languageName: 'French', whisperLang: 'fr',
    contentLang: 'Französisch (Schweiz)',
    tocTitle: 'Table des matières', tocToggleHide: 'Masquer', tocToggleShow: 'Afficher',
    readTimeFn: (m) => `Temps de lecture : env. ${m} minutes`,
    faqHeadline: 'Questions fréquentes',
    expertLabel: "Conseil d'expert", expertBadge: 'Expert en<br>récupération', expertJobTitle: 'Expert récupération de données MEDIAFIX',
  },
  'it-IT': {
    locationName: 'Italy', languageName: 'Italian', whisperLang: 'it',
    contentLang: 'Italienisch',
    tocTitle: 'Indice', tocToggleHide: 'Nascondi', tocToggleShow: 'Mostra',
    readTimeFn: (m) => `Tempo di lettura: circa ${m} minuti`,
    faqHeadline: 'Domande frequenti',
    expertLabel: 'Consiglio esperto', expertBadge: 'Esperto recupero<br>dati', expertJobTitle: 'MEDIAFIX Esperto recupero dati',
  },
};

export interface WizardState {
  step: number;
  locale: LocaleValue;
  seedKeyword: string;
  keywords: Keyword[];
  serpResults: SerpResult[];
  competitorContent: CompetitorContent[];
  clusters: Cluster[];
  selectedCluster: Cluster | null;
  contentType: ContentTypeValue;
  voiceTranscript: string;
  generatedText: SEOText | null;
  revisionTranscript: string;
  revisedText: SEOText | null;
  isLoading: boolean;
  error: string | null;
  preservedImages?: ImagePlaceholder[];
}
