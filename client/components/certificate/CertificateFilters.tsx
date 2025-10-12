// src/components/certificate/CertificateFilters.tsx

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Filter } from 'lucide-react';
import { FilterStatus } from '@/types/certificate.types';

interface CertificateFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterStatus: FilterStatus;
  setFilterStatus: (value: FilterStatus) => void;
}

export default function CertificateFilters({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus
}: CertificateFiltersProps) {
  return (
    <Card className="p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="search" className="mb-2 flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search Publications
          </Label>
          <Input
            id="search"
            placeholder="Search by title, publisher, or certificate number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="filter" className="mb-2 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter by Status
          </Label>
          <select
            id="filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background"
          >
            <option value="all">All Publications</option>
            <option value="pending">Pending Certificate</option>
            <option value="generated">Certificate Generated</option>
          </select>
        </div>
      </div>
    </Card>
  );
}