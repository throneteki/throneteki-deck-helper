'use strict';

var JoustFormat = {
    name: 'joust',
    requiredDraw: 60,
    requiredPlots: 7,
    maxDoubledPlots: 1,
    cannotInclude: function cannotInclude(card) {
        return card.packCode === 'VDS';
    },
    rules: [{
        message: 'You cannot include Draft cards in a normal deck',
        condition: function condition(deck) {
            return deck.getUniqueCards().every(function (card) {
                return card.packCode !== 'VDS';
            });
        }
    }]
};

module.exports = JoustFormat;