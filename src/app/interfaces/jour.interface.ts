import { Destination } from "./destination.interface";

export interface Jour {
  id: number;
  date: string;
  title: string;
  description: string;
  tripId: number;
  destinations: Destination[];
  publishedDate?: string | null;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}