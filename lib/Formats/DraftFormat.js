'use strict';

var DraftFormat = {
    name: 'draft',
    requiredDraw: 40,
    requiredPlots: 5,
    maxDoubledPlots: 1,
    rules: [{
        message: 'Includes cards that were not drafted',
        condition: function condition(deck, errors) {
            var draftCardQuantityByCode = deck.draftedCards.reduce(function (quantityByCode, cardQuantity) {
                quantityByCode.set(cardQuantity.code, cardQuantity.count);
                return quantityByCode;
            }, new Map());

            var allCards = deck.getAllCards();

            var onlyIncludesDraftedCards = true;

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = allCards[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var cardQuantity = _step.value;

                    if (!draftCardQuantityByCode.has(cardQuantity.card.code)) {
                        onlyIncludesDraftedCards = false;
                        errors.push(cardQuantity.card.name + ' is not one of the drafted cards');
                    } else if (draftCardQuantityByCode.get(cardQuantity.card.code) < cardQuantity.count) {
                        onlyIncludesDraftedCards = false;
                        errors.push(cardQuantity.card.name + ' has ' + cardQuantity.count + ' copies but only ' + draftCardQuantityByCode.get(cardQuantity.card.code) + ' copies were drafted');
                    }
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

            return onlyIncludesDraftedCards;
        }
    }]
};

module.exports = DraftFormat;