var GameSelectorLayer = cc.Layer.extend({

    _scrollView: null,
    _scrollViewContainer: null,

    _iconGapWidth: 178,
    _iconGapHeight: 175,

    _userId: null,
    _userName: null,
    _schoolId: null,
    _schoolName: null,

    _cacheSpriteFrameNames: [],

    ctor: function () {
        this._super();
        var self = this;

        this.playBackgroundMusic();
        var bg = new cc.Sprite(res.Bg_game_jpg);
        bg.x = cc.winSize.width/2;
        bg.y = cc.winSize.height/2;
        this.addChild(bg);
        var pug = new cc.Sprite("#pug.png");
        pug.setAnchorPoint(0.5, 0);
        pug.x = cc.winSize.width/2 - 310;
        pug.y = 0;
        this.addChild(pug, 99);

        this._userId = KVDatabase.getInstance().getString(STRING_USER_ID);
        this._userName = KVDatabase.getInstance().getString(STRING_USER_NAME);
        this._schoolId = KVDatabase.getInstance().getString(STRING_SCHOOL_ID);

        this.createBackButton();
    },

    onEnterTransitionDidFinish: function() {
        this._super();
        var self = this;

        var gameData = DataManager.getInstance().getGameData(this._userId);
 
        if (gameData != null && gameData.length > 0) {
            this.createScrollViewContainer();
            this.createScrollView();
            this.createUserInfoLabel();

            if (GameSelectorLayer.loadedDataIds.indexOf(this._userId) == -1) {
                this.runAction(cc.sequence(
                    cc.delayTime(0),
                    cc.callFunc(function() {
                        var loadingLayer = Utils.addLoadingIndicatorLayer(false);
                        loadingLayer.setIndicactorPosition(cc.winSize.width - 40, 40);

                        RequestsManager.getInstance().getGames(self._userId, function(succeed, data) {
                            Utils.removeLoadingIndicatorLayer();
                            if (succeed) {
                                GameSelectorLayer.loadedDataIds.push(self._userId);
                                if (JSON.stringify(gameData) === JSON.stringify(data.games))
                                    return;

                                DataManager.getInstance().setGameData(self._userId, data.games);
                                self._scrollView.removeFromParent();
                                self.createScrollViewContainer();
                                self.createScrollView();
                            }
                        });
                    })));
            }
        }
        else {
            this.runAction(cc.sequence(
                cc.delayTime(0),
                cc.callFunc(function() {
                    Utils.addLoadingIndicatorLayer(true);
                    RequestsManager.getInstance().getGames(self._userId, function(succeed, data) {
                        Utils.removeLoadingIndicatorLayer();
                        if (succeed) {
                            DataManager.getInstance().setGameData(self._userId, data.games);
                            self.createScrollViewContainer();
                            self.createScrollView();
                            self.createUserInfoLabel();
                        }
                        else {
                            showNativeMessage("TSOG", "Cannot connect to server\nPlease try again");
                            cc.director.replaceScene(new AccountSelectorScene());
                        }
                    });
                })));
        }
    },

    createUserInfoLabel: function() {
        cc.log("createUserInfoLabel");
        var schoolName = DataManager.getInstance().getSchoolConfig(this._schoolId).school_name;
        var infoString = schoolName + "\n" + this._userName;
        var scrollViewContainerWorldPos = this._scrollView.convertToWorldSpace(
                                    this._scrollViewContainer.getPosition());
        var infoLabel = new cc.LabelTTF(infoString, "Arial", 32);

        infoLabel.x = cc.winSize.width / 2;
        infoLabel.y = scrollViewContainerWorldPos.y + this._scrollViewContainer.height;
        infoLabel.setHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);

        this.addChild(infoLabel, 2);
    },

    createScrollViewContainer: function() {
        var gameData = DataManager.getInstance().getGameData(this._userId);
        var self = this;

        // var containerWidth = Math.ceil(gameData.length / 2) * this._iconGapWidth;
        var containerWidth = this._iconGapWidth * 4;
        var containerHeight = this._iconGapHeight * 2 + 20;

        // this._scrollViewContainer = new cc.LayerColor(cc.color(255, 0, 0, 255));
        this._scrollViewContainer = new cc.Layer();
        this._scrollViewContainer.setContentSize(containerWidth, containerHeight);
        this._scrollViewContainer.y = -60;
        // for (var i = 0; i < gameData.length; i++) {
        //     var posX = Math.floor(i / 2) * this._iconGapWidth + this._iconGapWidth/2;
        //     var posY = (1 - (i % 2)) * this._iconGapHeight + this._iconGapHeight/2 + 25;

        //     var btnGame = new ccui.Button();
        //     btnGame.setSwallowTouches(false);
        //     btnGame.loadTextures("icon-game-1.png", "", "", ccui.Widget.PLIST_TEXTURE);
        //     btnGame.x = posX;
        //     btnGame.y = posY;
        //     btnGame.rotation = Math.random() * 10 - 5;
        //     btnGame.scale = 0.9;
        //     this._scrollViewContainer.addChild(btnGame, 1);

        //     var btnShadow = new cc.Sprite("#icon-game-shadow.png");
        //     btnShadow.x = posX;
        //     btnShadow.y = posY - 8;
        //     btnShadow.rotation = btnGame.rotation;
        //     btnShadow.scale = btnGame.scale;
        //     this._scrollViewContainer.addChild(btnShadow, 0);

        //     var pin = new cc.Sprite("#pin.png");
        //     pin.x = posX;
        //     pin.y = posY + btnGame.height/2 - 3;
        //     this._scrollViewContainer.addChild(pin, 2);

        //     var lbName = new cc.LabelTTF(gameData[i].game_name, "Arial", 18);
        //     lbName.color = cc.color('#fffa85');
        //     lbName.x = posX;
        //     lbName.y = posY - 85;
        //     this._scrollViewContainer.addChild(lbName);
        // }

        for (var i = 0; i < gameData.length; i++) {
            if (i >= 3)
                break;

            var posX = containerWidth / 3 * (i + 0.5);
            var posY = containerHeight/2 + 35;

            var btnGame = new ccui.Button();

            btnGame.setSwallowTouches(false);
            btnGame.loadTextures("icon-game-default.png", "", "", ccui.Widget.PLIST_TEXTURE);
            btnGame.x = posX;
            btnGame.y = posY;
            btnGame.rotation = Math.random() * 10 - 5;
            btnGame.userData = gameData[i];
            btnGame.addClickEventListener(function(sender) {
                var data = sender.userData;
                var schoolConfig = DataManager.getInstance().getSchoolConfig(this._schoolId);

                Utils.segmentTrack("select_game", { game_id: data.game_id, game_name: data.game_name });

                var sendData = self._userName + ":" + self._userId + ":" + schoolConfig.school_name + ":" + schoolConfig.school_id;
                var scheme = cc.sys.os == cc.sys.OS_IOS ? data.ios_bundle : data.android_bundle;
                Utils.callOpenScheme(scheme, Base64.encode(sendData)); 
            });
            btnGame.scale = 1.35;
            Utils.loadImg(gameData[i].icon, btnGame);
            this._scrollViewContainer.addChild(btnGame, 1);

            var btnShadow = new cc.Sprite("#icon-game-shadow.png");
            btnShadow.x = posX;
            btnShadow.y = posY - 8 * btnGame.scale;
            btnShadow.rotation = btnGame.rotation;
            btnShadow.scale = btnGame.scale;
            this._scrollViewContainer.addChild(btnShadow, 0);

            var pin = new cc.Sprite("#pin.png");
            pin.x = posX;
            pin.y = posY + btnGame.getBoundingBox().height +80;
            this._scrollViewContainer.addChild(pin, 2);

            var lbName = new cc.LabelTTF(gameData[i].game_name, "Arial", 20);
            lbName.color = cc.color('#fffa85');
            lbName.x = posX;
            lbName.y = posY - 120;
            this._scrollViewContainer.addChild(lbName);

            var btnAction = cc.sequence(
                cc.delayTime(i* 0.1),
                cc.scaleTo(0.5, btnGame.scale).easing(cc.easeElasticOut(0.6))
            );

            pin.scale = 0.01;
            btnGame.scale = 0.01;
            btnShadow.scale = 0.01;

            // btnGame.visible = false;

            pin.runAction(btnAction.clone());
            btnGame.runAction(btnAction.clone());
            btnShadow.runAction(cc.sequence(
                cc.delayTime(i* 0.1),
                cc.scaleTo(0.5, 1.35).easing(cc.easeElasticOut(0.6))
            ));
        }
    },

    createScrollView: function(){
        var self = this;
        this._scrollView = new ccui.ScrollView();
        this._scrollView.setDirection(ccui.ScrollView.DIR_HORIZONTAL);
        this._scrollView.setTouchEnabled(true);
        this._scrollView.setSwallowTouches(false);
        this._scrollView.setContentSize(cc.size(cc.winSize.width, cc.winSize.height));
        this._scrollView.touchEnabled = false;

        this._scrollView.x = cc.winSize.width/2 - 355;
        this._scrollView.y = 200;
        this._scrollView.setContentSize(this._iconGapWidth * 4, this._iconGapHeight * 2);
        self.addChild(this._scrollView);

        // var innerWidth = Math.ceil(this.schoolBtn.length / 4) * cc.winSize.width;
        // var innerHeight = cc.winSize.height;

        this._scrollView.setBounceEnabled(true);
        this._scrollView.setInnerContainerSize(this._scrollViewContainer.getContentSize());
        this._scrollView.addChild(this._scrollViewContainer);
    },

    createBackButton: function() {
        var backButton = new ccui.Button("back.png",
                                 "back-pressed.png",
                                 "",
                                 ccui.Widget.PLIST_TEXTURE);

        backButton.x = backButton.width ;
        backButton.y = cc.winSize.height - backButton.height*2/3;
        backButton.addClickEventListener(function() {
            cc.audioEngine.stopMusic();
            cc.sys.localStorage.setItem("isLoggedIn", 0);
            cc.director.replaceScene(new AccountSelectorScene());
        });

        this.addChild(backButton);
    },

    playBackgroundMusic: function() {
        cc.audioEngine.stopMusic();
        if (cc.audioEngine.isMusicPlaying())
            return
        // play background music
        cc.audioEngine.setMusicVolume(0.2);
        cc.audioEngine.playMusic(res.background_mp3, true);
    },
});

GameSelectorLayer.loadedDataIds = [];

var GameSelectorScene = cc.Scene.extend({
    ctor: function() {
        this._super();

        var gsLayer = new GameSelectorLayer();
        this.addChild(gsLayer);
    }
});