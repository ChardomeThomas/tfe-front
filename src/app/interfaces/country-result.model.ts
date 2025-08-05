export interface CountryResult {
  name: { common: string };
  translations?: { [lang: string]: { common: string } };
  flags: { png: string; svg: string };
  altSpellings?: string[];
}