// src/app/interfaces/country.interface.ts
export interface Country {
  id: number;
  name: string;
  url:string;
  publishedDate: Date | null;
  deletedAt: Date | null;
  parent_point_of_interest_id: number | null;
  type: 'PAYS' | 'DESTINATION';
}
