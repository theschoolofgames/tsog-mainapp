var ADI_HEAD = "bone4";
var ADI_NOSE = "mui2";
var ADI_HAND_LEFT = "hand L 2";
var ADI_HAND_RIGHT = "hand R2";
var ADI_BELLY = "body2";
var ADI_SLOTS = [ADI_HEAD, ADI_NOSE, ADI_HAND_LEFT, ADI_HAND_RIGHT, ADI_BELLY];

var CharacterNodeAlpharacing = cc.Node.extend({
    _character: null,

    listener: null,

    ctor: function(characterName) {
        this._super();
        this.setCascadeOpacityEnabled(true);
        this._createCharacter(characterName);
        this.getBoundingBox();
        // if(setActive)
            // this._addTouchEvent();
    },

    getBoundingBox: function() {
        var bb = this._character.getBoundingBox();
        // cc.log("Talking ADi bbox: " + JSON.stringify(bb));
        this.setContentSize(bb.width, bb.height);
        // cc.rect(bb.x + this.x, bb.y + this.y, bb.width, bb.height);
    },

    _createCharacter: function(characterName) {
        cc.log("before creating adi");
        var name = CharacterManager.getInstance().getSelectedCharacter();
        if(!name) {
            name = "adi"
        };
        if(characterName)
            name = characterName;
        var config = CharacterManager.getInstance().getCharacterConfig(name);
        this._character = new sp.SkeletonAnimation("characters/alpharacing/" + name + "/character.json", "characters/alpharacing/" + name + "/character.atlas", 0.3);
        this._character.setCascadeOpacityEnabled(true);
        this._character.setMix('run', 'run', 0);
        this._character.setMix('jump', 'run', 1);
        this._character.y  = config.posY;
        this._character.x = - 100;
        cc.log("this._character: " + JSON.stringify(this._character.getPosition()));
        // this._character.setDebugSlotsEnabled(true);

        // this._character.setAnimation(0, 'run', true);
        this.addChild(this._character, 4);
    },

    characterJump: function() {
        this._character.setAnimation(0, 'jump', false);  
    },

    characterRunning: function() {
        // cc.log("setidling: " + this._isAdiIdling);
        this._character.setAnimation(0, 'run', true);
    }
});
