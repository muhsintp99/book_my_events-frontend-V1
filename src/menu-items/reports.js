// assets
import { IconChartLine, IconReportMoney, IconAnalyze } from '@tabler/icons-react';

// constant
const icons = { IconChartLine, IconReportMoney, IconAnalyze };

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const reports = {
    id: 'reports',
    title: 'Analytic Reports',
    type: 'group',
    children: [
        {
            id: 'admin-report',
            title: 'Admin Dashboard',
            type: 'item',
            url: '/reports/admin',
            icon: icons.IconAnalyze,
            breadcrumbs: false
        },
        {
            id: 'account-report',
            title: 'Account Report',
            type: 'item',
            url: '/reports/accounts',
            icon: icons.IconReportMoney,
            breadcrumbs: false
        },
        {
            id: 'vendor-payouts',
            title: 'Vendor Payouts',
            type: 'item',
            url: '/wallet/withdrawals',
            icon: icons.IconChartLine,
            breadcrumbs: false
        }
    ]
};

export default reports;
