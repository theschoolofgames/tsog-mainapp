var NewAccountLayer = cc.Layer.extend({
    _avatarScrollView: null,
    _passwordScrollView: null,
    _tf: null,
    _pickedAvatar: null,
    _pickedPassword: null,

    listener: null,

    ctor:function(){
        this._super();

        this._addBackGround();
        this._addNewAccountFormLayer();
        this._addBackBtn();

        Utils.showVersionLabel(this);
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
        
        var self = this;
        bb.addClickEventListener(function() {
            self._tf.didNotSelectSelf();
            cc.director.replaceScene(new AccountSelectorScene());
        });
        this.addChild(bb);
    },

    _addNewAccountFormLayer: function() {
        var holder = new cc.Layer();
        holder.x = -100;
        this.addChild(holder);

        font =  "hud-font.fnt";

        var lbName = new cc.LabelBMFont("Student Name", font);
        lbName.setAnchorPoint(1, 0.5);
        lbName.x = holder.width/2;
        lbName.y = holder.height/2 + 150;
        holder.addChild(lbName);

        var lbAvatar = new cc.LabelBMFont("Avatar", font);
        lbAvatar.setAnchorPoint(1, 0.5);
        lbAvatar.x = lbName.x;
        lbAvatar.y = holder.height/2 + 70;
        holder.addChild(lbAvatar);

        var lbPassword = new cc.LabelBMFont("Password", font);
        lbPassword.setAnchorPoint(1, 0.5);
        lbPassword.x = lbName.x;
        lbPassword.y = holder.height/2 - 30;
        holder.addChild(lbPassword);

        var fieldHolder = new cc.Sprite("#search_field.png");
        fieldHolder.setAnchorPoint(0, 0.5);
        fieldHolder.x = holder.width/2 + 50;
        fieldHolder.y = lbName.y - 5;

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

        var btn = new ccui.Button("create-btn.png","create-btn-pressed.png","",ccui.Widget.PLIST_TEXTURE);
        btn.x = fieldHolder.x;
        btn.y = lbPassword.y - btn.height*2;
        btn.setSwallowTouches(false);
        holder.addChild(btn);

        var self = this;

        btn.addClickEventListener(function() {
            self._tf.didNotSelectSelf();
            self._addNewAccount(self);
        });
    },

    _addNewAccount: function(self) {
        var newAccountName = self._tf.getString();
        if (newAccountName == null || newAccountName.trim() == ""){
            NativeHelper.callNative("showMessage", ["Missing field", "Please enter student name"]);
            return;
        }

        var loadingLayer = Utils.addLoadingIndicatorLayer(true);
        var userId = KVDatabase.getInstance().getString(STRING_USER_ID);
        
        RequestsManager.getInstance().createStudent(newAccountName, 
            userId,
            self._pickedAvatar.tag,
            self._pickedPassword.tag,
            function(succeed, data) {
                //Utils.removeLoadingIndicatorLayer();

                if (succeed) {
                    // var accountData = DataManager.getInstance().getAccountData(schoolId);
                    // accountData = accountData || [];
                    // accountData.unshift(data);

                    // var schoolConfig = DataManager.getInstance().getSchoolConfig(schoolId);

                    // SegmentHelper.identity(
                    //     data.user_id, 
                    //     data.name, 
                    //     schoolConfig.school_id, 
                    //     schoolConfig.school_name);
                    
                    // KVDatabase.getInstance().set(STRING_USER_ID, data.user_id);
                    // KVDatabase.getInstance().set(STRING_USER_NAME, data.name);
                    KVDatabase.getInstance().set(STRING_STUDENT_ID, data.student_id);
                    KVDatabase.getInstance().set(STRING_STUDENT_NAME, data.name);
                    
                    self._updateStudents(userId);

                    cc.director.replaceScene(new WelcomeScene());
                } else {
                    NativeHelper.callNative("showMessage", ["Error", data.message]);
                }
            });
    },

    // Get students and update in local storage
    _updateStudents: function(userId){
        RequestsManager.getInstance().getStudents(userId, function(succeed, data) {
            Utils.removeLoadingIndicatorLayer();
            
            if (succeed) {
                var _studentData = DataManager.getInstance().getStudentData(this._userId);
                _studentData = _studentData || [];
                
                if (JSON.stringify(_studentData) === JSON.stringify(data.students))
                    return;

                DataManager.getInstance().setStudentData(userId, data.students);
            }
        });
    },

    _createAvatarScrollView: function(fieldHolder){
        var self = this;
        this._avatarScrollView = new cc.ScrollView();
        this._avatarScrollView.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
        this._avatarScrollView.setTouchEnabled(true);

        this._avatarScrollView.x = fieldHolder.x - 50;
        this._avatarScrollView.y = fieldHolder.y - 140;

        this._avatarScrollView.setViewSize(cc.size(cc.winSize.width/2-10, 120));
        this._avatarScrollView.setClippingToBounds(true);
        this._avatarScrollView.setBounceable(true);

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: false,
            onTouchBegan: function(touch, event) { return true; }
        }, this._avatarScrollView);
    },

    _createPasswordScrollView: function(fieldHolder){
        var self = this;
        this._passwordScrollView = new cc.ScrollView();
        this._passwordScrollView.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);

        this._passwordScrollView.setTouchEnabled(true);

        this._passwordScrollView.x = fieldHolder.x - 50;
        this._passwordScrollView.y = fieldHolder.y - 250;

        this._passwordScrollView.setViewSize(cc.size(cc.winSize.width/2-10, 120));
        this._passwordScrollView.setClippingToBounds(true);
        this._passwordScrollView.setBounceable(true);
    },

    _createAvatarNode: function() {
        var avatarNode = new cc.Node();
        avatarNode.y = this._avatarScrollView.getViewSize().height/2;
        avatarNode.width = this._avatarScrollView.getViewSize().width/2;
        avatarNode.height = this._avatarScrollView.getViewSize().height/2;

        var innerWidth;
        var self = this;
        for ( var i = 0; i < 10; i++){
            var avatarBtn = new ccui.Button("avatar-"+ (i+1) + ".png", "", "", ccui.Widget.PLIST_TEXTURE);
            avatarBtn.x = avatarBtn.width + 110*i;
            avatarBtn.tag = (i+1);
            avatarBtn.setSwallowTouches(false);
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

            if (i == 0) {
                self._pickedAvatar = avatarBtn;
                avatarBtn.runAction(
                    cc.sequence(
                        cc.scaleTo(0.2, 0.8),
                        cc.scaleTo(0.4, 1.2).easing(cc.easeElasticOut(0.6))
                    )
                );
            }
            innerWidth = avatarBtn.width*i + cc.winSize.width/4;
        }
        this._avatarScrollView.setContentSize(cc.size(innerWidth, 120));
        this._avatarScrollView.addChild(avatarNode);
    },

    _createPassWordNode: function() {
        var passwordNode = new cc.Node();
        passwordNode.y = this._passwordScrollView.getViewSize().height/2;
        passwordNode.width = this._passwordScrollView.getViewSize().width/2;
        passwordNode.height = this._passwordScrollView.getViewSize().height/2;

        var self = this;
        for ( var i = 0; i < 10; i++){
            var passwordBtn = new ccui.Button("icon-"+ (i+1) + ".png", "", "", ccui.Widget.PLIST_TEXTURE);
            passwordBtn.x = passwordBtn.width*i*1.2 + passwordBtn.width;
            passwordBtn.tag = (i+1);
            passwordBtn.setSwallowTouches(false);
            passwordBtn.addClickEventListener(function(sender) {
                if (self._pickedPassword)
                    self._pickedPassword.scale = 1;
                
                self._pickedPassword = sender;
                self._pickedPassword.runAction(
                    cc.sequence(
                        cc.scaleTo(0.2, 0.8),
                        cc.scaleTo(0.4, 1.2).easing(cc.easeElasticOut(0.6))
                    )
                );
            });

            passwordNode.addChild(passwordBtn);

            if (i == 0) {
                self._pickedPassword = passwordBtn;
                passwordBtn.runAction(
                    cc.sequence(
                        cc.scaleTo(0.2, 0.8),
                        cc.scaleTo(0.4, 1.2).easing(cc.easeElasticOut(0.6))
                    )
                );
            }
            innerWidth = passwordBtn.width*i + cc.winSize.width/4;
        }
        this._passwordScrollView.setContentSize(cc.size(innerWidth, 120));
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