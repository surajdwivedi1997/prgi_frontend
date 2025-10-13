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

// 🌐 Base URL — auto switches for Render or local dev
const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:8080/api";

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
      const response = await fetch(`${API_BASE_URL}/annual-returns`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setReturns(data);
    } catch (error) {
      console.error("❌ Failed to load returns:", error);
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
      const url = `${API_BASE_URL}/annual-returns/${selectedReturn.id}/status?status=${status}${
        remarks ? `&remarks=${encodeURIComponent(remarks)}` : ""
      }`;

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      });

      if (response.ok) {
        alert(
          `Annual return ${
            modalAction === "approve" ? "approved" : "rejected"
          } successfully`
        );
        setShowModal(false);
        setRemarks("");
        setSelectedReturn(null);
        loadReturns();
      } else {
        throw new Error("Action failed");
      }
    } catch (error) {
      console.error("❌ Failed to update return:", error);
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

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Submissions", value: stats.total },
            { label: "Pending Review", value: stats.pending, color: "text-yellow-600" },
            { label: "Approved", value: stats.approved, color: "text-green-600" },
            { label: "Rejected", value: stats.rejected, color: "text-red-600" },
          ].map((s, i) => (
            <Card key={i} className="p-4">
              <div className="text-sm text-muted-foreground">{s.label}</div>
              <div className={`text-2xl font-bold ${s.color || ""}`}>{s.value}</div>
            </Card>
          ))}
        </div>

        {/* Filter + Search */}
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
              {["ALL", "PENDING", "APPROVED", "REJECTED"].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  onClick={() => setStatusFilter(status)}
                  size="sm"
                >
                  {status.charAt(0) + status.slice(1).toLowerCase()} (
                  {status === "ALL"
                    ? stats.total
                    : status === "PENDING"
                    ? stats.pending
                    : status === "APPROVED"
                    ? stats.approved
                    : stats.rejected}
                  )
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* List */}
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
            {filteredReturns.map((r) => (
              <Card key={r.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold">{r.titleName}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(r.status)}`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      RNI: {r.rniNumber} • Year: {r.returnYear} • Publisher: {r.publisherName}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openDetailsModal(r)}>
                      <Eye className="h-4 w-4 mr-1" /> Details
                    </Button>
                    {r.status === "PENDING" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => openActionModal(r, "approve")}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openActionModal(r, "reject")}
                        >
                          <XCircle className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}