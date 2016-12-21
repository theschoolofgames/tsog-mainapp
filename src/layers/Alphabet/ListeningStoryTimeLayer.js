var ListeningStoryTimeLayer = ListeningTestLayer.extend({
    ctor: function(data, timeForScene) {
        this._super(data);
    },

    _showObjects: function() {
        this._objectNodes.forEach(function(obj) { obj.removeFromParent(); });
        this._objectNodes = [];

        var self = this;
        var shownObjNames = [];

        var remainingObj = this._names.slice(0, this._nameIdx * 3);
        remainingObj.splice(this._nameIdx, 1);
        remainingObj = shuffle(remainingObj);
        cc.log("this._nameIdx: " + this._nameIdx);
        shownObjNames.push(this._names[this._nameIdx]);
        shownObjNames.push(remainingObj[0]);
        shownObjNames.push(remainingObj[1]);
        cc.log("shownObjNames STory: " + JSON.stringify(shownObjNames));
        shownObjNames = shuffle(shownObjNames);

        for (var i = 0; i < 3; i++) {
            var spritePath = "objects/" + shownObjNames[i].toLowerCase() + ".png";
            if (!jsb.fileUtils.isFileExist("res/SD/" + spritePath)) {
                spritePath = "animals/" + shownObjNames[i].toLowerCase() + ".png";
                if (!jsb.fileUtils.isFileExist("res/SD/" + spritePath)) {
                    // handle case number has two digit
                    
                }
                if (shownObjNames[i].indexOf("color") > -1) {
                    var color = shownObjNames[i].toLowerCase().substr(6);
                    spritePath = "#btn_" + color + ".png";   
                }   
            }

            cc.log("sprite path: " + spritePath);
            var mostTopY = this._nameNode.y - this._nameNode.height/2 - 20;

            var sprite = new cc.Sprite(spritePath);
            sprite.name = shownObjNames[i];
            sprite.scale = Math.min(200 / sprite.width, 350 / sprite.height) * Utils.screenRatioTo43();
            sprite.x = this._objCenter.x + (i-1) * 200 * Utils.screenRatioTo43();
            sprite.y = this._objCenter.y;

            if (cc.rectGetMaxY(sprite.getBoundingBox()) > mostTopY) {
                sprite.scale = (mostTopY - this._objCenter.y) / sprite.height * 2;
            }

            this._objectNodes.push(sprite);
            this.addChild(sprite);

            this._animateObject(sprite, i);
            this._animateObjectIn(sprite, i);

            if (sprite.name == this._names[this._nameIdx]) {
                sprite.runAction(cc.sequence(
                    cc.delayTime(GAME_CONFIG.listeningTestWaitToShowHand || UPDATED_CONFIG.listeningTestWaitToShowHand),
                    cc.callFunc(function(sender) {
                        self._tutorial = new TutorialLayer([sender]);
                        self.addChild(self._tutorial);
                    }),
                    cc.delayTime(GAME_CONFIG.listeningTestWaitToShowNextObj || UPDATED_CONFIG.listeningTestWaitToShowNextObj),
                    cc.callFunc(function(sender) {
                        if (self._tutorial) {
                            self._tutorial.removeFromParent();
                            self._tutorial = null;
                        }

                        self._nameIdx++;
                        if (self._nameIdx >= self._names.length) {
                            self._moveToNextScene();
                        } else {
                            self._displayCurrentName();
                            self._showObjects();
                        }
                    })
                ));
            }
        }
    },
});

var ListeningStoryTimeScene = cc.Scene.extend({
    ctor: function(data, timeForScene) {
        this._super();

        var l = new ListeningStoryTimeLayer(data, timeForScene);
        this.addChild(l);
    }
});