import axios from "axios";
import { backendURL } from "../config/config";
const axiosInstance = axios.create({
  baseURL: backendURL,
});

export default axiosInstance;
