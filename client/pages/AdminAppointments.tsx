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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, CheckCircle, XCircle, Link as LinkIcon, Copy } from "lucide-react";
import Header from "@/components/layout/Header";
import { useNavigate } from "react-router-dom";
import {
  getAllAppointments,
  approveAppointment,
  rejectAppointment,
  updateMeetingLink,
  Appointment,
} from "@/lib/appointmentApi";

export default function AdminAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [meetingLink, setMeetingLink] = useState("");
  const [venue, setVenue] = useState("");
  
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [remarks, setRemarks] = useState("");

  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [newMeetingLink, setNewMeetingLink] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "ROLE_ADMIN") {
      navigate("/dashboard");
      return;
    }
    
    loadAppointments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [appointments, filterStatus, searchQuery]);

  async function loadAppointments() {
    try {
      const data = await getAllAppointments();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load appointments:", err);
    }
  }

  function applyFilters() {
    let filtered = [...appointments];

    if (filterStatus !== "ALL") {
      filtered = filtered.filter(a => a.status === filterStatus);
    }

    if (searchQuery) {
      filtered = filtered.filter(a =>
        a.tokenNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredAppointments(filtered);
  }

  async function handleApprove() {
    if (!selectedAppointment) return;

    setLoading(true);
    try {
      await approveAppointment(
        selectedAppointment.id!,
        selectedAppointment.meetingType === "ONLINE" ? meetingLink : undefined,
        selectedAppointment.meetingType === "PHYSICAL" ? venue : undefined
      );

      await loadAppointments();
      setApproveDialogOpen(false);
      setDetailOpen(false);
      setMeetingLink("");
      setVenue("");
      alert("Appointment approved successfully");
    } catch (err) {
      alert("Failed to approve appointment");
    } finally {
      setLoading(false);
    }
  }

  async function handleReject() {
    if (!selectedAppointment || !remarks.trim()) return;

    setLoading(true);
    try {
      await rejectAppointment(selectedAppointment.id!, remarks);

      await loadAppointments();
      setRejectDialogOpen(false);
      setDetailOpen(false);
      setRemarks("");
      alert("Appointment rejected");
    } catch (err) {
      alert("Failed to reject appointment");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateLink() {
    if (!selectedAppointment || !newMeetingLink.trim()) return;

    setLoading(true);
    try {
      await updateMeetingLink(selectedAppointment.id!, newMeetingLink);

      await loadAppointments();
      setLinkDialogOpen(false);
      setDetailOpen(false);
      setNewMeetingLink("");
      alert("Meeting link updated");
    } catch (err) {
      alert("Failed to update meeting link");
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "APPROVED": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "REJECTED": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "COMPLETED": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "CANCELLED": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default: return "bg-gray-100 text-gray-800";
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    alert("Link copied to clipboard!");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      <Header />

      <main className="container mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">Appointment Management (Admin)</h1>
          <p className="text-muted-foreground">Manage and approve appointment requests</p>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Search</Label>
              <Input
                placeholder="Search by token or title..."
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
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setFilterStatus("ALL");
                  setSearchQuery("");
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Appointments Table */}
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token No.</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Meeting Type</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    No appointments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAppointments.map((appointment) => (
                  <TableRow key={appointment.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">
                      {appointment.tokenNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{appointment.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.purposeOfVisit?.replace("_", " ")}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {appointment.meetingType === "ONLINE" ? "Online" : "Physical"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {appointment.appointmentDate} {appointment.appointmentTime}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                          appointment.status || "PENDING"
                        )}`}
                      >
                        {appointment.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setDetailOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {appointment.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setApproveDialogOpen(true);
                              }}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setRejectDialogOpen(true);
                              }}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {appointment.status === "APPROVED" && appointment.meetingType === "ONLINE" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setLinkDialogOpen(true);
                            }}
                          >
                            <LinkIcon className="h-4 w-4" />
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

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedAppointment?.meetingType === "ONLINE" ? (
              <div>
                <Label>Meeting Link *</Label>
                <Input
                  placeholder="Enter Zoom/Google Meet link"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  User will see this link as copyable text
                </p>
              </div>
            ) : (
              <div>
                <Label>Venue *</Label>
                <Input
                  placeholder="Enter physical meeting venue"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                />
              </div>
            )}
            <Button 
              onClick={handleApprove} 
              disabled={loading || (!meetingLink && !venue)} 
              className="w-full"
            >
              {loading ? "Approving..." : "Approve Appointment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason for Rejection *</Label>
              <Textarea
                placeholder="Enter reason..."
                rows={4}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleReject} 
              disabled={loading || !remarks.trim()} 
              variant="destructive"
              className="w-full"
            >
              {loading ? "Rejecting..." : "Reject Appointment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Meeting Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>New Meeting Link *</Label>
              <Input
                placeholder="Enter new meeting link"
                value={newMeetingLink}
                onChange={(e) => setNewMeetingLink(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleUpdateLink} 
              disabled={loading || !newMeetingLink.trim()} 
              className="w-full"
            >
              {loading ? "Updating..." : "Update Link"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          {selectedAppointment && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>Appointment: {selectedAppointment.tokenNumber}</DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span
                    className={`inline-block px-2 py-1 rounded text-sm font-medium ${getStatusColor(
                      selectedAppointment.status || "PENDING"
                    )}`}
                  >
                    {selectedAppointment.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Meeting Type</p>
                  <p className="font-semibold">{selectedAppointment.meetingType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                  <p className="font-semibold">
                    {selectedAppointment.appointmentDate} {selectedAppointment.appointmentTime}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Purpose</p>
                  <p className="font-semibold">
                    {selectedAppointment.purposeOfVisit?.replace("_", " ")}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Title</h3>
                <p>{selectedAppointment.title}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Issue Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedAppointment.issueDescription}
                </p>
              </div>

              {selectedAppointment.meetingLink && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h3 className="font-semibold mb-2">Meeting Link</h3>
                  <div className="flex items-center gap-2">
                    <Input
                      value={selectedAppointment.meetingLink}
                      readOnly
                      className="text-sm font-mono"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(selectedAppointment.meetingLink || "")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {selectedAppointment.venue && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="font-semibold mb-2">Venue</h3>
                  <p className="text-sm">{selectedAppointment.venue}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}