export interface Newsletter {
  id: number;
  type?: 'COUNTRY' | 'TRIP';
  entityId?: number | string; 
  entityName?: string;
  isActive: boolean;
  subscribedAt?: string;
  updatedAt?: string;
  targetType?: 'COUNTRY' | 'TRIP';
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
  targetType: 'COUNTRY' | 'TRIP';
  targetId: number;
}