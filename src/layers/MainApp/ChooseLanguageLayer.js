var LANGUAGE = [
 ["English", "Chinese"], ["French", "Hindi"], ["Japanese", "Kannada"], ["Korean", "Philipino"], ["Swahili", "Spanish"]
];
var ChooseLanguageLayer = cc.LayerColor.extend({
    _popupDialog: null,
    _callback: null,

    ctor: function(callback) {
        this._super(cc.color(0, 0, 0, 200));

        this.y = -55;
        this._callback = callback;
        this._addDialog();
        this._addLangButtonToDialog();

    },

    _addDialog: function() {
        this._popupDialog = new cc.Sprite("#popup.png");
        this._popupDialog.x = cc.winSize.width/2;
        // this._popupDialog.y = cc.winSize.height/2 - this._popupDialog.height/4;
        this._popupDialog.y = 0;
        // this._popupDialog.scale = 0;
        var moveYBy = cc.winSize.height/2 - this._popupDialog.height/4 - 10;
        this._popupDialog.runAction(
            cc.sequence(
                cc.moveBy(0.5, cc.p(0, moveYBy)).easing(cc.easeElasticInOut(0.6))
                // cc.scaleTo(0.5, 1.1),
                // cc.scaleTo(0.2, 1).easing(cc.easeElasticInOut(0.6))
            )
        );
        this.addChild(this._popupDialog);
    },

    _addLangButtonToDialog: function() {
        var scrollView = new ccui.ListView();
        scrollView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        scrollView.setTouchEnabled(true);
        scrollView.setSwallowTouches(false);
        scrollView.setContentSize(cc.size(this._popupDialog.width - 20, this._popupDialog.height/2));

        var innerWidth, innerHeight;
        innerWidth = this._popupDialog.width;

        var scrollViewSize = scrollView.getContentSize();

        var itemPerRow = 2;
        var rowCount = LANGUAGE.length;
        var self = this;
        for (var i = 0; i < rowCount; i++) {
            var box = new ccui.HBox();
            box.setContentSize(cc.size(this._popupDialog.width - 40, 110));

            for (var j = 0; j < itemPerRow; j++) {
                var langName = LANGUAGE[i][j];
                if (!langName)
                    break;

                cc.log("langName: ---> %s", langName);
                var button = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);

                var marginL = (scrollViewSize.width - 2*button.width)/3;
                var lp = new ccui.LinearLayoutParameter();
                lp.setMargin(new ccui.Margin(marginL, 0, 0, 0));
                button.setLayoutParameter(lp);

                var lb = new cc.LabelTTF(langName, "Arial", 28);
                lb.x = button.width/2;
                lb.y = button.height/2;
                button.addChild(lb);
                button.setUserData(langName);
                button.addClickEventListener(function() {
                    var language = this.getUserData().toLowerCase();
                    KVDatabase.getInstance().set("language", language);

                    cc.log("language: --> %s", language);
                    self._callback();
                });

                box.addChild(button);
            }
            // button.x = (i%2 == 0) ? (scrollViewSize.width/4+20) : (scrollViewSize.width/4*3 - 20);
            // button.y = (i%2 == 0) ? (scrollViewSize.height - (i+1)*button.height/2 - 20) : (scrollViewSize.height - (i)*button.height/2 - 20);

            scrollView.addChild(box);
        }

        scrollView.y = this._popupDialog.height/4 - 10;

        this._popupDialog.addChild(scrollView);
    },

});