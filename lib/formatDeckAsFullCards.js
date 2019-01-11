"use strict";

/**
 * Creates a clone of the existing deck with full card data filled in instead of
 * just card codes.
 *
 * @param {object} deck
 * @param {object} data
 * @param {object} data.cards - an index of card code to full card object
 * @param {object} data.factions - an index of faction code to full faction object
 */
function formatDeckAsFullCards(deck, data) {
    var newDeck = {
        id: deck.id,
        name: deck.name,
        username: deck.username,
        lastUpdated: deck.lastUpdated,
        faction: Object.assign({}, deck.faction)
    };

    if (data.factions) {
        newDeck.faction = data.factions[deck.faction.value];
    }

    newDeck.cards = processCardCounts(deck.cards || [], data.cards);
    newDeck.rookeryCards = processCardCounts(deck.rookeryCards || [], data.cards);

    return newDeck;
}

function processCardCounts(cardCounts, cardData) {
    var cardCountsWithData = cardCounts.map(function (cardCount) {
        return { count: cardCount.count, card: cardData[cardCount.code] };
    });

    // Filter out any cards that aren't available in the card data.
    return cardCountsWithData.filter(function (cardCount) {
        return !!cardCount.card;
    });
}

module.exports = formatDeckAsFullCards;