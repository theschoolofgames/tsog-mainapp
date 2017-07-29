var DemosDialog = Dialog.extend({
    _dialogBg: null,

    ctor: function(retry){
        this._super(cc.color(0, 0, 0 , 200));
        this._addDialogBg();
        this._addDemoButtons();
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function() { return true },
        }, this);
    },
    _addDialogBg: function() {
        var dialogBg = new cc.Sprite("#level_dialog_frame.png");
        dialogBg.x = cc.winSize.width/2;
        dialogBg.y = cc.winSize.height/2;
        this.addChild(dialogBg);
        this._dialogBg = dialogBg;
        this.background = dialogBg;
    },

    _addDemoButtons: function(){
        var self = this;
        var canttouch = false;

        var demos = [
            {
                func: function() {
                    cc.director.runScene(new DemoSpeechCommandScene());
                },
                text: "Speech Command"
            },
            {
                func: function() {
                    NativeHelper.callNative("showCoreMLDemo");
                },
                text: "Collect Objects"
            },
            {
                func: function() {
                    cc.director.runScene(new DemosStoryScene());
                },
                text: "Story with Choices"
            },
        ];

        for (let i = 0; i < demos.length; i++) {
            var buttonPlay = new ccui.Button("btn_save_progress.png", "btn_save_progress_pressed.png", "", ccui.Widget.PLIST_TEXTURE);
            buttonPlay.x = this._dialogBg.width/2;
            buttonPlay.y = this._dialogBg.height - i * 100 - 100;

            this._dialogBg.addChild(buttonPlay);
            var lbPlay = CustomLabel.createWithTTF(res.HELVETICARDBLK_ttf.srcs[0], 26, cc.color("#b15a10"), 1, demos[i].text);

            buttonPlay.addChild(lbPlay,1);
            lbPlay.x = buttonPlay.width/2;
            lbPlay.y = buttonPlay.height/2 + 8;
            buttonPlay.addClickEventListener(demos[i].func);
        }

        var closeButton = new ccui.Button("btn_x.png", "btn_x-pressed.png", "",ccui.Widget.PLIST_TEXTURE);
        closeButton.x = this._dialogBg.width - 25;
        closeButton.y = this._dialogBg.height - 25;
        closeButton.addClickEventListener(function(){
            AudioManager.getInstance().play(res.ui_close_mp3, false, null);
            
            if (self._isRetry) {
                cc.director.runScene(new HomeScene());
            } else {
                self.parent._blocktouch = false;
                self.removeFromParent();
            }
        });
        this._dialogBg.addChild(closeButton);
    }
})