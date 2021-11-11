'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DeckWrapper = function () {
    function DeckWrapper(rawDeck) {
        _classCallCheck(this, DeckWrapper);

        this.agenda = rawDeck.agenda;
        this.bannerCards = rawDeck.bannerCards || [];
        this.draftedCards = rawDeck.draftedCards || [];
        this.drawCards = rawDeck.drawCards;
        this.eventId = rawDeck.eventId;
        this.faction = rawDeck.faction;
        this.format = rawDeck.format || 'joust';
        this.plotCards = rawDeck.plotCards;
        this.rookeryCards = rawDeck.rookeryCards || [];

        this.agendas = [this.agenda].concat(_toConsumableArray(this.bannerCards)).filter(function (agenda) {
            return !!agenda;
        });
    }

    _createClass(DeckWrapper, [{
        key: 'getCardCountsByName',
        value: function getCardCountsByName() {
            var cardCountByName = {};
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.getAllCards()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var cardQuantity = _step.value;

                    cardCountByName[cardQuantity.card.name] = cardCountByName[cardQuantity.card.name] || { name: cardQuantity.card.name, type: cardQuantity.card.type, limit: cardQuantity.card.deckLimit, count: 0 };
                    cardCountByName[cardQuantity.card.name].count += cardQuantity.count;
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

            return cardCountByName;
        }
    }, {
        key: 'getCardsIncludedInDeck',
        value: function getCardsIncludedInDeck() {
            return [].concat(_toConsumableArray(this.drawCards), _toConsumableArray(this.plotCards), _toConsumableArray(this.rookeryCards)).map(function (cardQuantity) {
                return cardQuantity.card;
            });
        }
    }, {
        key: 'getUniqueCards',
        value: function getUniqueCards() {
            return this.getCardsIncludedInDeck().concat(this.agendas);
        }
    }, {
        key: 'getAllCards',
        value: function getAllCards() {
            return [].concat(_toConsumableArray(this.getAgendaCardsWithCounts()), _toConsumableArray(this.drawCards), _toConsumableArray(this.plotCards));
        }
    }, {
        key: 'getAgendaCardsWithCounts',
        value: function getAgendaCardsWithCounts() {
            return this.agendas.map(function (agenda) {
                return { card: agenda, count: 1 };
            });
        }
    }, {
        key: 'countDrawCards',
        value: function countDrawCards() {
            var predicate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {
                return true;
            };

            return this.getDeckCount(this.drawCards.filter(function (cardQuantity) {
                return predicate(cardQuantity.card);
            }));
        }
    }, {
        key: 'countPlotCards',
        value: function countPlotCards() {
            var predicate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {
                return true;
            };

            return this.getDeckCount(this.plotCards.filter(function (cardQuantity) {
                return predicate(cardQuantity.card);
            }));
        }
    }, {
        key: 'countRookeryCards',
        value: function countRookeryCards() {
            var predicate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {
                return true;
            };

            return this.getDeckCount(this.rookeryCards.filter(function (cardQuantity) {
                return predicate(cardQuantity.card);
            }));
        }
    }, {
        key: 'countCards',
        value: function countCards() {
            var predicate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {
                return true;
            };

            return this.getDeckCount(this.getAllCards().filter(function (cardQuantity) {
                return predicate(cardQuantity.card);
            }));
        }
    }, {
        key: 'getDeckCount',
        value: function getDeckCount(cardEntries) {
            var count = 0;

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = cardEntries[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var cardEntry = _step2.value;

                    count += cardEntry.count;
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

            return count;
        }
    }]);

    return DeckWrapper;
}();

module.exports = DeckWrapper;