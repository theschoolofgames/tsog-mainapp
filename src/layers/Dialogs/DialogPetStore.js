var DialogPetStore = DialogLetsPlayAlpharacing.extend({
    ctor: function(dialogName) {
        this._super(dialogName);

        this.addCharacterCanUnlock();
    },

    addCharacterCanUnlock: function() {
        var diamonds = CurrencyManager.getInstance().getDiamond();
        var characterList = CharacterManager.getInstance().getCharactersHasNotUnlock();
        cc.log("characterList: " + JSON.stringify(characterList));
        var character = new AdiDogNode(true, characterList[0].name);
        character.scale  = 0.8;
        character.anchorX = 0;
        this._dialogBg.addChild(character);
        character.x = this._dialogBg.width/2;
        character.y = 140;
    },

    _addButton: function() {
        var okBtn = new ccui.Button("res/SD/dialogs/pay/pay_button_normal.png", "res/SD/dialogs/pay/pay_button_pressed.png",  "");
        okBtn.x = this.background.width/2;
        okBtn.y = 70;
        this.background.addChild(okBtn);
        lbLearn = new cc.LabelBMFont(localizeForWriting("Unlock"), res.HomeFont_fnt);
        lbLearn.x = okBtn.width/2;
        lbLearn.y = okBtn.height/2 + 10;
        lbLearn.scale = 0.5;
        okBtn.addChild(lbLearn);

        okBtn.addClickEventListener(function(){
            AudioManager.getInstance().play(res.ui_close_mp3, false, null);
            this.close();

            ShopScreenLayer.wantScrollToNextAvailableCharacter = true;
            cc.director.runScene(new ShopScene());
        }.bind(this));
    },

    _addInstructionText: function() {
        
    },

    _addDialogBg: function() {
        var dialogBg = new cc.Sprite("res/SD/dialog_bg.png");
        dialogBg.x = cc.winSize.width/2;
        dialogBg.y = cc.winSize.height/2;
        this.addChild(dialogBg);
        this.background = dialogBg;
        this._dialogBg = dialogBg;
    },


});

DialogPetStore.show = function() {
    cc.director.getRunningScene().addChild(new DialogPetStore("NEW PET!", 9999));
};