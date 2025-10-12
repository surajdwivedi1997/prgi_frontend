import { useState } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Header from "@/components/layout/Header";
import { createAppointment, Appointment } from "@/lib/appointmentApi";
import { Calendar, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AppointmentResponse {
  tokenNumber: string;
  message?: string;
}

export default function Appointments() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenNumber, setTokenNumber] = useState("");

  const [formData, setFormData] = useState<Appointment>({
    meetingType: "ONLINE",
    purposeOfVisit: "",
    applicationNumber: "",
    registrationNumber: "",
    referenceNumber: "",
    title: "",
    issueDescription: "",
    appointmentDate: "",
    appointmentTime: "",
    visitorType: "SELF",
    representativeName: "",
    representativePhone: "",
    representativeEmail: "",
  });

  function handleChange(field: keyof Appointment, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (
      !formData.purposeOfVisit ||
      !formData.title ||
      !formData.issueDescription ||
      !formData.appointmentDate ||
      !formData.appointmentTime
    ) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const response = (await createAppointment(formData)) as AppointmentResponse;

      if (!response?.tokenNumber) {
        throw new Error("Token number missing in response");
      }

      setTokenNumber(response.tokenNumber);
      setSuccess(true);

      setTimeout(() => {
        navigate("/my-appointments");
      }, 3000);
    } catch (error: any) {
      alert(error.message || "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Appointment Booked Successfully!</h2>
            <p className="text-muted-foreground mb-4">
              Your appointment has been submitted for approval.
            </p>
            <div className="bg-muted p-4 rounded-lg mb-6">
              <p className="text-sm text-muted-foreground">Token Number</p>
              <p className="text-2xl font-mono font-bold">{tokenNumber}</p>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              You will receive the meeting link once the admin approves your appointment.
              Redirecting to My Appointments...
            </p>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold">Book Appointment</h1>
            <p className="text-muted-foreground">
              Schedule a meeting with government officials
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <Card className="p-6 space-y-6">
              {/* Meeting Type */}
              <div>
                <Label className="text-base font-semibold">Meeting Type *</Label>
                <RadioGroup
                  value={formData.meetingType}
                  onValueChange={(value) => handleChange("meetingType", value)}
                  className="flex gap-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ONLINE" id="online" />
                    <Label htmlFor="online" className="font-normal cursor-pointer">
                      Token for Online Meeting
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="PHYSICAL" id="physical" />
                    <Label htmlFor="physical" className="font-normal cursor-pointer">
                      Token for Physical Meeting
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Purpose of Visit */}
              <div>
                <Label htmlFor="purpose">Purpose of Visit *</Label>
                <Select
                  value={formData.purposeOfVisit}
                  onValueChange={(value) => handleChange("purposeOfVisit", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERAL_INQUIRY">General Inquiry</SelectItem>
                    <SelectItem value="DOCUMENT_VERIFICATION">Document Verification</SelectItem>
                    <SelectItem value="COMPLAINT">Complaint</SelectItem>
                    <SelectItem value="APPLICATION_FOLLOWUP">Application Follow-up</SelectItem>
                    <SelectItem value="GRIEVANCE_DISCUSSION">Grievance Discussion</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search By Section */}
              <Card className="p-4 bg-muted/50">
                <Label className="text-sm font-semibold mb-3 block">
                  Search By (Optional)
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="appNumber" className="text-sm">
                      Application No.
                    </Label>
                    <Input
                      id="appNumber"
                      value={formData.applicationNumber}
                      onChange={(e) => handleChange("applicationNumber", e.target.value)}
                      placeholder="Enter application number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="regNumber" className="text-sm">
                      Registration Number
                    </Label>
                    <Input
                      id="regNumber"
                      value={formData.registrationNumber}
                      onChange={(e) => handleChange("registrationNumber", e.target.value)}
                      placeholder="Enter registration number"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="refNumber" className="text-sm">
                    Any Reference No. (PRGI)
                  </Label>
                  <Input
                    id="refNumber"
                    value={formData.referenceNumber}
                    onChange={(e) => handleChange("referenceNumber", e.target.value)}
                    placeholder="Enter reference number"
                  />
                </div>
              </Card>

              {/* Title and Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Brief title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="issueDesc">Issue Description *</Label>
                  <Textarea
                    id="issueDesc"
                    value={formData.issueDescription}
                    onChange={(e) => handleChange("issueDescription", e.target.value)}
                    placeholder="Describe your issue"
                    rows={3}
                    required
                  />
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Appointment Date *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) => handleChange("appointmentDate", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Appointment Time *
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.appointmentTime}
                    onChange={(e) => handleChange("appointmentTime", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Visitor Type */}
              <div>
                <Label className="text-base font-semibold">Visitor Type *</Label>
                <RadioGroup
                  value={formData.visitorType}
                  onValueChange={(value) => handleChange("visitorType", value)}
                  className="flex gap-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="SELF" id="self" />
                    <Label htmlFor="self" className="font-normal cursor-pointer">
                      Self
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="REPRESENTATIVE" id="representative" />
                    <Label htmlFor="representative" className="font-normal cursor-pointer">
                      Representative
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Representative Details */}
              {formData.visitorType === "REPRESENTATIVE" && (
                <Card className="p-4 bg-muted/50">
                  <Label className="text-sm font-semibold mb-3 block">
                    Representative Details
                  </Label>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="repName" className="text-sm">
                        Name
                      </Label>
                      <Input
                        id="repName"
                        value={formData.representativeName}
                        onChange={(e) => handleChange("representativeName", e.target.value)}
                        placeholder="Representative name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="repPhone" className="text-sm">
                        Phone
                      </Label>
                      <Input
                        id="repPhone"
                        value={formData.representativePhone}
                        onChange={(e) => handleChange("representativePhone", e.target.value)}
                        placeholder="Representative phone"
                      />
                    </div>
                    <div>
                      <Label htmlFor="repEmail" className="text-sm">
                        Email
                      </Label>
                      <Input
                        id="repEmail"
                        type="email"
                        value={formData.representativeEmail}
                        onChange={(e) => handleChange("representativeEmail", e.target.value)}
                        placeholder="Representative email"
                      />
                    </div>
                  </div>
                </Card>
              )}

              {/* Info Alert */}
              <div className="flex items-start gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-blue-900 dark:text-blue-100">
                    Important
                  </p>
                  <p className="text-blue-800 dark:text-blue-200">
                    Your appointment will be pending approval. You will receive the meeting details once an admin approves your request.
                  </p>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Submitting..." : "Submit Appointment"}
                </Button>
              </div>
            </Card>
          </form>
        </div>
      </main>
    </div>
  );
}