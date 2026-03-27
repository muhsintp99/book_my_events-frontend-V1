import { API_BASE_URL } from '../utils/apiImageUtils';

const API_BASE = `${API_BASE_URL}/admin/dashboard`;

/**
 * Get overall dashboard statistics
 * @returns {Promise<Object>} API response with overall stats
 */
export const getOverallStats = async () => {
    try {
        const response = await fetch(`${API_BASE}/overall-stats`);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch overall stats');
        }

        return data;
    } catch (error) {
        console.error('Error fetching overall stats:', error);
        throw error;
    }
};

/**
 * Get module specific statistics
 * @param {string} moduleId - The module ID
 * @returns {Promise<Object>} API response with module stats
 */
export const getModuleStats = async (moduleId) => {
    try {
        const response = await fetch(`${API_BASE}/module-stats?moduleId=${moduleId}`);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch module stats');
        }

        return data;
    } catch (error) {
        console.error('Error fetching module stats:', error);
        throw error;
    }
};

/**
 * Get recent system notifications
 * @returns {Promise<Object>} API response with notifications
 */
export const getNotifications = async () => {
    try {
        const response = await fetch(`${API_BASE}/notifications`);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch notifications');
        }

        return data;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
};
