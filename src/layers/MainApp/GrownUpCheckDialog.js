var GrownUpCheckDialog = cc.LayerColor.extend({
    _dialogBg: null,
    _numberArray: [],
    _numberForAdult: null,
    _numbersNodeArray: [],
    _timeTouched: null, 
    _timeForTouched: 0,
    _objectTouching: null,
    _progressBar: null,
    ctor: function(text){
        this._super(cc.color(0, 0, 0 , 200));
        this._colors = ["black", "blue", "green", "orange", "pink", "purple", "red", "brown", "white", "yellow"];
        this._numbersNodeArray = [];
        this._addDialogBg();
        this.addCloseButton();
        this._numberArray = [];
        for(var i = 0; i < 9; i++) {
            this._numberArray.push(i)
        };
        shuffle(this._numberArray);
        this._numberArray.splice(0,3);
        shuffle(this._colors);
        this._colors = this._colors.splice(0,6);
        cc.log("COLOR: " + JSON.stringify(this._colors));
        this._numberForAdult = this._numberArray[Math.floor(Math.random() * this._numberArray.length)];
        cc.log("NUMBER: " + JSON.stringify(this._numberArray));
        this.addRandomNumber();
        this.addNumberForAdultAndProgressBar();
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan.bind(this),
            onTouchMoved: this.onTouchMoved.bind(this),
            onTouchEnded: this.onTouchEnded.bind(this),
        }, this);
        this.scheduleUpdate();

    },

    runActionFail: function(){
        this._objectTouching = null;
        this._timeForTouched = 0;
        this._dialogBg.runAction(cc.sequence(
            cc.moveBy(0.05, cc.p(- 4, 0)).easing(cc.easeBackIn(0.05)),
            cc.moveBy(0.05, cc.p(4, 0)).easing(cc.easeBackIn(0.05)),
            cc.moveBy(0.05, cc.p(- 4, 0)).easing(cc.easeBackIn(0.05)),
            cc.moveBy(0.05, cc.p(4, 0)).easing(cc.easeBackIn(0.05))
        ))
    },

    onTouchBegan: function(touch, event){
        cc.log("onTouchBegan");
        var touchedPos = touch.getLocation();
        // var touchedPosNodeSpace = this._container.convertToNodeSpace(touchedPos);
        // targetNode._startTouchPosition = touchedPosNodeSpace;
        for(var i = 0; i < this._numbersNodeArray.length; i++) {
            var node = this._numbersNodeArray[i];
            var numberPos = this._dialogBg.convertToWorldSpace(cc.p(node.getBoundingBox().x, node.getBoundingBox().y));
            var numberBoundingBox = cc.rect(numberPos.x, numberPos.y, node.getBoundingBox().width, node.getBoundingBox().height);
            var isRectContainsPoint = cc.rectContainsPoint(numberBoundingBox, touchedPos);
            if(isRectContainsPoint && node.tag == this._numberForAdult) {
                this._startTouchPosition = touchedPos;
                this._timeTouched = new Date().getTime() / 1000;
                this._isTouching = true;
                cc.log("TOUCH ON : " + node.tag);
                this._objectTouching = node;
            };
            if(isRectContainsPoint && node.tag != this._numberForAdult) 
                this.runActionFail();
        }
        return true;
    },
    onTouchMoved: function(touch, event){
        cc.log("onTouchMoved");
        var touchedPos = touch.getLocation();
        cc.log("touchedPos: " + JSON.stringify(touchedPos));
        var delta = cc.pSub(touchedPos, this._startTouchPosition);
        cc.log("delta: " + cc.pLengthSQ(delta));
        if(cc.pLengthSQ(delta) > 20 && this._isTouching) {
            cc.log("FALSE");
            this._timeForTouched = 0;
            this._isTouching = false;
            this.runActionFail();
        };

    },
    onTouchEnded: function(touch, event){
        cc.log("onTouchEnded");
        this._timeForTouched = 0;
        if(this._objectTouching && this._timeForTouched < 3)
            this.runActionFail();
        this._isTouching = false;
    },

    update: function() {
        currentTime = new Date().getTime() / 1000;
        // cc.log("currentTime: " + currentTime);
        if(this._isTouching)
            this._timeForTouched = currentTime - this._timeTouched;
        this._progressBar.percentage = this._timeForTouched/3 * 100;
        if(this._timeForTouched >= 3 && this._isTouching)
            this.removeFromParent();
            // cc.log("DING DING");
    },

    _addDialogBg: function() {
        var dialogBg = new cc.Sprite("res/SD/grownup/dialog_bg.png");
        dialogBg.x = cc.winSize.width/2;
        dialogBg.y = cc.winSize.height/2;
        this.addChild(dialogBg);
        this._dialogBg = dialogBg;

        var ribbon = new cc.Sprite("res/SD/grownup/ribbon.png");
        ribbon.x = dialogBg.width/2;
        ribbon.y = dialogBg.height - 10;
        dialogBg.addChild(ribbon);
        var title = new cc.LabelBMFont("For Parent",res.CustomFont_fnt);
        title.scale = 0.55;
        title.x = ribbon.width/2;
        title.y = ribbon.height/2 + 25;
        ribbon.addChild(title);
        this._ribbon = ribbon;
    },

    addCloseButton: function() {
        var self = this;
        var closeButton = new ccui.Button("btn_x.png", "btn_x-pressed.png", "",ccui.Widget.PLIST_TEXTURE);
        closeButton.x = this._dialogBg.width - 25;
        closeButton.y = this._dialogBg.height - 25;
        closeButton.addClickEventListener(function(){
            AudioManager.getInstance().play(res.ui_close_mp3, false, null);
            self.removeFromParent();
        });
        this._dialogBg.addChild(closeButton);
    },

    addRandomNumber: function(){
        for(var i = 0; i < this._numberArray.length; i++) {
            btn = new cc.Sprite("#btn_" + this._colors[i] + ".png");
            btn.x = 150 + i % 3 * 120;
            btn.y = this._dialogBg.height - 240 - 130 * (Math.floor(i/3));
            this._dialogBg.addChild(btn);
            this._numbersNodeArray.push(btn);
            var number = this._numberArray[i];
            btn.tag = number;
            var numberLb = new cc.LabelBMFont(number.toString(), res.CustomFont_fnt);
            numberLb.x = btn.width/2;
            numberLb.y = btn.height/2;
            numberLb.scale = 0.5;
            btn.addChild(numberLb);
        }
    },

    addNumberForAdultAndProgressBar: function(){
        var requiredLb = new cc.LabelBMFont("Press number \" " + this._numberForAdult + " \" for 3 seconds", res.CustomFont_fnt);
        requiredLb.scale = 0.4;
        requiredLb.x = this._dialogBg.width/2;
        requiredLb.y = this._ribbon.y - 70;
        this._dialogBg.addChild(requiredLb);
        var progressBarBg = new cc.Sprite("res/SD/grownup/progress-bar-grown-up.png");
        progressBarBg.x = this._dialogBg.width/2;
        progressBarBg.y = this._dialogBg.height - 140;
        this._dialogBg.addChild(progressBarBg);
        var colorBar = new cc.Sprite("res/SD/grownup/colorbar-grown-up.png");
        var gameProgressBar = new cc.ProgressTimer(colorBar);
        gameProgressBar.x = progressBarBg.width/2 - 1;
        gameProgressBar.y = progressBarBg.height/2;
        gameProgressBar.type = cc.ProgressTimer.TYPE_BAR;
        gameProgressBar.midPoint = cc.p(0, 1);
        gameProgressBar.barChangeRate = cc.p(1, 0);
        gameProgressBar.percentage = 0;
        progressBarBg.addChild(gameProgressBar);
        this._progressBar = gameProgressBar;
    }



})