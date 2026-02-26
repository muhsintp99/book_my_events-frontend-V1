import {
    IconCategory,
} from '@tabler/icons-react';

const icons = {
    IconCategory,
};

const floristsections = {
    id: 'florist-sections-group',
    title: 'Florist Sections',
    type: 'group',
    children: [
        {
            id: 'florist-category',
            title: 'Category',
            type: 'item',
            url: '/florist/category',
            icon: icons.IconCategory,
            breadcrumbs: false
        },
    ]
};

export default floristsections;
