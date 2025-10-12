import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, CheckCircle2, FileText, Plus, Lock } from "lucide-react";
import { apiFetch } from "@/lib/api";
import Header from "@/components/layout/Header";
import { useNavigate } from "react-router-dom";

const GRIEVANCE_CATEGORIES = [
  { value: "DELAY", label: "Processing Delay" },
  { value: "REJECTION", label: "Application Rejection" },
  { value: "DOCUMENT_ISSUE", label: "Document Related Issue" },
  { value: "PAYMENT", label: "Payment Issue" },
  { value: "OTHER", label: "Other" },
];

export default function Grievances() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"submit" | "my-grievances">("my-grievances");
  const [myGrievances, setMyGrievances] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");

  // Get user email from localStorage
  const userEmail = localStorage.getItem("userEmail") || "";

  // Form states - Initialize with user's email
  const [formData, setFormData] = useState({
    applicationNumber: "",
    complainantName: "",
    complainantEmail: userEmail, // Auto-fill with logged-in user's email
    complainantPhone: "",
    category: "",
    subject: "",
    description: "",
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submittedGrievanceNumber, setSubmittedGrievanceNumber] = useState("");

  useEffect(() => {
    loadMyGrievances();
    loadStats();
  }, []);

  // Update email if it changes in localStorage (shouldn't happen, but for safety)
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      complainantEmail: userEmail
    }));
  }, [userEmail]);

  async function loadMyGrievances() {
    try {
      const data = await apiFetch("/api/grievances/my-grievances");
      setMyGrievances(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load grievances:", err);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await apiFetch("/api/grievances/create", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      setSubmittedGrievanceNumber(response.grievanceNumber);
      setSubmitSuccess(true);
      
      // Reset form but keep the email
      setFormData({
        applicationNumber: "",
        complainantName: "",
        complainantEmail: userEmail, // Keep user's email
        complainantPhone: "",
        category: "",
        subject: "",
        description: "",
      });

      // Reload grievances
      await loadMyGrievances();
      await loadStats();
    } catch (err: any) {
      alert(err?.message || "Failed to submit grievance");
    } finally {
      setLoading(false);
    }
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

  async function handleAddComment() {
    if (!newComment.trim() || !selectedGrievance) return;

    try {
      await apiFetch(`/api/grievances/${selectedGrievance.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ comment: newComment }),
      });

      // Reload comments
      const data = await apiFetch(`/api/grievances/${selectedGrievance.grievanceNumber}`);
      setComments(data.comments || []);
      setNewComment("");
    } catch (err) {
      alert("Failed to add comment");
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "OPEN": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "IN_PROGRESS": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "RESOLVED": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "CLOSED": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default: return "bg-gray-100 text-gray-800";
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Grievance Management</h1>
            <p className="text-muted-foreground">Submit and track your grievances</p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="text-sm text-muted-foreground">Total</div>
                <div className="text-2xl font-bold">{stats.total || 0}</div>
              </Card>
              <Card className="p-4 border-l-4 border-l-blue-500">
                <div className="text-sm text-muted-foreground">Open</div>
                <div className="text-2xl font-bold text-blue-600">{stats.open || 0}</div>
              </Card>
              <Card className="p-4 border-l-4 border-l-yellow-500">
                <div className="text-sm text-muted-foreground">In Progress</div>
                <div className="text-2xl font-bold text-yellow-600">{stats.inProgress || 0}</div>
              </Card>
              <Card className="p-4 border-l-4 border-l-green-500">
                <div className="text-sm text-muted-foreground">Resolved</div>
                <div className="text-2xl font-bold text-green-600">{stats.resolved || 0}</div>
              </Card>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 border-b">
            <button
              onClick={() => setActiveTab("my-grievances")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "my-grievances"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              My Grievances
            </button>
            <button
              onClick={() => setActiveTab("submit")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "submit"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Submit New Grievance
            </button>
          </div>

          {/* My Grievances Tab */}
          {activeTab === "my-grievances" && (
            <div className="space-y-4">
              {myGrievances.length === 0 ? (
                <Card className="p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No grievances submitted yet</p>
                  <Button
                    onClick={() => setActiveTab("submit")}
                    className="mt-4"
                    variant="outline"
                  >
                    Submit Your First Grievance
                  </Button>
                </Card>
              ) : (
                myGrievances.map((grievance) => (
                  <Card
                    key={grievance.id}
                    className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => viewGrievanceDetails(grievance.grievanceNumber)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-sm font-semibold">
                            {grievance.grievanceNumber}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(grievance.status)}`}>
                            {grievance.status}
                          </span>
                        </div>
                        <h3 className="font-semibold mb-1">{grievance.subject}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {grievance.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Category: {grievance.category}</span>
                          <span>
                            Submitted: {new Date(grievance.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Submit Grievance Tab */}
          {activeTab === "submit" && (
            <Card className="p-6">
              {submitSuccess && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-green-800 dark:text-green-300">
                        Grievance Submitted Successfully!
                      </h3>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        Your grievance number is: <strong>{submittedGrievanceNumber}</strong>
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        You can track the status using this number.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSubmitSuccess(false);
                          setActiveTab("my-grievances");
                        }}
                        className="mt-2"
                      >
                        View My Grievances
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="applicationNumber">Application Number (Optional)</Label>
                    <Input
                      id="applicationNumber"
                      placeholder="e.g., APP-2025-00123"
                      value={formData.applicationNumber}
                      onChange={(e) => setFormData({ ...formData, applicationNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRIEVANCE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="complainantName">Your Name *</Label>
                    <Input
                      id="complainantName"
                      placeholder="Enter your name"
                      value={formData.complainantName}
                      onChange={(e) => setFormData({ ...formData, complainantName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="complainantEmail">Email *</Label>
                    <div className="relative">
                      <Input
                        id="complainantEmail"
                        type="email"
                        value={formData.complainantEmail}
                        disabled
                        className="bg-muted cursor-not-allowed pr-10"
                        required
                      />
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Using your logged-in email
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="complainantPhone">Phone</Label>
                    <Input
                      id="complainantPhone"
                      placeholder="+91 1234567890"
                      value={formData.complainantPhone}
                      onChange={(e) => setFormData({ ...formData, complainantPhone: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    placeholder="Brief subject of your grievance"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed description of your grievance..."
                    rows={6}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Submitting..." : "Submit Grievance"}
                </Button>
              </form>
            </Card>
          )}
        </div>
      </main>

      {/* Grievance Details Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Grievance Details</DialogTitle>
          </DialogHeader>
          {selectedGrievance && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Grievance Number:</span>
                  <p className="font-mono font-semibold">{selectedGrievance.grievanceNumber}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedGrievance.status)}`}>
                      {selectedGrievance.status}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <p className="font-medium">{selectedGrievance.category}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Submitted:</span>
                  <p>{new Date(selectedGrievance.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <span className="text-muted-foreground text-sm">Subject:</span>
                <p className="font-semibold">{selectedGrievance.subject}</p>
              </div>

              <div>
                <span className="text-muted-foreground text-sm">Description:</span>
                <p className="text-sm">{selectedGrievance.description}</p>
              </div>

              {selectedGrievance.resolution && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-muted-foreground text-sm">Resolution:</span>
                  <p className="text-sm mt-1">{selectedGrievance.resolution}</p>
                </div>
              )}

              {/* Comments Section */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Comments</h3>
                <div className="space-y-3 mb-4">
                  {comments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No comments yet</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="p-3 bg-muted rounded-lg">
                        <p className="text-sm">{comment.comment}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(comment.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleAddComment();
                      }
                    }}
                  />
                  <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                    Send
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}