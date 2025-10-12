import axios from "axios";
import { PublicationRequest, PublicationResponse } from "../types/publication.types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const publicationApi = {
  createPublication: async (data: PublicationRequest): Promise<PublicationResponse> => {
    const response = await api.post("/publications", data);
    return response.data;
  },

  getMyPublications: async (): Promise<PublicationResponse[]> => {
    const response = await api.get("/publications/my-publications");
    return response.data;
  },

  getAllPublications: async (): Promise<PublicationResponse[]> => {
    const response = await api.get("/publications");
    return response.data;
  },

  getPublicationById: async (id: number): Promise<PublicationResponse> => {
    const response = await api.get(`/publications/${id}`);
    return response.data;
  },
};