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
  AlertTriangle,
  FileText,
} from "lucide-react";

interface Title {
  id: number;
  titleName: string;
  language: string;
  state: string;
  district: string;
  status: string;
  rniNumber: string | null;
  publisherId: number | null;
  periodicity: string | null;
  createdAt: string;
  registeredAt: string | null;
  remarks: string | null;
}

export default function AdminTitleManagement() {
  const [titles, setTitles] = useState<Title[]>([]);
  const [filteredTitles, setFilteredTitles] = useState<Title[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedTitle, setSelectedTitle] = useState<Title | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<"approve" | "reject" | "objection">("approve");
  const [remarks, setRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    console.log("Component mounted, calling loadTitles");
    loadTitles();
  }, []);

  useEffect(() => {
    filterTitles();
  }, [titles, statusFilter, searchQuery]);

  const loadTitles = async () => {
    console.log("=== loadTitles START ===");
    console.log("Token:", localStorage.getItem("jwtToken"));
    
    try {
      setLoading(true);
      console.log("About to fetch /api/publications");
      
      const response = await fetch("http://localhost:8080/api/publications", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      });
      
      console.log("Response received:", response.status, response.statusText);
      
      if (!response.ok) {
        console.error("Response status:", response.status);
        const errorText = await response.text();
        console.error("Response text:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Loaded titles:", data);
      console.log("Number of titles:", data.length);
      setTitles(data);
    } catch (error) {
      console.error("Failed to load titles:", error);
      alert("Failed to load titles. Please try logging in again.");
    } finally {
      setLoading(false);
      console.log("=== loadTitles END ===");
    }
  };

  const filterTitles = () => {
    let filtered = titles;

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((title) => title.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter((title) =>
        title.titleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        title.state.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTitles(filtered);
  };

  const openModal = (title: Title, action: "approve" | "reject" | "objection") => {
    setSelectedTitle(title);
    setModalAction(action);
    setRemarks("");
    setShowModal(true);
  };

  const handleAction = async () => {
    if (!selectedTitle) return;

    if ((modalAction === "reject" || modalAction === "objection") && !remarks.trim()) {
      alert("Please enter remarks");
      return;
    }

    try {
      setActionLoading(true);
      
      const newStatus = 
        modalAction === "approve" ? "APPROVED" :
        modalAction === "reject" ? "REJECTED" :
        "OBJECTED";

      const response = await fetch(
        `http://localhost:8080/api/publications/${selectedTitle.id}/status?status=${newStatus}&remarks=${encodeURIComponent(remarks)}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        }
      );

      if (response.ok) {
        alert(`Title ${modalAction === "approve" ? "approved" : modalAction === "reject" ? "rejected" : "marked with objection"} successfully`);
        setShowModal(false);
        setRemarks("");
        setSelectedTitle(null);
        loadTitles();
      } else {
        throw new Error("Action failed");
      }
    } catch (error) {
      console.error("Failed to update title:", error);
      alert("Failed to update title status");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "REGISTERED":
      case "APPROVED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "RESERVED":
      case "PENDING":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "OBJECTED":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "CEASED":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const stats = {
    total: titles.length,
    reserved: titles.filter((t) => t.status === "RESERVED" || t.status === "PENDING").length,
    registered: titles.filter((t) => t.status === "REGISTERED" || t.status === "APPROVED").length,
    objected: titles.filter((t) => t.status === "OBJECTED").length,
    ceased: titles.filter((t) => t.status === "CEASED").length,
  };

  console.log("Rendering component - titles count:", titles.length);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Title Management</h1>
          <p className="text-muted-foreground">
            Manage publication titles, objections, and approvals
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Titles</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </Card>
          <Card className="p-4 border-blue-200 dark:border-blue-800">
            <div className="text-sm text-muted-foreground">Pending</div>
            <div className="text-2xl font-bold text-blue-600">{stats.reserved}</div>
          </Card>
          <Card className="p-4 border-green-200 dark:border-green-800">
            <div className="text-sm text-muted-foreground">Approved</div>
            <div className="text-2xl font-bold text-green-600">{stats.registered}</div>
          </Card>
          <Card className="p-4 border-orange-200 dark:border-orange-800">
            <div className="text-sm text-muted-foreground">Objected</div>
            <div className="text-2xl font-bold text-orange-600">{stats.objected}</div>
          </Card>
          <Card className="p-4 border-gray-200 dark:border-gray-800">
            <div className="text-sm text-muted-foreground">Ceased</div>
            <div className="text-2xl font-bold text-gray-600">{stats.ceased}</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title name or state..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
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
                Pending ({stats.reserved})
              </Button>
              <Button
                variant={statusFilter === "APPROVED" ? "default" : "outline"}
                onClick={() => setStatusFilter("APPROVED")}
                size="sm"
              >
                Approved ({stats.registered})
              </Button>
              <Button
                variant={statusFilter === "OBJECTED" ? "default" : "outline"}
                onClick={() => setStatusFilter("OBJECTED")}
                size="sm"
              >
                Objected ({stats.objected})
              </Button>
              <Button
                variant={statusFilter === "CEASED" ? "default" : "outline"}
                onClick={() => setStatusFilter("CEASED")}
                size="sm"
              >
                Ceased ({stats.ceased})
              </Button>
            </div>
          </div>
        </Card>

        {/* Titles List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : filteredTitles.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Titles Found</h3>
            <p className="text-muted-foreground">
              {statusFilter !== "ALL"
                ? `No ${statusFilter.toLowerCase()} titles`
                : "No titles in the system yet"}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTitles.map((title) => (
              <Card key={title.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold">{title.titleName}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          title.status
                        )}`}
                      >
                        {title.status}
                      </span>
                      {title.rniNumber && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          RNI: {title.rniNumber}
                        </span>
                      )}
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Language</p>
                        <p className="font-medium">{title.language}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">State</p>
                        <p className="font-medium">{title.state}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">District</p>
                        <p className="font-medium">{title.district || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Periodicity</p>
                        <p className="font-medium">{title.periodicity || "N/A"}</p>
                      </div>
                    </div>

                    {title.remarks && (
                      <div className="p-3 bg-muted rounded-md mb-3">
                        <p className="text-sm">
                          <strong>Remarks:</strong> {title.remarks}
                        </p>
                      </div>
                    )}

                    <div className="text-sm text-muted-foreground">
                      Created: {new Date(title.createdAt).toLocaleString()}
                      {title.registeredAt && (
                        <> • Registered: {new Date(title.registeredAt).toLocaleString()}</>
                      )}
                    </div>
                  </div>

                  {(title.status === "RESERVED" || title.status === "PENDING") && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => openModal(title, "approve")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openModal(title, "objection")}
                        className="border-orange-500 text-orange-600 hover:bg-orange-50"
                      >
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Objection
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openModal(title, "reject")}
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

        {/* Action Modal */}
        {showModal && selectedTitle && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">
                {modalAction === "approve" && "Approve Title"}
                {modalAction === "reject" && "Reject Title"}
                {modalAction === "objection" && "Mark Objection"}
              </h2>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Title: <strong>{selectedTitle.titleName}</strong>
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  State: <strong>{selectedTitle.state}</strong>
                </p>

                {(modalAction === "reject" || modalAction === "objection") && (
                  <>
                    <Label>
                      {modalAction === "reject" ? "Rejection Reason *" : "Objection Details *"}
                    </Label>
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder={
                        modalAction === "reject"
                          ? "Enter reason for rejection..."
                          : "Enter objection details..."
                      }
                      className="w-full p-2 border rounded-md mt-1"
                      rows={4}
                    />
                  </>
                )}

                {modalAction === "approve" && (
                  <div className="p-3 bg-green-50 dark:bg-green-950 rounded-md">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      This will mark the title as APPROVED and make it available for publication use.
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowModal(false);
                    setRemarks("");
                    setSelectedTitle(null);
                  }}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAction}
                  disabled={
                    actionLoading ||
                    ((modalAction === "reject" || modalAction === "objection") && !remarks.trim())
                  }
                  className={
                    modalAction === "approve"
                      ? "bg-green-600 hover:bg-green-700"
                      : modalAction === "objection"
                      ? "bg-orange-600 hover:bg-orange-700"
                      : ""
                  }
                  variant={modalAction === "reject" ? "destructive" : "default"}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {modalAction === "approve" && <CheckCircle className="h-4 w-4 mr-2" />}
                      {modalAction === "reject" && <XCircle className="h-4 w-4 mr-2" />}
                      {modalAction === "objection" && <AlertTriangle className="h-4 w-4 mr-2" />}
                      {modalAction === "approve" && "Approve"}
                      {modalAction === "reject" && "Reject"}
                      {modalAction === "objection" && "Mark Objection"}
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