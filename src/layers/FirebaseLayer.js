var FirebaseLayer = cc.LayerColor.extend({
    _btnLogin: null,
    _btnLogout: null,
    _btnHomeScene: null,
    _btnShare: null,

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
            debugLog("tapped _btnLogin");
            LoadingIndicator.show();
            FirebaseManager.getInstance().login(function(succeed, msg) {
                self.reloadState();
                debugLog("gonna remove loading indicator");
                LoadingIndicator.hide();
            })
        });
        this.addChild(this._btnLogin);

        this._btnLogout = new ccui.Button();
        this._btnLogout.titleText = "LOGOUT";
        this._btnLogout.titleFontSize = 30;
        this._btnLogout.x = 150;
        this._btnLogout.y = cc.winSize.height/2 + 150;
        this._btnLogout.addClickEventListener(function() {
            debugLog("tapped _btnLogout");
            FirebaseManager.getInstance().logout(function() {
                self.reloadState();
            })
        });
        this.addChild(this._btnLogout);

        this._btnHomeScene = new ccui.Button();
        this._btnHomeScene.titleText = "HOME SCENE";
        this._btnHomeScene.titleFontSize = 30;
        this._btnHomeScene.x = 150;
        this._btnHomeScene.y = cc.winSize.height/2 + 100;
        this._btnHomeScene.addClickEventListener(function() {
            debugLog("tapped _btnHomeScene");
            cc.director.runScene(new HomeScene());
        });
        this.addChild(this._btnHomeScene);

        this._btnShare = new ccui.Button();
        this._btnShare.titleText = "SHARE DIALOG";
        this._btnShare.titleFontSize = 30;
        this._btnShare.x = 150;
        this._btnShare.y = cc.winSize.height / 2 + 50;
        this._btnShare.addClickEventListener(function() {
            debugLog("tapped _btnShare");
            var shareDialog = new ShareDialog();
            this.addChild(shareDialog, 99999);
        }.bind(this));
        this.addChild(this._btnShare);

        // this._btnFetchConfig = new ccui.Button();
        // this._btnFetchConfig.titleText = "FETCH CONFIG";
        // this._btnFetchConfig.titleFontSize = 30;
        // this._btnFetchConfig.x = 150;
        // this._btnFetchConfig.y = cc.winSize.height/2;
        // this._btnFetchConfig.addClickEventListener(function() {
        //     FirebaseManager.getInstance().fetchConfig(0, function(succeed, data) {
        //         debugLog(data);
        //     });
        // }.bind(this));
        // this.addChild(this._btnFetchConfig);

        // this._btnBuySet1 = new ccui.Button();
        // this._btnBuySet1.titleText = "BUY MONTHLY";
        // this._btnBuySet1.titleFontSize = 30;
        // this._btnBuySet1.x = 150;
        // this._btnBuySet1.y = cc.winSize.height/2 - 50;
        // this._btnBuySet1.addClickEventListener(function() {
        //     IAPManager.getInstance().purchase("subscription_monthly");
        // }.bind(this));
        // this.addChild(this._btnBuySet1);

        // this._btnBuySet2 = new ccui.Button();
        // this._btnBuySet2.titleText = "BUY SET 2";
        // this._btnBuySet2.titleFontSize = 30;
        // this._btnBuySet2.x = 150;
        // this._btnBuySet2.y = cc.winSize.height/2 - 100;
        // this._btnBuySet2.addClickEventListener(function() {
        //     IAPManager.getInstance().purchase("set_2");
        // }.bind(this));
        // this.addChild(this._btnBuySet2);

        // this._btnFacebookShare = new ccui.Button();
        // this._btnFacebookShare.titleText = "Share Facebook";
        // this._btnFacebookShare.titleFontSize = 30;
        // this._btnFacebookShare.x = 150;
        // this._btnFacebookShare.y = cc.winSize.height/2 - 50;
        // this._btnFacebookShare.addClickEventListener(function() {
        //     NativeHelper.callNative("shareFacebook", [FACEBOOK_SHARING_TITLE, 
        //                             FACEBOOK_SHARING_DESCRIPTION,
        //                             cc.formatStr(DYNAMIC_LINK, this._lbUid.string)]);
        // }.bind(this));
        // this.addChild(this._btnFacebookShare);

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
        // debugLogStackTrace();
        
        this._btnLogin.setEnabled(!User.isLoggedIn());
        this._btnLogout.setEnabled(User.isLoggedIn());
        this._btnHomeScene.setEnabled(User.isLoggedIn());
        this._btnShare.setEnabled(User.isLoggedIn());  

        this._btnLogin.setColor(this._btnLogin.enabled ? cc.color.WHITE : cc.color.GRAY);
        this._btnLogout.setColor(this._btnLogout.enabled ? cc.color.WHITE : cc.color.GRAY);
        this._btnHomeScene.setColor(this._btnHomeScene.enabled ? cc.color.WHITE : cc.color.GRAY);
        this._btnShare.setColor(this._btnShare.enabled ? cc.color.WHITE : cc.color.GRAY);

        if (User.isLoggedIn()) {
            var user = User.getCurrentUser();
            this._lbUid.string = user.uid;
            this._lbEmail.string = user.email;
            this._lbName.string = user.name;
            this._lbPhotoURL.string = user.photoUrl;
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