'use strict';

var JoustFormat = require('./JoustFormat');

var RookeryFormat = Object.assign({}, JoustFormat, {
    name: 'rookery',
    rules: [{
        message: 'More than 2 plot cards in rookery',
        condition: function condition(deck) {
            return deck.countRookeryCards(function (card) {
                return card.type === 'plot';
            }) <= 2;
        }
    }, {
        message: 'More than 10 draw cards in rookery',
        condition: function condition(deck) {
            return deck.countRookeryCards(function (card) {
                return card.type !== 'plot';
            }) <= 10;
        }
    }]
});

module.exports = RookeryFormat;