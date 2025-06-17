

  export interface Country {
    countryId: number;
    name: string;
    flag: string;
  }
export interface Voyage {
    voyageId: number;
    name: string;
    countryId: number;
    date_debut: string; 
    date_fin: string;
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
