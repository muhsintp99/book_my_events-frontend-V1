import { IconCategory } from '@tabler/icons-react';

const icons = { IconCategory };

const bouncersections = {
    id: 'bouncer-sections-group',
    title: 'Bouncer Sections',
    type: 'group',
    children: [
        {
            id: 'bouncer-category',
            title: 'Category',
            type: 'item',
            url: '/bouncers/category',
            icon: icons.IconCategory,
            breadcrumbs: false
        }
    ]
};

export default bouncersections;
