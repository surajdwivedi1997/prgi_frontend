// client/lib/titleApi.ts

import axios from "axios";
import { TitleCheckRequest, TitleCheckResponse } from "../types/title.types";

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

export const titleApi = {
  checkTitleAvailability: async (data: TitleCheckRequest): Promise<TitleCheckResponse> => {
    const response = await api.post("/titles/check", data);
    return response.data;
  },
};