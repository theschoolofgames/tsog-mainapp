var LANGUAGE = ["English", "Chinese", "French", "Hindi", "Japanese", "Korean", "Philipino", "Spanish", "Swahili"];
var ChooseLanguageLayer = cc.LayerColor.extend(){
    _popupDialog: null,

    ctor: function(callback) {
        this._super(cc.color(0, 0, 0, 200));

        this._addDialog();
    },

    _addDialog: function() {
        this._this._popupDialog = new cc.Sprite("#popup.png");
        this._popupDialog.x = cc.winSize.width/2;
        this._popupDialog.y = cc.winSize.height/2 - this._popupDialog.height/2;
        this.addChild(this._popupDialog);
    },

    _addLangButtonToDialog: function() {
        for (var i = 0; i < LANGUAGE.length; i++) {
            var langName = LANGUAGE[i];
            var button = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        };
    },
};