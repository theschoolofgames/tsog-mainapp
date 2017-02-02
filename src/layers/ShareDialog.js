var ShareDialog = Dialog.extend({
	_dialogBg: null,

	ctor: function() {
		this._super(cc.color(0, 0, 0, 200));
		this._addDialogBg();
		// this._addTitle();
		this._addButtons();
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

	_addTitle: function() {
		var title = new cc.LabelBMFont("Share", "res/font/custom_font.fnt");
		title.x = this._dialogBg.width / 2;
		title.y = this._dialogBg.height / 5 * 4;
		this._dialogBg.addChild(title);
	},

	_addButtons: function() {
		var buttonWhatsapp = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
		buttonWhatsapp.x = this._dialogBg.width / 2;
		buttonWhatsapp.y = this._dialogBg.height / 5 * 3;
		this._dialogBg.addChild(buttonWhatsapp);

		var lbWhatsapp = new cc.LabelBMFont("WHATSAPP", "res/font/custom_font.fnt");
		lbWhatsapp.x = buttonWhatsapp.width / 2;
		lbWhatsapp.y = buttonWhatsapp.height / 2;
		buttonWhatsapp.addChild(lbWhatsapp);
		buttonWhatsapp.addClickEventListener(function() {
			AudioManager.getInstance().play(res.ui_click_mp3_2, false, null);
			NativeHelper.callNative("shareWhatsapp", [WHATSAPP_SHARING_CAPTION, cc.formatStr(DYNAMIC_LINK, User.getCurrentUser().uid)]);
		});


		var buttonFacebook = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
		buttonFacebook.x = this._dialogBg.width / 2;
		buttonFacebook.y = this._dialogBg.height / 5 * 2;
		this._dialogBg.addChild(buttonFacebook);

		var lbFacebook = new cc.LabelBMFont("FACEBOOK", "res/font/custom_font.fnt");
		lbFacebook.x = buttonFacebook.width / 2;
		lbFacebook.y = buttonFacebook.height / 2;
		buttonFacebook.addChild(lbFacebook);
		buttonFacebook.addClickEventListener(function() {
			AudioManager.getInstance().play(res.ui_click_mp3_2, false, null);
	        NativeHelper.callNative("shareFacebook", [FACEBOOK_SHARING_TITLE, 
	                    FACEBOOK_SHARING_DESCRIPTION,
	                    cc.formatStr(DYNAMIC_LINK, User.getCurrentUser().uid)]);
		});


		var buttonNative = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
		buttonNative.x = this._dialogBg.width / 2;
		buttonNative.y = this._dialogBg.height / 5 * 1;
		this._dialogBg.addChild(buttonNative);

		var lbNative = new cc.LabelBMFont("NATIVE", "res/font/custom_font.fnt");
		lbNative.x = buttonNative.width / 2;
		lbNative.y = buttonNative.height / 2;
		buttonNative.addChild(lbNative);
		buttonNative.addClickEventListener(function() {
			NativeHelper.callNative("shareNative", [NATIVE_SHARING_CAPTION, cc.formatStr(DYNAMIC_LINK, User.getCurrentUser().uid)]);
		});	

		var buttonClose = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
		buttonClose.x = this._dialogBg.width - 30;
		buttonClose.y = this._dialogBg.height - 30;
		this._dialogBg.addChild(buttonClose);

		var lbClose = new cc.LabelBMFont("X", "res/font/custom_font.fnt");
		lbClose.x = buttonClose.width / 2;
		lbClose.y = buttonClose.height / 2;
		buttonClose.addChild(lbClose);
		buttonClose.addClickEventListener(function() {
			this.close();
		}.bind(this));	
	}
});