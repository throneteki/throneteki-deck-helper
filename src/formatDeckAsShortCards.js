/**
 * Creates a clone of the existing deck with only card codes instead of full
 * card data.
 */
function formatDeckAsShortCards(deck) {
    let newDeck = {
        id: deck.id,
        name: deck.name,
        username: deck.username,
        lastUpdated: deck.lastUpdated,
        faction: { name: deck.faction.name, value: deck.faction.value }
    };

    newDeck.cards = formatCards(deck.cards || []);
    newDeck.rookeryCards = formatCards(deck.rookeryCards || []);

    return newDeck;
}

function formatCards(cardCounts) {
    return cardCounts.map(cardCount => {
        return { count: cardCount.count, code: cardCount.card.code };
    });
}

module.exports = formatDeckAsShortCards;
