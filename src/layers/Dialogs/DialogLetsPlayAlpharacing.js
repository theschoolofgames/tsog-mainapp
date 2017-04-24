var DialogLetsPlayAlpharacing = Dialog.extend({
	closeCallback: null,

	ctor: function() {
		this._super();

		this._addDialogBg();
		this._addButton();
	},

	_addDialogBg: function() {
        var dialogBg = new cc.Sprite("#level_dialog_frame.png");
        dialogBg.x = cc.winSize.width/2;
        dialogBg.y = cc.winSize.height/2;
        this.addChild(dialogBg);
        this.background = dialogBg;
    },

    _addButton: function() {
    	var okBtn = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        okBtn.x = this.background.width/2;
        okBtn.y = 100;
        okBtn.scale = 0.8;
        this.background.addChild(okBtn);
        lbLearn = new cc.LabelBMFont(localize("OK"), "res/font/custom_font.fnt");
        lbLearn.x = okBtn.width/2;
        lbLearn.y = okBtn.height/2;
        okBtn.addChild(lbLearn);

        var currentScene = this.parent;
        okBtn.addClickEventListener(function(){
        	AudioManager.getInstance().play(res.ui_close_mp3, false, null);
        	this.close();
            currentScene.addChild(new DialogPlayAlpharacing(false), HOME_DOOR_Z_ORDER+3);
        }.bind(this));

        var closeButton = new ccui.Button("btn_x.png", "btn_x-pressed.png", "",ccui.Widget.PLIST_TEXTURE);
        closeButton.x = this.background.width - 25;
        closeButton.y = this.background.height - 25;
        closeButton.addClickEventListener(function(){
            this.close();
            if (this.closeCallback) {
            	this.closeCallback();
            }
        }.bind(this));
    },
});