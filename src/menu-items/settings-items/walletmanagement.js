// assets
import { IconWallet } from '@tabler/icons-react';

// constant
const icons = { IconWallet };

// ==============================|| WALLET MANAGEMENT MENU ITEM ||============================== //

const walletmanagement = {
    id: 'wallet-management-group',
    title: 'Financials',
    type: 'group',
    children: [
        {
            id: 'withdrawal-requests',
            title: 'Withdrawal Requests',
            type: 'item',
            url: '/wallet/withdrawals',
            icon: icons.IconWallet,
            breadcrumbs: false
        }
    ]
};

export default walletmanagement;
