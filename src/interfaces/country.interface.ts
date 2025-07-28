// src/app/interfaces/country.interface.ts
export interface Country {
  id: number;
  name: string;
  url:string;
  published_date: Date | null;
  deleted_at: Date | null;
  parent_point_of_interest_id: number | null;
  type: 'PAYS' | 'DESTINATION';
}

export interface Voyage {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  publishedDate: string | null;
  pointOfInterestId: number;
  pointOfInterestName: string;
  published: boolean;
}
export interface DestinationParent {
  id: number;
  url: string | null;
  name: string;
  publishedDate: string | null;
  type: 'PAYS';
  parent: null;
  published: boolean;
}

export interface Destination {
  id: number;
  url: string | null;
  name: string;
  publishedDate: string | null;
  type: 'DESTINATION';
  parent: DestinationParent;
  published: boolean;
}

export interface Jour {
  id: number;
  date: string;
  title: string;
  description: string;
  tripId: number;
  destinations: Destination[];
  published_date?: string | null;
  deleted_at?: string | null;
  trip_id?: number;
  created_at?: string;
  updated_at?: string;
}
export interface Photo {
  id: number;
  url: string;
  thumbnail_url: string;
  description: string;
  is_public: boolean;
  favorite: boolean;
  day_id: number;
  published_date: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}
