'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var moment = require('moment');

var RestrictedList = require('./RestrictedList');

function getDeckCount(deck) {
    var count = 0;

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = deck[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var cardEntry = _step.value;

            count += cardEntry.count;
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    return count;
}

function hasKeyword(card, keywordRegex) {
    var lines = card.text.split('\n');
    var keywordLine = lines[0] || '';
    var keywords = keywordLine.split('.').map(function (keyword) {
        return keyword.trim();
    }).filter(function (keyword) {
        return keyword.length !== 0;
    });

    return keywords.some(function (keyword) {
        return keywordRegex.test(keyword);
    });
}

function hasTrait(card, trait) {
    return card.traits.some(function (t) {
        return t.toLowerCase() === trait.toLowerCase();
    });
}

function isCardInReleasedPack(packs, card) {
    var pack = packs.find(function (pack) {
        return card.packCode === pack.code;
    });

    if (!pack) {
        return false;
    }

    var releaseDate = pack.releaseDate;

    if (!releaseDate) {
        return false;
    }

    releaseDate = moment(releaseDate, 'YYYY-MM-DD');
    var now = moment();

    return releaseDate <= now;
}

function rulesForBanner(faction, factionName) {
    return {
        mayInclude: function mayInclude(card) {
            return card.faction === faction && !card.loyal && card.type !== 'plot';
        },
        rules: [{
            message: 'Must contain 12 or more ' + factionName + ' cards',
            condition: function condition(deck) {
                return getDeckCount(deck.drawCards.filter(function (cardQuantity) {
                    return cardQuantity.card.faction === faction;
                })) >= 12;
            }
        }]
    };
}

function rulesForDraft(properties) {
    return Object.assign({ requiredDraw: 40, requiredPlots: 5 }, properties);
}

/**
 * Validation rule structure is as follows. All fields are optional.
 *
 * requiredDraw  - the minimum amount of cards required for the draw deck.
 * requiredPlots - the exact number of cards required for the plot deck.
 * maxDoubledPlots - the maximum amount of plot cards that can be contained twice in the plot deck.
 * mayInclude    - function that takes a card and returns true if it is allowed in the overall deck.
 * cannotInclude - function that takes a card and return true if it is not allowed in the overall deck.
 * rules         - an array of objects containing a `condition` function that takes a deck and return true if the deck is valid for that rule, and a `message` used for errors when invalid.
 */
var agendaRules = {
    // Banner of the stag
    '01198': rulesForBanner('baratheon', 'Baratheon'),
    // Banner of the kraken
    '01199': rulesForBanner('greyjoy', 'Greyjoy'),
    // Banner of the lion
    '01200': rulesForBanner('lannister', 'Lannister'),
    // Banner of the sun
    '01201': rulesForBanner('martell', 'Martell'),
    // Banner of the watch
    '01202': rulesForBanner('thenightswatch', 'Night\'s Watch'),
    // Banner of the wolf
    '01203': rulesForBanner('stark', 'Stark'),
    // Banner of the dragon
    '01204': rulesForBanner('targaryen', 'Targaryen'),
    // Banner of the rose
    '01205': rulesForBanner('tyrell', 'Tyrell'),
    // Fealty
    '01027': {
        rules: [{
            message: 'You cannot include more than 15 neutral cards in a deck with Fealty',
            condition: function condition(deck) {
                return getDeckCount(deck.drawCards.filter(function (cardEntry) {
                    return cardEntry.card.faction === 'neutral';
                })) <= 15;
            }
        }]
    },
    // Kings of Summer
    '04037': {
        cannotInclude: function cannotInclude(card) {
            return card.type === 'plot' && hasTrait(card, 'Winter');
        },
        rules: [{
            message: 'Kings of Summer cannot include Winter plot cards',
            condition: function condition(deck) {
                return !deck.plotCards.some(function (cardQuantity) {
                    return hasTrait(cardQuantity.card, 'Winter');
                });
            }
        }]
    },
    // Kings of Winter
    '04038': {
        cannotInclude: function cannotInclude(card) {
            return card.type === 'plot' && hasTrait(card, 'Summer');
        },
        rules: [{
            message: 'Kings of Winter cannot include Summer plot cards',
            condition: function condition(deck) {
                return !deck.plotCards.some(function (cardQuantity) {
                    return hasTrait(cardQuantity.card, 'Summer');
                });
            }
        }]
    },
    // Rains of Castamere
    '05045': {
        requiredPlots: 12,
        rules: [{
            message: 'Rains of Castamere must contain exactly 5 different Scheme plots',
            condition: function condition(deck) {
                var schemePlots = deck.plotCards.filter(function (cardQuantity) {
                    return hasTrait(cardQuantity.card, 'Scheme');
                });
                return schemePlots.length === 5 && getDeckCount(schemePlots) === 5;
            }
        }]
    },
    // Alliance
    '06018': {
        requiredDraw: 75,
        rules: [{
            message: 'Alliance cannot have more than 2 Banner agendas',
            condition: function condition(deck) {
                return !deck.bannerCards || deck.bannerCards.length <= 2;
            }
        }]
    },
    // The Brotherhood Without Banners
    '06119': {
        cannotInclude: function cannotInclude(card) {
            return card.type === 'character' && card.loyal;
        },
        rules: [{
            message: 'The Brotherhood Without Banners cannot include loyal characters',
            condition: function condition(deck) {
                return !deck.drawCards.some(function (cardQuantity) {
                    return cardQuantity.card.type === 'character' && cardQuantity.card.loyal;
                });
            }
        }]
    },
    // The Conclave
    '09045': {
        mayInclude: function mayInclude(card) {
            return card.type === 'character' && hasTrait(card, 'Maester') && !card.loyal;
        },
        rules: [{
            message: 'Must contain 12 or more Maester characters',
            condition: function condition(deck) {
                return getDeckCount(deck.drawCards.filter(function (cardQuantity) {
                    return cardQuantity.card.type === 'character' && hasTrait(cardQuantity.card, 'Maester');
                })) >= 12;
            }
        }]
    },
    // The Wars To Come
    '10045': {
        requiredPlots: 10,
        maxDoubledPlots: 2
    },
    // The Free Folk
    '11079': {
        cannotInclude: function cannotInclude(card) {
            return card.faction !== 'neutral';
        }
    },
    // Kingdom of Shadows
    '13079': {
        mayInclude: function mayInclude(card) {
            return !card.loyal && hasKeyword(card, /Shadow \(\d+\)/);
        }
    },
    // The White Book
    '13099': {
        mayInclude: function mayInclude(card) {
            return card.type === 'character' && hasTrait(card, 'Kingsguard') && !card.loyal;
        },
        rules: [{
            message: 'Must contain 7 or more different Kingsguard characters',
            condition: function condition(deck) {
                var kingsguardChars = deck.drawCards.filter(function (cardQuantity) {
                    return cardQuantity.card.type === 'character' && hasTrait(cardQuantity.card, 'Kingsguard');
                });
                return kingsguardChars.length >= 7;
            }
        }]
    },
    // Draft Agendas
    // The Power of Wealth
    '00001': rulesForDraft({
        mayInclude: function mayInclude() {
            return true;
        },
        rules: [{
            message: 'Cannot include cards from more than 1 outside faction',
            condition: function condition(deck) {
                var outOfFactionCards = deck.drawCards.concat(deck.plotCards).filter(function (cardQuantity) {
                    return cardQuantity.card.faction !== deck.faction.value && cardQuantity.card.faction !== 'neutral';
                });
                var factions = outOfFactionCards.map(function (cardQuantity) {
                    return cardQuantity.card.faction;
                });
                return factions.length <= 1;
            }
        }]
    }),
    // Protectors of the Realm
    '00002': rulesForDraft({
        mayInclude: function mayInclude(card) {
            return card.type === 'character' && (hasTrait(card, 'Knight') || hasTrait(card, 'Army'));
        }
    }),
    // Treaty
    '00003': rulesForDraft({
        mayInclude: function mayInclude() {
            return true;
        },
        rules: [{
            message: 'Cannot include cards from more than 2 outside factions',
            condition: function condition(deck) {
                var outOfFactionCards = deck.drawCards.concat(deck.plotCards).filter(function (cardQuantity) {
                    return cardQuantity.card.faction !== deck.faction.value && cardQuantity.card.faction !== 'neutral';
                });
                var factions = outOfFactionCards.map(function (cardQuantity) {
                    return cardQuantity.card.faction;
                });
                return factions.length <= 2;
            }
        }]
    }),
    // Uniting the Seven Kingdoms
    '00004': rulesForDraft({
        mayInclude: function mayInclude(card) {
            return card.type !== 'plot';
        }
    })
};

var DeckValidator = function () {
    function DeckValidator(packs, restrictedListRules) {
        _classCallCheck(this, DeckValidator);

        this.packs = packs;
        this.restrictedList = new RestrictedList(restrictedListRules);
    }

    _createClass(DeckValidator, [{
        key: 'validateDeck',
        value: function validateDeck(deck) {
            var _this = this;

            var errors = [];
            var unreleasedCards = [];
            var rules = this.getRules(deck);
            var plotCount = getDeckCount(deck.plotCards);
            var drawCount = getDeckCount(deck.drawCards);

            if (plotCount < rules.requiredPlots) {
                errors.push('Too few plot cards');
            } else if (plotCount > rules.requiredPlots) {
                errors.push('Too many plot cards');
            }

            if (drawCount < rules.requiredDraw) {
                errors.push('Too few draw cards');
            }

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = rules.rules[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var rule = _step2.value;

                    if (!rule.condition(deck)) {
                        errors.push(rule.message);
                    }
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            var allCards = deck.plotCards.concat(deck.drawCards);
            var cardCountByName = {};

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = allCards[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var cardQuantity = _step3.value;

                    cardCountByName[cardQuantity.card.name] = cardCountByName[cardQuantity.card.name] || { name: cardQuantity.card.name, type: cardQuantity.card.type, limit: cardQuantity.card.deckLimit, count: 0 };
                    cardCountByName[cardQuantity.card.name].count += cardQuantity.count;
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = (deck.bannerCards || [])[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var card = _step4.value;

                    cardCountByName[card.name] = cardCountByName[card.name] || { name: card.name, type: card.type, limit: card.deckLimit, count: 0 };
                    cardCountByName[card.name].count += 1;
                }

                // Only add rookery cards here as they don't count towards deck limits
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }

            allCards = allCards.concat(deck.rookeryCards || []);

            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = allCards[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var _cardQuantity = _step5.value;

                    if (!rules.mayInclude(_cardQuantity.card) || rules.cannotInclude(_cardQuantity.card)) {
                        errors.push(_cardQuantity.card.label + ' is not allowed by faction or agenda');
                    }

                    if (!isCardInReleasedPack(this.packs, _cardQuantity.card)) {
                        unreleasedCards.push(_cardQuantity.card.label + ' is not yet released');
                    }
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }

            if (deck.agenda && !isCardInReleasedPack(this.packs, deck.agenda)) {
                unreleasedCards.push(deck.agenda.label + ' is not yet released');
            }

            var doubledPlots = Object.values(cardCountByName).filter(function (card) {
                return card.type === 'plot' && card.count === 2;
            });
            if (doubledPlots.length > rules.maxDoubledPlots) {
                errors.push('Maximum allowed number of doubled plots: ' + rules.maxDoubledPlots);
            }

            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = Object.values(cardCountByName)[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var _card = _step6.value;

                    if (_card.count > _card.limit) {
                        errors.push(_card.name + ' has limit ' + _card.limit);
                    }
                }
            } catch (err) {
                _didIteratorError6 = true;
                _iteratorError6 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion6 && _iterator6.return) {
                        _iterator6.return();
                    }
                } finally {
                    if (_didIteratorError6) {
                        throw _iteratorError6;
                    }
                }
            }

            var uniqueCards = allCards.map(function (cardQuantity) {
                return cardQuantity.card;
            }).concat(deck.bannerCards);

            // Ensure agenda cards are validated against the restricted list
            if (deck.agenda) {
                uniqueCards.push(deck.agenda);
            }

            var restrictedResult = this.restrictedList.validate(uniqueCards);
            var includesDraftCards = this.isDraftCard(deck.agenda) || allCards.some(function (cardQuantity) {
                return _this.isDraftCard(cardQuantity.card);
            });

            if (includesDraftCards) {
                errors.push('You cannot include Draft cards in a normal deck');
            }

            return {
                basicRules: errors.length === 0,
                faqJoustRules: restrictedResult.validForJoust,
                faqVersion: restrictedResult.version,
                noUnreleasedCards: unreleasedCards.length === 0,
                plotCount: plotCount,
                drawCount: drawCount,
                extendedStatus: errors.concat(unreleasedCards).concat(restrictedResult.errors)
            };
        }
    }, {
        key: 'getRules',
        value: function getRules(deck) {
            var standardRules = {
                requiredDraw: 60,
                requiredPlots: 7,
                maxDoubledPlots: 1
            };

            var factionRules = this.getFactionRules(deck.faction.value.toLowerCase());
            var agendaRules = this.getAgendaRules(deck);
            var rookeryRules = this.getRookeryRules(deck);

            return this.combineValidationRules([standardRules, factionRules, rookeryRules].concat(agendaRules));
        }
    }, {
        key: 'getRookeryRules',
        value: function getRookeryRules() {
            return {
                rules: [{
                    message: 'More than 2 plot cards in rookery',
                    condition: function condition(deck) {
                        return !deck.rookeryCards || getDeckCount(deck.rookeryCards.filter(function (card) {
                            return card.card.type === 'plot';
                        })) <= 2;
                    }
                }, {
                    message: 'More than 10 draw cards in rookery',
                    condition: function condition(deck) {
                        return !deck.rookeryCards || getDeckCount(deck.rookeryCards.filter(function (card) {
                            return card.card.type !== 'plot';
                        })) <= 10;
                    }
                }]
            };
        }
    }, {
        key: 'getFactionRules',
        value: function getFactionRules(faction) {
            return {
                mayInclude: function mayInclude(card) {
                    return card.faction === faction || card.faction === 'neutral';
                }
            };
        }
    }, {
        key: 'getAgendaRules',
        value: function getAgendaRules(deck) {
            if (!deck.agenda) {
                return [];
            }

            var allAgendas = [deck.agenda].concat(deck.bannerCards || []);
            return allAgendas.map(function (agenda) {
                return agendaRules[agenda.code];
            }).filter(function (a) {
                return !!a;
            });
        }
    }, {
        key: 'combineValidationRules',
        value: function combineValidationRules(validators) {
            var mayIncludeFuncs = validators.map(function (validator) {
                return validator.mayInclude;
            }).filter(function (v) {
                return !!v;
            });
            var cannotIncludeFuncs = validators.map(function (validator) {
                return validator.cannotInclude;
            }).filter(function (v) {
                return !!v;
            });
            var combinedRules = validators.reduce(function (rules, validator) {
                return rules.concat(validator.rules || []);
            }, []);
            var combined = {
                mayInclude: function mayInclude(card) {
                    return mayIncludeFuncs.some(function (func) {
                        return func(card);
                    });
                },
                cannotInclude: function cannotInclude(card) {
                    return cannotIncludeFuncs.some(function (func) {
                        return func(card);
                    });
                },
                rules: combinedRules
            };

            return Object.assign.apply(Object, [{}].concat(_toConsumableArray(validators), [combined]));
        }
    }, {
        key: 'isDraftCard',
        value: function isDraftCard(card) {
            return card && card.packCode === 'VDS';
        }
    }]);

    return DeckValidator;
}();

module.exports = DeckValidator;