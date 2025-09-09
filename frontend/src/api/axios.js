// frontend/src/api/axios.js
import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "https://event-pollling-application-1.onrender.com/api",
  
  // timeout: 10000,
});
console.log("API Base URL:", process.env.REACT_APP_API_BASE_URL);
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log("Interceptor sending:", config.method, config.baseURL || config.url, "Authorization?", !!token);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


export default API;
