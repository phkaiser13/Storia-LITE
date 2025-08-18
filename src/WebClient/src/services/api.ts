// Em src/WebClient/src/services/api.ts
import axios from 'axios';
import { AuthResultDto } from '../types';

// Vite expõe as variáveis de ambiente no objeto `import.meta.env`
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
});

let isRefreshing = false;
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void; }[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        originalRequest.headers.Authorization = 'Bearer ' + token;
                        return axios(originalRequest);
                    })
                    .catch(err => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                isRefreshing = false;
                // Redireciona para a página de login se não houver refresh token
                window.location.href = '/#/login';
                return Promise.reject(error);
            }

            try {
                // Usa a baseURL configurada para a chamada de refresh
                const { data } = await api.post<AuthResultDto>('/api/auth/refresh', { refreshToken });

                localStorage.setItem('token', data.token);
                localStorage.setItem('refreshToken', data.refreshToken);

                api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
                originalRequest.headers.Authorization = `Bearer ${data.token}`;

                processQueue(null, data.token);
                return api(originalRequest);

            } catch (refreshError) {
                processQueue(refreshError, null);
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                // Redireciona para a página de login em caso de falha no refresh
                window.location.href = '/#/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

export default api;