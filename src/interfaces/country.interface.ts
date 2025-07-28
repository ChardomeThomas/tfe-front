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
  export interface Jour{
    dayId: number;
    day_number: number;
    cityId: number;
    description:string;
	url:string;
  }
export interface Photo {
  idPhoto: number;
  idDay:   number;
  title:   string;
  url:     string;
  description: string;
  isPrivate:   boolean;
  loaded:      boolean;
}
