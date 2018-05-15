'use strict';

var DeckValidator = require('./DeckValidator');

module.exports = {
    validateDeck: function validateDeck(deck, options) {
        options = Object.assign({ includeExtendedStatus: true }, options);

        var validator = new DeckValidator(options.packs, options.restrictedList);
        var result = validator.validateDeck(deck);

        if (!options.includeExtendedStatus) {
            delete result.extendedStatus;
        }

        return result;
    }
};