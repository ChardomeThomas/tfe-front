export interface Photo {
  id: number;
  url: string;
  thumbnailUrl: string;
  description: string;
  isPublic: boolean;
  favorite: boolean;
  dayId: number;
  publishedDate: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}