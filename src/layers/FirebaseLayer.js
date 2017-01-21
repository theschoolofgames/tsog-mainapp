var FirebaseLayer = cc.LayerColor.extend({
    _btnLogin: null,
    _btnLogout: null,

    _lbName: null,
    _lbEmail: null,
    _lbPhotoURL: null,
    _lbUid: null,

    ctor: function() {
        this._super(cc.color("#000"));

        var self = this;

        this._btnLogin = new ccui.Button();
        this._btnLogin.titleText = "LOGIN";
        this._btnLogin.titleFontSize = 30;
        this._btnLogin.x = 150;
        this._btnLogin.y = cc.winSize.height/2 + 200;
        this._btnLogin.addClickEventListener(function() {
            FirebaseManager.getInstance().login(function(succeed, msg) {
                self.reloadState();
            })
        });
        this.addChild(this._btnLogin);

        this._btnLogout = new ccui.Button();
        this._btnLogout.titleText = "LOGOUT";
        this._btnLogout.titleFontSize = 30;
        this._btnLogout.x = 150;
        this._btnLogout.y = cc.winSize.height/2 + 150;
        this._btnLogout.addClickEventListener(function() {
            FirebaseManager.getInstance().logout(function() {
                self.reloadState();
            })
        });
        this.addChild(this._btnLogout);

        this._lbName = new ccui.Text();
        this._lbName.fontSize = 24;
        this._lbName.x = cc.winSize.width/2 + 150;
        this._lbName.y = cc.winSize.height/2 + 75;
        this.addChild(this._lbName);

        this._lbEmail = new ccui.Text();
        this._lbEmail.fontSize = 24;
        this._lbEmail.x = cc.winSize.width/2 + 150;
        this._lbEmail.y = cc.winSize.height/2 + 25;
        this.addChild(this._lbEmail);

        this._lbPhotoURL = new ccui.Text();
        this._lbPhotoURL.fontSize = 24;
        this._lbPhotoURL.x = cc.winSize.width/2 + 150;
        this._lbPhotoURL.y = cc.winSize.height/2 - 25;
        this.addChild(this._lbPhotoURL);

        this._lbUid = new ccui.Text();
        this._lbUid.fontSize = 24;
        this._lbUid.x = cc.winSize.width/2 + 150;
        this._lbUid.y = cc.winSize.height/2 - 75;
        this.addChild(this._lbUid);

        this.reloadState();
    },

    reloadState: function() {
        this._btnLogin.setEnabled(!NativeHelper.callNative("isLoggedIn"));
        this._btnLogout.setEnabled(NativeHelper.callNative("isLoggedIn"));

        this._btnLogin.setColor(this._btnLogin.enabled ? cc.color.WHITE : cc.color.GRAY);
        this._btnLogout.setColor(this._btnLogout.enabled ? cc.color.WHITE : cc.color.GRAY);

        if (FirebaseManager.getInstance().isLoggedIn()) {
            var userInfo = FirebaseManager.getInstance().getUserInfo();
            this._lbUid.string = userInfo.uid;
            this._lbEmail.string = userInfo.email;
            this._lbName.string = userInfo.name;
            this._lbPhotoURL.string = userInfo.photoUrl;
        } else {
            this._lbUid.string = this._lbEmail.string = this._lbName.string = this._lbPhotoURL.string = "";
        }
    }, 
});

var FirebaseScene = cc.Scene.extend({
    ctor: function() {
        this._super();
        var layer = new FirebaseLayer();
        this.addChild(layer);
    }
});