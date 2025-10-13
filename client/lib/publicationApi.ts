import axios from "axios";
import { PublicationRequest, PublicationResponse } from "../types/publication.types";

// 🌐 Environment-aware Base URL setup
// Removes trailing slash if any, falls back to localhost for dev
const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:8080/api";

// 🔧 Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// 🔐 JWT Token interceptor — attaches token for authenticated APIs
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🧩 Publication API functions
export const publicationApi = {
  // Create a new publication
  createPublication: async (data: PublicationRequest): Promise<PublicationResponse> => {
    const response = await api.post("/publications", data);
    return response.data;
  },

  // Fetch logged-in user's publications
  getMyPublications: async (): Promise<PublicationResponse[]> => {
    const response = await api.get("/publications/my-publications");
    return response.data;
  },

  // Fetch all publications (admin)
  getAllPublications: async (): Promise<PublicationResponse[]> => {
    const response = await api.get("/publications");
    return response.data;
  },

  // Fetch publication details by ID
  getPublicationById: async (id: number): Promise<PublicationResponse> => {
    const response = await api.get(`/publications/${id}`);
    return response.data;
  },
};