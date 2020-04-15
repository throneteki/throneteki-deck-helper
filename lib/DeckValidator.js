'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var moment = require('moment');

var AgendaRules = require('./AgendaRules');
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

var DeckValidator = function () {
    function DeckValidator(packs, restrictedListRules) {
        _classCallCheck(this, DeckValidator);

        this.packs = packs;

        this.restrictedLists = restrictedListRules.map(function (rl) {
            return new RestrictedList(rl);
        });
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

            var restrictedListResults = this.restrictedLists.map(function (restrictedList) {
                return restrictedList.validate(uniqueCards);
            });
            var officialRestrictedResult = restrictedListResults[0];
            var includesDraftCards = this.isDraftCard(deck.agenda) || allCards.some(function (cardQuantity) {
                return _this.isDraftCard(cardQuantity.card);
            });

            if (includesDraftCards) {
                errors.push('You cannot include Draft cards in a normal deck');
            }

            var restrictedListErrors = restrictedListResults.reduce(function (errors, result) {
                return errors.concat(result.errors);
            }, []);

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
                return AgendaRules[agenda.code];
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