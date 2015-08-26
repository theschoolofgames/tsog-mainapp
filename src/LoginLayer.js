var LoginLayer = cc.Layer.extend({
    _passwordList: [],
    _scrollView: null,
    accountClicked: null,
    _passwordField: null,
    _passwordList: [0, 1, 2, 3, 4, 5, 6],
    _passwordArea: null,
    _passwordClickedBefore: null,
    _originPos: null,

    ctor: function (account) {
        this._super();

        this.accountClicked = account;

        this.createAccountImage();
        this.createPasswordField();
        this.createPasswordList();
        this.createScrollView();
        this.addBackButton();
    },

    createAccountImage: function() {
        var s = ACCOUNT_INFO[this.accountClicked].sex;
        var acc;
        if (s === 0)
            acc = new ccui.Button("female-avt.png", "", "", ccui.Widget.PLIST_TEXTURE);
        else
            acc = new ccui.Button("male-avt.png", "", "", ccui.Widget.PLIST_TEXTURE);

        acc.x = cc.winSize.width / 3;
        acc.y = cc.winSize.height / 2 + acc.height /2;

        this.createAccountNameLabel(this.accountClicked, acc);
        this.addChild(acc);
    },

    createAccountNameLabel: function(index, button) {
        var name = ACCOUNT_INFO[index].name;
        var lb = new cc.LabelTTF(name, "Arial", 24);
        lb.x = button.width / 2;
        lb.y = button.height / 8 + lb.height/2;
        button.addChild(lb);
    },

    createPasswordField: function() {
        var f = new cc.Sprite("#password-field.png");
        f.x = cc.winSize.width / 2;
        f.y = cc.winSize.height / 2;

        this._passwordField = f;
        this.addChild(this._passwordField);

    },

    createPasswordList: function() {
        this.createPasswordArea();
        for ( var i = 0; i < this._passwordList.length; i++) {
            var pwImage = this.createNewPassWordImage(i);
            this._passwordArea.width = pwImage.x;
            this._passwordArea.height = pwImage.y + pwImage.height;
            this._passwordArea.x = 0;
            this._passwordArea.y = this._passwordArea.height / 2;
            this._passwordArea.addChild(pwImage);
        }
    },

    createNewPassWordImage: function(i){
        var self = this;
        var pwImage = new ccui.Button();

        pwImage.loadTextureNormal("password-img.png", ccui.Widget.PLIST_TEXTURE);
        pwImage.x = pwImage.width + (pwImage.width*2)* i;
        pwImage.y = pwImage.height;
        pwImage.tag = i;
        pwImage.setSwallowTouches(false);
        pwImage.addClickEventListener(function() {self.onPasswordClicked(this)});

        return pwImage;
    },

    onPasswordClicked: function(password) {
        if (this._passwordClickedBefore) {
            var pw = this.createNewPassWordImage(this._passwordClickedBefore.tag);
            this._passwordArea.addChild(pw);
        }

        this._passwordClickedBefore = password;
        password.removeFromParent();
        this._passwordClickedBefore.setPosition(this._passwordField.width / 2, this._passwordField.height /2);
        this._passwordField.addChild(this._passwordClickedBefore);
    },

    setPassWordImageVisible: function(pwImg, visible){
        pwImg.setVisible(visible);
    },

    createPasswordArea: function() {
        var area = new cc.Sprite();
        area.setAnchorPoint(0, 0.5);
        this._passwordArea = area;
    },

    addBackButton: function() {
        var self = this;
        var b = new ccui.Button("back-button.png", "", "", ccui.Widget.PLIST_TEXTURE);
        b.x = b.width / 2;
        b.y = cc.winSize.height - b.height / 2;
        this.addChild(b);

        b.addClickEventListener(function() {
            self.parent.addNewLayer(self, "accLayer");
        });

    },

    createScrollView: function(){
        var self = this;
        this._scrollView = new ccui.ScrollView();
        this._scrollView.setDirection(ccui.ScrollView.DIR_HORIZONTAL);
        this._scrollView.setTouchEnabled(true);
        this._scrollView.setContentSize(cc.size(cc.winSize.width, cc.winSize.height));

        var scrollViewRect = this._scrollView.getContentSize();

        this._scrollView.x = 0;
        this._scrollView.y = 0;
        self.addChild(this._scrollView);

        var innerWidth = this._passwordArea.width + 100;
        var innerHeight = cc.winSize.height/2 - this._passwordField.height;
        this._scrollView.setInnerContainerSize(cc.size(innerWidth, innerHeight));

        this._scrollView.addChild(this._passwordArea);

        cc.log("innerWidth: " + innerWidth);
        cc.log("innerHeight: " + innerHeight);
        cc.log("contentsize: " + JSON.stringify(this._scrollView.getContentSize()));
    },
});