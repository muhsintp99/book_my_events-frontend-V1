import { IconCategory } from '@tabler/icons-react';

const icons = { IconCategory };

const lightsections = {
    id: 'light-sections-group',
    title: 'Light & Sound Sections',
    type: 'group',
    children: [
        {
            id: 'light-category',
            title: 'Category',
            type: 'item',
            url: '/lights/category',
            icon: icons.IconCategory,
            breadcrumbs: false
        }
    ]
};

export default lightsections;
