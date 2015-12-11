var NewAccountLayer = cc.Layer.extend({
    listener: null,

    ctor:function(){
        this._super();

        this._addBackGround();
        this._addNewAccount();
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
            // KVDatabase.getInstance().remove(STRING_SCHOOL_ID);
            // KVDatabase.getInstance().remove(STRING_SCHOOL_NAME);
            cc.director.replaceScene(new AccountSelectorScene());
        });
        this.addChild(bb);
    },

    _addNewAccount: function() {

    },
});

var NewAccountScene = cc.Scene.extend({
    ctor: function(){
        this._super();

        var layer = new NewAccountLayer();
        this.addChild(layer);
    }
});