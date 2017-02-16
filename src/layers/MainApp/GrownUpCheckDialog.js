var config = {
    "0": "zero",
    "1": "one",
    "2": "two",
    "3": "three",
    "4": "four",
    "5": "five",
    "6": "six",
    "7": "seven",
    "8": "eight",
    "9": "nine"
};
var GrownUpCheckDialog = cc.LayerColor.extend({
    _dialogBg: null,
    _numberArray: [],
    _numberForAdult: null,
    _numbersNodeArray: [],
    _timeTouched: null, 
    _timeForTouched: 0,
    _objectTouching: null,
    _progressBar: null,
    _callback: null,
    ctor: function(callback){
        this._super(cc.color(0, 0, 0 , 200));
        this._callback = callback;
        this._colors = ["black", "blue", "green", "orange", "pink", "purple", "red", "brown", "white", "yellow"];
        this._numbersNodeArray = [];
        this._addDialogBg();
        this.addCloseButton();
        this._numberArray = [];
        for(var i = 0; i < 9; i++) {
            this._numberArray.push(i)
        };
        shuffle(this._numberArray);
        this._numberArray = this._numberArray.splice(0,6);
        shuffle(this._colors);
        this._colors = this._colors.splice(0,6);
        cc.log("COLOR: " + JSON.stringify(this._colors));
        this._numberForAdult = this._numberArray[Math.floor(Math.random() * this._numberArray.length)];
        cc.log("NUMBER: " + JSON.stringify(this._numberArray));
        this.addNumberForAdultAndProgressBar();
        this.addRandomNumber();
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
                this._objectTouching = node;
            };
            if(isRectContainsPoint && node.tag != this._numberForAdult) 
                this.runActionFail();
        }
        return true;
    },
    onTouchMoved: function(touch, event){
        var touchedPos = touch.getLocation();
        if(this._startTouchPosition) {
            var delta = cc.pSub(touchedPos, this._startTouchPosition);
            if(cc.pLengthSQ(delta) > 625 && this._isTouching) {
                cc.log("FALSE");
                this._timeForTouched = 0;
                this._isTouching = false;
                this.runActionFail();
            };
        }

    },
    onTouchEnded: function(touch, event){
        cc.log("onTouchEnded");
        this._startTouchPosition = null,
        this._timeForTouched = 0;
        if(this._objectTouching && this._timeForTouched < TIME_FOR_ADULT_TOCH)
            this.runActionFail();
        this._isTouching = false;
    },

    update: function() {
        currentTime = new Date().getTime() / 1000;
        // cc.log("currentTime: " + currentTime);
        if(this._isTouching)
            this._timeForTouched = currentTime - this._timeTouched;
        this._progressBar.percentage = this._timeForTouched/TIME_FOR_ADULT_TOCH * 100;
        //PASS CHECK
        if(this._timeForTouched >= TIME_FOR_ADULT_TOCH && this._isTouching) {
            this._callback();
            cc.log("DING DING");
        }
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
        var title = new cc.LabelBMFont("For Parent", "res/font/grownupcheckfont-export.fnt");
        title.scale = 0.5;
        title.x = ribbon.width/2;
        title.y = ribbon.height/2 + 23;
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
            var number = this._numberArray[i];
            btn = new ccui.Button("res/SD/grownup/button-" + number + ".png", "res/SD/grownup/button-" + number + "-pressed.png", "");
            btn.x = this._progressBarBg.x - this._progressBarBg.width/2 + btn.width/2 +  i % 3 * 165;
            btn.y = this._dialogBg.height - 240 - 140 * (Math.floor(i/3));
            btn.setSwallowTouches(false);
            this._dialogBg.addChild(btn);
            this._numbersNodeArray.push(btn);
            btn.tag = number;
            var underButton = new cc.Sprite("res/SD/grownup/button_bg_grownup.png");
            underButton.x = btn.width/2;
            underButton.y = btn.height/2;
            btn.addChild(underButton, -1);
            btn.addClickEventListener(function(){
                AudioManager.getInstance().play(res.ui_click_mp3_2, false, null);
            });
        }
    },

    addNumberForAdultAndProgressBar: function(){
        var requiredLb = new cc.LabelBMFont("Press number \"" + config[this._numberForAdult.toString()].toUpperCase() + "\" for 3 seconds", "res/font/grownupcheckfont-export.fnt");
        requiredLb.scale = 0.4;
        requiredLb.x = this._dialogBg.width/2;
        requiredLb.y = this._ribbon.y - 70;
        this._dialogBg.addChild(requiredLb);
        var progressBarBg = new cc.Sprite("res/SD/grownup/progress-bar-grown-up.png");
        progressBarBg.x = this._dialogBg.width/2;
        progressBarBg.y = this._dialogBg.height - 140;
        this._progressBarBg = progressBarBg;
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