var SpecifyGoalHudLayer = HudLayer.extend({
    _specifyGoal: null,

    _totalSpecifyGoal: 0,
    _currentSpecifyGoal: 0,

    ctor: function(layer, timeForScene) {
        this._super(layer, false, timeForScene);
    },

    addSpecifyGoal: function(imageName) {
        var bg = new cc.Sprite("#whitespace.png");
        bg.x = this._clockBg.x + this._clockBg.width/2 + bg.width/2 + HUD_BAR_DISTANCE;
        bg.y = this._clockBg.y;
        this.addChild(bg);
        this._bg = bg;

        var specifyGoalSprite;
        if (imageName)
            specifyGoalSprite = new cc.Sprite(imageName);
        
        specifyGoalSprite.scale = bg.height * 2/specifyGoalSprite.height;
        specifyGoalSprite.x = 0;
        specifyGoalSprite.y = bg.height/2 - 5;
        bg.addChild(specifyGoalSprite);

        var text = this._currentSpecifyGoal + "/" + this._totalSpecifyGoal;
        this._specifyGoal = new cc.LabelBMFont(text, res.HudFont_fnt);
        this._specifyGoal.x = this._bg.width/2 + 10;
        this._specifyGoal.y = this._bg.height/2;
        this._bg.addChild(this._specifyGoal);
    },

    setTotalSpecifyGoal: function(goal) {
        cc.log("setTotalSpecifyGoal goal: " + goal);
        this._totalSpecifyGoal = goal;
    },

    setCurrentSpecifyGoal: function(goal) {
        this._currentSpecifyGoal = goal;
    },

    updateSpecifyGoal: function() {
        this._specifyGoal.setString(this._currentSpecifyGoal + "/" + this._totalSpecifyGoal);
    },
});