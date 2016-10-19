var CreateAccountLayer = cc.Layer.extend({
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

        var lb = new cc.LabelBMFont("CREATE ACCOUNT", font);
        lb.setScale(0.5);
        lb.x = cc.winSize.width/2;
        lb.y = cc.winSize.height/2 + 1.25 * lb.height + 100;
        this.addChild(lb, 1);


        /*	Textfield username 	*/
        var fieldHolderUsername = new cc.Sprite("#search_field.png");
        fieldHolderUsername.x = holder.width/2;
        fieldHolderUsername.y = holder.height/2 + fieldHolderUsername.height * 0.5;

        var tfUsername = new ccui.TextField("Your Username", "Arial", 26);
        tfUsername.x = fieldHolderUsername.width / 2;
        tfUsername.y = fieldHolderUsername.height / 2;
        tfUsername.setTouchSize(cc.size(fieldHolderUsername.width, fieldHolderUsername.height));
        tfUsername.color = cc.color.YELLOW;
        tfUsername.setTouchAreaEnabled(true);
        tfUsername.setMaxLengthEnabled(true);
        tfUsername.setMaxLength(20);
        this.tfUsername = tfUsername;
        fieldHolderUsername.addChild(tfUsername);
        holder.addChild(fieldHolderUsername);


        /*	Textfield password 1	*/
        var fieldHolderPassword1 = new cc.Sprite("#search_field.png");
        fieldHolderPassword1.x = holder.width/2;
        fieldHolderPassword1.y = holder.height/2 - fieldHolderPassword1.height * 0.5;

        var tfPassword1 = new ccui.TextField("Your Password", "Arial", 26);
        tfPassword1.x = fieldHolderUsername.width / 2;
        tfPassword1.y = fieldHolderUsername.height / 2;
        tfPassword1.setTouchSize(cc.size(fieldHolderUsername.width, fieldHolderUsername.height));
        tfPassword1.color = cc.color.YELLOW;
        tfPassword1.setTouchAreaEnabled(true);
        tfPassword1.setPasswordEnabled(true);
        tfPassword1.setMaxLengthEnabled(true);
        tfPassword1.setMaxLength(20);
        this.tfPassword1 = tfPassword1;
        fieldHolderPassword1.addChild(tfPassword1);
        holder.addChild(fieldHolderPassword1);


        /*	Textfield password 2	*/
		var fieldHolderPassword2 = new cc.Sprite("#search_field.png");
        fieldHolderPassword2.x = holder.width/2;
        fieldHolderPassword2.y = holder.height/2 - fieldHolderPassword2.height * 1.5;
        var tfPassword2 = new ccui.TextField("Confirm Your Password", "Arial", 26);
        tfPassword2.x = fieldHolderPassword2.width / 2;
        tfPassword2.y = fieldHolderPassword2.height / 2;
        
        tfPassword2.setTouchSize(cc.size(fieldHolderPassword2.width, fieldHolderPassword2.height));
        tfPassword2.color = cc.color.YELLOW;
        tfPassword2.setTouchAreaEnabled(true);
        tfPassword2.setPasswordEnabled(true);
        tfPassword2.setMaxLengthEnabled(true);
        tfPassword2.setMaxLength(20);
        this.tfPassword2 = tfPassword2;
        fieldHolderPassword2.addChild(tfPassword2);
        holder.addChild(fieldHolderPassword2);


        /* Button create 	*/
        var btn = new ccui.Button("create-btn.png","create-btn-pressed.png","", ccui.Widget.PLIST_TEXTURE);
        btn.x = holder.width/2;
        btn.y = holder.height/2 - btn.height * 2.25;
        holder.addChild(btn);

        var self = this;
        var schoolData = DataManager.getInstance().getSchoolData();

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

            if (password1 == null || password1.trim() == ""){
                NativeHelper.callNative("showMessage", ["Missing field", "Please enter password"]);
                return;
            }

            if (password2 == null || password2.trim() == ""){
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

                    KVDatabase.getInstance().set(STRING_USER_ACCESS_TOKEN, data["access_token"]);
                    cc.log("test saved: " + KVDatabase.getInstance().getString(STRING_USER_ACCESS_TOKEN));
                    
                    this.holder.removeAllChildren();
                    var succeedLabel = new cc.LabelTTF("Account created\nsuccessfully!", "Arial", 40);
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

var CreateAccountScene = cc.Scene.extend({
    ctor: function(){
        this._super();

        var layer = new CreateAccountLayer();
        this.addChild(layer);
    }
});