# throneteki-deck-helper

Deck formatting and validation helpers for throneteki

## Usage

### `validateDeck(deck, options)`

Returns validation status for the specified deck. Options must include an array of `packs` data and `restrictedList` data from `throneteki-json-data`.

The returned object breaks down any problems with the specified deck in the following fields:

* `basicRules` - boolean specifying whether standard faction and agenda rules were obeyed.
* `faqJoustRules` - boolean specifying whether the deck adheres to Joust format restrictions of the FAQ.
* `faqVersion` - which version of the FAQ was checked
* `noUnreleasedCards` - boolean specifying whether any cards in the deck haven't been released yet.
* `extendedStatus` - array of user-presentable error messages related to validation.
