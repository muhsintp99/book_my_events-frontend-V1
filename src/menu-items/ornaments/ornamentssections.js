import {
    IconCategory,
} from '@tabler/icons-react';

const icons = {
    IconCategory,
};

const ornamentssections = {
    id: 'ornaments-sections-group',
    title: 'ornamentssections',
    type: 'group',
    children: [
        {
            id: 'ornaments-category',
            title: 'Category',
            type: 'item',
            url: '/ornaments/category',
            icon: icons.IconCategory,
            breadcrumbs: false
        },
    ]
};

export default ornamentssections;
