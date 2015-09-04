var treePositions = [
    { x = 50, hintImageId = 1, hintOffsetX = 50, hintOffsetY = 100 },
    { x = 50, hintImageId = 1, hintOffsetX = 50, hintOffsetY = 100 },
    { x = 50, hintImageId = 2, hintOffsetX = 50, hintOffsetY = 100 },
    { x = 50, hintImageId = 3, hintOffsetX = 50, hintOffsetY = 100 },
    { x = 50, hintImageId = 3, hintOffsetX = 50, hintOffsetY = 100 },
    { x = 50, hintImageId = 4, hintOffsetX = 50, hintOffsetY = 100 },
];

var AccountSelectorLayer = cc.Layer.extend({
    accountBtn: [],
    school: null,
    accountHolder: null,
    _scrollView: null,
    backButton: null,


    ctor: function () {
        this._super();
        this.resetAllChildren();
        this.addBackground();
        this.createAccountButton(5);
        this.addBackButton();
        this.createScrollView();
    },

    resetAllChildren: function() {
        this.accountBtn = [];
    },

    addBackground: function() {
        var bg = new cc.Sprite("#bg-account.png");
        var scale = cc.winSize.width / bg.width;
        bg.setScaleX(scale);
        bg.x = cc.winSize.width / 2;
        bg.y = cc.winSize.height / 2;
        this.addChild(bg);
    },

    createAccountButton: function (accNumber){
        var self = this;
        var acc, r;
        var scale = 2.4;
        for ( var i = 0; i < accNumber; i++) {
            r = Math.floor(Math.random() * 2.8 + 1);
            acc = new ccui.Button("avatar-" + r + ".png", "", "", ccui.Widget.PLIST_TEXTURE);

            acc.x = ACCOUNT_POS[i].x / scale;
            acc.y = ACCOUNT_POS[i].y / scale;

            acc.tag = i;

            this.accountBtn.push(acc);

            acc.addClickEventListener(function() {
                cc.director.replaceScene(new LoginScene());
            });
        }
        this.createFlowerFrames();
        this.createAccountHolder(accNumber);
        this.createPlusButton();
    },

    createFlowerFrames: function() {
        var ff = new cc.Sprite("#flower-frame.png");
        var scale = (cc.winSize.width / ff.width);
        ff.x = cc.winSize.width / 2;
        ff.y = cc.winSize.height / 2;
        ff.setScale(scale);
        this.addChild(ff);
    },

    createAccountHolder: function(accNumber){
        this.accountHolder = new cc.Sprite();
        this.accountHolder.x = cc.winSize.width / 4;
        this.accountHolder.y = cc.winSize.height / 2;
        this.accountHolder.width = this.accountBtn[accNumber - 1].y +this.accountBtn[accNumber -1].width;
        this.accountHolder.height = cc.winSize.height;
        for ( var i = 0; i < this.accountBtn.length; i++) {
            this.accountHolder.addChild(this.accountBtn[i]);
        }
    },

    createPlusButton:function (){
        var self = this;
        var p = new ccui.Button("plus_button.png", "plus_button-pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        p.x = cc.winSize.width * 3/4;
        p.y = cc.winSize.height * 0.25;
        p.addClickEventListener(function() {
            self.parent.addNewLayer(this, "signUpLayer");
            cc.log("going to sign up layer");
        });
        this.accountHolder.addChild(p);
    },

    addBackButton: function() {
        var self = this;
        var b = new ccui.Button("back.png", "back-pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        b.x = b.width / 2;
        b.y = cc.winSize.height - b.height / 2;
        this.addChild(b, 1);

        b.addClickEventListener(function() {
            cc.director.replaceScene(new SchoolSelectorScene());
        });
        this.backButton = b;
    },

    createScrollView: function(){
        var self = this;
        this._scrollView = new ccui.ScrollView();
        this._scrollView.setDirection(ccui.ScrollView.DIR_HORIZONTAL);
        this._scrollView.setTouchEnabled(true);
        this._scrollView.setContentSize(cc.size(cc.winSize.width, cc.winSize.height));

        this._scrollView.x = 0;
        this._scrollView.y = 0;
        self.addChild(this._scrollView);

        var innerWidth = Math.ceil(this.accountBtn.length / 4) * cc.winSize.width;
        var innerHeight = cc.winSize.height - this.backButton.height;

        this._scrollView.setInnerContainerSize(cc.size(innerWidth, innerHeight));
        this._scrollView.addChild(this.accountHolder);

    }

});

var AccountSelectorScene = cc.Scene.extend({
    ctor: function() {
        this._super();

        var msLayer = new AccountSelectorLayer();
        this.addChild(msLayer);
    }
});
