import { apiFetch } from "./api";

export interface Appointment {
  id?: number;
  tokenNumber?: string;
  meetingType: string;
  purposeOfVisit: string;
  applicationNumber?: string;
  registrationNumber?: string;
  referenceNumber?: string;
  title: string;
  issueDescription: string;
  appointmentDate: string;
  appointmentTime: string;
  timeSlot?: string;
  visitorType: string;
  representativeName?: string;
  representativePhone?: string;
  representativeEmail?: string;
  status?: string;
  meetingLink?: string;
  venue?: string;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function createAppointment(appointment: Appointment) {
  return await apiFetch("/api/appointments", {
    method: "POST",
    body: JSON.stringify(appointment),
  });
}

export async function getMyAppointments() {
  return await apiFetch("/api/appointments/my-appointments");
}

export async function getAllAppointments() {
  return await apiFetch("/api/appointments/all");
}

export async function getAppointmentsByStatus(status: string) {
  return await apiFetch(`/api/appointments/status/${status}`);
}

export async function approveAppointment(
  id: number,
  meetingLink?: string,
  venue?: string,
  officerId?: number
) {
  return await apiFetch(`/api/appointments/${id}/approve`, {
    method: "PUT",
    body: JSON.stringify({ meetingLink, venue, officerId }),
  });
}

export async function rejectAppointment(id: number, remarks: string) {
  return await apiFetch(`/api/appointments/${id}/reject`, {
    method: "PUT",
    body: JSON.stringify({ remarks }),
  });
}

export async function updateMeetingLink(id: number, meetingLink: string) {
  return await apiFetch(`/api/appointments/${id}/meeting-link`, {
    method: "PUT",
    body: JSON.stringify({ meetingLink }),
  });
}