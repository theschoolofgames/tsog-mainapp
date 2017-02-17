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

    _completedSteps: null,

    _maxStepUnlockedOrder: 0,

    ctor: function() {
        this._super();
        this._whirlwinds  = [];
        this._stepsStar = {};
        this._loadTmx();
        this._getCompletedSteps();
        this._loadMapData();

        this.addSettingButton();
        // this.addBackToHomeScene();
        this._updateMapData();
    },

    onEnterTransitionDidFinish: function() {
        this._super();

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
        var isAllLevelUnlocked = 0

        var stepCounter = 0;

        this._steps = {
            "prefixToButton": {},
            "orderToButton": {}
        };
        var mapLabel = 0;
        var level = 0;
        var scrollView = new cc.ScrollView();
        scrollView.setBounceable(false);
        for (var map in this._mapData) {
            if (this._mapData.hasOwnProperty(map)) {
                var path = "Map_Part" + mapIndex + "_jpg";
                var mapPart = new cc.Sprite(res[path]);
                mapPart.x = lastPartXPos + mapPart.width/2;
                mapPart.y = cc.winSize.height/2;

                if (map.indexOf("assessment") > -1)
                    mapLabel++;
                else
                    mapLabel = parseInt(map);
                var _map = this._mapData[map];
                var _mapInArray = Object.keys(_map);
                var totalSteps = _mapInArray.length;

                for (var step in _map) {
                    if (_map.hasOwnProperty(step)) {
                        stepCounter++;
                        var val = _map[step];
                        level++;
                        var pos = this._btnStepCoordinates[stepIndex-1];
                        var enabled = (val == "1-1") ? true : false;
                        var btn = new ccui.Button("btn_level.png", "btn_level-pressed.png", "btn_level-disabled.png", ccui.Widget.PLIST_TEXTURE);
                        btn.x = pos.x + btn.width * 0.5 + mapPart.width * (mapLabel - 1);
                        btn.y = pos.y + btn.height * 1.5;
                        btn.setEnabled(isAllLevelUnlocked ? true : enabled);
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

                        // this._steps.push(btn);
                        this._steps["prefixToButton"][val] = {
                            'button': btn,
                            'order': stepCounter
                        };
                        this._steps["orderToButton"][stepCounter] = {
                            "button": btn,
                            "prefix": val
                        }
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
        this._whirlwinds.forEach(function(object) {
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

    _getCompletedSteps: function() {
        this._completedSteps = User.getCurrentUser().getCurrentChild().getLevelProgress().getCompletedSteps();
    },

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
    },

    _addStepStars: function(btn) {
        var self = this;
        var step = btn.getUserData();
        this._stepsStar[step] = {};
        this._stepsStar[step].stars = [];
        this._stepsStar[step].unlocked = 0;
        var stepData = [];

        var dataPath = "res/config/levels/" + "step-" + step + ".json";
        if(step.indexOf("assessment") > -1)
            dataPath = "res/config/levels/" + step +".json";
        if (!jsb.fileUtils.isFileExist(dataPath))
            return;
        cc.loader.loadJson(dataPath, function(err, data){
            if (!err && data) {
                stepData = data;
                var totalGameInStep = Object.keys(stepData).length;
                var st = Math.PI/5;
                var h = btn.width/2; 
                var k = btn.height/2 + 5;
                var r = 50;
                for(var i = totalGameInStep; i > 0; i--) { 
                    var angle = st * ((5 - totalGameInStep)/2 + i - 1/2);
                    var x = h + r*Math.cos(angle);
                    var y = k + r*Math.sin(angle);
                    
                    var star = new cc.Sprite("#star-empty.png");
                    star.scale = 0.35;
                    star.x = x;
                    star.y = y;
                    star.tag = i;
                    btn.addChild(star);
                    self._stepsStar[step].stars.push(star);
                }
            } else {
                cc.fileUtils.removeFile(Utils.getAssetsManagerPath() + res.Map_Data_JSON);
                cc.loader.loadJson(res.Map_Data_JSON, function(err, data) {
                });
            }
        });
        
    },

    _updateMapData: function() {
        if (this._completedSteps == null || this._completedSteps == "" || this._completedSteps == undefined) {
            return;
        }

        for (var stepIndex in this._completedSteps) {
            if (this._completedSteps.hasOwnProperty(stepIndex)) {
                var stepPrefix = stepIndex.substring(0, stepIndex.lastIndexOf("-"));
                var stepGame = stepIndex.substring(stepIndex.lastIndexOf("-") + 1);

                // Update step state: Enable corresponding step button, depends on stepPrefix
                this._steps["prefixToButton"][stepPrefix].button.setEnabled(true);

                // Update step data: Add a filled star to the corresponding step button, depends on stepIndex
                var stepUnlockedStars = this._stepsStar[stepPrefix].unlocked;
                this._stepsStar[stepPrefix].stars[stepUnlockedStars].setSpriteFrame("star-filled.png");
                stepUnlockedStars += 1;
                this._stepsStar[stepPrefix].unlocked = stepUnlockedStars;

                // Unlock next step button if there are enough stars required
                var stepTotalStars = this._stepsStar[stepPrefix].stars.length;
                var stepUnlockedStars = this._stepsStar[stepPrefix].unlocked;
                if (stepUnlockedStars * 1.0 / stepTotalStars >= NEW_LEVEL_UNLOCKING_STAR_RATIO) {
                    var currentStepOrder = this._steps["prefixToButton"][stepPrefix].order;
                    if (this._steps["orderToButton"][currentStepOrder + 1]) {
                        var nextStepButton = this._steps["orderToButton"][currentStepOrder + 1].button;
                        var nextStepPrefix = this._steps["orderToButton"][currentStepOrder + 1].prefix;
                        nextStepButton.setEnabled(true);
                        if (currentStepOrder + 1 > this._maxStepUnlockedOrder) {
                            this._maxStepUnlockedOrder = currentStepOrder + 1;
                            SceneFlowController.getInstance().setLastedStepUnlocked(nextStepPrefix);
                        }
                    }
                }
            }
        }
    },

    _stepPressed: function(b) {
        AudioManager.getInstance().play(res.ui_click_mp3_2, false, null);
        if (this._touchBlocked)
            return;
        var level = SceneFlowController.getInstance().getLastedStepPressed();
        if (!level)
            level = SceneFlowController.getInstance().getLastedStepUnlocked();

        if (b)
            level = b.getUserData();

        cc.log("level: " + level);
        if (level)
            this.addChild(new LevelDialog(level));
    },

    _prepareMap: function() {
        var ignoreMapScrollAnimation = KVDatabase.getInstance().getInt("ignoreMapScrollAnimation", 0);
        var delayTime = ignoreMapScrollAnimation ? 0 : 0.5;
        var step = SceneFlowController.getInstance().getLastedStepPressed();

        if (!step)
            step = SceneFlowController.getInstance().getLastedStepUnlocked() || "1-1";

        var latestUnlockedStepButton = this._steps["prefixToButton"][step]["button"];
        var firstButtonDeltaX = this._steps["prefixToButton"]["1-1"]["button"].x;
        var xPos = latestUnlockedStepButton.x - firstButtonDeltaX;
        this._scrollMapToPosX(xPos, delayTime);
        this.runAction(cc.sequence(
            cc.delayTime(delayTime),
            cc.callFunc(function() {
                this._touchBlocked = false;
                this._stepPressed();
            }.bind(this))
        ));
    },

    _scrollMapToPosX: function(xPos, delay) {
        this._touchBlocked = true;
        this._scrollView.setContentOffsetInDuration(cc.p(-xPos, 0), delay);
    },

    onExit: function() {
        this._super();

        cc.audioEngine.stopMusic();
        KVDatabase.getInstance().set("ignoreMapScrollAnimation", 0);
    },
});

MapLayer.TotalMapPart = 4;
MapLayer.TotalStarsEachStep = 6;

var MapScene = cc.Scene.extend({
    ctor:function() {
        this._super();
        this.name = "map";
        var l = new MapLayer();
        this.addChild(l);
    }
});