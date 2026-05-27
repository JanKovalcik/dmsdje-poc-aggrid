import type { AdvancedFilterModel, FilterModel, SortModelItem } from "ag-grid-enterprise";

export interface SortModel {
  colId: string;
  sort: 'asc' | 'desc';
  type: 'absolute' | 'default';
}

export interface RevisionsSearchPageableRequest {
  pageToken: string|null;
  startRow: number;
  endRow: number;
  sortModel: SortModelItem[];
  filterModel: FilterModel | AdvancedFilterModel | null;
}

export type DocumentKindEnum = 'R' | 'Z' | 'O';

export interface DocumentSearchResponse {
  documentTitle?: string;
  documentId?: string;
  guid?: string;
  documentNumber?: string;
  documentType?: string;
  author?: string;
  documentKind?: DocumentKindEnum;
  categories?: RevisionCategory[];
}

export interface RevisionSearchResponse {
  revisionId: string;
  guid: string;
  revisionTitle?: string;
  revisionNumber?: string;
  currentRevisionStatus?: string;
  revisionDate?: Date;
  document?: DocumentSearchResponse;
}

export interface RevisionsSearchPage {
  pageToken?: string;
  rowCount?: number;
  rowData: RevisionSearchResponse[];
}

export interface RevisionCategory {
  code?: string;
  area?: string;
}