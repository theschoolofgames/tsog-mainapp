var SettingDialog = cc.Layer.extend({
    _dialogBg: null,
    _mask: null,
    _textFieldLabel: null,
    _dialogBgLabel: null,
    _callback: null,
    _logoutBtnXRatio: -1,

    ctor: function(text) {
        this._super();

        this._addMask();
        this._addDialogBg();
        this._addDebugButtons();
        this._addContactDetail();

        this._dialogBgLabel = text;
        this._logoutBtnXRatio = 0;
        if (!text) {
            this._logoutBtnXRatio = 1;
            this._textFieldLabel = Utils.getUserName() || "Anonymous";
            if (this._textFieldLabel.length > MAX_NAME_LENGTH_DISPLAYED) 
                this._textFieldLabel = this._textFieldLabel.substring(0, MAX_NAME_LENGTH_DISPLAYED) + "...";
            this._dialogBgLabel = Utils.getSchoolName();
            this._addResumeButton();
            this._addTextField();
        }
        this._addDialogBgLabel();
        this._addLogoutButton();

        cc.eventManager.addListener({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: true,
                onTouchBegan: function(touch, event) { return true; }
        }, this);
    },

    _addMask: function() {
        var mask = new cc.LayerColor(cc.color(0, 0, 0 , 200));
        mask.width = cc.winSize.width;
        mask.height = cc.winSize.height;
        this.addChild(mask);

        this._mask = mask;
    },

    _addDialogBg: function() {
        var dialogBg = new cc.Sprite("#setting-dialog-bg.png");
        dialogBg.x = cc.winSize.width/2;
        dialogBg.y = cc.winSize.height/2;
        this.addChild(dialogBg);
        this._dialogBg = dialogBg;
    },

    _addTextField: function() {
        var textField = new cc.Sprite("#name-holder.png");
        textField.x = this._dialogBg.width/2;
        textField.y = this._dialogBg.height/2 - textField.height*1.5;
        this._dialogBg.addChild(textField);

        var textFieldLabel = new cc.LabelTTF(this._textFieldLabel, "Arial", 24);
        textFieldLabel.color = cc.color.WHITE;
        textFieldLabel.x = textField.width/2;
        textFieldLabel.y = textField.height/2;
        textField.addChild(textFieldLabel);
    },

    _addLogoutButton: function() {
        var logoutBtn = new ccui.Button();
        logoutBtn.loadTextures("btn_exit.png", "btn_exit-pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        logoutBtn.x = this._dialogBg.width/2 - (logoutBtn.width/2 - 10) * this._logoutBtnXRatio;
        logoutBtn.y = 20;
        this._dialogBg.addChild(logoutBtn);

        var self = this;
        logoutBtn.addClickEventListener(function() {
            cc.director.resume();
            if (Utils.getUserName()){
                Utils.logoutStudent();
                cc.director.replaceScene(new AccountSelectorScene());
            }
            else {
                cc.director.replaceScene(new MainScene());
                // NativeHelper.callNative("moveToMainApp");
            }
        })
    },

    _addResumeButton: function() {
        var resumeBtn = new ccui.Button();
        resumeBtn.loadTextures("btn_play.png", "btn_play-pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        resumeBtn.x = this._dialogBg.width/2 + resumeBtn.width/2 + 10;
        resumeBtn.y = 20;
        this._dialogBg.addChild(resumeBtn);

        var self = this;
        resumeBtn.addClickEventListener(function() {
            self.removeFromParent();
            cc.director.resume();
        })
    },

    _addDialogBgLabel: function() {
        font = FONT_COLOR[1];

        text = this._dialogBgLabel.toUpperCase();
        var dialogBgLabel = new cc.LabelBMFont(text, 
                                            font, 
                                            this._dialogBg.width*1.5);
        dialogBgLabel.scale = 0.5;
        dialogBgLabel.textAlign = cc.TEXT_ALIGNMENT_CENTER;
        dialogBgLabel.x = this._dialogBg.width/2;
        dialogBgLabel.y = this._dialogBg.height/2 + 10;
        this._dialogBg.addChild(dialogBgLabel);
    },

    _addDebugButtons: function() {
        var self = this;
        
        if (TSOG_DEBUG) {
            var winCurTestBtn = new ccui.Button("name-holder.png", "", "", ccui.Widget.PLIST_TEXTURE);
            winCurTestBtn.x = cc.winSize.width - 150;
            winCurTestBtn.y = cc.winSize.height/2 + 80;
            winCurTestBtn.anchorX = winCurTestBtn.anchorY = 1;
            winCurTestBtn.titleText = "Win Current Test";
            winCurTestBtn.setTitleColor(cc.color.BLACK);
            winCurTestBtn.setTitleFontSize(16);
            this.addChild(winCurTestBtn);
            winCurTestBtn.addClickEventListener(function() {
                winCurTestBtn.setEnabled(false);
                cc.director.resume();
                cc.log(cc.director.getRunningScene().getChildrenCount());
                cc.director.getRunningScene().getChildren()[1]._moveToNextScene();
                // self._layer._moveToNextScene();
            });

            var winToRoomOrForestBtn = new ccui.Button("name-holder.png", "", "", ccui.Widget.PLIST_TEXTURE);
            winToRoomOrForestBtn.x = cc.winSize.width - 150;
            winToRoomOrForestBtn.y = cc.winSize.height/2;
            winToRoomOrForestBtn.anchorX = winToRoomOrForestBtn.anchorY = 1;
            winToRoomOrForestBtn.titleText = "Win To Room/Forest";
            winToRoomOrForestBtn.setTitleColor(cc.color.BLACK);
            winToRoomOrForestBtn.setTitleFontSize(16);
            this.addChild(winToRoomOrForestBtn);
            winToRoomOrForestBtn.addClickEventListener(function() {
                var nextSceneName = SceneFlowController.getInstance().getNextRoomOrForestScene();
                var scene = new window[nextSceneName]();
                cc.director.replaceScene(new cc.TransitionFade(1, scene, cc.color(255, 255, 255, 255)));
            });

            var resetBtn = new ccui.Button("name-holder.png", "", "", ccui.Widget.PLIST_TEXTURE);
            resetBtn.x = cc.winSize.width - 150;
            resetBtn.y = cc.winSize.height/2 - 80;
            resetBtn.anchorX = resetBtn.anchorY = 1;
            resetBtn.titleText = "Reset Progress";
            resetBtn.setTitleColor(cc.color.BLACK);
            resetBtn.setTitleFontSize(16);
            this.addChild(resetBtn);
            resetBtn.addClickEventListener(function() {
                Global.clearCachedState();
                cc.director.replaceScene(new MainScene());
            });

            var testBtn = new ccui.Button("name-holder.png", "", "", ccui.Widget.PLIST_TEXTURE);
            testBtn.x = cc.winSize.width - 150;
            testBtn.y = cc.winSize.height/2 - 160;
            testBtn.anchorX = testBtn.anchorY = 1;
            testBtn.titleText = "Test MAP";
            testBtn.setTitleColor(cc.color.BLACK);
            testBtn.setTitleFontSize(16);
            this.addChild(testBtn);
            testBtn.addClickEventListener(function() {
                cc.director.resume();
                cc.director.runScene(new MapScene());
            });
        }
    },

    _addContactDetail: function() {
        var text = "Send feedback and comments to anshul@theschoolofgames.org";
        font = FONT_COLOR[1];

        // text = text.toUpperCase();
        var contactDetailText = new cc.LabelTTF(text, font, 24);
        // contactDetailText.scale = 0.5;
        contactDetailText.boundingWidth = cc.winSize.width/3;
        contactDetailText.textAlign = cc.TEXT_ALIGNMENT_CENTER;
        contactDetailText.x = cc.winSize.width/2;
        contactDetailText.y = cc.winSize.height/2 - this._dialogBg.width/2 - 70;
        this.addChild(contactDetailText);
    }
})