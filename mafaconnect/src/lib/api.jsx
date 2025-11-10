// src/lib/api.js
import axios from "axios";

// 🧠 Base URL of your Node.js backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://your-node-backend.com"; 
// you can set VITE_API_BASE_URL in your .env file

// Axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// GET request
export const apiGet = async (url) => {
  const response = await api.get(url);
  return response;
};

// POST request
export const apiPost = async (url, data) => {
  const response = await api.post(url, data);
  return response;
};

// PUT request
export const apiPut = async (url, data) => {
  const response = await api.put(url, data);
  return response;
};

// DELETE request
export const apiDelete = async (url) => {
  const response = await api.delete(url);
  return response;
};
