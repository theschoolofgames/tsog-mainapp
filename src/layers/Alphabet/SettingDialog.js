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

        this._dialogBgLabel = text;
        this._logoutBtnXRatio = 0;
        if (!text) {
            this._logoutBtnXRatio = 1;
            this._textFieldLabel = Utils.getUserName();
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
            KVDatabase.getInstance().remove(STRING_USER_ID);
            KVDatabase.getInstance().remove(STRING_USER_NAME);
            KVDatabase.getInstance().remove(STRING_SCHOOL_NAME);
            KVDatabase.getInstance().remove("numberItems");
            KVDatabase.getInstance().remove("amountGamePlayed");
            
            cc.director.replaceScene(new SchoolSelectorScene());
            // NativeHelper.callNative("moveToMainApp");
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
})