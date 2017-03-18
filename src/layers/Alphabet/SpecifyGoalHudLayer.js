var SpecifyGoalHudLayer = HudLayer.extend({
    _specifyGoalLabel: null,

    _totalSpecifyGoal: 0,
    _currentSpecifyGoal: 0,
    _holder: null,
    _showClock: true,
    _whiteBg: null,
    _isAlpharacing: false,
    _word: null,

    ctor: function(layer, timeForScene, currencyType, isAlpharacing) {
        if (currencyType)
            this.setCurrencyType(currencyType);
        this._isAlpharacing = isAlpharacing;
        this._super(layer, !this._showClock, timeForScene);
        this.addBackGround();
        // this._bg.visible = false;
    },

    addBackGround: function() {
        var bg = new cc.Sprite("#whitespace.png");
        bg.x = this._clockBg.x + this._clockBg.width + HUD_BAR_DISTANCE;
        bg.y = this._progressBarBg.y;
        this.addChild(bg);
        this._whiteBg = bg;
    },

    addGoalImage: function(imageName, word) {
        cc.log("this._isAlpharacing: " + this._isAlpharacing);
        // this._bg.visible = false;
        cc.log("imageName: " + imageName);
        var holder = new cc.Sprite("#holder.png");
        holder.x = 15;
        holder.y = this._whiteBg.height/2 - 5;
        this._holder = holder;
        this._whiteBg.addChild(holder);
        var specifyGoalSprite = new cc.Sprite(imageName);

        specifyGoalSprite.scale = this._bg.height * 2/specifyGoalSprite.height;
        specifyGoalSprite.x = holder.width/2;
        specifyGoalSprite.y = holder.height/2 - 10;
        holder.addChild(specifyGoalSprite); 
        if(word.length == 1) {
            if(this._word)
                this._word.removeFromParent();
            var word = new cc.LabelBMFont(word, res.CustomFont_fnt); 
            word.x = specifyGoalSprite.width/2 + 5;
            word.y = specifyGoalSprite.height - word.height - 20;
            word.scale = 0.9;
            specifyGoalSprite.addChild(word);
            this._word = word;
        };
        var text = this._currentSpecifyGoal + "/" + this._totalSpecifyGoal;
        if (this._specifyGoalLabel)
            this.updateSpecifyGoalLabel();
        else {
            this._specifyGoalLabel = new cc.LabelBMFont(text, res.HudFont_fnt);
            this._specifyGoalLabel.scale = CURRENCY_SCALE;
            this._specifyGoalLabel.x = this._whiteBg.width/2 + 10;
            this._specifyGoalLabel.y = this._whiteBg.height/2;
            this._whiteBg.addChild(this._specifyGoalLabel);
        };
        this.updatePositonHud();
        
    },

    updatePositonHud: function(){
        var width = this._bg.width + this._clockBg.width + this._settingBtn.width + this._whiteBg.width + HUD_BAR_DISTANCE * 3;
        if(this._progressBarBg.visible == true) 
            width = width + this._progressBarBg.width + HUD_BAR_DISTANCE;
        if(width >= cc.winSize.width) {
            this._whiteBg.x = this._whiteBg.x - 30;
            this._bg.y = this._bg.y - 75;
        };
    },

    addGoalLabel: function() {
        cc.log("addGoalLabeld");
        var cupImage = new cc.Sprite("#holder.png");
        cupImage.x = -10;
        cupImage.y = this._whiteBg.height/2;
        // if(this._isAlpharacing) {
        //     this.addChild(cupImage);
        //     cupImage.x = this._clockBg.x + this._clockBg.width + HUD_BAR_DISTANCE * 2;
        //     cupImage.y = this._progressBarBg.y - 5;
        //     this._whiteBg.visible = false;
        // }
        // else
        this._whiteBg.addChild(cupImage);
        this._holder = cupImage;

        var label = new cc.LabelBMFont(0 + "", res.HudFont_fnt);
        label.scale = CURRENCY_SCALE;
        label.x = this._whiteBg.width/2 + 10;
        label.y = this._whiteBg.height/2;
        this._whiteBg.addChild(label);

        this._specifyGoalLabel = label;
    },

    addSpecifyGoal: function(imageName, word) {
        if (imageName)
            this.addGoalImage(imageName, word);
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
});