export interface GCInfo {
  gcCode: string;
  difficulty: string;
  terrain: string;
  owner: string;
  ownerLink: string;
  hiddenDate: string;
  note: string;
  attributes: string[];
  favoritePoints: string;
  description: string;
  tbInventory: { name: string; link: string }[];
  bookmarks: { name: string; link: string; user: string }[];
  myBookmarks: { name: string; link: string }[];
  hint: string;
  logs: { user: string; date: string; type: string; text: string }[];
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
