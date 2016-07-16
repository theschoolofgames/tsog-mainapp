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
        holder.y = cc.winSize.height/2 + 100;
        this.addChild(holder);
        this.holder = holder;

        font =  res.YellowFont_fnt;
        var lb = new cc.LabelBMFont("LOGIN", font);
        lb.setScale(0.5);
        lb.x = cc.winSize.width/2;
        lb.y = cc.winSize.height/2 + lb.height + 100;
        this.addChild(lb, 1);


        /*	Textfield username 	*/
        var fieldHolderUsername = new cc.Sprite("#search_field.png");
        fieldHolderUsername.x = holder.width/2;
        fieldHolderUsername.y = holder.height/2  + fieldHolderUsername.height * 0.25;

        var tfUsername = new ccui.TextField("Your Username", "Arial", 26);
        tfUsername.x = fieldHolderUsername.width / 2;
        tfUsername.y = fieldHolderUsername.height / 2;
        tfUsername.setTouchSize(cc.size(fieldHolderUsername.width, fieldHolderUsername.height));
        tfUsername.color = cc.color.YELLOW;
        tfUsername.setTouchAreaEnabled(true);
        this.tfUsername = tfUsername;
        fieldHolderUsername.addChild(tfUsername);
        holder.addChild(fieldHolderUsername);


        /*	Textfield password	*/
        var fieldHolderPassword = new cc.Sprite("#search_field.png");
        fieldHolderPassword.x = holder.width/2;
        fieldHolderPassword.y = holder.height/2 - fieldHolderPassword.height * 0.75;

        var tfPassword = new ccui.TextField("Your Password", "Arial", 26);
        tfPassword.x = fieldHolderUsername.width / 2;
        tfPassword.y = fieldHolderUsername.height / 2;
        tfPassword.setTouchSize(cc.size(fieldHolderUsername.width, fieldHolderUsername.height));
        tfPassword.color = cc.color.YELLOW;
        tfPassword.setTouchAreaEnabled(true);
        tfPassword.setPasswordEnabled(true);
        this.tfPassword = tfPassword;
        fieldHolderPassword.addChild(tfPassword);
        holder.addChild(fieldHolderPassword);


        /* Button create 	*/
        var btn = new ccui.Button("create-btn.png","create-btn-pressed.png","", ccui.Widget.PLIST_TEXTURE);
        btn.x = holder.width/2;
        btn.y = holder.height/2 - btn.height * 1.5;
        holder.addChild(btn);

        var self = this;
        var schoolData = DataManager.getInstance().getSchoolData();

        btn.addClickEventListener(function() {
            tfUsername.didNotSelectSelf();
            tfPassword.didNotSelectSelf();
            var username = tfUsername.getString();
            var password = tfPassword.getString();

            if (username == null || username.trim() == ""){
                NativeHelper.callNative("showMessage", ["Missing field", "Please enter username"]);
                return;
            }

            if (password == null || password.trim() == ""){
                NativeHelper.callNative("showMessage", ["Missing field", "Please enter password"]);
                return;
            }

            var loadingLayer = Utils.addLoadingIndicatorLayer(true);

            RequestsManager.getInstance().login(username, password, function(succeed, data) {
                Utils.removeLoadingIndicatorLayer();

                if (succeed) {
                    // schoolData.unshift(data);
                    // DataManager.getInstance().setSchoolData(schoolData);
                    
                    // SegmentHelper.track(SEGMENT.SELECT_SCHOOL, 
                    //     { 
                    //         school_id: data.school_id, 
                    //         school_name: data.school_name 
                    //     });
                    
                    // KVDatabase.getInstance().set(STRING_SCHOOL_ID, data.school_id);
                    // KVDatabase.getInstance().set(STRING_SCHOOL_NAME, data.school_name);
                    // tf.didNotSelectSelf();
                    // cc.director.replaceScene(new AccountSelectorScene());

                    // NativeHelper.callNative("showMessage", ["Created school successfully!", "Now you can create students for your new school"]);
                    KVDatabase.getInstance().set(STRING_USER_ACCESS_TOKEN, data["access_token"]);
                    cc.log("test saved: " + KVDatabase.getInstance().getString(STRING_USER_ACCESS_TOKEN));
                    
                    this.holder.removeAllChildren();
                    var succeedLabel = new cc.LabelTTF("Login successfully!", "Arial", 40);
                    succeedLabel.setFontFillColor(cc.color.BLACK);
                    succeedLabel.setHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
                    succeedLabel.x = this.holder.width / 2;
                    succeedLabel.y = this.holder.height / 2 - succeedLabel.height / 2;
                    this.holder.addChild(succeedLabel);
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

        var self = this;
        bb.addClickEventListener(function() {
            // self._tf.didNotSelectSelf();
            // cc.director.replaceScene(new CreateAccountLayer());
        });
        this.addChild(bb);
    },
});

var LoginScene = cc.Scene.extend({
    ctor: function(){
        this._super();

        var layer = new LoginLayer();
        this.addChild(layer);
    }
});