const moment = require('moment');

const AgendaRules = require('./AgendaRules');
const DeckWrapper = require('./DeckWrapper');
const Formats = require('./Formats');
const RestrictedList = require('./RestrictedList');

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

        this.restrictedLists = restrictedListRules.map(rl => new RestrictedList(rl));
    }

    validateDeck(rawDeck) {
        const deck = new DeckWrapper(rawDeck);

        let errors = [];
        let unreleasedCards = [];
        let rules = this.getRules(deck);
        let plotCount = deck.countPlotCards();
        let drawCount = deck.countDrawCards();

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

        let cardCountByName = deck.getCardCountsByName();

        for(const card of deck.getCardsIncludedInDeck()) {
            if(!rules.mayInclude(card) || rules.cannotInclude(card)) {
                errors.push(card.label + ' is not allowed by faction or agenda');
            }
        }

        for(const card of deck.getUniqueCards()) {
            if(!isCardInReleasedPack(this.packs, card)) {
                unreleasedCards.push(card.label + ' is not yet released');
            }
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

        let uniqueCards = deck.getUniqueCards();
        let restrictedListResults = this.restrictedLists.map(restrictedList => restrictedList.validate(uniqueCards));
        let officialRestrictedResult = restrictedListResults[0];
        const restrictedListErrors = restrictedListResults.reduce((errors, result) => errors.concat(result.errors), []);

        return {
            basicRules: errors.length === 0,
            faqJoustRules: officialRestrictedResult.restrictedRules,
            faqVersion: officialRestrictedResult.version,
            noBannedCards: officialRestrictedResult.noBannedCards,
            restrictedLists: restrictedListResults,
            noUnreleasedCards: unreleasedCards.length === 0,
            plotCount: plotCount,
            drawCount: drawCount,
            extendedStatus: errors.concat(unreleasedCards).concat(restrictedListErrors)
        };
    }

    getRules(deck) {
        const standardRules = {
            requiredDraw: 60,
            requiredPlots: 7,
            maxDoubledPlots: 1,
            cannotInclude: card => card.packCode === 'VDS',
            rules: [
                {
                    message: 'You cannot include Draft cards in a normal deck',
                    condition: deck => {
                        return deck.getUniqueCards().every(card => card.packCode !== 'VDS');
                    }
                }
            ]
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
                        return deck.countRookeryCards(card => card.type === 'plot') <= 2;
                    }
                },
                {
                    message: 'More than 10 draw cards in rookery',
                    condition: deck => {
                        return deck.countRookeryCards(card => card.type !== 'plot') <= 10;
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
        return deck.agendas.map(agenda => AgendaRules[agenda.code]).filter(a => !!a);
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
