import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import Header from "../components/layout/Header";
import { FileCheck } from "lucide-react";
import { Publication, FilterStatus } from "../types/certificate.types";
import { certificateService } from "../services/certificateService";
import CertificateStatsCards from "../components/certificate/CertificateStatsCards";
import CertificateFilters from "../components/certificate/CertificateFilters";
import PublicationCertificateCard from "../components/certificate/PublicationCertificateCard";
import CertificatePreview from "../components/certificate/CertificatePreview";

export default function AdminCertificateManagement() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [filteredPublications, setFilteredPublications] = useState<Publication[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [showCertificatePreview, setShowCertificatePreview] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPublications();
  }, []);

  useEffect(() => {
    filterPublications();
  }, [searchTerm, filterStatus, publications]);

  const loadPublications = async () => {
    setLoading(true);
    try {
      const data = await certificateService.getApprovedPublications();
      setPublications(data);
      setFilteredPublications(data);
    } catch (error) {
      console.error("Error loading publications:", error);
      alert("Failed to load publications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filterPublications = () => {
    let filtered = publications;

    // 🔹 Pending = approved but no certificate number
    if (filterStatus === "pending") {
      filtered = filtered.filter(
        (p) =>
          (p.status === "APPROVED" || p.status === "PENDING") &&
          !p.certificateNumber
      );
    }
    // 🔹 Generated = have certificate or marked as generated
    else if (filterStatus === "generated") {
      filtered = filtered.filter(
        (p) =>
          p.status === "CERTIFICATE_GENERATED" ||
          !!p.certificateNumber ||
          p.certificateGenerated
      );
    }
    // 🔹 All = everything that is approved or generated
    else if (filterStatus === "all") {
      filtered = publications.filter(
        (p) =>
          ["APPROVED", "CERTIFICATE_GENERATED", "PENDING"].includes(p.status) ||
          !!p.certificateNumber
      );
    }

    // 🔹 Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.publisherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.certificateNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPublications(filtered);
  };

  const handleGenerateCertificate = async (publication: Publication) => {
    setGenerating(true);
    try {
      const updated = await certificateService.generateCertificate(publication.id);

      setPublications((prev) =>
        prev.map((p) => (p.id === publication.id ? updated : p))
      );

      setSelectedPublication(updated);
      setShowCertificatePreview(true);

      await loadPublications();
    } catch (error) {
      console.error("Error generating certificate:", error);
      alert("Failed to generate certificate. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleViewCertificate = (publication: Publication) => {
    setSelectedPublication(publication);
    setShowCertificatePreview(true);
  };

  const handleDownloadCertificate = async (publication: Publication) => {
    try {
      if (!publication.certificateNumber) {
        alert("Certificate not yet generated for this publication.");
        return;
      }

      const blob = await certificateService.downloadCertificate(publication.certificateNumber);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PRGI_Certificate_${publication.certificateNumber}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading certificate:", error);
      alert("Failed to download certificate. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading publications...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <FileCheck className="h-8 w-8 text-cyan-600" />
              <div>
                <h1 className="text-3xl font-bold">PRGI Certificate Management</h1>
                <p className="text-muted-foreground">
                  Generate, preview and download publication certificates
                </p>
              </div>
            </div>
          </div>

          <CertificateStatsCards publications={publications} />

          <CertificateFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
          />

          <div className="space-y-4">
            {filteredPublications.map((publication) => (
              <PublicationCertificateCard
                key={publication.id}
                publication={publication}
                generating={generating}
                onGenerateCertificate={handleGenerateCertificate}
                onViewCertificate={handleViewCertificate}
                onDownloadCertificate={handleDownloadCertificate}
              />
            ))}

            {filteredPublications.length === 0 && (
              <Card className="p-12 text-center">
                <FileCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">No publications found</p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm
                    ? "Try adjusting your search criteria"
                    : "No publications match the selected filter"}
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>

      {showCertificatePreview && selectedPublication && (
        <CertificatePreview
          publication={selectedPublication}
          onClose={() => setShowCertificatePreview(false)}
          onDownload={handleDownloadCertificate}
        />
      )}
    </div>
  );
}