/**
 * Utility for handling API URLs and Image paths
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.bookmyevent.ae/api';

/**
 * Get the origin of the API (e.g., https://api.bookmyevent.ae)
 */
export const getApiOrigin = () => {
    try {
        return new URL(API_BASE_URL).origin;
    } catch (e) {
        // Fallback if URL is invalid (unlikely with env var)
        return API_BASE_URL.split('/api')[0] || 'https://api.bookmyevent.ae';
    }
};

export const API_ORIGIN = getApiOrigin();

/**
 * Construct a full image URL from a relative path
 * @param {string} path - The relative path (e.g., 'uploads/venues/image.png')
 * @returns {string} - The full URL
 */
export const getApiImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;

    let cleanPath = path;

    // Handle absolute server paths like /var/www/backend/Uploads/...
    // Search for the last occurrence of 'uploads' (case-insensitive)
    const uploadsMatch = path.match(/([uU]ploads[\\/\\\\].*)$/);

    if (uploadsMatch && uploadsMatch[1]) {
        cleanPath = uploadsMatch[1];
        // Replace backslashes with forward slashes
        cleanPath = cleanPath.replace(/\\\\/g, '/');
    }

    // Ensure the path starts with a slash for proper concatenation
    const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    return `${API_ORIGIN}${finalPath}`;
};
