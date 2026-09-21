import axios from 'axios';

const baseUrl = "http://localhost:3000/delivery";

export const api = axios.create({
    baseURL: baseUrl,
    timeout: 10000,
});