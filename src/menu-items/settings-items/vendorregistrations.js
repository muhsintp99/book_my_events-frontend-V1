// assets
import { IconUserPlus } from '@tabler/icons-react';

// constant
const icons = { IconUserPlus };

// ==============================|| VENDOR REGISTRATIONS MENU ITEM ||============================== //

const vendorregistrations = {
    id: 'vendor-registrations-group',
    title: 'Vendor Registrations',
    type: 'group',
    children: [
        {
            id: 'vendor-registrations',
            title: 'Website Registrations',
            type: 'item',
            url: '/settings/vendor-registrations',
            icon: icons.IconUserPlus,
            breadcrumbs: false
        }
    ]
};

export default vendorregistrations;
