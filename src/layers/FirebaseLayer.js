var FirebaseLayer = cc.LayerColor.extend({
    _btnLogin: null,
    _btnLogout: null,

    ctor: function() {
        this._super(cc.color("#000"));

        this._btnLogin = new ccui.Button();
        this._btnLogin.titleText = "LOGIN";
        this._btnLogin.titleFontSize = 30;
        this._btnLogin.x = cc.winSize.width/2;
        this._btnLogin.y = cc.winSize.height/2 + 200;
        this._btnLogin.addClickEventListener(function() {
            NativeHelper.callNative("login");
        });
        this.addChild(this._btnLogin);

        this._btnLogout = new ccui.Button();
        this._btnLogout.titleText = "LOGOUT";
        this._btnLogout.titleFontSize = 30;
        this._btnLogout.x = cc.winSize.width/2;
        this._btnLogout.y = cc.winSize.height/2 + 150;
        this._btnLogout.addClickEventListener(function() {
            NativeHelper.callNative("logout");
        });
        this.addChild(this._btnLogout);

        this.reloadButtonState();
    },

    onEnter: function() {
        this._super();

        NativeHelper.setListener("Firebase", this);
    },

    onExit: function() {
        this._super();

        NativeHelper.removeListener("Firebase");
    },

    reloadButtonState: function() {
        this._btnLogin.setEnabled(!NativeHelper.callNative("isLoggedIn"));
        this._btnLogout.setEnabled(NativeHelper.callNative("isLoggedIn"));

        this._btnLogin.setColor(this._btnLogin.enabled ? cc.color.WHITE : cc.color.GRAY);
        this._btnLogout.setColor(this._btnLogout.enabled ? cc.color.WHITE : cc.color.GRAY);
    },

    onLoggedIn: function(succeed, msg) {
        cc.log(succeed + " " + msg);

        // showNativeMessage("Login: " + succeed, msg ? msg : "");

        this.reloadButtonState();
    },

    onLoggedOut: function() {
        this.reloadButtonState();
    }

});

var FirebaseScene = cc.Scene.extend({
    ctor: function() {
        this._super();
        var layer = new FirebaseLayer();
        this.addChild(layer);
    }
});