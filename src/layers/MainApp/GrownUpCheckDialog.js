var GrownUpCheckDialog = cc.LayerColor.extend({
    _dialogBg: null,

    ctor: function(text){
        this._super(cc.color(0, 0, 0 , 200));
        this._addDialogBg();
        this.addCloseButton();
    },

    _addDialogBg: function() {
        var dialogBg = new cc.Sprite("#level_dialog_frame.png");
        dialogBg.x = cc.winSize.width/2;
        dialogBg.y = cc.winSize.height/2;
        this.addChild(dialogBg);
        this._dialogBg = dialogBg;

        var title = new cc.LabelBMFont("For Parent",res.HomeFont_fnt);
        title.x = this._dialogBg.width/2;
        title.y = this._dialogBg.height - title.height - 10;
        this._dialogBg.addChild(title);
    },

    addCloseButton: function() {
        var self = this;
        var closeButton = new ccui.Button("btn_x.png", "btn_x-pressed.png", "",ccui.Widget.PLIST_TEXTURE);
        closeButton.x = this._dialogBg.width - 25;
        closeButton.y = this._dialogBg.height - 25;
        closeButton.addClickEventListener(function(){
            AudioManager.getInstance().play(res.ui_close_mp3, false, null);
            self.removeFromParent();
        });
        this._dialogBg.addChild(closeButton);
    }



})