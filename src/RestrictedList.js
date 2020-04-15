const moment = require('moment');

class RestrictedList {
    constructor(rules) {
        this.rules = rules;
    }

    validate(cards) {
        let restrictedCardsOnList = cards.filter(card => this.rules.restricted.includes(card.code));
        let bannedCardsOnList = cards.filter(card => this.rules.banned.includes(card.code));

        let errors = [];

        if(restrictedCardsOnList.length > 1) {
            errors.push(`${this.rules.name}: Contains more than 1 card on the restricted list: ${restrictedCardsOnList.map(card => card.name).join(', ')}`);
        }

        if(bannedCardsOnList.length > 0) {
            errors.push(`${this.rules.name}: Contains cards that are not tournament legal: ${bannedCardsOnList.map(card => card.name).join(', ')}`);
        }

        return {
            name: this.rules.name,
            valid: errors.length === 0,
            restrictedRules: restrictedCardsOnList.length <= 1,
            noBannedCards: bannedCardsOnList.length === 0,
            errors: errors,
            restrictedCards: restrictedCardsOnList,
            bannedCards: bannedCardsOnList
        };
    }
}

module.exports = RestrictedList;
