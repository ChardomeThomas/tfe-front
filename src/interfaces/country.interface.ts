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
  voyageId: number;
  name: string;
  countryId: number;
  date_debut: string;
  date_fin: string;
  status: 'DRAFT' | 'PUBLISHED'; // Suppression du statut 'DELETED'
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
