Session.set('config', {
    filterIndexMap: ['type', 'industry'],
    colors: {
        'black': '#1B1C1D',
        'blue': '#2196F3',
        'green': '#4CAF50',
        'grey': '#9E9E9E',
        'orange': '#FF9800',
        'pink': '#E91E63',
        'purple': '#9C27B0',
        'red': '#F44336',
        'teal': '#1de9b6',
        'yellow': '#FFEB3B',
        'lightBlack': '#333333',
        'lightBlue': '#2979FF',
        'lightGreen': '#00E676',
        'lightOrange': '#FF9100',
        'lightPink': '#F50057',
        'lightPurple': '#D500F9',
        'lightRed': '#FF1744',
        'lightTeal': '#1DE9B6',
        'lightYellow': '#FFEA00'
    },
    labelColors: {
        type: {
            'startup': 'red',
            'coworking': 'orange',
            'investor': 'blue',
            'service': 'pink',
            'community': 'green'
        },
        industry: {
            'tech': 'yellow',
            'food': 'green',
            'marketing': 'red',
            'mobile': 'pink',
            'ecommerce': 'black',
            'other': 'purple'
        }
    },
    labelIcons: {
        'type': {
            'startup': 'rocket',
            'coworking': 'building',
            'investor': 'chemist',
            'service': 'bank',
            'community': 'polling-place'
        },
        'industry': {
            'tech': 'circle-stroked',
            'food': 'town-hall',
            'marketing': 'restaurant',
            'mobile': 'rail-metro',
            'ecommerce': 'swimming',
            'other': 'town-hall'
        }
    }
});
