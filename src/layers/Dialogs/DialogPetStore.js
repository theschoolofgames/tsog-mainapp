var DialogPetStore = DialogLetsPlayAlpharacing.extend({
    ctor: function() {
        this._super();
    },

    _addButton: function() {
        var okBtn = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        okBtn.x = this.background.width/2;
        okBtn.y = 100;
        okBtn.scale = 0.8;
        this.background.addChild(okBtn);
        lbLearn = new cc.LabelBMFont(localizeForWriting("OK"), "res/font/custom_font.fnt");
        lbLearn.x = okBtn.width/2;
        lbLearn.y = okBtn.height/2;
        okBtn.addChild(lbLearn);

        okBtn.addClickEventListener(function(){
            AudioManager.getInstance().play(res.ui_close_mp3, false, null);
            this.close();

            ShopScreenLayer.wantScrollToNextAvailableCharacter = true;
            cc.director.runScene(new ShopScene());
        }.bind(this));
    },

    _addInstructionText: function() {
        var text = new cc.LabelBMFont(localizeForWriting("pets"), res.HomeFont_fnt);
        text.scale = 0.7;
        text.x = this.background.width/2;
        text.y = this.background.height/2 + 100;

        this.background.addChild(text);
    },

});

DialogPetStore.show = function() {
    cc.director.getRunningScene().addChild(new DialogPetStore());
};