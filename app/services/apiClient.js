import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://scholargenapi.onrender.com/api';

/**
 * Common headers for all requests
 */
const getHeaders = async (isMultipart = false) => {
    const headers = {
        'Accept': 'application/json',
    };

    if (!isMultipart) {
        headers['Content-Type'] = 'application/json';
    }

    try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
            // console.log('Attached Auth Token:', token.substring(0, 10) + '...');
        } else {
            console.warn('No userToken found in AsyncStorage for request');
        }
    } catch (error) {
        console.error('Error fetching token', error);
    }

    return headers;
};

/**
 * Handle API responses globally
 */
const handleResponse = async (response) => {
    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : null;

    console.log(`[API] ${response.url} returned ${response.status}`);

    if (!response.ok) {
        // Handle 401 Unauthorized globally
        if (response.status === 401) {
            console.warn('Unauthorized access - Token might be invalid or expired.');
            // Only remove token if it's not a login attempt (to avoid clearing before saving)
            // But here we are just reporting error.
        }

        const error = (data && data.message) || (data && data.error) || response.statusText;
        console.log('[API] Rejecting with:', { status: response.status, message: error });
        return Promise.reject({ status: response.status, message: error, data });
    }

    return { status: response.status, data };
};

export const apiClient = {
    get: async (endpoint, params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const url = `${BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;

        const headers = await getHeaders();

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers,
            });
            return handleResponse(response);
        } catch (error) {
            console.error(`GET ${endpoint} failed:`, error);
            throw error;
        }
    },

    post: async (endpoint, body = {}) => {
        const headers = await getHeaders();

        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });
            return handleResponse(response);
        } catch (error) {
            console.error(`POST ${endpoint} failed:`, error);
            throw error;
        }
    },

    put: async (endpoint, body = {}) => {
        const headers = await getHeaders();

        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(body),
            });
            return handleResponse(response);
        } catch (error) {
            console.error(`PUT ${endpoint} failed:`, error);
            throw error;
        }
    },

    delete: async (endpoint) => {
        const headers = await getHeaders();

        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers,
            });
            return handleResponse(response);
        } catch (error) {
            console.error(`DELETE ${endpoint} failed:`, error);
            throw error;
        }
    },

    // Helper for multipart/form-data (e.g. image uploads)
    upload: async (endpoint, formData) => {
        const headers = await getHeaders(true); // true = isMultipart

        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    ...headers,
                    // Content-Type is left undefined so `fetch` sets it to multipart/form-data with boundary
                },
                body: formData,
            });
            return handleResponse(response);
        } catch (error) {
            console.error(`UPLOAD ${endpoint} failed:`, error);
            throw error;
        }
    }
};
