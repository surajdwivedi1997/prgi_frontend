export interface PublicationRequest {
  titleName: string;
  language: string;
  state: string;
  district?: string;
  periodicity: string;
  publicationType: string;
  publisherName: string;
  publisherAddress: string;
  publisherEmail?: string;
  publisherPhone?: string;
  editorName: string;
  editorAddress?: string;
  editorEmail?: string;
  editorPhone?: string;
  printerName: string;
  printingPressName: string;
  printingPressAddress: string;
  placeOfPublication?: string;
  firstPublicationDate?: string;
  declarationText?: string;
}

export interface PublicationResponse {
  id: number;
  titleName: string;
  rniNumber?: string;
  userId: number;
  language: string;
  state: string;
  district?: string;
  periodicity: string;
  publicationType: string;
  publisherName: string;
  editorName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  rejectionReason?: string;
  createdAt: string;
  approvedAt?: string;
}