'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var moment = require('moment');

var AgendaRules = require('./AgendaRules');
var DeckWrapper = require('./DeckWrapper');
var Formats = require('./Formats');
var RestrictedList = require('./RestrictedList');

var DeckValidator = function () {
    function DeckValidator(packs, restrictedListRules) {
        var customRules = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        _classCallCheck(this, DeckValidator);

        var now = moment();
        this.releasedPackCodes = new Set(packs.filter(function (pack) {
            return pack.releaseDate && moment(pack.releaseDate, 'YYYY-MM-DD') <= now;
        }).map(function (pack) {
            return pack.code;
        }));

        this.restrictedLists = restrictedListRules.map(function (rl) {
            return new RestrictedList(rl);
        });
        this.customRules = customRules;
    }

    _createClass(DeckValidator, [{
        key: 'validateDeck',
        value: function validateDeck(rawDeck) {
            var deck = new DeckWrapper(rawDeck);

            var errors = [];
            var unreleasedCards = [];
            var rules = this.getRules(deck);
            var plotCount = deck.countPlotCards();
            var drawCount = deck.countDrawCards();

            if (plotCount < rules.requiredPlots) {
                errors.push('Too few plot cards');
            } else if (plotCount > rules.requiredPlots) {
                errors.push('Too many plot cards');
            }

            if (drawCount < rules.requiredDraw) {
                errors.push('Too few draw cards');
            }

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = rules.rules[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var rule = _step.value;

                    if (!rule.condition(deck, errors)) {
                        errors.push(rule.message);
                    }
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

            var cardCountByName = deck.getCardCountsByName();

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = deck.getCardsIncludedInDeck()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var card = _step2.value;

                    if (!rules.mayInclude(card) || rules.cannotInclude(card)) {
                        errors.push(card.label + ' is not allowed by faction or agenda');
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

            if (deck.format !== 'draft') {
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = deck.getUniqueCards()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var _card = _step3.value;

                        if (!this.releasedPackCodes.has(_card.packCode)) {
                            unreleasedCards.push(_card.label + ' is not yet released');
                        }
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
            }

            var doubledPlots = Object.values(cardCountByName).filter(function (card) {
                return card.type === 'plot' && card.count === 2;
            });
            if (doubledPlots.length > rules.maxDoubledPlots) {
                errors.push('Maximum allowed number of doubled plots: ' + rules.maxDoubledPlots);
            }

            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = Object.values(cardCountByName)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var _card2 = _step4.value;

                    if (_card2.count > _card2.limit) {
                        errors.push(_card2.name + ' has limit ' + _card2.limit);
                    }
                }
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

            var restrictedListResults = this.restrictedLists.map(function (restrictedList) {
                return restrictedList.validate(deck);
            });
            var officialRestrictedResult = restrictedListResults[0] || { noBannedCards: true, restrictedRules: true, version: '' };
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
            var formatRules = Formats.find(function (format) {
                return format.name === deck.format;
            }) || Formats.find(function (format) {
                return format.name === 'joust';
            });
            var customizedFormatRules = Object.assign({}, formatRules, this.customRules);
            var factionRules = this.getFactionRules(deck.faction.value.toLowerCase());
            var agendaRules = this.getAgendaRules(deck);

            return this.combineValidationRules([customizedFormatRules, factionRules].concat(agendaRules));
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
            return deck.agendas.map(function (agenda) {
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