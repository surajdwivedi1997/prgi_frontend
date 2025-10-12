import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, Eye, UserCheck, CheckCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import Header from "@/components/layout/Header";
import { useNavigate } from "react-router-dom";

export default function AdminGrievances() {
  const navigate = useNavigate();
  const [grievances, setGrievances] = useState<any[]>([]);
  const [filteredGrievances, setFilteredGrievances] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedOfficerId, setSelectedOfficerId] = useState("");
  
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [resolution, setResolution] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "ROLE_ADMIN") {
      navigate("/dashboard");
      return;
    }
    
    loadGrievances();
    loadUsers();
    loadStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [grievances, filterStatus, filterPriority, searchQuery]);

  async function loadGrievances() {
    try {
      const data = await apiFetch("/api/grievances/all");
      setGrievances(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load grievances:", err);
    }
  }

  async function loadUsers() {
    try {
      const data = await apiFetch("/api/admin/userlist");
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  }

  async function loadStats() {
    try {
      const data = await apiFetch("/api/grievances/stats");
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  }

  function applyFilters() {
    let filtered = [...grievances];

    if (filterStatus !== "ALL") {
      filtered = filtered.filter(g => g.status === filterStatus);
    }

    if (filterPriority !== "ALL") {
      filtered = filtered.filter(g => g.priority === filterPriority);
    }

    if (searchQuery) {
      filtered = filtered.filter(g =>
        g.grievanceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.complainantName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredGrievances(filtered);
  }

  async function viewGrievanceDetails(grievanceNumber: string) {
    try {
      const data = await apiFetch(`/api/grievances/${grievanceNumber}`);
      setSelectedGrievance(data.grievance);
      setComments(data.comments || []);
      setDetailOpen(true);
    } catch (err) {
      console.error("Failed to load grievance details:", err);
    }
  }

  async function handleAssign() {
    if (!selectedGrievance || !selectedOfficerId) return;

    setLoading(true);
    try {
      await apiFetch(
        `/api/grievances/${selectedGrievance.id}/assign?officerId=${selectedOfficerId}`,
        { method: "PUT" }
      );

      await loadGrievances();
      setAssignDialogOpen(false);
      setDetailOpen(false);
      alert("Grievance assigned successfully");
    } catch (err) {
      alert("Failed to assign grievance");
    } finally {
      setLoading(false);
    }
  }

  async function handleResolve() {
    if (!selectedGrievance || !resolution.trim()) return;

    setLoading(true);
    try {
      await apiFetch(
        `/api/grievances/${selectedGrievance.id}/status?status=RESOLVED`,
        {
          method: "PUT",
          body: JSON.stringify({ resolution }),
        }
      );

      await loadGrievances();
      setResolveDialogOpen(false);
      setDetailOpen(false);
      setResolution("");
      alert("Grievance resolved successfully");
    } catch (err) {
      alert("Failed to resolve grievance");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(grievanceId: number, status: string) {
    setLoading(true);
    try {
      await apiFetch(`/api/grievances/${grievanceId}/status?status=${status}`, {
        method: "PUT",
      });

      await loadGrievances();
      alert("Status updated successfully");
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "OPEN": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "ASSIGNED": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "IN_PROGRESS": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "RESOLVED": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "CLOSED": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "ESCALATED": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800";
    }
  }

  function getPriorityBadge(priority: string) {
    const colors = {
      URGENT: "bg-red-500",
      HIGH: "bg-orange-500",
      MEDIUM: "bg-yellow-500",
      LOW: "bg-green-500",
    };
    return colors[priority as keyof typeof colors] || "bg-gray-500";
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      <Header />

      <main className="container mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">Grievance Management (Admin)</h1>
          <p className="text-muted-foreground">Manage and resolve user grievances</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="p-4 border-l-4 border-l-blue-500">
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </Card>
            <Card className="p-4 border-l-4 border-l-purple-500">
              <div className="text-sm text-muted-foreground">Open</div>
              <div className="text-2xl font-bold">{stats.open}</div>
            </Card>
            <Card className="p-4 border-l-4 border-l-yellow-500">
              <div className="text-sm text-muted-foreground">In Progress</div>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
            </Card>
            <Card className="p-4 border-l-4 border-l-green-500">
              <div className="text-sm text-muted-foreground">Resolved</div>
              <div className="text-2xl font-bold">{stats.resolved}</div>
            </Card>
            <Card className="p-4 border-l-4 border-l-red-500">
              <div className="text-sm text-muted-foreground">Escalated</div>
              <div className="text-2xl font-bold">{stats.escalated || 0}</div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Search</Label>
              <Input
                placeholder="Search by number, subject, name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="ASSIGNED">Assigned</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="ESCALATED">Escalated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Priority</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setFilterStatus("ALL");
                  setFilterPriority("ALL");
                  setSearchQuery("");
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Grievances Table */}
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Priority</TableHead>
                <TableHead>Grievance #</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Complainant</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGrievances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10">
                    No grievances found
                  </TableCell>
                </TableRow>
              ) : (
                filteredGrievances.map((grievance) => (
                  <TableRow key={grievance.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div
                        className={`w-3 h-3 rounded-full ${getPriorityBadge(
                          grievance.priority
                        )}`}
                        title={grievance.priority}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {grievance.grievanceNumber}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {grievance.subject}
                      {grievance.isEscalated && (
                        <AlertCircle className="inline h-4 w-4 text-red-500 ml-2" />
                      )}
                    </TableCell>
                    <TableCell>{grievance.complainantName}</TableCell>
                    <TableCell className="text-sm">
                      {grievance.category.replace("_", " ")}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                          grievance.status
                        )}`}
                      >
                        {grievance.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(grievance.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(grievance.slaDeadline).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => viewGrievanceDetails(grievance.grievanceNumber)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {grievance.status === "OPEN" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedGrievance(grievance);
                              setAssignDialogOpen(true);
                            }}
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        )}
                        {(grievance.status === "ASSIGNED" ||
                          grievance.status === "IN_PROGRESS") && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedGrievance(grievance);
                              setResolveDialogOpen(true);
                            }}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </main>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Grievance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Officer</Label>
              <Select value={selectedOfficerId} onValueChange={setSelectedOfficerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an officer" />
                </SelectTrigger>
                <SelectContent>
                  {users
                    .filter((u) => u.role === "ROLE_USER" || u.role === "ROLE_ADMIN")
                    .map((user) => (
                      <SelectItem key={user.id} value={String(user.id)}>
                        {user.email} ({user.role.replace("ROLE_", "")})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAssign} disabled={loading || !selectedOfficerId} className="w-full">
              {loading ? "Assigning..." : "Assign Grievance"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Grievance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Resolution Details</Label>
              <Textarea
                placeholder="Enter resolution details..."
                rows={6}
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
              />
            </div>
            <Button onClick={handleResolve} disabled={loading || !resolution.trim()} className="w-full">
              {loading ? "Resolving..." : "Mark as Resolved"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedGrievance && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>Grievance: {selectedGrievance.grievanceNumber}</DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span
                    className={`inline-block px-2 py-1 rounded text-sm font-medium ${getStatusColor(
                      selectedGrievance.status
                    )}`}
                  >
                    {selectedGrievance.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Priority</p>
                  <p className="font-semibold">{selectedGrievance.priority}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Complainant</p>
                  <p className="font-semibold">{selectedGrievance.complainantName}</p>
                  <p className="text-sm">{selectedGrievance.complainantEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-semibold">{selectedGrievance.category.replace("_", " ")}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Subject</h3>
                <p>{selectedGrievance.subject}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedGrievance.description}
                </p>
              </div>

              {selectedGrievance.resolution && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h3 className="font-semibold mb-2">Resolution</h3>
                  <p className="text-sm">{selectedGrievance.resolution}</p>
                </div>
              )}

              <div className="flex gap-2">
                {selectedGrievance.status === "OPEN" && (
                  <Button
                    onClick={() => {
                      setAssignDialogOpen(true);
                    }}
                  >
                    Assign to Officer
                  </Button>
                )}
                {(selectedGrievance.status === "ASSIGNED" ||
                  selectedGrievance.status === "IN_PROGRESS") && (
                  <>
                    <Button onClick={() => updateStatus(selectedGrievance.id, "IN_PROGRESS")}>
                      Mark In Progress
                    </Button>
                    <Button onClick={() => setResolveDialogOpen(true)} variant="default">
                      Resolve
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}