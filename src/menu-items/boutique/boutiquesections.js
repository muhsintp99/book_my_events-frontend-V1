import {
    IconCategory,
} from '@tabler/icons-react';

const icons = {
    IconCategory,
};

const boutiquesections = {
    id: 'boutique-sections-group',
    title: 'boutiquesections',
    type: 'group',
    children: [
        {
            id: 'boutique-category',
            title: 'Category',
            type: 'item',
            url: '/boutique/category',
            icon: icons.IconCategory,
            breadcrumbs: false
        },
        // {
        //     id: 'boutique-attributes',
        //     title: 'Attributes',
        //     type: 'item',
        //     url: '/boutique/attributes',
        //     icon: icons.IconCategory,
        //     breadcrumbs: false
        // },
    ]
};

export default boutiquesections;
