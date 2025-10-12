// src/components/certificate/CertificatePreview.tsx

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Download } from 'lucide-react';
import { Publication } from '@/types/certificate.types';

interface CertificatePreviewProps {
  publication: Publication;
  onClose: () => void;
  onDownload: (publication: Publication) => void;
}

export default function CertificatePreview({
  publication,
  onClose,
  onDownload
}: CertificatePreviewProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white">
        <div className="p-8">
          {/* Certificate Header */}
          <div className="text-center mb-8 border-b-4 border-double border-gray-800 pb-6">
            <div className="mb-4">
              <Award className="h-16 w-16 mx-auto text-amber-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              PRESS REGISTRAR GENERAL OF INDIA
            </h1>
            <p className="text-lg text-gray-600">Certificate of Registration</p>
          </div>

          {/* Certificate Body */}
          <div className="space-y-6 mb-8">
            <div className="text-center">
              <p className="text-gray-700 leading-relaxed">
                This is to certify that the publication
              </p>
              <h2 className="text-2xl font-bold text-gray-800 my-3">
                "{publication.title}"
              </h2>
              <p className="text-gray-700 leading-relaxed">
                published by <span className="font-semibold">{publication.publisherName}</span>
              </p>
              <p className="text-gray-700 leading-relaxed">
                has been duly registered under the Press Registration Act.
              </p>
            </div>

            {/* Publication Details */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div>
                <p className="text-sm text-gray-600">Language</p>
                <p className="font-semibold text-gray-800">{publication.language}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Periodicity</p>
                <p className="font-semibold text-gray-800">{publication.periodicity}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Place of Publication</p>
                <p className="font-semibold text-gray-800">{publication.district}, {publication.state}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date of Approval</p>
                <p className="font-semibold text-gray-800">
                  {new Date(publication.approvalDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Certificate Number */}
            <div className="text-center bg-amber-50 p-4 rounded-lg border-2 border-amber-200">
              <p className="text-sm text-gray-600 mb-1">Certificate Number</p>
              <p className="text-xl font-bold text-amber-700">
                {publication.certificateNumber}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Issued on: {publication.certificateDate && new Date(publication.certificateDate).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Certificate Footer */}
          <div className="border-t-2 border-gray-200 pt-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-gray-600">Valid from</p>
                <p className="font-semibold text-gray-800">
                  {publication.certificateDate && new Date(publication.certificateDate).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div className="text-right">
                <div className="mb-8"></div>
                <div className="border-t border-gray-800 pt-2">
                  <p className="font-semibold text-gray-800">Press Registrar General</p>
                  <p className="text-sm text-gray-600">Government of India</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
            <Button 
              onClick={() => onDownload(publication)}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button 
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}