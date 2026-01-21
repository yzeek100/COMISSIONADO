
export enum ServiceType {
  VIDEO_CALL = 'Videochamada Privada',
  DIGITAL_CONTENT = 'Conteúdo Digital',
  TIP = 'Gorjeta',
  RESERVED_TIME = 'Sessão Exclusiva'
}

export interface Creator {
  id: string;
  name: string;
  username: string;
  bio: string;
  avatar: string;
  rating: number;
  ratingCount?: number;
  online: boolean;
  offlineTime?: string;
  baseRate: number;
  age?: number;
  phone?: string;
  referenceCode?: string;
  lastUpdated?: string;
  verified?: boolean;
  schedule?: string;
  areasServed?: string[];
  catchphrase?: string;
  audioDuration?: string;
  location_area?: string;
  location_city?: string;
  location_lat?: number;
  location_lng?: number;
  rates?: { duration: string; price: string }[];
  aboutTags?: string[];
  servicesTags?: string[];
  specialServicesTags?: string[];
  environmentTags?: string[];
  photos?: string[];
}

export interface NavState {
  view: 'home' | 'marketplace' | 'dashboard' | 'profile' | 'registration';
  selectedCreatorId?: string;
}
