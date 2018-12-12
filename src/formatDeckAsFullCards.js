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
    let newDeck = {
        id: deck.id,
        name: deck.name,
        username: deck.username,
        lastUpdated: deck.lastUpdated,
        faction: Object.assign({}, deck.faction)
    };

    if(data.factions) {
        newDeck.faction = data.factions[deck.faction.value];
    }

    if(deck.agenda) {
        if(deck.agenda.code) {
            newDeck.agenda = data.cards[deck.agenda.code];
        } else {
            newDeck.agenda = data.cards[deck.agenda];
        }
    }

    newDeck.bannerCards = (deck.bannerCards || []).map(card => data.cards[card]);
    newDeck.drawCards = processCardCounts(deck.drawCards || [], data.cards);
    newDeck.plotCards = processCardCounts(deck.plotCards || [], data.cards);
    newDeck.rookeryCards = processCardCounts(deck.rookeryCards || [], data.cards);

    return newDeck;
}

function processCardCounts(cardCounts, cardData) {
    let cardCountsWithData = cardCounts.map(cardCount => {
        return { count: cardCount.count, card: cardData[cardCount.code] };
    });

    // Filter out any cards that aren't available in the card data.
    return cardCountsWithData.filter(cardCount => !!cardCount.card);
}

module.exports = formatDeckAsFullCards;
