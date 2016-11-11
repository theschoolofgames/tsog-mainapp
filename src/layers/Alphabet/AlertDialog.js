var AlertDialog = cc.LayerColor.extend({
    _dialogBg: null,

    ctor: function(text){
        this._super(cc.color(0, 0, 0 , 200));
        this._addDialogBg();
        this._addButton();
        this._addText(text);
    },
    _addDialogBg: function() {
        var dialogBg = new cc.Sprite("#setting-dialog-bg.png");
        dialogBg.x = cc.winSize.width/2;
        dialogBg.y = cc.winSize.height/2;
        this.addChild(dialogBg);
        this._dialogBg = dialogBg;
    },
    _addText: function(text) {
        var text = new cc.LabelTTF(text, "Arial", 30, cc.size(300, 80));
        text.x = this._dialogBg.width/2 + 20;
        text.y = this._dialogBg.height/2;
        text.setColor(cc.color(0,0,0));
        this._dialogBg.addChild(text);
    },

    _addButton: function(){
        var self = this;
        var buttonCancel = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        buttonCancel.x = this._dialogBg.width/2 - 50;
        buttonCancel.y = 100;
        this._dialogBg.addChild(buttonCancel);
        lbCancel = new cc.LabelBMFont("Cancel", "res/font/custom_font.fnt");
        lbCancel.scale = 0.4;
        lbCancel.x = buttonCancel.width/2;;
        lbCancel.y = buttonCancel.height/2;
        buttonCancel.addChild(lbCancel);
        buttonCancel.addClickEventListener(function(){
            self.removeFromParent();
        });

        var buttonPlay = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        buttonPlay.x = this._dialogBg.width/2 + 50;
        buttonPlay.y = 100;
        this._dialogBg.addChild(buttonPlay);
        lbPlay = new cc.LabelBMFont("Play", "res/font/custom_font.fnt");
        lbPlay.scale = 0.4;
        lbPlay.x = buttonPlay.width/2;
        lbPlay.y = buttonPlay.height/2;
        buttonPlay.addChild(lbPlay);
        buttonPlay.addClickEventListener(function(){
            var data = DataManager.getInstance().getDataAlpharacing();
            cc.director.runScene(new AlphaRacingScene(data, null, 600));
        });

    }
})