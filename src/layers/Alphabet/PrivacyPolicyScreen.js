var PrivacyPolicyScreen = cc.Layer.extend({
    _navBar: null,

    ctor: function(callback) {
        this._super();
        this._callback = callback;

        this.currentLang = KVDatabase.getInstance().getString("currentLang", "english");

        this._addNavBar();
        this._addAcceptButton();
        this._addWebView();
    },

    _addWebView: function() {
        var webView = new ccui.WebView();
        webView.loadURL("res/html/Privacy-" + this.currentLang +".html");
        webView.setContentSize(cc.winSize.width, cc.winSize.height - 100);
        webView.setPosition(cc.winSize.width/2, cc.winSize.height);
        webView.anchorY = 1;
        this.addChild(webView, 1);

        this._webView = webView;
    },

    _addNavBar: function() {
        this._navBar = new cc.LayerColor(cc.color.WHITE);
        this._navBar.width = cc.winSize.width;
        this._navBar.height = 200;
        this._navBar.anchorY = 0.5;

        this.addChild(this._navBar, 2);
    },

    _addAcceptButton: function() {
        var acceptBtn = new ccui.Button();
        acceptBtn.loadTextures("table-name.png", "", "", ccui.Widget.PLIST_TEXTURE);
        acceptBtn.x = this._navBar.width/2;
        acceptBtn.y = 50;
        this._navBar.addChild(acceptBtn, 2);

        var self = this;
        acceptBtn.addClickEventListener(function() {
            KVDatabase.getInstance().set("policyAccepted", 1);
            if (self.callback)
                self._callback();
            self.removeFromParent();
        });

        var text = "Accept";
        var title = new cc.LabelTTF(text, "Arial", 20);
        title.boundingWidth = acceptBtn.width-20;
        title.textAlign = cc.TEXT_ALIGNMENT_CENTER;
        title.setPosition(cc.p(acceptBtn.width/2, acceptBtn.height/2 + 5));
        acceptBtn.getVirtualRenderer().addChild(title);
    },
});