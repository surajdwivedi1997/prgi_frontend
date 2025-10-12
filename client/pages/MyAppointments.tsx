import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import { getMyAppointments, Appointment } from "@/lib/appointmentApi";
import { Calendar, Clock, Copy } from "lucide-react";

export default function MyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  async function loadAppointments() {
    try {
      const data = await getMyAppointments();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load appointments:", error);
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "APPROVED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    alert("Link copied to clipboard!");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold">My Appointments</h1>
          <p className="text-muted-foreground">View and manage your appointment bookings</p>
        </div>

        {loading ? (
          <Card className="p-8 text-center">
            <p>Loading appointments...</p>
          </Card>
        ) : appointments.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">You haven't booked any appointments yet</p>
            <Button onClick={() => (window.location.href = "/appointments")}>
              Book Appointment
            </Button>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token No.</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Meeting Type</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
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
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        {appointment.appointmentDate}
                        <Clock className="h-4 w-4 ml-2" />
                        {appointment.appointmentTime}
                      </div>
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
                      {appointment.status === "APPROVED" && appointment.meetingLink && (
                        <div className="space-y-1 max-w-xs">
                          <p className="text-xs text-muted-foreground font-medium">Meeting Link:</p>
                          <div className="flex items-center gap-2">
                            <Input
                              value={appointment.meetingLink}
                              readOnly
                              className="text-xs h-8 font-mono"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(appointment.meetingLink || "")}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                      {appointment.status === "APPROVED" && appointment.venue && (
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">Venue:</p>
                          <p className="text-sm font-medium">{appointment.venue}</p>
                        </div>
                      )}
                      {appointment.status === "REJECTED" && appointment.remarks && (
                        <div>
                          <p className="text-xs text-red-600 dark:text-red-400 font-medium">Reason:</p>
                          <p className="text-sm">{appointment.remarks}</p>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </main>
    </div>
  );
}