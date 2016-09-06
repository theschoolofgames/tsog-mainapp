var TestGameLayer = cc.Layer.extend({

	ctor:function(){
        this._super();

        this._addBackGround();
        this._addButtons();

    },

    _addBackGround: function() {
        var bg = new cc.Sprite(res.Bg_school_jpg);
        bg.x = cc.winSize.width / 2;
        bg.y = cc.winSize.height / 2;
        this.addChild(bg);
    },

    _addButtons: function() {
    	var self = this;

        // SHOW LIST
        var btnShowList = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        btnShowList.x = btnShowList.width;
        btnShowList.y = cc.winSize.height - btnShowList.height*2/3;
        this.addChild(btnShowList);
        btnShowList.addClickEventListener(function() {
            
        });

        var lbShowList = new cc.LabelBMFont("SHOW", "yellow-font-export.fnt");
        lbShowList.scale = 0.6;
        lbShowList.x = btnShowList.width/2;
        lbShowList.y = btnShowList.height/2;
        btnShowList.getRendererNormal().addChild(lbShowList);

        // PLAY
        // var btnPlay = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        // btnPlay.x = btnPlay.width / 2;
        // btnPlay.y = cc.winSize.height - btnPlay.height*2/3
        // this.addChild(btnPlay);
        // btnPlay.addClickEventListener(function() {
            
        // });

        // var lbPlay = new cc.LabelBMFont("PLAY", "yellow-font-export.fnt");
        // lbPlay.scale = 0.6;
        // lbPlay.x = btnPlay.width/2;
        // lbPlay.y = btnPlay.height/2;
        // btnPlay.getRendererNormal().addChild(lbPlay);
    },
});

var TestGameScene = cc.Scene.extend({
    ctor: function() {
        this._super();
        this.name = "testGameScene";
        var testLayer = new TestGameLayer();
        this.addChild(testLayer);
    }
});