export interface DestinationParent {
  id: number;
  url: string | null;
  name: string;
  publishedDate: string | null;
  type: 'PAYS';
  parent: null;
  published: boolean;
}

export interface Destination {
  id: number;
  url: string | null;
  name: string;
  publishedDate: string | null;
  type: 'DESTINATION';
  parent: DestinationParent;
  published: boolean;
}