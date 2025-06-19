// src/app/interfaces/country.interface.ts
export interface Country {
  countryId: number;
  name: string;
  flag: string;
  status: 'DRAFT' | 'PUBLISHED';
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
