import axios from 'axios';

const api = axios.create({
    baseURL: 'https://api.fresheasy.online/api/',
    withCredentials: true, // cookies are sent automatically
    // headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Response interceptor
api.interceptors.response.use(
    response => response,
    async (error) => {
        const originalRequest = error.config;
        console.log('inside of api');
        

        if (error.response?.status === 401 && !originalRequest._retry) {
            console.log('inside of api');
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await axios.post(
                    'http://52.200.25.84/api/accounts/token/refresh/',
                    {},
                    { withCredentials: true } // send cookies & receive new access cookie
                );

                // ✅ No need to manually set tokens — cookies handle it
                processQueue(null);
                return api(originalRequest);
            } catch (err) {
                processQueue(err, null);
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }

        }
        return Promise.reject(error);
    }
);

export default api;
