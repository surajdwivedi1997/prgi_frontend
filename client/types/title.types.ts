// client/types/title.types.ts

export interface TitleCheckRequest {
  titleName: string;
  language: string;
  state: string;
}

export interface SimilarTitle {
  title: string;
  similarity: number;
  status: string;
  language: string;
}

export interface ConflictDetails {
  exactMatch?: string;
  similarTitles?: SimilarTitle[];
  reservedTitles?: string[];
}

export interface TitleCheckResponse {
  titleName: string;
  probabilityScore: number;
  status: 'HIGH' | 'MEDIUM' | 'LOW' | 'REJECTED';
  reasons: string[];
  suggestions: string[];
  conflicts: ConflictDetails;
}