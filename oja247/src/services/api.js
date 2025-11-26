import axios from "axios";

const API_URL = "http://localhost:5000/api/businesses"; // ⭐ Correct endpoint

export const getAllBusinesses = () => axios.get(API_URL);
export const getBusinessById = (id) => axios.get(`${API_URL}/${id}`);

