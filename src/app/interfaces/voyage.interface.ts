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
  photoUrl?: string;
  deletedAt?: string | null; // Date de suppression pour les soft deletes
  status?: string; // Statut du voyage (actif, supprimé, etc.)
}
