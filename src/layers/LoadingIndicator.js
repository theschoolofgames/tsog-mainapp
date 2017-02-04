var LoadingIndicator = cc.LayerColor.extend({
    _character: null,
    _textLabel: null,

    ctor: function(text) {
        this._super(cc.color(0, 0, 0, 120));

        var characterName = CharacterManager.getInstance().getSelectedCharacter();
        if(!characterName) {
            characterName = "adi"
        };
        this._character = new sp.SkeletonAnimation("characters/alpharacing/" + characterName + "/character.json", "characters/alpharacing/" + characterName + "/character.atlas", 0.3);
        this._character.x = this.width/2;
        if (text) {
            this._character.y  = this.height/2 + 50;
        } else {
            this._character.y  = this.height/2;
        }
        this._character.scale = 1;
        this.addChild(this._character);
        this._character.setAnimation(0, 'run', true);

        if (text) {
            this._textLabel = new cc.LabelBMFont(text, res.HudFont_fnt);
            this._textLabel.scale = 1;
            this._textLabel.x = this.width/2;
            this._textLabel.y = this.height/2 - 50;
            this.addChild(this._textLabel);
        }

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function(touch, event) { return true; },
            onTouchMoved: function(touch, event) { },
            onTouchEnded: function(touch, event) { },
            onTouchCancelled: function(touch, event) { }
        }, this);  

        // for testing
        // this.scheduleOnce(function() {
        //     LoadingIndicator.hide();
        // }, 3);
    }
});

LoadingIndicator._instance = null;
LoadingIndicator.show = function(text) {
    if (this._instance) {
        this.hide();
    }

    var layer = new LoadingIndicator(text);
    var currentScene = cc.director.getRunningScene();
    currentScene.addChild(layer, 999999);
    LoadingIndicator._instance = layer;
};

LoadingIndicator.hide = function() {
    if (this._instance) {
        this._instance.removeFromParent();
        this._instance = null;
    }
}