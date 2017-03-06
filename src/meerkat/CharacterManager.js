var CharacterManager = cc.Class.extend({
    _characterCfg: null,

    ctor: function () {
        cc.assert(CharacterManager._instance == null, "can be instantiated once only");

        let self = this;
        cc.loader.loadJson("config/character.json", function(err, data) {
            self._characterCfg = data;
        });
    },

    // Return array of character information
    getCharacterList: function() {
        let self = this;
        return this._characterCfg.map(cfg => {
            return {
                name: cfg.name,
                price: cfg.price || 0,
                path: cfg.path,
                heathy: cfg.heathy,
                unlocked: self.hasUnlocked(cfg.name),
                animationFrameCount: cfg.animationFrameCount,
                posY: cfg.posY
            }
        });
    },

    getCharacterConfig: function(name) {
        let cfg = this._characterCfg.filter(cfg => cfg.name == name);
        cfg = cfg.length > 0 ? cfg[0] : null;

        return cfg;
    },

    hasUnlocked: function(characterName) {
        return User.getCurrentChild().getCharactersProgress().isCharacterUnlocked(characterName);
    },

    unlockCharacter: function(characterName) {
        if (this.hasUnlocked(characterName)) {
            return false;
        }

        var cfg = this.getCharacterConfig(characterName);

        if (cfg) {
            if (cfg.price > CurrencyManager.getInstance().getDiamond()) {
                return false;
            }

            CurrencyManager.getInstance().decrDiamond(cfg.price);
            User.getCurrentChild().getCharactersProgress().unlockCharacter(characterName);
            return true
        }

        return false;
    },

    selectCharacter: function(name) {
        if (!User.getCurrentChild().getCharactersProgress().getUnlockedCharacters()[name]) {
            return false;
        }
        User.getCurrentChild().setSelectedCharacter(name);
        return true
    },

    getSelectedCharacter: function() {
        var user = User.getCurrentUser();
        if (user) {
            return user.getCurrentChild().getSelectedCharacter();
        } else {
            return null
        }
    }
});

CharacterManager._instance = null;

CharacterManager.getInstance = function () {
  return CharacterManager._instance || CharacterManager.setupInstance();
};

CharacterManager.setupInstance = function () {
    CharacterManager._instance = new CharacterManager();
    return CharacterManager._instance;
}