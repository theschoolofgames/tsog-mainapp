var ShareDialog = Dialog.extend({
	_dialogBg: null,
	_context: null,

	ctor: function(context) {
		this._super(cc.color(0, 0, 0, 200));
		this._addDialogBg();
		this._addTitle();
		this._addButtons();
		this._context = context;
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
		var buttonClose = new ccui.Button(res.Button_x_normal_png, res.Button_x_pressed_png);
		buttonClose.x = this._dialogBg.width - buttonClose.width / 2;
		buttonClose.y = this._dialogBg.height - buttonClose.height / 2;
		buttonClose.addClickEventListener(function() {
			AudioManager.getInstance().play(res.ui_click_mp3_2, false, null);
			this.close();
		}.bind(this));	
		this._dialogBg.addChild(buttonClose);

		var countryCode = NativeHelper.callNative("getCountryCode");
		debugLog("countryCode: " + countryCode);
		var options;
		if (SHARING_OPTIONS[countryCode]) {
			options = SHARING_OPTIONS[countryCode].split(",");
		} else {
			options = SHARING_OPTIONS['default'].split(",");
		}

		for (var i = 0; i < 2; i++) {
			if (options[i] == "facebook") {
				this.createShareButton(res.Button_facebook_normal_png, res.Button_facebook_pressed_png,
										i + 1, function() {
									        NativeHelper.callNative("shareFacebook", 
									        	[
									        		FACEBOOK_SHARING_TITLE, 
							                    	FACEBOOK_SHARING_DESCRIPTION,
							                    	cc.formatStr(DYNAMIC_LINK, User.getCurrentUser().uid)
							                    ]
											);
											AnalyticsManager.getInstance().logEventShare(this._context, "Facebook");
										}.bind(this));
			} else if (options[i] == "twitter") {
				this.createShareButton(res.Button_twitter_normal_png, res.Button_twitter_pressed_png,
										i + 1, function() {
								        	NativeHelper.callNative("shareTwitter", 
								        		[
								        			TWITTER_SHARING_DESCRIPTION, 
	                    							cc.formatStr(DYNAMIC_LINK, User.getCurrentUser().uid)
	                    						]
	                    					);
	                    					AnalyticsManager.getInstance().logEventShare(this._context, "Twitter");
										}.bind(this));
			} else if (options[i] == "whatsapp") {
				this.createShareButton(res.Button_whatsapp_normal_png, res.Button_whatsapp_pressed_png,
										i + 1, function() {
											NativeHelper.callNative("shareWhatsapp", 
												[
													WHATSAPP_SHARING_DESCRIPTION, 
													cc.formatStr(DYNAMIC_LINK, User.getCurrentUser().uid)
												]
											);
											AnalyticsManager.getInstance().logEventShare(this._context, "Whatsapp");
										}.bind(this));
			}
		}
		this.createShareButton(res.Button_more_normal_png, res.Button_more_pressed_png,
								3, function() {
									NativeHelper.callNative("shareNative", 
										[
											NATIVE_SHARING_DESCRIPTION, 
											cc.formatStr(DYNAMIC_LINK, User.getCurrentUser().uid)
										]
									);
									AnalyticsManager.getInstance().logEventShare(this._context, "Native");
								}.bind(this));
	},

	//create share button #i (i = 1, 2,...)
	createShareButton: function(buttonNormal, buttonPressed, index, onClick) {
		var bg = new cc.Sprite(res.Button_background_png);
		bg.x = this._dialogBg.width / 4 * index + (index - 2) * bg.width / 6;
		bg.y = this._dialogBg.height / 2 + 10;
		this._dialogBg.addChild(bg);

		var button = new ccui.Button(buttonNormal, buttonPressed);
		button.x = bg.x;
		button.y = bg.y;
		button.addClickEventListener(onClick);
		this._dialogBg.addChild(button);
	}
});
