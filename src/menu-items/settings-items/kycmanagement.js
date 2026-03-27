// assets
import { IconUserCheck } from '@tabler/icons-react';

// constant
const icons = { IconUserCheck };

// ==============================|| KYC MANAGEMENT MENU ITEM ||============================== //

const kycmanagement = {
    id: 'kyc-management-group',
    title: 'Vendor KYC',
    type: 'group',
    children: [
        {
            id: 'kyc-verification',
            title: 'KYC Verification',
            type: 'item',
            url: '/settings/kyc-verification',
            icon: icons.IconUserCheck,
            breadcrumbs: false
        }
    ]
};

export default kycmanagement;
