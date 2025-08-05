import { Destination } from "./destination.interface";

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