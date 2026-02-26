import { IconCategory } from '@tabler/icons-react';

const icons = { IconCategory };

const panthalsections = {
    id: 'panthal-sections-group',
    title: 'Panthal Sections',
    type: 'group',
    children: [
        {
            id: 'panthal-category',
            title: 'Category',
            type: 'item',
            url: '/panthal/category',
            icon: icons.IconCategory,
            breadcrumbs: false
        }
    ]
};

export default panthalsections;
