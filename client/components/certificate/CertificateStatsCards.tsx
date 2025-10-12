// src/components/certificate/CertificateStatsCards.tsx

import { Card } from '@/components/ui/card';
import { Clock, CheckCircle, Award } from 'lucide-react';
import { Publication } from '@/types/certificate.types';

interface CertificateStatsCardsProps {
  publications: Publication[];
}

export default function CertificateStatsCards({ publications }: CertificateStatsCardsProps) {
  const pendingCount = publications.filter(p => p.status === 'APPROVED').length;
  const generatedCount = publications.filter(p => p.status === 'CERTIFICATE_GENERATED').length;
  const totalCount = publications.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card className="p-6 border-l-4 border-l-cyan-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Pending Generation</p>
            <p className="text-3xl font-bold">{pendingCount}</p>
          </div>
          <Clock className="h-8 w-8 text-cyan-600" />
        </div>
      </Card>

      <Card className="p-6 border-l-4 border-l-green-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Certificates Generated</p>
            <p className="text-3xl font-bold">{generatedCount}</p>
          </div>
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
      </Card>

      <Card className="p-6 border-l-4 border-l-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Publications</p>
            <p className="text-3xl font-bold">{totalCount}</p>
          </div>
          <Award className="h-8 w-8 text-blue-600" />
        </div>
      </Card>
    </div>
  );
}