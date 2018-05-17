"use strict";

/**
 * Creates a clone of the existing deck with only card codes instead of full
 * card data.
 */
function formatDeckAsShortCards(deck) {
    var newDeck = {
        _id: deck._id,
        name: deck.name,
        username: deck.username,
        lastUpdated: deck.lastUpdated,
        faction: { name: deck.faction.name, value: deck.faction.value }
    };

    if (deck.agenda) {
        newDeck.agenda = { code: deck.agenda.code };
    }

    newDeck.bannerCards = (deck.bannerCards || []).map(function (card) {
        return { code: card.code };
    });
    newDeck.drawCards = formatCards(deck.drawCards || []);
    newDeck.plotCards = formatCards(deck.plotCards || []);
    newDeck.rookeryCards = formatCards(deck.rookeryCards || []);

    return newDeck;
}

function formatCards(cardCounts) {
    return cardCounts.map(function (cardCount) {
        return { count: cardCount.count, card: cardCount.card.custom ? cardCount.card : { code: cardCount.card.code } };
    });
}

module.exports = formatDeckAsShortCards;