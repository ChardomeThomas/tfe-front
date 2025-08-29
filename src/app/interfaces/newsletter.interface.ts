export interface Newsletter {
  id: number;
  type?: 'PAYS' | 'DESTINATION';
  entityId?: number | string; 
  entityName?: string;
  isActive: boolean;
  subscribedAt?: string;
  updatedAt?: string;
  targetType?: 'PAYS' | 'DESTINATION';
  targetId?: number;
}

export interface CountryWithTrips {
  countryId : number;
  countryName : string;
  trips: Trip[];
}

export interface Trip {
  tripId: number;
  title: string;
  slug: string;
}

export interface ToggleSubscriptionRequest {
  targetType: 'PAYS' | 'DESTINATION';
  targetId: number;
}