/**
 * Provider API - Centralized API functions for provider management
 */

import { API_BASE_URL, getApiImageUrl } from '../utils/apiImageUtils';

const API_BASE = `${API_BASE_URL}/profile`;

/**
 * Get all vendors with optional sorting
 * @param {string} sortBy - Field to sort by (packageCount, bookingCount)
 * @param {string} order - Sort order (asc, desc)
 * @returns {Promise<Object>} API response with vendors data
 */
export const getAllVendors = async (sortBy = '', order = 'desc') => {
    try {
        const params = new URLSearchParams();
        if (sortBy) params.append('sort', sortBy);
        if (order) params.append('order', order);

        const url = `${API_BASE}/vendors/all${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch vendors');
        }

        return data;
    } catch (error) {
        console.error('Error fetching vendors:', error);
        throw error;
    }
};

/**
 * Get comprehensive provider details
 * @param {string} providerId - Provider user ID
 * @returns {Promise<Object>} Provider details including profile, packages, bookings
 */
export const getProviderDetails = async (providerId) => {
    try {
        const response = await fetch(`${API_BASE}/admin/vendor/${providerId}/details`);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch provider details');
        }

        return data;
    } catch (error) {
        console.error('Error fetching provider details:', error);
        throw error;
    }
};

/**
 * Delete a provider (vendor profile only)
 * @param {string} providerId - Provider user ID
 * @returns {Promise<Object>} API response
 */
export const deleteProvider = async (providerId) => {
    try {
        const response = await fetch(`${API_BASE}/vendor/${providerId}`, {
            method: 'DELETE'
        });
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to delete provider');
        }

        return data;
    } catch (error) {
        console.error('Error deleting provider:', error);
        throw error;
    }
};

/**
 * Update provider bio
 * @param {string} providerId - Provider user ID
 * @param {Object} bioData - Bio data (title, subtitle, description)
 * @returns {Promise<Object>} API response
 */
export const updateProviderBio = async (providerId, bioData) => {
    try {
        const response = await fetch(`${API_BASE}/vendor/${providerId}/bio`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ bio: bioData })
        });
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to update provider bio');
        }

        return data;
    } catch (error) {
        console.error('Error updating provider bio:', error);
        throw error;
    }
};

/**
 * Format vendor data for display in lists
 * @param {Array} vendors - Raw vendor data from API
 * @returns {Array} Formatted vendor data
 */
export const formatVendorsForList = (vendors) => {
    return vendors
        .filter(v => v.user && v.user._id)
        .map((v, index) => ({
            id: index + 1,
            vendorId: v.user._id,
            name: `${v.user.firstName || ''} ${v.user.lastName || ''}`.trim() || 'N/A',
            email: v.user.email || 'N/A',
            phone: v.user.phone || 'N/A',
            profilePhoto: v.user.profilePhoto || '',
            isVerified: v.isVerified || false,
            status: v.isVerified ? 'Verified' : 'Pending',
            packageCount: v.packageCount || 0,
            bookingCount: v.bookingCount || 0,
            module: v.module?.title || 'N/A',
            moduleId: v.module?._id || v.module || null,
            zone: v.zone?.name || 'N/A',
            coverImage: v.coverImage || ''
        }));
};

export const getImageUrl = (imagePath) => {
    return getApiImageUrl(imagePath);
};
