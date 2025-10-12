import { Publication } from "../types/certificate.types";

// ✅ Environment-safe API base URL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/api/certificates`
    : "http://localhost:8080/api/certificates";

export const certificateService = {
  // ✅ Fetch all approved publications (for generation list)
  async getApprovedPublications(): Promise<Publication[]> {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token found");

      console.log("Fetching approved publications...");

      const response = await fetch(`${API_BASE_URL}/approved`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "Failed to fetch approved publications:",
          response.status,
          errorText
        );
        throw new Error(`Failed to fetch approved publications: ${response.status}`);
      }

      const data = await response.json();
      console.log("Approved publications fetched:", data.length);

      // Map backend response to frontend model
      return data.map((pub: any) => ({
        id: pub.id,
        title: pub.titleName,
        publisherName: pub.publisherName,
        language: pub.language,
        periodicity: pub.periodicity,
        district: pub.district,
        state: pub.state,
        submittedDate: pub.createdAt,
        approvalDate: pub.updatedAt || pub.createdAt,
        status: pub.certificateGenerated ? "CERTIFICATE_GENERATED" : "APPROVED",
        certificateNumber: pub.certificateNumber || undefined,
        certificateDate: pub.certificateDate || undefined,
      }));
    } catch (error) {
      console.error("Error fetching approved publications:", error);
      throw error;
    }
  },

  // ✅ Generate certificate (handle CertificateResponse)
  async generateCertificate(publicationId: number): Promise<Publication> {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token found");

      console.log("Generating certificate for publication:", publicationId);

      const response = await fetch(`${API_BASE_URL}/generate/${publicationId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to generate certificate:", response.status, errorText);
        throw new Error(
          `Failed to generate certificate: ${response.status} - ${errorText}`
        );
      }

      const res = await response.json();
      console.log("Certificate generated successfully:", res.certificateNumber);

      // Convert that lightweight response into Publication model
      return {
        id: publicationId,
        title: res.titleName || "Untitled",
        publisherName: res.publisherName || "Unknown Publisher",
        language: "",
        periodicity: "",
        district: "",
        state: "",
        submittedDate: new Date().toISOString(),
        approvalDate: new Date().toISOString(),
        status: "CERTIFICATE_GENERATED",
        certificateNumber: res.certificateNumber,
        certificateDate: res.certificateDate,
      };
    } catch (error) {
      console.error("Error generating certificate:", error);
      throw error;
    }
  },

  // ✅ Get all already generated certificates
  async getAllCertificates(): Promise<Publication[]> {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token found");

      console.log("Fetching all certificates...");

      const response = await fetch(`${API_BASE_URL}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch certificates:", response.status, errorText);
        throw new Error(`Failed to fetch certificates: ${response.status}`);
      }

      const data = await response.json();
      console.log("Certificates fetched:", data.length);

      return data;
    } catch (error) {
      console.error("Error fetching certificates:", error);
      throw error;
    }
  },

  // ✅ Download certificate PDF (returns Blob)
  async downloadCertificate(certificateNumber: string): Promise<Blob> {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token found. Please login again.");

      console.log("Downloading certificate:", certificateNumber);

      const response = await fetch(`${API_BASE_URL}/download/${certificateNumber}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/pdf",
        },
      });

      console.log("Download response status:", response.status);

      if (response.status === 403)
        throw new Error("Access denied. You don't have permission to download this certificate.");
      if (response.status === 404)
        throw new Error("Certificate not found.");

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Download failed:", errorText);
        throw new Error(`Failed to download certificate: ${response.status} - ${errorText}`);
      }

      const blob = await response.blob();
      console.log("Blob received, size:", blob.size, "bytes");

      if (blob.size === 0) throw new Error("Downloaded file is empty");

      // ✅ Return Blob (not void) so AdminCertificateManagement can decide how to handle it
      return blob;
    } catch (error) {
      console.error("Error downloading certificate:", error);
      throw error;
    }
  },

  // ✅ Preview certificate (opens in new tab)
  async previewCertificate(certificateNumber: string): Promise<void> {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token found");

      console.log("Previewing certificate:", certificateNumber);

      const response = await fetch(`${API_BASE_URL}/download/${certificateNumber}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/pdf",
        },
      });

      if (!response.ok) throw new Error(`Failed to preview certificate: ${response.status}`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      window.open(url, "_blank");

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);

      console.log("Certificate preview opened");
    } catch (error) {
      console.error("Error previewing certificate:", error);
      throw error;
    }
  },
};