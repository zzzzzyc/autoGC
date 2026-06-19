export const cacheTypeMap: Record<string, number> = {
  'Traditional Cache': 1,
  'Multi-Cache': 2,
  'Mystery Cache': 3,
  'EarthCache': 4,
  'Letterbox Hybrid': 5,
  'Event Cache': 6,
  'Cache In Trash Out Event': 7,
  'Mega-Event Cache': 8,
  'Giga-Event Cache': 9,
  'Wherigo Cache': 10,
  'Geocaching HQ Cache': 11,
  'GPS Adventures Maze Exhibit': 12,
  'Adventure Lab®': 13,
  'Geocaching HQ Celebration': 14,
  'Geocaching HQ Block Party': 15,
  'Community Celebration Event': 16,
  'Virtual Cache': 17,
  'Webcam Cache': 18,
  'Project A.P.E. Cache': 19,
  'Locationless Cache': 20,
};

export const cacheTypeNameMap: Record<number, string> = Object.fromEntries(
  Object.entries(cacheTypeMap).map(([name, id]) => [id, name])
);

export function getCacheTypeId(title: string | null | undefined): number {
  if (!title) return 0;
  const trimmed = title.trim();
  // Try exact match
  if (cacheTypeMap[trimmed] !== undefined) {
    return cacheTypeMap[trimmed];
  }
  // Try case-insensitive match
  const lower = trimmed.toLowerCase();
  for (const [name, id] of Object.entries(cacheTypeMap)) {
    if (name.toLowerCase() === lower) {
      return id;
    }
  }
  return 0; // Unknown
}

export const logTypeMap: Record<string, number> = {
  'found it': 2,
  'caches found': 2,
  "didn't find it": 3,
  'write note': 4,
  'archive': 9,
  'temporarily disable': 22,
  'enable listing': 23,
  'publish listing': 24,
  'needs maintenance': 45,
  'owner maintenance': 46,
  'update coordinates': 47,
  'reviewer note': 68,
};

export function getLogTypeId(title: string | null | undefined): number {
  if (!title) return 0;
  const clean = title.toLowerCase().trim();
  for (const [keyword, id] of Object.entries(logTypeMap)) {
    if (clean.includes(keyword)) {
      return id;
    }
  }
  return 0; // Unknown
}
