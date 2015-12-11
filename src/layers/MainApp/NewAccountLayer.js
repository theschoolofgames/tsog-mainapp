var NewAccountLayer = cc.Layer.extend({
    _avatarScrollView: null,
    _passwordScrollView: null,
    _tf: null,
    _pickedAvatar: null,
    _pickePassword: null,

    listener: null,

    ctor:function(){
        this._super();

        this._addBackGround();
        this._addNewAccountFormLayer();
        this._addBackBtn();
    },

    _addAvatar: function(avatarID, parent) {
        var avatar = new cc.Sprite("#avatar-" + avatarID + ".png");
        avatar.setPosition(cc.p(parent.width/2, parent.height/2 + 10));
        parent.addChild(avatar);
    },

    _addBackGround: function() {
        var bg = new cc.Sprite(res.Bg_account_jpg);
        bg.x = cc.winSize.width / 2;
        bg.y = cc.winSize.height / 2;
        this.addChild(bg);

        var ground, bush;
        var groundNode = new cc.Node();

        for ( var i = 0; i < 3; i++) {
            ground = new cc.Sprite("#Mainground.png");
            ground.setAnchorPoint(0, 0);
            ground.x = (i-1) * (ground.width/2 - 5);
            ground.y = -ground.height/2;
            ground.flippedX = (i-1)%2 == 0;

            groundNode.addChild(ground, 3);
        }

        this.addChild(groundNode);

        var bushNode = new cc.Node();

        for (var i = 0; i < 3; i++) {
            bush = new cc.Sprite("#grass.png");
            bush.setAnchorPoint(0,0);
            bush.x = (i-1) * (bush.width - 3);
            bush.y = ground.y + bush.height - 20;
            bush.flippedX = (i-1)%2 == 0;
            bushNode.addChild(bush, -1);
        }

        this.addChild(bushNode);
    },

    _addBackBtn: function() {
        var bb = new ccui.Button("back.png",
                                 "back-pressed.png",
                                 "",
                                 ccui.Widget.PLIST_TEXTURE);

        bb.x = bb.width ;
        bb.y = cc.winSize.height - bb.height*2/3;
        bb.addClickEventListener(function() {
            cc.director.replaceScene(new AccountSelectorScene());
        });
        this.addChild(bb);
    },

    _addNewAccountFormLayer: function() {
        var holder = new cc.Layer();
        holder.x = -100;
        this.addChild(holder);

        var lbName = new cc.LabelTTF("Student Name", "Arial", 32);
        lbName.color = cc.color.ORANGE;
        lbName.x = holder.width/2 - 200;
        lbName.y = holder.height/2 + 150;
        holder.addChild(lbName);

        var lbAvatar = new cc.LabelTTF("Avatar", "Arial", 32);
        lbAvatar.setAnchorPoint(0, 0.5);
        lbAvatar.color = cc.color.ORANGE;
        lbAvatar.x = lbName.x - lbName.width/2;
        lbAvatar.y = holder.height/2 + 100;
        holder.addChild(lbAvatar);

        var lbPassword = new cc.LabelTTF("Password", "Arial", 32);
        lbPassword.setAnchorPoint(0, 0.5);
        lbPassword.color = cc.color.ORANGE;
        lbPassword.x = lbName.x - lbName.width/2;
        lbPassword.y = holder.height/2;
        holder.addChild(lbPassword);

        var fieldHolder = new cc.Sprite("#search_field.png");
        fieldHolder.x = holder.width/2 + fieldHolder.width/2;
        fieldHolder.y = lbName.y;

        this._tf = new ccui.TextField("Your Name Here", "Arial", 26);

        this._tf.x = fieldHolder.width / 2;
        this._tf.y = fieldHolder.height / 2;

        this._tf.setTextColor(cc.color.GREEN);
        this._tf.setTouchSize(cc.size(fieldHolder.width, fieldHolder.height));
        this._tf.color = cc.color.RED;
        this._tf.setTouchAreaEnabled(true);
        fieldHolder.addChild(this._tf);
        holder.addChild(fieldHolder);

        this._createAvatarScrollView(fieldHolder);
        this._createPasswordScrollView(fieldHolder);

        holder.addChild(this._avatarScrollView);
        holder.addChild(this._passwordScrollView);

        this._createAvatarNode();
        this._createPassWordNode();

        var btn = new ccui.Button("create-button.png","","");
        btn.x = holder.width/2;
        btn.y = holder.height/2 - btn.height*2;
        holder.addChild(btn);

        var self = this;
        var schoolData = DataManager.getInstance().getSchoolData();

        btn.addClickEventListener(function() {
            self._addNewAccount(self);
        });
    },

    _addNewAccount: function(self) {
        var newAccountName = self._tf.getString();
        if (newAccountName == null || newAccountName.trim() == ""){
            NativeHelper.callNative("showMessage", ["Missing field", "Please enter school name"]);
            return;
        }

        var loadingLayer = Utils.addLoadingIndicatorLayer(true);
        /*
            create new account with 
            name : newAccountName
            avatar: self._pickedAvatar
            password: self._pickedPassword
        */
        var testingUserData = {
            name: newAccountName, 
            avatar: {
                hair_id: self._pickedAvatar.tag
            }, 
            password: self._pickePassword.tag
        }
        cc.log("testingUserData: " + JSON.stringify(testingUserData));
        cc.director.replaceScene(new AccountSelectorScene(testingUserData));

        // RequestsManager.getInstance().createSchool(newSchoolName.trim(), function(succeed, data) {
        //     Utils.removeLoadingIndicatorLayer();

        //     if (succeed) {
        //         schoolData.unshift(data);
        //         DataManager.getInstance().setSchoolData(schoolData);
                
        //         SegmentHelper.track(SEGMENT.SELECT_SCHOOL, 
        //             { 
        //                 school_id: data.school_id, 
        //                 school_name: data.school_name 
        //             });
                
        //         KVDatabase.getInstance().set(STRING_SCHOOL_ID, data.school_id);
        //         KVDatabase.getInstance().set(STRING_SCHOOL_NAME, data.school_name);
        //         cc.director.replaceScene(new AccountSelectorScene());

        //         NativeHelper.callNative("showMessage", ["Created school successfully!", "Now you can create students for your new school"]);
        //     } else {
        //         NativeHelper.callNative("showMessage", ["Error", data.message]);
        //     }
        // });
    },

    _createAvatarScrollView: function(fieldHolder){
        var self = this;
        this._avatarScrollView = new cc.ScrollView();
        this._avatarScrollView.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
        this._avatarScrollView.setTouchEnabled(true);

        this._avatarScrollView.x = fieldHolder.x - fieldHolder.width/2;
        this._avatarScrollView.y = fieldHolder.y - 140;

        this._avatarScrollView.setViewSize(cc.size(cc.winSize.width, 120));
        this._avatarScrollView.setClippingToBounds(false);
        this._avatarScrollView.setBounceable(true);

        // var avatarData = DataManager.getInstance().getAccountData(this._schoolId);
        var avatarData = 6;

        var innerWidth = avatarData / 6 * cc.winSize.width/2;
        var innerHeight = cc.winSize.height;
        this._avatarScrollView.setContentSize(cc.size(innerWidth, innerHeight));

        // var layer = new cc.LayerColor(cc.color.RED);
        // layer.width = this._avatarScrollView.getViewSize().width;
        // layer.height = this._avatarScrollView.getViewSize().height;
        // this._avatarScrollView.addChild(layer);

    },

    _createPasswordScrollView: function(fieldHolder){
        var self = this;
        this._passwordScrollView = new cc.ScrollView();
        this._passwordScrollView.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);

        this._passwordScrollView.setTouchEnabled(true);

        this._passwordScrollView.x = fieldHolder.x - fieldHolder.width/2;
        this._passwordScrollView.y = fieldHolder.y - 250;

        this._passwordScrollView.setViewSize(cc.size(cc.winSize.width, 120));
        this._passwordScrollView.setClippingToBounds(false);
        this._passwordScrollView.setBounceable(true);

        var passwordData = 6;

        var innerWidth = passwordData / 6 * cc.winSize.width/2;
        var innerHeight = cc.winSize.height;
        this._passwordScrollView.setContentSize(cc.size(innerWidth, innerHeight));

        // var layer = new cc.LayerColor(cc.color.RED);
        // layer.width = this._passwordScrollView.getViewSize().width;
        // layer.height = this._passwordScrollView.getViewSize().height;
        // this._passwordScrollView.addChild(layer);
    },

    _createAvatarNode: function() {
        var avatarNode = new cc.Node();
        avatarNode.y = this._avatarScrollView.getViewSize().height/2;

        var self = this;
        for ( var i = 0; i < 3; i++){
            var avatarBtn = new ccui.Button("avatar-"+ (i+1) + ".png", "", "", ccui.Widget.PLIST_TEXTURE);
            avatarBtn.x = avatarBtn.width*i*1.2 + avatarBtn.width;
            avatarBtn.tag = (i+1);
            avatarBtn.addClickEventListener(function(sender) {
                if (self._pickedAvatar)
                    self._pickedAvatar.scale = 1;

                self._pickedAvatar = sender;
                self._pickedAvatar.runAction(
                    cc.sequence(
                        cc.scaleTo(0.2, 0.8),
                        cc.scaleTo(0.4, 1.2).easing(cc.easeElasticOut(0.6))
                    )
                );
            });

            avatarNode.addChild(avatarBtn);
        }
        this._avatarScrollView.addChild(avatarNode);
    },

    _createPassWordNode: function() {
        var passwordNode = new cc.Node();
        passwordNode.y = this._passwordScrollView.getViewSize().height/2;

        var self = this;
        for ( var i = 0; i < 5; i++){
            var passwordBtn = new ccui.Button("icon-"+ (i+1) + ".png", "", "", ccui.Widget.PLIST_TEXTURE);
            passwordBtn.x = passwordBtn.width*i*1.2 + passwordBtn.width;
            passwordBtn.tag = (i+1);

            passwordBtn.addClickEventListener(function(sender) {
                if (self._pickePassword)
                    self._pickePassword.scale = 1;
                
                self._pickePassword = sender;
                self._pickePassword.runAction(
                    cc.sequence(
                        cc.scaleTo(0.2, 0.8),
                        cc.scaleTo(0.4, 1.2).easing(cc.easeElasticOut(0.6))
                    )
                );
            });

            passwordNode.addChild(passwordBtn);
        }
        this._passwordScrollView.addChild(passwordNode);
    },
});

var NewAccountScene = cc.Scene.extend({
    ctor: function(){
        this._super();

        var layer = new NewAccountLayer();
        this.addChild(layer);
    }
});