export interface GCDate {
  year: number;
  month: number;
  day: number;
}

export interface GCInfo {
  gcCode: string;
  cacheType: number;
  difficulty: number | null;
  terrain: number | null;
  owner: string;
  ownerLink: string;
  hiddenDate: GCDate | null;
  note: string;
  images: { url: string; title: string }[];
  attributes: { id: number; name: string; isOn: boolean }[];
  favoritePoints: number;
  description: string;
  tbInventory: { name: string; link: string }[];
  bookmarks: { name: string; link: string; user: string }[];
  myBookmarks: { name: string; link: string }[];
  hint: string;
  logs: { 
    user: string; 
    date: string; 
    type: number; 
    text: string;
    images: { link: string; text: string }[];
  }[];
}

export type CheckerType = 'certitude' | 'geocheck' | 'unknown';

export interface CheckerData {
  type: CheckerType;
  link: string;
}

export interface BaseResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface InternalMessage {
  action: string;
  payload?: any;
}
