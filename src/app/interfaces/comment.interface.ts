export interface Comment {
    id: number;
    content: string;
    publishedDate: string; // ISO date string from API
    deletedAt?: string | null;
    userId: number;
    photoId: number;
    username: string;
    published: boolean;
}