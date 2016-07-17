var LoginLayer = cc.Layer.extend({
    listener: null,

    ctor:function(){
        this._super();

        this._addBackGround();
        this._addNewAccount();
        this._addBackBtn();

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
        var lb = new cc.LabelBMFont("LOGIN", font);
        lb.setScale(0.7);
        lb.x = cc.winSize.width/2;
        lb.y = cc.winSize.height/2 + 1.25 * lb.height + 50;
        this.addChild(lb, 1);


        /*	Textfield username 	*/
        var fieldHolderUsername = new cc.Sprite("#search_field.png");
        fieldHolderUsername.x = holder.width/2;
        fieldHolderUsername.y = holder.height/2  + fieldHolderUsername.height;

        var tfUsername = new ccui.TextField("Username", "Arial", 26);
        tfUsername.x = fieldHolderUsername.width / 2;
        tfUsername.y = fieldHolderUsername.height / 2;
        tfUsername.setTextColor(cc.color.BLACK);
        tfUsername.setPlaceHolderColor(cc.color.WHITE);
        tfUsername.setTouchSize(cc.size(fieldHolderUsername.width, fieldHolderUsername.height));
        tfUsername.setTouchAreaEnabled(true);
        this.tfUsername = tfUsername;
        fieldHolderUsername.addChild(tfUsername);
        holder.addChild(fieldHolderUsername);
        this.tfUsername = tfUsername;


        /*	Textfield password	*/
        var fieldHolderPassword = new cc.Sprite("#search_field.png");
        fieldHolderPassword.x = holder.width/2;
        fieldHolderPassword.y = holder.height/2 - fieldHolderPassword.height * 0.3;

        var tfPassword = new ccui.TextField("Password", "Arial", 26);
        tfPassword.x = fieldHolderUsername.width / 2;
        tfPassword.y = fieldHolderUsername.height / 2;
        tfPassword.setTextColor(cc.color.BLACK);
        tfPassword.setPlaceHolderColor(cc.color.WHITE);
        tfPassword.setTouchSize(cc.size(fieldHolderUsername.width, fieldHolderUsername.height));
        tfPassword.setTouchAreaEnabled(true);
        tfPassword.setPasswordEnabled(true);
        this.tfPassword = tfPassword;
        fieldHolderPassword.addChild(tfPassword);
        holder.addChild(fieldHolderPassword);
        this.tfPassword = tfPassword;


        /* Button login 	*/
        var btn = new ccui.Button(res.BtnNormal_png, res.BtnPressed_png, "");
        btn.setScale(0.85);
        btn.x = holder.width/2 + btn.width  / 2;
        btn.y = holder.height/2 - btn.height * 2;
        holder.addChild(btn);

        var lbl = new cc.LabelTTF("LOGIN", "Arial", 26);
        lbl.x = btn.width / 2;
        lbl.y = btn.height / 2;
        btn.addChild(lbl);
        // var schoolData = DataManager.getInstance().getSchoolData();

        btn.addClickEventListener(function() {
            tfUsername.didNotSelectSelf();
            tfPassword.didNotSelectSelf();
            var username = tfUsername.getString();
            var password = tfPassword.getString();

            if (username == null || username.trim() == ""){
                NativeHelper.callNative("showMessage", ["Missing field", "Please enter username"]);
                return;
            }

            if (password == null){
                NativeHelper.callNative("showMessage", ["Missing field", "Please enter password"]);
                return;
            }

            var loadingLayer = Utils.addLoadingIndicatorLayer(true);

            RequestsManager.getInstance().login(username, password, function(succeed, data) {
                Utils.removeLoadingIndicatorLayer();

                if (succeed) {
                    this._addLoginSucceededDialog();
                } else {
                    NativeHelper.callNative("showMessage", ["Error", data ? data.message : "Cannot connect to server"]);
                }
            }.bind(this));
        }.bind(this));

        /*  Button create     */
        btn = new ccui.Button(res.BtnNormal_png, res.BtnPressed_png, "");
        btn.setScale(0.85);
        btn.x = holder.width/2 - btn.width / 2;
        btn.y = holder.height/2 - btn.height * 2;
        holder.addChild(btn);

        lbl = new cc.LabelTTF("CREATE", "Arial", 26);
        lbl.x = btn.width / 2;
        lbl.y = btn.height / 2;
        btn.addChild(lbl);

        btn.addClickEventListener(function() {
            this.tfUsername.didNotSelectSelf();
            this.tfPassword.didNotSelectSelf();
            cc.director.replaceScene(
                new cc.TransitionFade(1, new SignUpScene("LoginScene"), cc.color(255, 255, 255, 255))
            );
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
            this.tfPassword.didNotSelectSelf();
            cc.director.replaceScene(
                new MainScene()
            );

        }.bind(this));
        this.addChild(bb);
    },

    _addLoginSucceededDialog: function() {
        var dialog = new MessageDialog();

        var succeedLabel = new cc.LabelTTF("Login\nsuccessfully!", "Arial", 40);
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

var LoginScene = cc.Scene.extend({
    ctor: function(){
        this._super();

        var layer = new LoginLayer();
        this.addChild(layer);
    }
});