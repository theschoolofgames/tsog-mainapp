var DialogLetsPlayAlpharacing = Dialog.extend({
	closeCallback: null,

	ctor: function() {
		this._super();

		this._addDialogBg();
        this._addInstructionText();
		this._addButton();
        this._addCloseButton();
	},

	_addDialogBg: function() {
        var dialogBg = new cc.Sprite("#level_dialog_frame.png");
        dialogBg.x = cc.winSize.width/2;
        dialogBg.y = cc.winSize.height/2;
        this.addChild(dialogBg);
        this.background = dialogBg;
    },

    _addInstructionText: function() {
        var text = new cc.LabelBMFont(localizeForWriting("letsplay"), res.HomeFont_fnt);
        text.scale = 0.7;
        text.x = this.background.width/2;
        text.y = this.background.height/2 + 100;

        this.background.addChild(text);
    },

    _addButton: function() {
    	var okBtn = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        okBtn.x = this.background.width/2;
        okBtn.y = 100;
        okBtn.scale = 0.8;
        this.background.addChild(okBtn);
        lbLearn = new cc.LabelBMFont(localizeForWriting("OK"), res.GreenFont_fnt);
        lbLearn.x = okBtn.width/2;
        lbLearn.y = okBtn.height/2;
        okBtn.addChild(lbLearn);

        okBtn.addClickEventListener(function(){
        	AudioManager.getInstance().play(res.ui_close_mp3, false, null);
        	this.close();
            cc.director.getRunningScene().addChild(new DialogPlayAlpharacing(false), HOME_DOOR_Z_ORDER+3);
        }.bind(this));
    },

    _addCloseButton: function() {
        var closeButton = new ccui.Button("btn_x.png", "btn_x-pressed.png", "",ccui.Widget.PLIST_TEXTURE);
        closeButton.x = this.background.width - 25;
        closeButton.y = this.background.height - 25;
        this.background.addChild(closeButton);
        closeButton.addClickEventListener(function(){
            if (this.closeCallback) {
                this.closeCallback();
            }
            this.close();
        }.bind(this));
    },
});