const DeckValidator = require('./DeckValidator');
const formatDeckAsFullCards = require('./formatDeckAsFullCards');

module.exports = {
    formatDeckAsFullCards: formatDeckAsFullCards,
    validateDeck: function(deck, options) {
        options = Object.assign({ includeExtendedStatus: true }, options);

        let validator = new DeckValidator(options.packs, options.restrictedList);
        let result = validator.validateDeck(deck);

        if(!options.includeExtendedStatus) {
            delete result.extendedStatus;
        }

        return result;
    }
};
