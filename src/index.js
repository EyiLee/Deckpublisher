import 'bootstrap/dist/css/bootstrap.min.css'
import Rx from 'rxjs/Rx'

let exportDeckButton = document.querySelector('#export_deck')
let exportDeckStream = Rx.Observable.fromEvent(exportDeckButton, 'click')
exportDeckStream.subscribe(() => exportDeck())

async function exportDeck () {
  let deckCode = document.querySelector('#deck_code').value
  // ja en ko zh-tw fr
  let deckRaw = await getDeckByDeckCode(deckCode, 'en')
  let deckSummary = getDeckSummary(deckRaw)

  drawDeck(deckSummary)
};

async function getDeckByDeckCode (deckCode, lang) {
  let hashUrl = 'https://shadowverse-portal.com/api/v1/deck/import?format=json&deck_code=' + deckCode
  let response = await (await fetch(hashUrl)).json()
  let deckHash = response.data.hash
  return getDeckByHash(deckHash, lang)
}

async function getDeckByHash (deckHash, lang) {
  let deckUrl = 'https://shadowverse-portal.com/api/v1/deck?format=json&lang=' + lang + '&hash=' + deckHash
  let response = await (await fetch(deckUrl)).json()
  return response.data.deck
}

function getDeckSummary (deckRaw) {
  let deckSummary = {
    'clan': deckRaw.clan,
    'cards': []
  }

  for (let card of deckRaw.cards) {
    let index = deckSummary.cards.findIndex(x => x.card_id === card.card_id)
    if (index < 0) {
      deckSummary.cards.push({
        'card_id': card.card_id,
        'card_name': card.card_name,
        'cost': card.cost,
        'num': 1,
        'rarity': card.rarity
      })
    } else {
      deckSummary.cards[index].num += 1
    }
  }

  return deckSummary
}

function drawDeck (deck) {
  let canvas = document.createElement('canvas')
  canvas.width = 270
  canvas.height = deck.cards.length * 46

  let ctx = canvas.getContext('2d')
  ctx.fillStyle = 'white'
  ctx.font = '11px Helvetica'
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  let raritys = ['', 'bronze', 'silver', 'gold', 'legend']
  let cardImages = []
  let costImages = []
  let rarityImages = []
  let cardNames = []
  let cardNums = []

  for (let [index, card] of deck.cards.entries()) {
    cardImages.push({
      url: 'https://shadowverse-portal.com/image/card/zh-tw/L_' + card.card_id + '.jpg',
      x: 0,
      y: index * 46,
      width: 270,
      height: 46
    })
    costImages.push({
      url: 'https://shadowverse-portal.com/public/assets/image/common/global/cost_' + card.cost + '.png',
      x: 14,
      y: index * 46 + 6,
      width: 22,
      height: 22
    })
    rarityImages.push({
      url: 'https://shadowverse-portal.com/public/assets/image/common/zh-tw/rarity_' + raritys[card.rarity] + '.png',
      x: 0,
      y: index * 46 + 28,
      width: 50,
      height: 16
    })
    cardNames.push({
      text: card.card_name,
      x: 55,
      y: index * 46 + 26,
      width: 150
    })
    cardNums.push({
      text: '× ' + card.num,
      x: 225,
      y: index * 46 + 28,
      width: 50
    })
  }

  let drawImages = Rx.Observable.concat(
    Rx.Observable.from(cardImages),
    Rx.Observable.from(costImages),
    Rx.Observable.from(rarityImages)
  )

  let drawInfos = Rx.Observable.concat(cardNames, cardNums).publish()

  drawImages.concatMap(image => loadImage(image))
    .subscribe(image => {
      ctx.drawImage(image.image, image.x, image.y, image.width, image.height)
    }, null, drawInfos.connect.bind(drawInfos))

  drawInfos.subscribe(drawInfo => {
    ctx.fillText(drawInfo.text, drawInfo.x, drawInfo.y, drawInfo.width)
  })

  let demo = document.querySelector('#demo')
  demo.appendChild(canvas)

  // window.open(canvas.toDataURL('image/png'), '_blank')
}

function loadImage (image) {
  return Rx.Observable.create(function (observer) {
    let img = new Image()
    img.onload = () => {
      observer.next({
        image: img,
        x: image.x,
        y: image.y,
        width: image.width,
        height: image.height
      })
      observer.complete()
    }
    img.src = image.url
  })
}
