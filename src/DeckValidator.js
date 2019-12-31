const moment = require('moment');

const AgendaRules = require('./AgendaRules');
const RestrictedList = require('./RestrictedList');

function getDeckCount(deck) {
    let count = 0;

    for(const cardEntry of deck) {
        count += cardEntry.count;
    }

    return count;
}

function isCardInReleasedPack(packs, card) {
    let pack = packs.find(pack => {
        return card.packCode === pack.code;
    });

    if(!pack) {
        return false;
    }

    let releaseDate = pack.releaseDate;

    if(!releaseDate) {
        return false;
    }

    releaseDate = moment(releaseDate, 'YYYY-MM-DD');
    let now = moment();

    return releaseDate <= now;
}

class DeckValidator {
    constructor(packs, restrictedListRules) {
        this.packs = packs;
        this.restrictedList = new RestrictedList(restrictedListRules);
    }

    validateDeck(deck) {
        let errors = [];
        let unreleasedCards = [];
        let rules = this.getRules(deck);
        let plotCount = getDeckCount(deck.plotCards);
        let drawCount = getDeckCount(deck.drawCards);

        if(plotCount < rules.requiredPlots) {
            errors.push('Too few plot cards');
        } else if(plotCount > rules.requiredPlots) {
            errors.push('Too many plot cards');
        }

        if(drawCount < rules.requiredDraw) {
            errors.push('Too few draw cards');
        }

        for(const rule of rules.rules) {
            if(!rule.condition(deck)) {
                errors.push(rule.message);
            }
        }

        let allCards = deck.plotCards.concat(deck.drawCards);
        let cardCountByName = {};

        for(let cardQuantity of allCards) {
            cardCountByName[cardQuantity.card.name] = cardCountByName[cardQuantity.card.name] || { name: cardQuantity.card.name, type: cardQuantity.card.type, limit: cardQuantity.card.deckLimit, count: 0 };
            cardCountByName[cardQuantity.card.name].count += cardQuantity.count;
        }

        for(let card of deck.bannerCards || []) {
            cardCountByName[card.name] = cardCountByName[card.name] || { name: card.name, type: card.type, limit: card.deckLimit, count: 0 };
            cardCountByName[card.name].count += 1;
        }

        // Only add rookery cards here as they don't count towards deck limits
        allCards = allCards.concat(deck.rookeryCards || []);

        for(const cardQuantity of allCards) {
            if(!rules.mayInclude(cardQuantity.card) || rules.cannotInclude(cardQuantity.card)) {
                errors.push(cardQuantity.card.label + ' is not allowed by faction or agenda');
            }

            if(!isCardInReleasedPack(this.packs, cardQuantity.card)) {
                unreleasedCards.push(cardQuantity.card.label + ' is not yet released');
            }
        }

        if(deck.agenda && !isCardInReleasedPack(this.packs, deck.agenda)) {
            unreleasedCards.push(deck.agenda.label + ' is not yet released');
        }

        let doubledPlots = Object.values(cardCountByName).filter(card => card.type === 'plot' && card.count === 2);
        if(doubledPlots.length > rules.maxDoubledPlots) {
            errors.push('Maximum allowed number of doubled plots: ' + rules.maxDoubledPlots);
        }

        for(const card of Object.values(cardCountByName)) {
            if(card.count > card.limit) {
                errors.push(card.name + ' has limit ' + card.limit);
            }
        }

        let uniqueCards = allCards.map(cardQuantity => cardQuantity.card).concat(deck.bannerCards);

        // Ensure agenda cards are validated against the restricted list
        if(deck.agenda) {
            uniqueCards.push(deck.agenda);
        }

        let restrictedResult = this.restrictedList.validate(uniqueCards);
        let includesDraftCards = this.isDraftCard(deck.agenda) || allCards.some(cardQuantity => this.isDraftCard(cardQuantity.card));

        if(includesDraftCards) {
            errors.push('You cannot include Draft cards in a normal deck');
        }

        return {
            basicRules: errors.length === 0,
            faqJoustRules: restrictedResult.validForJoust,
            faqVersion: restrictedResult.version,
            noBannedCards: restrictedResult.noBannedCards,
            noUnreleasedCards: unreleasedCards.length === 0,
            plotCount: plotCount,
            drawCount: drawCount,
            extendedStatus: errors.concat(unreleasedCards).concat(restrictedResult.errors)
        };
    }

    getRules(deck) {
        const standardRules = {
            requiredDraw: 60,
            requiredPlots: 7,
            maxDoubledPlots: 1
        };

        let factionRules = this.getFactionRules(deck.faction.value.toLowerCase());
        let agendaRules = this.getAgendaRules(deck);
        let rookeryRules = this.getRookeryRules(deck);

        return this.combineValidationRules([standardRules, factionRules, rookeryRules].concat(agendaRules));
    }

    getRookeryRules() {
        return {
            rules: [
                {
                    message: 'More than 2 plot cards in rookery',
                    condition: deck => {
                        return !deck.rookeryCards || getDeckCount(deck.rookeryCards.filter(card => card.card.type === 'plot')) <= 2;
                    }
                },
                {
                    message: 'More than 10 draw cards in rookery',
                    condition: deck => {
                        return !deck.rookeryCards || getDeckCount(deck.rookeryCards.filter(card => card.card.type !== 'plot')) <= 10;
                    }
                }
            ]
        };
    }

    getFactionRules(faction) {
        return {
            mayInclude: card => card.faction === faction || card.faction === 'neutral'
        };
    }

    getAgendaRules(deck) {
        if(!deck.agenda) {
            return [];
        }

        let allAgendas = [deck.agenda].concat(deck.bannerCards || []);
        return allAgendas.map(agenda => AgendaRules[agenda.code]).filter(a => !!a);
    }

    combineValidationRules(validators) {
        let mayIncludeFuncs = validators.map(validator => validator.mayInclude).filter(v => !!v);
        let cannotIncludeFuncs = validators.map(validator => validator.cannotInclude).filter(v => !!v);
        let combinedRules = validators.reduce((rules, validator) => rules.concat(validator.rules || []), []);
        let combined = {
            mayInclude: card => mayIncludeFuncs.some(func => func(card)),
            cannotInclude: card => cannotIncludeFuncs.some(func => func(card)),
            rules: combinedRules
        };

        return Object.assign({}, ...validators, combined);
    }

    isDraftCard(card) {
        return card && card.packCode === 'VDS';
    }
}

module.exports = DeckValidator;
