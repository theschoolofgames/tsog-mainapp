var ShareDialog = Dialog.extend({
	_dialogBg: null,

	ctor: function() {
		this._super(cc.color(0, 0, 0, 200));
		this._addDialogBg();
		this._addTitle();
		this._addButtons();
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function() { return true },
        }, this);
	},

	_addDialogBg: function() {
        var dialogBg = new cc.Sprite(res.Dialog_bg_png);
        dialogBg.x = cc.winSize.width/2;
        dialogBg.y = cc.winSize.height/2;
        this.addChild(dialogBg);
        this._dialogBg = dialogBg;
        this.background = dialogBg;
        this.background.setCascadeOpacityEnabled(true);
	},

	_addTitle: function() {
		var title = new cc.Sprite(res.Ribbon_png);
		title.x = this._dialogBg.width / 2;
		title.y = this._dialogBg.height - title.height / 10;
		this._dialogBg.addChild(title);

        var label = new cc.LabelBMFont("Share", res.CustomFont_fnt);
        label.scale = 0.55;
        label.x = title.width / 2;
        label.y = title.height / 7 * 5.5;
        title.addChild(label);
	},

	_addButtons: function() {
		var buttonWhatsappBg = new cc.Sprite(res.Button_background_png);
		buttonWhatsappBg.x = this._dialogBg.width / 4 * 1 - buttonWhatsappBg.width / 6;
		buttonWhatsappBg.y = this._dialogBg.height / 2 + 10;
		this._dialogBg.addChild(buttonWhatsappBg);

		var buttonWhatsapp = new ccui.Button(res.Button_whatsapp_normal_png, res.Button_whatsapp_pressed_png);
		buttonWhatsapp.x = buttonWhatsappBg.x;
		buttonWhatsapp.y = buttonWhatsappBg.y;
		buttonWhatsapp.addClickEventListener(function() {
			AudioManager.getInstance().play(res.ui_click_mp3_2, false, null);
			NativeHelper.callNative("shareWhatsapp", [WHATSAPP_SHARING_CAPTION, cc.formatStr(DYNAMIC_LINK, User.getCurrentUser().uid)]);
		});
		this._dialogBg.addChild(buttonWhatsapp);

		var buttonFacebookBg = new cc.Sprite(res.Button_background_png);
		buttonFacebookBg.x = this._dialogBg.width / 4 * 2;
		buttonFacebookBg.y = this._dialogBg.height / 2 + 10;
		this._dialogBg.addChild(buttonFacebookBg);

		var buttonFacebook = new ccui.Button(res.Button_facebook_normal_png, res.Button_facebook_pressed_png);
		buttonFacebook.x = buttonFacebookBg.x;
		buttonFacebook.y = buttonFacebookBg.y;
		buttonFacebook.addClickEventListener(function() {
			AudioManager.getInstance().play(res.ui_click_mp3_2, false, null);
	        NativeHelper.callNative("shareFacebook", [FACEBOOK_SHARING_TITLE, 
	                    FACEBOOK_SHARING_DESCRIPTION,
	                    cc.formatStr(DYNAMIC_LINK, User.getCurrentUser().uid)]);
		});
		this._dialogBg.addChild(buttonFacebook);

		var buttonNativeBg = new cc.Sprite(res.Button_background_png);
		buttonNativeBg.x = this._dialogBg.width / 4 * 3 + buttonWhatsappBg.width / 6;
		buttonNativeBg.y = this._dialogBg.height / 2 + 10;
		this._dialogBg.addChild(buttonNativeBg);

		var buttonNative = new ccui.Button(res.Button_more_normal_png, res.Button_more_pressed_png);
		buttonNative.x = buttonNativeBg.x;
		buttonNative.y = buttonNativeBg.y;
		buttonNative.addClickEventListener(function() {
			AudioManager.getInstance().play(res.ui_click_mp3_2, false, null);
			NativeHelper.callNative("shareNative", [NATIVE_SHARING_CAPTION, cc.formatStr(DYNAMIC_LINK, User.getCurrentUser().uid)]);
		});	
		this._dialogBg.addChild(buttonNative);

		var buttonClose = new ccui.Button(res.Button_x_normal_png, res.Button_x_pressed_png);
		buttonClose.x = this._dialogBg.width - buttonClose.width / 2;
		buttonClose.y = this._dialogBg.height - buttonClose.height / 2;
		buttonClose.addClickEventListener(function() {
			AudioManager.getInstance().play(res.ui_click_mp3_2, false, null);
			this.close();
		}.bind(this));	
		this._dialogBg.addChild(buttonClose);
	}
});
