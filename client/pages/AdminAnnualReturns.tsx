import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import Header from "../components/layout/Header";
import {
  Loader2,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  TrendingUp,
} from "lucide-react";

interface AnnualReturn {
  id: number;
  publicationId: number;
  rniNumber: string;
  titleName: string;
  returnYear: number;
  userEmail: string;
  publisherName: string;
  totalCopiesPrinted: number;
  averageCirculation: number;
  distributionArea: string;
  subscriptionRevenue: string;
  advertisementRevenue: string;
  hasPublishedRegularly: boolean;
  issuesMissed: number;
  ownershipChanged: boolean;
  addressChanged: boolean;
  status: string;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
}

export default function AdminAnnualReturns() {
  const [returns, setReturns] = useState<AnnualReturn[]>([]);
  const [filteredReturns, setFilteredReturns] = useState<AnnualReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedReturn, setSelectedReturn] = useState<AnnualReturn | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [modalAction, setModalAction] = useState<"approve" | "reject">("approve");
  const [remarks, setRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadReturns();
  }, []);

  useEffect(() => {
    filterReturns();
  }, [returns, statusFilter, searchQuery]);

  const loadReturns = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/api/annual-returns", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      });
      const data = await response.json();
      setReturns(data);
    } catch (error) {
      console.error("Failed to load returns:", error);
      alert("Failed to load annual returns");
    } finally {
      setLoading(false);
    }
  };

  const filterReturns = () => {
    let filtered = returns;

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((ret) => ret.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (ret) =>
          ret.titleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ret.rniNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ret.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredReturns(filtered);
  };

  const openActionModal = (returnItem: AnnualReturn, action: "approve" | "reject") => {
    setSelectedReturn(returnItem);
    setModalAction(action);
    setRemarks("");
    setShowModal(true);
  };

  const openDetailsModal = (returnItem: AnnualReturn) => {
    setSelectedReturn(returnItem);
    setShowDetailsModal(true);
  };

  const handleAction = async () => {
    if (!selectedReturn) return;

    try {
      setActionLoading(true);
      
      const status = modalAction === "approve" ? "APPROVED" : "REJECTED";
      const url = `http://localhost:8080/api/annual-returns/${selectedReturn.id}/status?status=${status}${remarks ? `&remarks=${encodeURIComponent(remarks)}` : ""}`;

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      });

      if (response.ok) {
        alert(`Annual return ${modalAction === "approve" ? "approved" : "rejected"} successfully`);
        setShowModal(false);
        setRemarks("");
        setSelectedReturn(null);
        loadReturns();
      } else {
        throw new Error("Action failed");
      }
    } catch (error) {
      console.error("Failed to update return:", error);
      alert("Failed to update return status");
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
    total: returns.length,
    pending: returns.filter((r) => r.status === "PENDING").length,
    approved: returns.filter((r) => r.status === "APPROVED").length,
    rejected: returns.filter((r) => r.status === "REJECTED").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Annual Returns Review</h1>
          <p className="text-muted-foreground">
            Review and verify annual submissions from publications
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Submissions</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </Card>
          <Card className="p-4 border-yellow-200 dark:border-yellow-800">
            <div className="text-sm text-muted-foreground">Pending Review</div>
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
                  placeholder="Search by title, RNI number, or email..."
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

        {/* Returns List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : filteredReturns.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Returns Found</h3>
            <p className="text-muted-foreground">
              {statusFilter !== "ALL"
                ? `No ${statusFilter.toLowerCase()} annual returns`
                : "No annual return submissions yet"}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredReturns.map((returnItem) => (
              <Card key={returnItem.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold">{returnItem.titleName}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          returnItem.status
                        )}`}
                      >
                        {returnItem.status}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Year: {returnItem.returnYear}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground">RNI Number</p>
                        <p className="font-medium">{returnItem.rniNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Publisher</p>
                        <p className="font-medium">{returnItem.publisherName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Submitted By</p>
                        <p className="font-medium text-xs">{returnItem.userEmail}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Copies Printed</p>
                        <p className="font-medium">{returnItem.totalCopiesPrinted?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Avg. Circulation</p>
                        <p className="font-medium">{returnItem.averageCirculation?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Published Regularly</p>
                        <p className="font-medium">{returnItem.hasPublishedRegularly ? "Yes" : `No (${returnItem.issuesMissed} missed)`}</p>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Submitted: {new Date(returnItem.submittedAt).toLocaleString()}
                      {returnItem.reviewedAt && (
                        <> • Reviewed: {new Date(returnItem.reviewedAt).toLocaleString()}</>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDetailsModal(returnItem)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                    {returnItem.status === "PENDING" && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => openActionModal(returnItem, "approve")}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openActionModal(returnItem, "reject")}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Action Modal */}
        {showModal && selectedReturn && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">
                {modalAction === "approve" ? "Approve Annual Return" : "Reject Annual Return"}
              </h2>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Publication: <strong>{selectedReturn.titleName}</strong>
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Year: <strong>{selectedReturn.returnYear}</strong>
                </p>

                <Label>{modalAction === "approve" ? "Remarks (Optional)" : "Rejection Reason *"}</Label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={modalAction === "approve" ? "Enter remarks..." : "Enter rejection reason..."}
                  className="w-full p-2 border rounded-md mt-1"
                  rows={4}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowModal(false);
                    setRemarks("");
                    setSelectedReturn(null);
                  }}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAction}
                  disabled={actionLoading || (modalAction === "reject" && !remarks.trim())}
                  className={modalAction === "approve" ? "bg-green-600 hover:bg-green-700" : ""}
                  variant={modalAction === "reject" ? "destructive" : "default"}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {modalAction === "approve" ? <CheckCircle className="h-4 w-4 mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                      {modalAction === "approve" ? "Approve" : "Reject"}
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedReturn && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
            <Card className="p-6 max-w-3xl w-full mx-4 my-8">
              <h2 className="text-2xl font-bold mb-4">Annual Return Details</h2>
              
              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Title</p>
                    <p className="font-semibold">{selectedReturn.titleName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">RNI Number</p>
                    <p className="font-semibold">{selectedReturn.rniNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Return Year</p>
                    <p className="font-semibold">{selectedReturn.returnYear}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Publisher</p>
                    <p className="font-semibold">{selectedReturn.publisherName}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Circulation</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Copies Printed</p>
                      <p>{selectedReturn.totalCopiesPrinted?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Average Circulation</p>
                      <p>{selectedReturn.averageCirculation?.toLocaleString()}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">Distribution Area</p>
                      <p>{selectedReturn.distributionArea}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Financial</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Subscription Revenue</p>
                      <p>{selectedReturn.subscriptionRevenue || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Advertisement Revenue</p>
                      <p>{selectedReturn.advertisementRevenue || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Compliance</h3>
                  <p className="text-sm">
                    <strong>Published Regularly:</strong> {selectedReturn.hasPublishedRegularly ? "Yes" : "No"}
                  </p>
                  {!selectedReturn.hasPublishedRegularly && (
                    <p className="text-sm">
                      <strong>Issues Missed:</strong> {selectedReturn.issuesMissed}
                    </p>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Changes</h3>
                  <p className="text-sm">
                    <strong>Ownership Changed:</strong> {selectedReturn.ownershipChanged ? "Yes" : "No"}
                  </p>
                  <p className="text-sm">
                    <strong>Address Changed:</strong> {selectedReturn.addressChanged ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={() => setShowDetailsModal(false)}>Close</Button>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}