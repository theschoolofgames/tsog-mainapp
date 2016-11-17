var SpecifyGoalHudLayer = HudLayer.extend({
    _specifyGoalLabel: null,

    _totalSpecifyGoal: 0,
    _currentSpecifyGoal: 0,

    _showClock: true,
    _whiteBg: null,

    ctor: function(layer, timeForScene, currencyType) {
        if (currencyType)
            this.setCurrencyType(currencyType);

        this._super(layer, !this._showClock, timeForScene);
        this.addBackGround();
    },

    addBackGround: function() {
        var bg = new cc.Sprite("#whitespace.png");
        bg.x = this._clockBg.x + this._clockBg.width/2 + bg.width/2 + HUD_BAR_DISTANCE;
        bg.y = this._clockBg.y;
        this.addChild(bg);
        this._whiteBg = bg;
    },

    addGoalImage: function(imageName) {
        var specifyGoalSprite = new cc.Sprite(imageName);
        specifyGoalSprite.scale = this._whiteBg.height * 2/specifyGoalSprite.height;
        specifyGoalSprite.x = 0;
        specifyGoalSprite.y = this._whiteBg.height/2 - 5;
        this._whiteBg.addChild(specifyGoalSprite); 

        var text = this._currentSpecifyGoal + "/" + this._totalSpecifyGoal;
        if (this._specifyGoalLabel)
            this.updateSpecifyGoalLabel();
        else {
            this._specifyGoalLabel = new cc.LabelBMFont(text, res.HudFont_fnt);
            this._specifyGoalLabel.scale = CURRENCY_SCALE;
            this._specifyGoalLabel.x = this._whiteBg.width/2 + 10;
            this._specifyGoalLabel.y = this._whiteBg.height/2;
            this._whiteBg.addChild(this._specifyGoalLabel);
        }
    },

    addGoalLabel: function() {
        var cupImage = new cc.Sprite("#cup.png");
        cupImage.scale = CURRENCY_SCALE;
        cupImage.x = 0;
        cupImage.y = this._whiteBg.height/2 - 5;
        this._whiteBg.addChild(cupImage);

        var label = new cc.LabelBMFont(0 + "", res.HudFont_fnt);
        label.scale = CURRENCY_SCALE;
        label.x = this._whiteBg.width/2 + 10;
        label.y = this._whiteBg.height/2;
        this._whiteBg.addChild(label);

        this._specifyGoalLabel = label;
    },

    addSpecifyGoal: function(imageName) {
        if (imageName)
            this.addGoalImage(imageName);
        else
            this.addGoalLabel();
    },

    setTotalSpecifyGoal: function(goal) {
        cc.log("setTotalSpecifyGoal goal: " + goal);
        this._totalSpecifyGoal = goal;
    },

    setCurrentSpecifyGoal: function(goal) {
        this._currentSpecifyGoal = goal;
    },

    updateSpecifyGoalLabel: function(text) {
        if (text)
            this._specifyGoalLabel.setString(text);
        else
            this._specifyGoalLabel.setString(this._currentSpecifyGoal + "/" + this._totalSpecifyGoal);
    },


    setCurrencyType: function(name) {
        this._currencyType = name;
    },
});