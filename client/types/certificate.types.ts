export interface Publication {
  id: number; // should be number, not string
  title: string;
  publisherName: string;
  language: string;
  periodicity: string;
  district: string;
  state: string;
  submittedDate: string;
  approvalDate: string;
  status: 'APPROVED' | 'CERTIFICATE_GENERATED';
  certificateNumber?: string;
  certificateDate?: string;
}

export interface Certificate {
  id?: number;
  publicationId: number;
  certificateNumber: string;
  issueDate: string;
  validFrom?: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
}

export type FilterStatus = 'all' | 'pending' | 'generated';

export interface CertificateFilters {
  searchTerm: string;
  status: FilterStatus;
}