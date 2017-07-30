webpackJsonp([0],{

/***/ 70:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

__webpack_require__(71);

var _Rx = __webpack_require__(37);

var _Rx2 = _interopRequireDefault(_Rx);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var exportDeckButton = document.querySelector('#export_deck');
var exportDeckStream = _Rx2.default.Observable.fromEvent(exportDeckButton, 'click');
exportDeckStream.subscribe(function () {
  return exportDeck();
});

async function exportDeck() {
  var deckCode = document.querySelector('#deck_code').value;
  // ja en ko zh-tw fr
  var deckRaw = await getDeckByDeckCode(deckCode, 'en');
  var deckSummary = getDeckSummary(deckRaw);

  drawDeck(deckSummary);
};

async function getDeckByDeckCode(deckCode, lang) {
  var hashUrl = 'https://shadowverse-portal.com/api/v1/deck/import?format=json&deck_code=' + deckCode;
  var response = await (await fetch(hashUrl)).json();
  var deckHash = response.data.hash;
  return getDeckByHash(deckHash, lang);
}

async function getDeckByHash(deckHash, lang) {
  var deckUrl = 'https://shadowverse-portal.com/api/v1/deck?format=json&lang=' + lang + '&hash=' + deckHash;
  var response = await (await fetch(deckUrl)).json();
  return response.data.deck;
}

function getDeckSummary(deckRaw) {
  var deckSummary = {
    'clan': deckRaw.clan,
    'cards': []
  };

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    var _loop = function _loop() {
      var card = _step.value;

      var index = deckSummary.cards.findIndex(function (x) {
        return x.card_id === card.card_id;
      });
      if (index < 0) {
        deckSummary.cards.push({
          'card_id': card.card_id,
          'card_name': card.card_name,
          'cost': card.cost,
          'num': 1,
          'rarity': card.rarity
        });
      } else {
        deckSummary.cards[index].num += 1;
      }
    };

    for (var _iterator = deckRaw.cards[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      _loop();
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return deckSummary;
}

function drawDeck(deck) {
  var canvas = document.createElement('canvas');
  canvas.width = 270;
  canvas.height = deck.cards.length * 46;

  var ctx = canvas.getContext('2d');
  ctx.fillStyle = 'white';
  ctx.font = '11px Helvetica';
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  var raritys = ['', 'bronze', 'silver', 'gold', 'legend'];
  var cardImages = [];
  var costImages = [];
  var rarityImages = [];
  var cardNames = [];
  var cardNums = [];

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = deck.cards.entries()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var _step2$value = _slicedToArray(_step2.value, 2),
          _index = _step2$value[0],
          _card = _step2$value[1];

      cardImages.push({
        url: 'https://shadowverse-portal.com/image/card/zh-tw/L_' + _card.card_id + '.jpg',
        x: 0,
        y: _index * 46,
        width: 270,
        height: 46
      });
      costImages.push({
        url: 'https://shadowverse-portal.com/public/assets/image/common/global/cost_' + _card.cost + '.png',
        x: 14,
        y: _index * 46 + 6,
        width: 22,
        height: 22
      });
      rarityImages.push({
        url: 'https://shadowverse-portal.com/public/assets/image/common/zh-tw/rarity_' + raritys[_card.rarity] + '.png',
        x: 0,
        y: _index * 46 + 28,
        width: 50,
        height: 16
      });
      cardNames.push({
        text: _card.card_name,
        x: 55,
        y: _index * 46 + 26,
        width: 150
      });
      cardNums.push({
        text: '× ' + _card.num,
        x: 225,
        y: _index * 46 + 28,
        width: 50
      });
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  var drawImages = _Rx2.default.Observable.concat(_Rx2.default.Observable.from(cardImages), _Rx2.default.Observable.from(costImages), _Rx2.default.Observable.from(rarityImages));

  var drawInfos = _Rx2.default.Observable.concat(cardNames, cardNums).publish();

  drawImages.concatMap(function (image) {
    return loadImage(image);
  }).subscribe(function (image) {
    ctx.drawImage(image.image, image.x, image.y, image.width, image.height);
  }, null, drawInfos.connect.bind(drawInfos));

  drawInfos.subscribe(function (drawInfo) {
    ctx.fillText(drawInfo.text, drawInfo.x, drawInfo.y, drawInfo.width);
  });

  var demo = document.querySelector('#demo');
  demo.appendChild(canvas);

  // window.open(canvas.toDataURL('image/png'), '_blank')
}

function loadImage(image) {
  return _Rx2.default.Observable.create(function (observer) {
    var img = new Image();
    img.onload = function () {
      observer.next({
        image: img,
        x: image.x,
        y: image.y,
        width: image.width,
        height: image.height
      });
      observer.complete();
    };
    img.src = image.url;
  });
}

/***/ }),

/***/ 71:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ })

},[70]);