var SignUpLayer = cc.Layer.extend({
    listener: null,

    ctor:function(prevScene){
        this._super();

        this._addBackGround();
        this._addNewAccount();
        this._addBackBtn();
        this.prevScene = prevScene;
        Utils.showVersionLabel(this);
    },

    _addBackGround: function() {
        var bg = new cc.Sprite(res.Bg_school_jpg);
        bg.x = cc.winSize.width / 2;
        bg.y = cc.winSize.height / 2;
        this.addChild(bg);
    },

    _addNewAccount: function() {

    	/*	Background 	*/
        var holder = new cc.Sprite(res.CloudEmpty_png);
        holder.x = cc.winSize.width/2;
        holder.y = cc.winSize.height/2;
        this.addChild(holder);
        this.holder = holder;

        font =  res.YellowFont_fnt;

        var lb = new cc.LabelBMFont("CREATE ACCOUNT", font);
        lb.setScale(0.7);
        lb.x = cc.winSize.width/2;
        lb.y = cc.winSize.height/2 + 1.25 * lb.height + 50;
        this.addChild(lb, 1);


        /*	Textfield username 	*/
        var fieldHolderUsername = new cc.Sprite("#search_field.png");
        fieldHolderUsername.x = holder.width/2;
        fieldHolderUsername.y = holder.height/2 + 1.2 * fieldHolderUsername.height;

        var tfUsername = new ccui.TextField("Username", "Arial", 26);
        tfUsername.x = fieldHolderUsername.width / 2;
        tfUsername.y = fieldHolderUsername.height / 2;
        tfUsername.setTouchSize(cc.size(fieldHolderUsername.width, fieldHolderUsername.height));
        tfUsername.setTextColor(cc.color(127, 127, 127));
        tfUsername.setPlaceHolderColor(cc.color.WHITE);
        tfUsername.setTouchAreaEnabled(true);
        this.tfUsername = tfUsername;
        fieldHolderUsername.addChild(tfUsername);
        holder.addChild(fieldHolderUsername);
        this.tfUsername = tfUsername;

        tfUsername.addEventListener(function(listener, type) {
            if (type == ccui.TextField.EVENT_ATTACH_WITH_IME) {
                this.tfUsername.setTextColor(cc.color.BLACK);
                this.tfUsername.setPlaceHolder("");
                cc.director.getRunningScene().runAction(
                    cc.moveBy(KEYBOARD_ANIMATION_DURATION, 0, cc.winSize.height / 3)
                )
            } else if (type == ccui.TextField.EVENT_DETACH_WITH_IME) {
                this.tfUsername.setTextColor(cc.color(127, 127, 127));
                this.tfUsername.setPlaceHolder("Username");
                cc.director.getRunningScene().runAction(
                    cc.moveBy(KEYBOARD_ANIMATION_DURATION, 0, -cc.winSize.height / 3)
                )
            }
        }.bind(this), this);

        /*	Textfield password 1	*/
        var fieldHolderPassword1 = new cc.Sprite("#search_field.png");
        fieldHolderPassword1.x = holder.width/2;
        fieldHolderPassword1.y = holder.height/2 - 0.1 * fieldHolderUsername.height;

        var tfPassword1 = new ccui.TextField("Password", "Arial", 26);
        tfPassword1.x = fieldHolderUsername.width / 2;
        tfPassword1.y = fieldHolderUsername.height / 2;
        tfPassword1.setTouchSize(cc.size(fieldHolderUsername.width, fieldHolderUsername.height));
        tfPassword1.setTextColor(cc.color(127, 127, 127));
        tfPassword1.setPlaceHolderColor(cc.color.WHITE);
        tfPassword1.setTouchAreaEnabled(true);
        tfPassword1.setPasswordEnabled(true);
        this.tfPassword1 = tfPassword1;
        fieldHolderPassword1.addChild(tfPassword1);
        holder.addChild(fieldHolderPassword1);
        this.tfPassword1 = tfPassword1;

        tfPassword1.addEventListener(function(listener, type) {
            if (type == ccui.TextField.EVENT_ATTACH_WITH_IME) {
                this.tfPassword1.setTextColor(cc.color.BLACK);
                this.tfPassword1.setPlaceHolder("");
                cc.director.getRunningScene().runAction(
                    cc.moveBy(KEYBOARD_ANIMATION_DURATION, 0, cc.winSize.height / 3)
                )
            } else if (type == ccui.TextField.EVENT_DETACH_WITH_IME) {
                this.tfPassword1.setTextColor(cc.color(127, 127, 127));
                this.tfPassword1.setPlaceHolder("Password");
                cc.director.getRunningScene().runAction(
                    cc.moveBy(KEYBOARD_ANIMATION_DURATION, 0, -cc.winSize.height / 3)
                )
            }
        }.bind(this), this);  

        /*	Textfield password 2	*/
		var fieldHolderPassword2 = new cc.Sprite("#search_field.png");
        fieldHolderPassword2.x = holder.width/2
        fieldHolderPassword2.y = holder.height/2 - 1.4 * fieldHolderUsername.height;

        var tfPassword2 = new ccui.TextField("Confirm password", "Arial", 26);
        tfPassword2.x = fieldHolderPassword2.width / 2;
        tfPassword2.y = fieldHolderPassword2.height / 2;
        tfPassword2.setTouchSize(cc.size(fieldHolderPassword2.width, fieldHolderPassword2.height));
        tfPassword2.setTextColor(cc.color(127, 127, 127));
        tfPassword2.setPlaceHolderColor(cc.color.WHITE);
        tfPassword2.setTouchAreaEnabled(true);
        tfPassword2.setPasswordEnabled(true);
        this.tfPassword2 = tfPassword2;
        fieldHolderPassword2.addChild(tfPassword2);
        holder.addChild(fieldHolderPassword2);
        this.tfPassword2 = tfPassword2;

        tfPassword2.addEventListener(function(listener, type) {
            if (type == ccui.TextField.EVENT_ATTACH_WITH_IME) {
                this.tfPassword2.setTextColor(cc.color.BLACK);
                this.tfPassword2.setPlaceHolder("");
                cc.director.getRunningScene().runAction(
                    cc.moveBy(KEYBOARD_ANIMATION_DURATION, 0, cc.winSize.height / 3)
                )
            } else if (type == ccui.TextField.EVENT_DETACH_WITH_IME) {
                this.tfPassword2.setTextColor(cc.color(127, 127, 127));
                this.tfPassword2.setPlaceHolder("Password");
                cc.director.getRunningScene().runAction(
                    cc.moveBy(KEYBOARD_ANIMATION_DURATION, 0, -cc.winSize.height / 3)
                )
            }
        }.bind(this), this);  

        /* Button create 	*/
        var btn = new ccui.Button(res.BtnNormal_png, res.BtnPressed_png, "");
        btn.x = holder.width/2;
        btn.y = holder.height/2 - btn.height * 2.5;
        holder.addChild(btn);

        lbl = new cc.LabelTTF("CREATE", "Arial", 26);
        lbl.x = btn.width / 2;
        lbl.y = btn.height / 2;
        btn.addChild(lbl);

        btn.addClickEventListener(function() {
            tfUsername.didNotSelectSelf();
            tfPassword1.didNotSelectSelf();
            tfPassword2.didNotSelectSelf();
            var username = tfUsername.getString();
            var password1 = tfPassword1.getString();
            var password2 = tfPassword2.getString();

            if (username == null || username.trim() == ""){
                NativeHelper.callNative("showMessage", ["Missing field", "Please enter username"]);
                return;
            }

            if (password1 == null){
                NativeHelper.callNative("showMessage", ["Missing field", "Please enter password"]);
                return;
            }

            if (password1.length < 6) {
                NativeHelper.callNative("showMessage", ["Invalid password", "Password cannot be shorter than 6 characters"]);
                return;                
            }

            if (password2 == null){
                NativeHelper.callNative("showMessage", ["Missing field", "Please confirm password"]);
                return;
            }

            if (password1 != password2){
                NativeHelper.callNative("showMessage", ["Error", "Passwords do not match"]);
                return;
            }

            var loadingLayer = Utils.addLoadingIndicatorLayer(true);

            RequestsManager.getInstance().createAccount(username, password1, function(succeed, data) {
                Utils.removeLoadingIndicatorLayer();

                if (succeed) {
                    this._addCreateSucceededDialog();
                } else {
                    NativeHelper.callNative("showMessage", ["Error", data ? data.message : "Cannot connect to server"]);
                }
            }.bind(this));
        }.bind(this));
    },

    _addBackBtn: function() {
        var bb = new ccui.Button("back.png",
                                 "back-pressed.png",
                                 "",
                                 ccui.Widget.PLIST_TEXTURE);

        bb.x = bb.width ;
        bb.y = cc.winSize.height - bb.height*2/3;

        bb.addClickEventListener(function() {
            this.tfUsername.didNotSelectSelf();
            this.tfPassword1.didNotSelectSelf();
            this.tfPassword2.didNotSelectSelf();

            if (this.prevScene == "MainScene") {
                cc.director.replaceScene(
                    new cc.TransitionFade(1, new MainScene(), cc.color(255, 255, 255, 255))
                );                
            } else if (this.prevScene == "LoginScene") {
                cc.director.replaceScene(
                    new cc.TransitionFade(1, new LoginScene(), cc.color(255, 255, 255, 255))
                );
            }
        }.bind(this));
        this.addChild(bb);
    },

    _addCreateSucceededDialog: function() {
        var dialog = new MessageDialog();

        var succeedLabel = new cc.LabelTTF("Account created\nsuccessfully!", "Arial", 36);
        succeedLabel.setFontFillColor(cc.color.BLACK);
        succeedLabel.setHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        succeedLabel.x = dialog.background.width / 2;
        succeedLabel.y = dialog.background.height / 2;
        dialog.addComponent(succeedLabel);

        btn = new ccui.Button(res.BtnNormal_png, res.BtnPressed_png, "");
        btn.x = dialog.background.width / 2;
        btn.y = succeedLabel.y - succeedLabel.height;
        btn.addClickEventListener(function() {
            cc.director.replaceScene(
                new cc.TransitionFade(1, new RoomScene(), cc.color(255, 255, 255, 255))
            );
        });

        lbl = new cc.LabelTTF("PLAY", "Arial", 26);
        lbl.x = btn.width / 2;
        lbl.y = btn.height / 2;
        btn.addChild(lbl);

        dialog.addComponent(btn);

        this.addChild(dialog, 2);
    }
});

var SignUpScene = cc.Scene.extend({
    ctor: function(prevScene){
        this._super();

        var layer = new SignUpLayer(prevScene);
        this.addChild(layer);
    }
});