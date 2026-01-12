/**
 * Global Interceptor for fetch calls.
 * This wraps the native window.fetch to provide a central point for handling
 * common API responses, specifically 401 Unauthorized.
 */

const setupInterceptors = () => {
    const { fetch: originalFetch } = window;

    window.fetch = async (...args) => {
        try {
            const response = await originalFetch(...args);

            // If the server returns 401 Unauthorized, it means the token is likely expired or invalid
            if (response.status === 401) {
                console.warn('Authentication expired. Redirecting to login...');

                // Clear authentication data
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('user');

                // Redirect to the login page if not already there
                // Note: Using window.location.href to force a hard reload and clear any stale app state
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            }

            return response;
        } catch (error) {
            // Handle network errors if necessary
            return Promise.reject(error);
        }
    };
};

export default setupInterceptors;
