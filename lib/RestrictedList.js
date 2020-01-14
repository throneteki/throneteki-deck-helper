'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var moment = require('moment');

var RestrictedList = function () {
    function RestrictedList(rules) {
        _classCallCheck(this, RestrictedList);

        this.rules = rules;
    }

    _createClass(RestrictedList, [{
        key: 'validate',
        value: function validate(cards) {
            var currentRules = this.getCurrentRules();
            var joustCardsOnList = cards.filter(function (card) {
                return currentRules.joustCards.includes(card.code);
            });
            var bannedCardsOnList = cards.filter(function (card) {
                return currentRules.bannedCards.includes(card.code);
            });

            var errors = [];

            if (joustCardsOnList.length > 1) {
                errors.push('Contains more than 1 card on the FAQ v' + currentRules.version + ' Joust restricted list: ' + joustCardsOnList.map(function (card) {
                    return card.name;
                }).join(', '));
            }

            if (bannedCardsOnList.length > 0) {
                errors.push('Contains cards that are not tournament legal: ' + bannedCardsOnList.map(function (card) {
                    return card.name;
                }).join(', '));
            }

            return {
                version: currentRules.version,
                valid: errors.length === 0,
                validForJoust: joustCardsOnList.length <= 1,
                noBannedCards: bannedCardsOnList.length === 0,
                errors: errors,
                joustCards: joustCardsOnList,
                bannedCards: bannedCardsOnList
            };
        }
    }, {
        key: 'getCurrentRules',
        value: function getCurrentRules() {
            var now = moment();
            return this.rules.reduce(function (max, list) {
                var effectiveDate = moment(list.date, 'YYYY-MM-DD');
                if (effectiveDate <= now && effectiveDate > moment(max.date, 'YYYY-MM-DD')) {
                    return list;
                }

                return max;
            });
        }
    }]);

    return RestrictedList;
}();

module.exports = RestrictedList;