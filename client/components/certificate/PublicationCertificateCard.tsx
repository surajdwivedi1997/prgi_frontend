import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  User,
  MapPin,
  Calendar,
  Hash,
  FileCheck,
  Download,
  Eye,
} from "lucide-react";
import { Publication } from "@/types/certificate.types";

interface PublicationCertificateCardProps {
  publication: Publication;
  generating: boolean;
  onGenerateCertificate: (publication: Publication) => void;
  onViewCertificate: (publication: Publication) => void;
  onDownloadCertificate: (publication: Publication) => void;
}

export default function PublicationCertificateCard({
  publication,
  generating,
  onGenerateCertificate,
  onViewCertificate,
  onDownloadCertificate,
}: PublicationCertificateCardProps) {
  // ✅ Updated logic: no "certificateGenerated" field anymore
  const isGenerated =
    publication.status === "CERTIFICATE_GENERATED" ||
    !!publication.certificateNumber ||
    !!publication.certificateDate;

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        {/* Left section */}
        <div className="flex-1">
          <div className="flex items-start gap-3 mb-3">
            <Building className="h-5 w-5 text-cyan-600 mt-1" />
            <div>
              <h3 className="text-xl font-semibold mb-1">
                {publication.title}
              </h3>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <User className="h-3 w-3" />
                {publication.publisherName}
              </p>
            </div>
          </div>

          {/* Publication details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Language</p>
              <p className="font-medium">{publication.language}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Periodicity</p>
              <p className="font-medium">{publication.periodicity}</p>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Location</p>
                <p className="font-medium">
                  {publication.district}, {publication.state}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Approved</p>
                <p className="font-medium">
                  {publication.approvalDate
                    ? new Date(publication.approvalDate).toLocaleDateString()
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Certificate Info Section */}
          {isGenerated && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 text-sm">
                <Hash className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-green-700 dark:text-green-400">
                  {publication.certificateNumber || "N/A"}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  Generated on{" "}
                  {publication.certificateDate
                    ? new Date(publication.certificateDate).toLocaleDateString()
                    : "—"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex flex-col gap-2 ml-4">
          <Badge
            variant={isGenerated ? "default" : "secondary"}
            className={
              isGenerated
                ? "bg-green-500 hover:bg-green-600"
                : "bg-amber-500 hover:bg-amber-600"
            }
          >
            {isGenerated ? "Generated" : "Pending"}
          </Badge>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t">
        {!isGenerated ? (
          <Button
            onClick={() => onGenerateCertificate(publication)}
            disabled={generating}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            <FileCheck className="h-4 w-4 mr-2" />
            {generating ? "Generating..." : "Generate Certificate"}
          </Button>
        ) : (
          <>
            <Button
              onClick={() => onViewCertificate(publication)}
              variant="outline"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Certificate
            </Button>
            <Button
              onClick={() => onDownloadCertificate(publication)}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}