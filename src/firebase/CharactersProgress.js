var CharactersProgress = BaseFirebaseModel.extend({
	_className: "CharactersProgress",

	ctor: function (id, initCallback) {
		this.fixCocosBugs();
		this.setDefaultValues({
			"unlockedCharacters": {
				"adi": true
			}
		});
		this._super("/charactersProgress/" + id, id, ["unlockedCharacters"], initCallback);
	},

	unlockCharacter: function(name) {
		var unlockedCharacters = this.getUnlockedCharacters();
		unlockedCharacters[name] = true;
		this.setUnlockedCharacters(unlockedCharacters);
	},

	isCharacterUnlocked: function (name) {
        if (UNLOCK_ALL_CHARACTERS) {
            return true;
        }
		var unlockedCharacters = this.getUnlockedCharacters();
		return unlockedCharacters[name] ? true : false;
	}
});