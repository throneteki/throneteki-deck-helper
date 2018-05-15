const DeckValidator = require('./DeckValidator');

module.exports = {
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
