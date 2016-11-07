var CharacterManager = cc.Class.extend({

    KEY_UNLOCKED_CHARACTER_NAMES: "CharacterManager:KEY_UNLOCKED_CHARACTER_NAMES",
    KEY_SELECTED_CHARACTER_IDX: "CharacterManager:KEY_SELECTED_CHARACTER_IDX",

    _characterCfg: null,
    _unlockedCharacterNames: [],

    ctor: function () {
        cc.assert(CharacterManager._instance == null, "can be instantiated once only");

        let self = this;
        cc.loader.loadJson("config/character.json", function(err, data) {
            self._characterCfg = data;

            let unlockedCharNamesString = KVDatabase.getInstance().getString(this.KEY_UNLOCKED_CHARACTER_NAMES);

            self._unlockedCharacterNames = unlockedCharNamesString ? JSON.parse(unlockedCharNamesString) : self._characterCfg.filter(cfg => cfg.unlocked).map(cfg => cfg.name);
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
                unlocked: self.hasUnlocked(cfg.name)
            }
        });
    },

    getCharacterConfig: function(name) {
        let cfg = this._characterCfg.filter(cfg => cfg.name == characterName);
        cfg = cfg.length > 0 ? cfg[0] : null;

        return cfg;
    },

    hasUnlocked: function(characterName) {
        return this._unlockedCharacterNames.indexOf(characterName) >= 0;
    },

    unlockCharacter: function(characterName) {
        if (this.hasUnlocked(characterName))
            return false;

        let cfg = this.getCharacterConfig(characterName);

        if (cfg) {
            if (cfg.price > CurrencyManager.getInstance().getDiamond())
                return false;

            CurrencyManager.getInstance().decrDiamond(cfg.price);

            this._unlockedCharacterNames.push(cfg.name);
            KVDatabase.getInstance().set(this.KEY_UNLOCKED_CHARACTER_NAMES, JSON.stringify(this._unlockedCharacterNames));

            return true;
        }

        return false;
    },

    getSelectedCharacter: function() {
        let idx = KVDatabase.getInstance().getInt(this.KEY_SELECTED_CHARACTER_IDX, 0);
        return this._unlockedCharacterNames[idx];
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