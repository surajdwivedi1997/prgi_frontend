// client/lib/tokenApi.ts

import axios from "axios";
import { Token, TokenStats, CreateTokenRequest } from "../types/token.types";

// Get the base URL - adjust if your backend is on a different port
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to include JWT token
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

export const tokenApi = {
  // Create a new token
  createToken: async (data: CreateTokenRequest): Promise<Token> => {
    const response = await api.post("/tokens", data);
    return response.data;
  },

  // Get all tokens (Admin only)
  getAllTokens: async (): Promise<Token[]> => {
    const response = await api.get("/tokens");
    return response.data;
  },

  // Get active tokens in queue
  getActiveTokens: async (): Promise<Token[]> => {
    const response = await api.get("/tokens/active");
    return response.data;
  },

  // Get tokens for a specific user
  getUserTokens: async (userId: number): Promise<Token[]> => {
    const response = await api.get(`/tokens/user/${userId}`);
    return response.data;
  },

  // Get token by ID
  getTokenById: async (id: number): Promise<Token> => {
    const response = await api.get(`/tokens/${id}`);
    return response.data;
  },

  // Call next token in queue (Admin only)
  callNextToken: async (): Promise<Token> => {
    const response = await api.post("/tokens/call-next");
    return response.data;
  },

  // Start serving a token (Admin only)
  startServing: async (id: number): Promise<Token> => {
    const response = await api.put(`/tokens/${id}/start-serving`);
    return response.data;
  },

  // Complete a token (Admin only)
  completeToken: async (id: number): Promise<Token> => {
    const response = await api.put(`/tokens/${id}/complete`);
    return response.data;
  },

  // Cancel a token
  cancelToken: async (id: number): Promise<Token> => {
    const response = await api.put(`/tokens/${id}/cancel`);
    return response.data;
  },

  // Get token statistics (Admin only)
  getTokenStats: async (): Promise<TokenStats> => {
    const response = await api.get("/tokens/stats");
    return response.data;
  },
};