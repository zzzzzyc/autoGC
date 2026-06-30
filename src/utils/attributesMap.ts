export interface GCAttribute {
  id: number;
  name: string;
  category: string;
}

export const GCAttributesList: GCAttribute[] = [
  // Permissions (Allowed/Not Allowed)
  { id: 1, name: 'Dogs', category: 'Permissions' },
  { id: 2, name: 'Bicycles', category: 'Permissions' },
  { id: 3, name: 'Motorcycles', category: 'Permissions' },
  { id: 4, name: 'Quads', category: 'Permissions' },
  { id: 5, name: 'Off-road vehicles', category: 'Permissions' },
  { id: 6, name: 'Snowmobiles', category: 'Permissions' },
  { id: 7, name: 'Horses', category: 'Permissions' },
  { id: 8, name: 'Campfires', category: 'Permissions' },
  { id: 9, name: 'Trucks/RVs', category: 'Permissions' },

  // Conditions (Yes/No)
  { id: 10, name: 'Recommended for kids', category: 'Conditions' },
  { id: 11, name: 'Takes less than one hour', category: 'Conditions' },
  { id: 12, name: 'Scenic view', category: 'Conditions' },
  { id: 13, name: 'Significant hike', category: 'Conditions' },
  { id: 14, name: 'Difficult climb', category: 'Conditions' },
  { id: 15, name: 'May require wading', category: 'Conditions' },
  { id: 16, name: 'May require swimming', category: 'Conditions' },
  { id: 17, name: 'Available 24/7', category: 'Conditions' },
  { id: 18, name: 'Recommended at night', category: 'Conditions' },
  { id: 19, name: 'Available in winter', category: 'Conditions' },
  { id: 20, name: 'Stealth required', category: 'Conditions' },
  { id: 21, name: 'Owner attention requested', category: 'Conditions' },
  { id: 22, name: 'Livestock nearby', category: 'Conditions' },
  { id: 23, name: 'Field puzzle', category: 'Conditions' },
  { id: 24, name: 'Night cache', category: 'Conditions' },
  { id: 25, name: 'Park and grab', category: 'Conditions' },
  { id: 26, name: 'Abandoned structure', category: 'Conditions' },
  { id: 27, name: 'Short hike (<1 km)', category: 'Conditions' },
  { id: 28, name: 'Medium hike (1 km–10 km)', category: 'Conditions' },
  { id: 29, name: 'Long hike (>10 km)', category: 'Conditions' },
  { id: 30, name: 'Seasonal access', category: 'Conditions' },
  { id: 31, name: 'Recommended for tourists', category: 'Conditions' },
  { id: 32, name: 'Yard (private residence)', category: 'Conditions' },
  { id: 33, name: 'Teamwork cache', category: 'Conditions' },
  { id: 34, name: 'Challenge cache', category: 'Conditions' },
  { id: 35, name: 'Power trail', category: 'Conditions' },
  { id: 36, name: 'Bonus cache', category: 'Conditions' },

  // Specials (Yes/No)
  { id: 37, name: 'Lost and Found tour', category: 'Specials' },
  { id: 38, name: 'Partnership cache', category: 'Specials' },
  { id: 39, name: 'GeoTour', category: 'Specials' },
  { id: 40, name: 'Geocaching.com solution checker', category: 'Specials' },

  // Equipment (Required/Not Required)
  { id: 41, name: 'Access/parking fee', category: 'Equipment' },
  { id: 42, name: 'Climbing gear required', category: 'Equipment' },
  { id: 43, name: 'Boat required', category: 'Equipment' },
  { id: 44, name: 'Scuba gear required', category: 'Equipment' },
  { id: 45, name: 'Flashlight required', category: 'Equipment' },
  { id: 46, name: 'UV light required', category: 'Equipment' },
  { id: 47, name: 'May require snowshoes', category: 'Equipment' },
  { id: 48, name: 'May require cross country skis', category: 'Equipment' },
  { id: 49, name: 'Special tool required', category: 'Equipment' },
  { id: 50, name: 'Wireless beacon', category: 'Equipment' },
  { id: 51, name: 'Tree climbing required', category: 'Equipment' },

  // Hazards (Present/Not Present)
  { id: 52, name: 'Poisonous plants', category: 'Hazards' },
  { id: 53, name: 'Dangerous animals', category: 'Hazards' },
  { id: 54, name: 'Ticks', category: 'Hazards' },
  { id: 55, name: 'Abandoned mine', category: 'Hazards' },
  { id: 56, name: 'Cliffs/falling rocks', category: 'Hazards' },
  { id: 57, name: 'Hunting area', category: 'Hazards' },
  { id: 58, name: 'Dangerous area', category: 'Hazards' },
  { id: 59, name: 'Thorns', category: 'Hazards' },

  // Facilities (Yes/No)
  { id: 60, name: 'Wheelchair accessible', category: 'Facilities' },
  { id: 61, name: 'Parking nearby', category: 'Facilities' },
  { id: 62, name: 'Public transportation nearby', category: 'Facilities' },
  { id: 63, name: 'Drinking water nearby', category: 'Facilities' },
  { id: 64, name: 'Public restrooms nearby', category: 'Facilities' },
  { id: 65, name: 'Telephone nearby', category: 'Facilities' },
  { id: 66, name: 'Picnic tables nearby', category: 'Facilities' },
  { id: 67, name: 'Camping nearby', category: 'Facilities' },
  { id: 68, name: 'Stroller accessible', category: 'Facilities' },
  { id: 69, name: 'Fuel nearby', category: 'Facilities' },
  { id: 70, name: 'Food nearby', category: 'Facilities' }
];

export function getAttributeId(name: string): number {
  const cleanName = name.trim().toLowerCase();
  // Strip "not" or "no" prefixes if any to find base attribute
  const baseName = cleanName.replace(/^(not|no)\s+/i, '').trim();
  
  const attr = GCAttributesList.find(a => a.name.toLowerCase() === baseName || a.name.toLowerCase() === cleanName);
  return attr ? attr.id : 0; // 0 for unknown
}
