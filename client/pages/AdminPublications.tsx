import { useState, useEffect } from "react";
import { publicationApi } from "../lib/publicationApi";
import { apiFetch } from "@/lib/api";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import Header from "../components/layout/Header";
import { Loader2, FileText, CheckCircle, XCircle, Search } from "lucide-react";

interface Publication {
  id: number;
  titleName: string;
  language: string;
  state: string;
  district: string;
  periodicity: string;
  publicationType: string;
  publisherName: string;
  publisherEmail?: string;
  editorName: string;
  printerName?: string;
  status: string;
  rniNumber: string | null;
  userEmail?: string;
  createdAt: string;
}

export default function AdminPublications() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [filteredPublications, setFilteredPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPub, setSelectedPub] = useState<Publication | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rniNumber, setRniNumber] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadPublications();
  }, []);

  useEffect(() => {
    filterPublications();
  }, [publications, statusFilter, searchQuery]);

  // ✅ Fetch publications
  const loadPublications = async () => {
    try {
      setLoading(true);
      const data = await publicationApi.getAllPublications();
      setPublications(data as Publication[]);
    } catch (error) {
      console.error("Failed to load publications:", error);
      alert("Failed to load publications");
    } finally {
      setLoading(false);
    }
  };

  const filterPublications = () => {
    let filtered = publications;

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((pub) => pub.status === statusFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (pub) =>
          pub.titleName.toLowerCase().includes(q) ||
          pub.publisherName.toLowerCase().includes(q) ||
          (pub.userEmail && pub.userEmail.toLowerCase().includes(q))
      );
    }

    setFilteredPublications(filtered);
  };

  // ✅ Approve flow — now uses apiFetch, no BASE_URL or fetch()
  const handleApprove = (pub: Publication) => {
    setSelectedPub(pub);
    setShowModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedPub || !rniNumber.trim()) {
      alert("Please enter RNI Number");
      return;
    }

    try {
      setActionLoading(true);
      await apiFetch(
        `publications/${selectedPub.id}/status?status=APPROVED&rniNumber=${encodeURIComponent(
          rniNumber
        )}`,
        { method: "PATCH" }
      );

      alert("Publication approved successfully!");
      setShowModal(false);
      setRniNumber("");
      setSelectedPub(null);
      await loadPublications();
    } catch (error) {
      console.error("Failed to approve publication:", error);
      alert("Failed to approve publication");
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ Reject flow — uses apiFetch instead of manual fetch()
  const handleReject = async (pub: Publication) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      setActionLoading(true);
      await apiFetch(
        `publications/${pub.id}/status?status=REJECTED&reason=${encodeURIComponent(reason)}`,
        { method: "PATCH" }
      );

      alert("Publication rejected successfully!");
      await loadPublications();
    } catch (error) {
      console.error("Failed to reject publication:", error);
      alert("Failed to reject publication");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const stats = {
    total: publications.length,
    pending: publications.filter((p) => p.status === "PENDING").length,
    approved: publications.filter((p) => p.status === "APPROVED").length,
    rejected: publications.filter((p) => p.status === "REJECTED").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Publication Management</h1>
          <p className="text-muted-foreground">
            Review and manage publication registration applications
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Applications</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </Card>
          <Card className="p-4 border-yellow-200 dark:border-yellow-800">
            <div className="text-sm text-muted-foreground">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </Card>
          <Card className="p-4 border-green-200 dark:border-green-800">
            <div className="text-sm text-muted-foreground">Approved</div>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </Card>
          <Card className="p-4 border-red-200 dark:border-red-800">
            <div className="text-sm text-muted-foreground">Rejected</div>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, publisher, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "ALL" ? "default" : "outline"}
                onClick={() => setStatusFilter("ALL")}
                size="sm"
              >
                All ({stats.total})
              </Button>
              <Button
                variant={statusFilter === "PENDING" ? "default" : "outline"}
                onClick={() => setStatusFilter("PENDING")}
                size="sm"
              >
                Pending ({stats.pending})
              </Button>
              <Button
                variant={statusFilter === "APPROVED" ? "default" : "outline"}
                onClick={() => setStatusFilter("APPROVED")}
                size="sm"
              >
                Approved ({stats.approved})
              </Button>
              <Button
                variant={statusFilter === "REJECTED" ? "default" : "outline"}
                onClick={() => setStatusFilter("REJECTED")}
                size="sm"
              >
                Rejected ({stats.rejected})
              </Button>
            </div>
          </div>
        </Card>

        {/* Publications List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : filteredPublications.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Publications Found</h3>
            <p className="text-muted-foreground">
              {statusFilter !== "ALL"
                ? `No ${statusFilter.toLowerCase()} publications`
                : "No publication applications yet"}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPublications.map((pub) => (
              <Card key={pub.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold">{pub.titleName}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          pub.status
                        )}`}
                      >
                        {pub.status}
                      </span>
                      {pub.rniNumber && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          RNI: {pub.rniNumber}
                        </span>
                      )}
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Type & Periodicity</p>
                        <p className="font-medium">
                          {pub.publicationType} • {pub.periodicity}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Language</p>
                        <p className="font-medium">{pub.language}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">
                          {pub.district}, {pub.state}
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Publisher</p>
                        <p className="font-medium">{pub.publisherName}</p>
                        {pub.publisherEmail && (
                          <p className="text-xs text-muted-foreground">{pub.publisherEmail}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Editor</p>
                        <p className="font-medium">{pub.editorName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Printer</p>
                        <p className="font-medium">{pub.printerName || "N/A"}</p>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Applied by: {pub.userEmail || "N/A"} •{" "}
                      {new Date(pub.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {pub.status === "PENDING" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(pub)}
                        disabled={actionLoading}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(pub)}
                        disabled={actionLoading}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Approval Modal */}
        {showModal && selectedPub && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">Approve Publication</h2>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Publication: <strong>{selectedPub.titleName}</strong>
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Publisher: <strong>{selectedPub.publisherName}</strong>
                </p>
                <Label>RNI Number *</Label>
                <Input
                  value={rniNumber}
                  onChange={(e) => setRniNumber(e.target.value)}
                  placeholder="e.g., MAHENG/2023/12345"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the assigned RNI registration number
                </p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowModal(false);
                    setRniNumber("");
                    setSelectedPub(null);
                  }}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmApprove}
                  disabled={actionLoading || !rniNumber.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}