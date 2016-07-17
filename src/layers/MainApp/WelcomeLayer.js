var WelcomeLayer = cc.LayerColor.extend({
    _policyAccepted: null,

	ctor: function() {
		this._super(cc.color(255, 255, 255, 255));

        this.tag = 1;
        // this._policyAccepted = KVDatabase.getInstance().getInt("policyAccepted", 0);
        var startedDay = KVDatabase.getInstance().getInt("startedDay", 0);
        cc.log("startedDay: " + startedDay);
        if (!startedDay) {
            startedDay = Date.now()/1000;
            KVDatabase.getInstance().set("startedDay", startedDay);
        } else {
            var currentDay = Date.now()/1000;
            var playedDay = Math.floor((currentDay - startedDay) / 86400); // second to daytime
            cc.log("playedDay: " + playedDay);
            if (playedDay >= GAME_CONFIG.amountOfFreeDayToPlay) {
                var self = this;
                this.addChild(new PayWallDialog(function() {
                    self.addWelcomeCutscene();
                    // if (!self._policyAccepted) {
                    //     cc.director.pause();
                    //     self.addChild(new PrivacyPolicyScreen(function(){cc.director.resume();}));
                    // }
                    self.moveToMainScene();

                    SegmentHelper.track(SEGMENT.TALKING_ADI, null );

                    Utils.showVersionLabel(self);
                }, true), 999);
            } else {
                this.addWelcomeCutscene();
                // if (!this._policyAccepted) {
                //     cc.director.pause();
                //     this.addChild(new PrivacyPolicyScreen(function(){cc.director.resume();}));
                // }
                this.moveToMainScene();

                SegmentHelper.track(SEGMENT.TALKING_ADI, null );

                Utils.showVersionLabel(this);
            }
        }
        
	},

    onEnter: function() {
        this._super();

        cc.audioEngine.setMusicVolume(1);
        cc.audioEngine.playMusic(res.welcome_sound_mp3);
    },

	addWelcomeCutscene: function() {
        var lwfSprite = cc.LWFSprite.create("welcome.lwf");
        lwfSprite.setAnchorPoint(cc.p(0.5, 0.5));
        lwfSprite.x = cc.winSize.width*0.5;
        lwfSprite.y = cc.winSize.height*0.5;
        // lwfSprite.scale = cc.winSize.width / lwfSprite.getContentSize().width;
        this.addChild(lwfSprite);
	},

	moveToMainScene: function() {
		this.runAction(cc.sequence(
			cc.delayTime(7.5),
			cc.callFunc(function() {
                if (DID_RELEASE) {
                    var nextSceneName = SceneFlowController.getInstance().getNextSceneName();
                    var scene;
                    if (nextSceneName != "RoomScene" && nextSceneName != "ForestScene" && nextSceneName != "TalkingAdiScene")
                        scene = new RoomScene();
                    else
                        scene = new window[nextSceneName]();
                    cc.director.replaceScene(new cc.TransitionFade(1, scene, cc.color(255, 255, 255, 255)));
                }else {
                    cc.audioEngine.stopMusic();
                    cc.director.replaceScene(new MainScene());
                }
			})
		));
	}
});

var WelcomeScene = cc.Scene.extend({
	ctor: function() {
		this._super();

		var welcomelayer = new WelcomeLayer();
		this.addChild(welcomelayer);
	}
});