document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#publish').addEventListener('click', function () {
        publish();
    });
    document.querySelector('#export').addEventListener('click', function () {
        let url = document.querySelector('#demo').toDataURL('image/png');
        window.open(url, '_blank');
    });
});

async function publish() {
    let deck_code = document.querySelector("#deck_code").value;    
    let deck_raw = await getHashByDeckCode(deck_code);

    let deck_summary = {
        'clan': deck_raw.clan,
        'cards': []
    };

    for (let card of deck_raw.cards) {
        let index = cardIndex(deck_summary.cards, card.card_id);

        if (index < 0) {
            deck_summary.cards.push({
                'card_id': card.card_id,
                'card_name': card.card_name,
                'cost': card.cost,
                'num': 1,
                'rarity': card.rarity
            });
        } else {
            deck_summary.cards[index].num += 1;
        }
    }

    drawDeck(deck_summary);
};

function cardIndex(cards, card_id) {
    let index = 0;
    for (let card of cards) {
        if (card.card_id == card_id) {
            return index;
        }
        index += 1;
    }
    return -1;
}

function getHashByDeckCode(deck_code) {
    let hash_url = 'https://shadowverse-portal.com/api/v1/deck/import?format=json&lang=ja&deck_code=' + deck_code;

    return fetch(hash_url).then(function (response) {
        return response.json();
    }).then(function (response) {
        if (response.data.hash) {
            return response.data.hash;
        } else {
            return null;
        }
    }).then(function (deck_hash) {
        if (deck_hash) {
            return getDeckByHash(deck_hash);
        }
    })
}

function getDeckByHash(deck_hash) {
    let deck_url = 'https://shadowverse-portal.com/api/v1/deck?format=json&lang=ja&hash=' + deck_hash;

    return fetch(deck_url).then(function (response) {
        return response.json();
    }).then(function (response) {
        if (response.data.deck) {
            return response.data.deck;
        } else {
            return null;
        }
    }).then(function (deck) {
        if (deck) {
            return deck;
        }
    })
}

function drawDeck(deck) {
    let canvas = document.querySelector('#demo');
    canvas.width = 270;
    canvas.height = deck.cards.length * 47 - 1;
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.font = '11px Helvetica';
    ctx.fillStyle = 'white';

    for (let i = 0; i < deck.cards.length; i++) {
        fetch('https://shadowverse-portal.com/image/card/zh-tw/L_' + deck.cards[i].card_id + '.jpg').then(function (response) {
            return response.blob()
        }).then(function (response) {
            let img = new Image();
            img.onload = function () {
                ctx.drawImage(img, 0, i * 47, 270, 46);
                ctx.fillText(deck.cards[i].card_name, 50, i * 47 + 26, 150);
            };
            img.src = URL.createObjectURL(response);
        })
    }
    
    for (let i = 0; i < deck.cards.length; i++) {
        fetch('https://shadowverse-portal.com/public/assets/image/common/global/cost_' + deck.cards[i].cost + '.png').then(function (response) {
            return response.blob()
        }).then(function (response) {
            let img = new Image();
            img.onload = function () {
                ctx.drawImage(img, 10, i * 47 + 10, 22, 22);
            };
            img.src = URL.createObjectURL(response);
        })
    }
    
    // for (let i = 0; i < deck.cards.length; i++) {
    //     fetch('https://shadowverse-portal.com/public/assets/image/common/zh-tw/rarity_bronze.png' + deck.cards[i].rarity + '.png').then(function (response) {
    //         return response.blob()
    //     }).then(function (response) {
    //         let img = new Image();
    //         img.onload = function () {
    //             ctx.drawImage(img, 10, i * 47 + 5, 22, 22);
    //         };
    //         img.src = URL.createObjectURL(response);
    //     })
    // }

    
}