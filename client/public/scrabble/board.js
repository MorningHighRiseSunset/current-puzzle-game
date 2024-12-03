const BoardLookup = {
    'TL': 'tripple-letter',
    'QL': 'quadruple-letter',
    'TW': 'tripple-word',
    'QW': 'quadruple-word',
    '★': 'center-star'
};

const BoardLocations = {
    '0,0': 'QW',
    '0,3': 'QL',
    '0,7': 'TW',
    '0,11': 'QL',
    '0,14': 'QW',
    '1,1': 'TW',
    '1,5': 'TL',
    '1,9': 'TL',
    '1,13': 'TW',
    '2,2': 'TW',
    '2,6': 'QL',
    '2,8': 'QL',
    '2,12': 'TW',
    '3,0': 'QL',
    '3,3': 'TW',
    '3,7': 'QL',
    '3,11': 'TW',
    '3,14': 'QL',
    '4,4': 'TW',
    '4,10': 'TW',
    '5,1': 'TL',
    '5,5': 'TL',
    '5,9': 'TL',
    '5,13': 'TL',
    '6,2': 'QL',
    '6,6': 'QL',
    '6,8': 'QL',
    '6,12': 'QL',
    '7,0': 'QW',
    '7,3': 'QL',
    '7,7': '?',
    '7,11': 'QL',
    '7,14': 'QW',
    '8,2': 'QL',
    '8,6': 'QL',
    '8,8': 'QL',
    '8,12': 'QL',
    '9,1': 'TL',
    '9,5': 'TL',
    '9,9': 'TL',
    '9,13': 'TL',
    '10,4': 'TW',
    '10,10': 'TW',
    '11,0': 'QL',
    '11,3': 'TW',
    '11,7': 'QL',
    '11,11': 'TW',
    '11,14': 'QL',
    '12,2': 'TW',
    '12,6': 'QL',
    '12,8': 'QL',
    '12,12': 'TW',
    '13,1': 'TW',
    '13,5': 'TL',
    '13,9': 'TL',
    '13,13': 'TW',
    '14,0': 'QW',
    '14,3': 'QL',
    '14,7': 'TW',
    '14,11': 'QL',
    '14,14': 'QW'
};

function flip(y, size) {
    return -y + size + 1;
}

window.onload = e => {
    for (const location in BoardLocations) {
        const x = String.fromCharCode(parseInt(location.split(',')[0]) + 65).toLowerCase();
        const y = parseInt(location.split(',')[1]) + 1;
        
        const boardLocation = document.querySelector(`#row-${y}`).querySelector(`#col-${x}`);

        boardLocation.classList.add(BoardLookup[BoardLocations[location]]);
        boardLocation.classList.add('unselectable');
        let localeThing = BoardLocations[location];

        // hacky but it works
        if (localStorage.getItem('locale') === 'es' || localStorage.getItem('locale') === 'pt') {
            localeThing = localeThing.replace('W', 'P');
        }

        boardLocation.innerHTML = localeThing;
    }
};
