var PauseLayer = cc.LayerColor.extend({
    _callback: null, 

    ctor: function(callback) {
        this._super(cc.color.WHITE);

        this._callback = callback;
        this._addAskLabel();
        this._addAnswerButton();

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function() {return true;}
        }, this);

    },

    _addAskLabel: function() {
        var randSchoolIdx = Math.floor(Math.random() * 4);
        font = FONT_COLOR[1];
        var text = "Your session is over\n Do you still want to continue?";
        text = text.toUpperCase();
        var lb = new cc.LabelBMFont(text, font);
        lb.textAlign = cc.TEXT_ALIGNMENT_CENTER;
        lb.scale = 0.7;
        lb.x = cc.winSize.width/2;
        lb.y = cc.winSize.height/2 + lb.height/2;
        this.addChild(lb);
    },

    _addAnswerButton: function() {
        var self = this;
        var exitBtn = new ccui.Button();
        exitBtn.loadTextures("btn_exit.png", "btn_exit-pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        exitBtn.x = cc.winSize.width/2 - exitBtn.width/2 - 50;
        exitBtn.y = cc.winSize.height/2 - exitBtn.height/2;
        this.addChild(exitBtn);

        exitBtn.addClickEventListener(function() {
            self.removeFromParent();
            cc.director.runScene(new SchoolSelectorScene());
        })

        var resumeBtn = new ccui.Button();
        resumeBtn.loadTextures("btn_play.png", "btn_play-pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        resumeBtn.x = cc.winSize.width/2 + resumeBtn.width/2 + 50;
        resumeBtn.y = cc.winSize.height/2 - resumeBtn.height/2;
        this.addChild(resumeBtn);
        
        resumeBtn.addClickEventListener(function() {
            self.removeFromParent();
            if (self._callback)
                self._callback();
        })
    }
})