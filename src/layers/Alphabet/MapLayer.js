var MapLayer = cc.Layer.extend({
    _poolParts: [],
    _btnStepCoordinates: [],
    _steps: [],
    _stepsStar: {},

    _mapData: null,
    _scrollView: null,

    _lastedStepUnlocked: null,
    _whirlwinds: [],
    _csf: 1,

    ctor: function() {
        this._super();
        this._whirlwinds  = [];
        this._stepsStar = {};
        this._loadTmx();
        this._loadMapData();

        this.addSettingButton();
        // this.addBackToHomeScene();
        this._updateMapData();

        if (TSOG_DEBUG) {
            // this.addUnlockLevelButton();
        }
    },

    onEnterTransitionDidFinish: function() {
        this._super();

        if (MapLayer.newLevelUnlocked) {
            cc.log("showLetsPlayAlphaRacingDialog");
            this.showLetsPlayAlphaRacingDialog();
        }

        this._prepareMap();
        cc.audioEngine.playMusic(res.map_mp3, true);
    },

    addSettingButton: function() {
        var settingBtn = new ccui.Button();
        settingBtn.loadTextures("btn_pause.png", "btn_pause-pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        settingBtn.x = settingBtn.width - 10;
        settingBtn.y = cc.winSize.height - settingBtn.height/2 - 10;
        this.addChild(settingBtn);

        var self = this;
        settingBtn.addClickEventListener(function() {
            AudioManager.getInstance().play(res.ui_click_mp3_2, false, null);
            self.addChild(new SettingDialog(), 999);
        })
        this._settingBtn = settingBtn;
    },

    addBackToHomeScene: function(){
        var button = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        button.x = cc.winSize.width - button.width;
        button.y = cc.winSize.height - button.height/2 - 10;
        this.addChild(button, 9999);
        button.addClickEventListener(function(){
            cc.director.runScene(new MainScene());
        });
        var lb = new cc.LabelBMFont("BACK TO MAIN", "yellow-font-export.fnt");
        lb.scale = 0.5;
        lb.x = button.width/2;
        lb.y = button.height/2;
        button.getRendererNormal().addChild(lb);
    },

    _loadMapBg: function() {
        var lastPartXPos = 0;
        var stepIndex = 1;
        var mapIndex = 1;

        this._steps = [];
        var mapLabel = 0;
        var level = 0;
        var scrollView = new cc.ScrollView();
        scrollView.setBounceable(false);
        for (var map in this._mapData) {
            // cc.log("this._mapData: " + JSON.stringify(this._mapData));
            if (this._mapData.hasOwnProperty(map)) {
                var path = "Map_Part" + mapIndex + "_jpg";
                var mapPart = new cc.Sprite(res[path]);
                mapPart.x = lastPartXPos + mapPart.width/2;
                mapPart.y = cc.winSize.height/2;

                if (map.indexOf("assessment") > -1)
                    mapLabel++;
                else
                    mapLabel = parseInt(map);
                // cc.log("mapLabel: " + mapLabel);
                var _map = this._mapData[map];
                // cc.log("_map: " + JSON.stringify(_map));
                var _mapInArray = Object.keys(_map);
                var totalSteps = _mapInArray.length;

                for (var step in _map) {
                    // cc.log("_map: %s, step: %s", _map, step);
                    if (_map.hasOwnProperty(step)) {
                        var val = _map[step];
                        level++;
                        // cc.log("level: %d, step: %s", level, val);
                        var pos = this._btnStepCoordinates[stepIndex-1];
                        var enabled = (val == "1-1") ? true : false;
                        var btn = new ccui.Button("btn_level.png", "btn_level-pressed.png", "btn_level-disabled.png", ccui.Widget.PLIST_TEXTURE);
                        btn.x = pos.x + btn.width * 0.5 + mapPart.width * (mapLabel - 1);
                        btn.y = pos.y + btn.height * 1.5;
                        btn.setEnabled(MapLayer.unlockAllLevel ? true : enabled);
                        var lb = new cc.LabelBMFont(level, res.MapFont_fnt);
                        lb.x = btn.width/2;
                        lb.y = btn.height/2 + 35 * this._csf;
                        btn.addChild(lb);

                        scrollView.addChild(btn, 1);
                        btn.tag = level;
                        btn.setUserData(val);
                        btn.addClickEventListener(this._stepPressed.bind(this));

                        this._addStepStars(btn);

                        if ((stepIndex%5 > 0) && _mapInArray[totalSteps-1] == step)
                            stepIndex += 5 - (stepIndex%5);

                        this._steps.push(btn);
                        stepIndex = (stepIndex >= this._btnStepCoordinates.length) ? 1 : (stepIndex+1);
                    }
                }
                
                scrollView.addChild(mapPart);

                this._poolParts.push(mapPart);
                if(mapIndex == 3) {
                    var whirlwind = new cc.Sprite("#animation/whirlwind-1.png");
                    whirlwind.x = mapPart.width * Math.random();
                    whirlwind.y = Math.random() * mapPart.height;
                    mapPart.addChild(whirlwind);
                    this._whirlwinds.push(whirlwind);
                    // Utils.runAnimation(whirlwind, "animation/whirlwind", 0.1, 12, true, 3, cc.callFunc(function(){
                    //     cc.log("whirlwind action");
                    //     whirlwind.setVisible(false);
                    //     whirlwind.x = mapPart.width * Math.random();
                    //     whirlwind.y = Math.random() * mapPart.height;
                    //     cc.log("Isvisible: " + whirlwind.isVisible());
                    // }));
                };
                lastPartXPos += mapPart.width;
                mapIndex = (mapIndex >= 4) ? 1 : (mapIndex+1);
            }
        }

        // case that last map part has 1 level is on outside of the map
        if (mapIndex == 3) {
            var path = "Map_Part" + (mapIndex) + "_jpg";
            var mapPardPlus = new cc.Sprite(res[path]);
            mapPardPlus.x = lastPartXPos + mapPardPlus.width/2;
            mapPardPlus.y = cc.winSize.height/2;
            scrollView.addChild(mapPardPlus);

            var whirlwind = new cc.Sprite("#animation/whirlwind-1.png");
            whirlwind.x = mapPardPlus.width * Math.random();
            whirlwind.y = Math.random() * mapPardPlus.height;
            mapPardPlus.addChild(whirlwind);
            this._whirlwinds.push(whirlwind);

            lastPartXPos+= mapPardPlus.width;
        };
        var self = this;
        // cc.log("Length ---> " + this._whirlwinds.length);
        this._whirlwinds.forEach(function(object) {
            // var object = this._whirlwinds[i];
            Utils.runAnimation(object, "animation/whirlwind", 0.1, 12, true, 3, cc.callFunc(function(){
                object.setVisible(false);
                object.x = mapPart.width * Math.random();
                object.y = Math.random() * mapPart.height;
            }));
        });
        scrollView.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
        scrollView.setContentSize(cc.size(lastPartXPos, mapPart.height));
        scrollView.setViewSize(cc.director.getWinSize());
        this.addChild(scrollView);
        this._scrollView = scrollView;
    },

    _duplicateMapAt: function(idx) {},

    _loadMapData: function() {
        var self = this;
        cc.loader.loadJson(res.Map_Data_JSON, function(err, data){
            if (!err) {
                self._mapData = data;
                self._loadMapBg();
            } else {
                cc.fileUtils.removeFile(Utils.getAssetsManagerPath() + res.Map_Data_JSON);
                cc.loader.loadJson(res.Map_Data_JSON, function(err, data) {
                    self._mapData = data;
                });
            }
        });
        // cc.log("_mapData: " + JSON.stringify(this._mapData));

    },

    _loadTmx: function() {
        this._btnStepCoordinates = [];
        this._csf = cc.director.getContentScaleFactor();
        var tiledMap = new cc.TMXTiledMap();
        tiledMap.initWithTMXFile(res.Map_TMX);

        // var group = tiledMap.getObjectGroup("buttonPart1");
        var self = this;
        tiledMap.getObjectGroups().forEach(function(group) {
            // cc.log("group ->>>>");
            if (group.getGroupName().startsWith("buttonPart")) {
                group.getObjects().forEach(function(obj) {
                    self._btnStepCoordinates.push({
                        "x": obj.x * self._csf,
                        "y": obj.y * self._csf
                    }); 
                });
            }
        });
        // cc.log("this._btnStepCoordinates: " + JSON.stringify(this._btnStepCoordinates));
        // cc.log("this._btnStepCoordinates length : " + this._btnStepCoordinates.length);
    },

    _addStepStars: function(btn) {
        var self = this;
        var step = btn.getUserData();
        this._stepsStar[step] = [];
        var stepData = [];
        // var starPosDif = [2.2, 1.6, 1.2, 1.2, 1.6, 2.2];
        // getTotalGame in step
        var dataPath = "res/config/levels/" + "step-" + step + ".json";
        if(step.indexOf("assessment") > -1)
            dataPath = "res/config/levels/" + step +".json";
        // cc.log("_addStepStars dataPath: " + dataPath);
        if (!jsb.fileUtils.isFileExist(dataPath))
            return;
        cc.loader.loadJson(dataPath, function(err, data){
            // cc.log("err: " + err);
            if (!err && data) {
                stepData = data;
                var totalGameInStep = Object.keys(stepData).length;
                // cc.log("self._data " + JSON.stringify(data));
                var st = Math.PI/5;
                var h = btn.width/2; 
                var k = btn.height/2 + 5;
                var r = 50;
                for(var i = totalGameInStep; i > 0; i--) { 
                    var angle = st * ((5 - totalGameInStep)/2 + i - 1/2);
                    var x = h + r*Math.cos(angle);
                    var y = k + r*Math.sin(angle);
                    // cc.log("angle -> " + (angle/st));
                    var star = new cc.Sprite("#star-empty.png");
                    star.scale = 0.35;
                    star.x = x;
                    star.y = y;
                    star.tag = i;
                    btn.addChild(star);
                    self._stepsStar[step].push(star);
                }
            } else {
                cc.fileUtils.removeFile(Utils.getAssetsManagerPath() + res.Map_Data_JSON);
                cc.loader.loadJson(res.Map_Data_JSON, function(err, data) {
                });
            }
        });
        
    },

    _updateMapData: function() {
        var stepData = KVDatabase.getInstance().getString("stepData");
        var currentLevel = SceneFlowController.getInstance().getCurrentStep();
        var currentSceneName = SceneFlowController.getInstance().getCurrentSceneName();
        
        if (stepData == null || stepData == "" || stepData == undefined)
            return;

        stepData = JSON.parse(stepData);
        for (var step in stepData) {
            var eachStepData = stepData[step];

            if (!eachStepData)
                return;

            if (eachStepData.completed)
                this._updateStepState(step);

            for (var info in eachStepData) {
                var gameCompleted;
                var eachStepInfo = eachStepData[info];
                if (info.indexOf("totalStars") < 0)
                    gameCompleted = eachStepData[info];
                else
                    this._updateStepData(step, eachStepInfo);
            }
        }

    },

    _updateStepState: function(step) {
        cc.log("_updateStepState");
        for (var i = 0; i < this._steps.length; i++) {
            var stepBtn = this._steps[i];
            var userData = stepBtn.getUserData();

            if (step == userData) {
                this._steps[i+1].setEnabled(true);
                UserStorage.getInstance().setLastLevelPlay(stepBtn.tag);
                SceneFlowController.getInstance().setLastedStepUnlocked(this._steps[i+1].getUserData());
            }
        }
    },

    _updateStepData: function(step, eachStepInfo) {
        // cc.log("_updateStepData");
        // cc.log("this._stepsStar: " + JSON.stringify(this._stepsStar));
        // cc.log("eachStepInfo: " + eachStepInfo);
        var stepStars = this._stepsStar[step];
        if (isNaN(eachStepInfo))
            eachStepInfo = parseInt(eachStepInfo);
        for (var i = 0; i < eachStepInfo; i++) {
            if (stepStars && stepStars[i]) {
                var star = stepStars[i];
                star.setSpriteFrame("star-filled.png");
            }
        }
    },

    _stepPressed: function(b) {
        AudioManager.getInstance().play(res.ui_click_mp3_2, false, null);
        if (this._touchBlocked)
            return;
        // cc.log("Level: " + b.tag);
        var level = SceneFlowController.getInstance().getLastedStepPressed();
        if (!level || !b)
            level = SceneFlowController.getInstance().getLastedStepUnlocked();

        // if (level && parseInt(level.charAt(0)) > 4)
        //     return;

        if (b) {
            level = b.getUserData();
        }

        // cc.log("level: " + level);
        this.showLevelDialog(level);
    },

    _prepareMap: function() {
        var ignoreMapScrollAnimation = KVDatabase.getInstance().getInt("ignoreMapScrollAnimation", 0);
        var delayTime = ignoreMapScrollAnimation ? 0 : 0.5;
        var step = SceneFlowController.getInstance().getLastedStepPressed();
        cc.log("step: " + step);
        // cc.log("ignoreMapScrollAnimation: " + ignoreMapScrollAnimation);
        // cc.log("delayTime: " + delayTime);

        if (!step)
            step = SceneFlowController.getInstance().getLastedStepUnlocked();
        cc.log("LAST STEP UNLOCKED: " + SceneFlowController.getInstance().getLastedStepUnlocked());
        
        this._steps.forEach(function(stp) {
            if (stp.getUserData() === step) {
                var xPos = stp.x - this._steps[0].x;
                this._scrollMapToPosX(xPos, delayTime);
                this.runAction(cc.sequence(
                    cc.delayTime(delayTime),
                    cc.callFunc(function() {
                        this._touchBlocked = false;
                        this._stepPressed();
                    }.bind(this))
                ))
            }
        }.bind(this));
    },

    _getLevelPosXByStep: function(step) {
        // cc.log("_getLevelPosXByStep");
        
    },

    _scrollMapToPosX: function(xPos, delay) {
        // cc.log("xpos:" + xPos);
        this._touchBlocked = true;
        this._scrollView.setContentOffsetInDuration(cc.p(-xPos, 0), delay);
    },

    onExit: function() {
        this._super();

        MapLayer.newLevelUnlocked = false;
        cc.audioEngine.stopMusic();
        KVDatabase.getInstance().set("ignoreMapScrollAnimation", 0);
    },

    showLetsPlayAlphaRacingDialog: function() {
        var dialog = new DialogLetsPlayAlpharacing("PLAY TIME!");
        this.addChild(dialog, 9);
        dialog.closeCallback = this.showLevelDialog;
    },

    showLevelDialog: function(level) {
        if (!level) {
            var level = SceneFlowController.getInstance().getLastedStepUnlocked() || SceneFlowController.getInstance().getLastedStepPressed();
        }
        cc.log ("getCurrentDialog - > " + Dialog.getCurrentDialog());
        if (level && !Dialog.getCurrentDialog()) {
            this.addChild(new LevelDialog(level));
        }
    },

    addUnlockLevelButton: function() {
        var button = new ccui.Button("res/SD/button-progress-tracker.png", "res/SD/button-progress-tracker-pressed.png", "");
        button.x = cc.winSize.width - button.width/2  - 60;
        button.y = cc.winSize.height - button.height + 10;
        button.scale = 1.3;
        this.addChild(button);
        button.addClickEventListener(function() {
            MapLayer.unlockAllLevel = !MapLayer.unlockAllLevel;
            cc.director.replaceScene(new MapScene());
        }.bind(this));

        var text = localizeForWriting(MapLayer.unlockAllLevel ? "Lock All Levels" : "Unlock All Levels");
        var lb = new cc.LabelBMFont(text, res.HomeFont_fnt);
        lb.scale = (button.width * 0.85) / lb.width;
        lb.x = button.width/2;
        lb.y = button.height/2 + 3;
        button.addChild(lb);
    },
});

MapLayer.TotalMapPart = 4;
MapLayer.TotalStarsEachStep = 6;
MapLayer.newLevelUnlocked = false;
MapLayer.unlockAllLevel = true;

var MapScene = cc.Scene.extend({
    ctor:function() {
        this._super();
        this.name = "map";
        var l = new MapLayer();
        this.addChild(l);
    }
});