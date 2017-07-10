document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#publish').addEventListener('click', function (){
        publish();
    });
});

async function publish() {
    let deck_raw = await getHashByDeckCode();

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

    await drawDeck(deck_summary);
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

function getHashByDeckCode() {
    let deck_code = document.querySelector("#deck_code").value;
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
    let canvas = document.getElementById('demo');
    canvas.width = 270;
    canvas.height = deck.cards.length * 47;
    let ctx = canvas.getContext('2d');

    for (let i = 0; i < deck.cards.length; i++) {
        drawCard(ctx, deck.cards[i], i);
    }
}

function drawCard(ctx, card, index) {
    let img = new Image();
    img.onload = function () {
        ctx.drawImage(img, 0, index * 47, 270, 46);
    };
    img.src = 'https://shadowverse-portal.com/image/card/zh-tw/L_' + card.card_id + '.jpg';
}