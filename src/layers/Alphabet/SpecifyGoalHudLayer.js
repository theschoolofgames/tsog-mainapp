var SpecifyGoalHudLayer = HudLayer.extend({
    _specifyGoalLabel: null,

    _totalSpecifyGoal: 0,
    _currentSpecifyGoal: 0,
    _holder: null,
    _showClock: true,

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
        this._bg = bg;
    },

    addGoalImage: function(imageName) {
        var holder = new cc.Sprite("#holder.png");
        holder.x = 0;
        holder.y = this._bg.height/2 - 5;
        this._holder = holder;
        this._bg.addChild(holder);
        var specifyGoalSprite = new cc.Sprite(imageName);
        specifyGoalSprite.scale = this._bg.height * 2/specifyGoalSprite.height;
        specifyGoalSprite.x = holder.width/2;
        specifyGoalSprite.y = holder.height/2 - 10;
        holder.addChild(specifyGoalSprite); 

        var text = this._currentSpecifyGoal + "/" + this._totalSpecifyGoal;
        this._specifyGoalLabel = new cc.LabelBMFont(text, res.HudFont_fnt);
        this._specifyGoalLabel.x = this._bg.width/2 + 10;
        this._specifyGoalLabel.y = this._bg.height/2;
        this._bg.addChild(this._specifyGoalLabel);
    },

    addGoalLabel: function() {
        var cupImage = new cc.Sprite("#holder.png");
        cupImage.x = -10;
        cupImage.y = this._bg.height/2;
        this._bg.addChild(cupImage);
        this._holder = cupImage;
        var label = new cc.LabelBMFont(0 + "", res.HudFont_fnt);
        label.x = this._bg.width/2 + 10;
        label.y = this._bg.height - 17;
        this._bg.addChild(label);

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
        if (text) {
            var index = text.indexOf("-");
            cc.log("index: " + index);
            var num = parseInt(text.slice(0, index));
            string = (20 - num) + "/" + 20;
            this._specifyGoalLabel.setString(string);
            if(this._lbText)
                this._lbText.setString(text.slice(index+ 1, text.length));
            else {
                var lbText = new cc.LabelBMFont(text.slice(index+ 1, text.length), res.HudFont_fnt);
                lbText.x = this._holder.width/2;
                lbText.y = this._holder.height/2;
                this._holder.addChild(lbText);
                this._lbText = lbText;
            }
        }
        else
            this._specifyGoalLabel.setString(this._currentSpecifyGoal + "/" + this._totalSpecifyGoal);
    },


    setCurrencyType: function(name) {
        this._currencyType = name;
    },
});