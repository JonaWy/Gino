export const HORSE_BREEDS = [
  "Andalusier",
  "Appaloosa",
  "Araber",
  "Belgisches Warmblut",
  "Brandenburger",
  "Connemara-Pony",
  "Deutsches Reitpony",
  "Friese",
  "Haflinger",
  "Hannoveraner",
  "Holsteiner",
  "Islandpferd",
  "Irish Cob",
  "KWPN",
  "Lusitano",
  "Mecklenburger",
  "Morgan",
  "Oldenburger",
  "Paint Horse",
  "Paso Peruano",
  "Quarter Horse",
  "Rheinländer",
  "Selle Français",
  "Shetlandpony",
  "Shire Horse",
  "Trakehner",
  "Tinker",
  "Vollblut",
  "Vollblutaraber",
  "Welsh Pony",
  "Westfale",
  "Zweibrücker",
] as const;

export function horseBreedOptions(current?: string | null): string[] {
  const value = current?.trim();
  if (value && !HORSE_BREEDS.includes(value as (typeof HORSE_BREEDS)[number])) {
    return [value, ...HORSE_BREEDS];
  }
  return [...HORSE_BREEDS];
}
