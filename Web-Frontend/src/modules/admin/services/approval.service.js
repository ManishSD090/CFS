import apiClient from '../../../api/apiClient';

export const approvalService = {
    // Fetch & Aggregate pending/approved/rejected items
    getApprovals: async (statusTab) => {
        try {
            let mappedStatus = statusTab ? statusTab.toUpperCase() : '';
            if (mappedStatus === 'PENDING') mappedStatus = 'PENDING_APPROVAL';

            const queryParam = mappedStatus ? `?status=${mappedStatus}` : '';

            // Fetch from both budget and timeline routes concurrently
            const [budgetsRes, timelinesRes] = await Promise.allSettled([
                apiClient.get(`/budgets${queryParam}`),
                apiClient.get(`/timelines${queryParam}`)
            ]);

            let aggregatedList = [];

            // Parse Budgets
            if (budgetsRes.status === 'fulfilled' && budgetsRes.value.data) {
                const budgets = budgetsRes.value.data.data || budgetsRes.value.data || [];
                aggregatedList.push(...budgets.map(b => ({
                    ...b,
                    approvalType: 'Budget',
                    displayId: `BUD-${b._id?.substring(0, 6).toUpperCase() || b.id?.substring(0, 6).toUpperCase() || 'TEMP'}`,
                    submitterName: b.createdBy?.name || b.submittedBy || 'Manager',
                    displayDate: b.createdAt
                })));
            }

            // Parse Timelines
            if (timelinesRes.status === 'fulfilled' && timelinesRes.value.data) {
                const timelines = timelinesRes.value.data.data || timelinesRes.value.data || [];
                aggregatedList.push(...timelines.map(t => ({
                    ...t,
                    approvalType: 'Timeline',
                    displayId: `TML-${t._id?.substring(0, 6).toUpperCase() || t.id?.substring(0, 6).toUpperCase() || 'TEMP'}`,
                    submitterName: t.createdBy?.name || t.submittedBy || 'Manager',
                    displayDate: t.createdAt
                })));
            }

            // Sort newest first
            return aggregatedList.sort((a, b) => new Date(b.displayDate) - new Date(a.displayDate));

        } catch (error) {
            console.error("Error fetching aggregated approvals:", error);
            throw error;
        }
    },

    // Process Approval/Rejection based on item type
    updateStatus: async (type, id, status, remarks) => {
        try {
            let endpoint = '';
            let payload = {};

            const normalizedType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

            if (normalizedType === 'Budget') {
                endpoint = `/budgets/${id}/status`;
                payload = { status: status.toUpperCase(), remarks };
            } else if (normalizedType === 'Timeline') {
                endpoint = `/timelines/${id}/status`;
                payload = { status: status.toUpperCase(), comments: remarks }; 
            }

            const response = await apiClient.patch(endpoint, payload);
            return response.data;
        } catch (error) {
            console.error(`Error updating ${type} status:`, error);
            throw error;
        }
    }
};
