var ChooseLanguageLayer = cc.LayerColor.extend({
    _popupDialog: null,
    _callback: null,
    _fontDef: null,

    ctor: function(callback) {
        // this._super();
        this._super(cc.color(0, 0, 0, 200));

        // this.y = -55;
        this._callback = callback;
        this._addDialog();
        this._addLangLabel();
        this._addLangButtonToDialog();
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function(touch, event) {return true;}
        }, this);
    },

    _addDialog: function() {
        this._popupDialog = new cc.Sprite("#popup.png");
        this._popupDialog.x = cc.winSize.width/2;
        // this._popupDialog.y = cc.winSize.height/2;
        this._popupDialog.y = -this._popupDialog.height/2;
        // this._popupDialog.scale = 0;

        this._popupDialog.runAction(
            cc.sequence(
                cc.moveBy(0.5, cc.p(0, this._popupDialog.height)).easing(cc.easeElasticInOut(0.6))
                // cc.scaleTo(0.2, 1.1),
                // cc.scaleTo(0.2, 1).easing(cc.easeElasticInOut(0.6))
            )
        );
        this.addChild(this._popupDialog);
    },

    _addLangLabel: function() {
        // var fontDef = new cc.FontDefinition();
        // fontDef.fontName = "Arial";
        // fontDef.fontWeight = "bold";
        // fontDef.fontSize = 30;
        // this._fontDef = fontDef;
        // var lb = new cc.LabelTTF("LANGUAGE", fontDef);
        this._fontDef = "yellow-font-export.fnt";
        var lb = new cc.LabelBMFont("LANGUAGE", this._fontDef);
        lb.scale = 0.6;
        lb.x = this._popupDialog.width/2;
        lb.y = this._popupDialog.height - lb.height - 10;
        // this._popupDialog.addChild(lb);
    },

    _addLangButtonToDialog: function() {
        var scrollView = new ccui.ListView();
        scrollView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        scrollView.setTouchEnabled(true);
        scrollView.setSwallowTouches(false);
        scrollView.setContentSize(cc.size(this._popupDialog.width - 20, this._popupDialog.height/2));
        scrollView.setScrollBarAutoHideEnabled(false);
        scrollView.setBounceEnabled(true);
        var innerWidth, innerHeight;
        innerWidth = this._popupDialog.width;

        var scrollViewSize = scrollView.getContentSize();

        var itemPerRow = 2;
        var rowCount = Math.ceil(LANGUAGE.length / itemPerRow);
        var self = this;
        for (var i = 0; i < rowCount; i++) {
            var box = new ccui.HBox();
            box.setContentSize(cc.size(this._popupDialog.width - 60, 80));

            for (var j = 0; j < itemPerRow; j++) {
                var langName = LANGUAGE[rowCount * i + j];
                if (!langName)
                    break;

                // cc.log("langName: ---> %s", langName);
                var button = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);

                var marginL = (scrollViewSize.width - 2*button.width)/3;
                var lp = new ccui.LinearLayoutParameter();
                lp.setMargin(new ccui.Margin(marginL, 0, 0, 0));
                button.setLayoutParameter(lp);

                var lb = new cc.LabelBMFont(langName.toUpperCase(), this._fontDef);
                lb.scale = 0.6;
                lb.x = button.width/2;
                lb.y = button.height/2;
                button.getRendererNormal().addChild(lb);

                button.setUserData(langName);
                button.addClickEventListener(this.changeLanguageFunc.bind(this));

                box.addChild(button);
            }
            // button.x = (i%2 == 0) ? (scrollViewSize.width/4+20) : (scrollViewSize.width/4*3 - 20);
            // button.y = (i%2 == 0) ? (scrollViewSize.height - (i+1)*button.height/2 - 20) : (scrollViewSize.height - (i)*button.height/2 - 20);

            scrollView.addChild(box);
        }

        scrollView.y = this._popupDialog.height/4 - 10;

        this._popupDialog.addChild(scrollView);
    },

    changeLanguageFunc: function(button) {
        var language = button.getUserData();
        var code = LANGUAGE_CODE[language];
        cc.log("code: " + code);

        var mess = "Set Current Language to " + language;

        setLanguage(code);
        SpeechRecognitionListener.setupInstance();
        
        NativeHelper.callNative("showMessage", ["Message", mess]);
        
        this._callback && this._callback();
    },

});