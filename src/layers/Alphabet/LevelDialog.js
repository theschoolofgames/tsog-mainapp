var LevelDialog = Dialog.extend({
    _level: null,
    _dialogBg: null,
    _layerContent: null,

    _data: null,
    _scenePool: null,

    ctor: function(level) {
        this._super();

        this._addDialog();
        this._addLayerContent();

        // level = "1-1"; // testing
        if (level) {
            this._level = level;
            this._fetchDataAtLevel(level);
        }

    },

    _addDialog: function() {
        this._dialogBg = new cc.Sprite("#level_dialog_frame.png");
        this._dialogBg.x = cc.winSize.width/2;
        this._dialogBg.y = cc.winSize.height/2;
        this.addChild(this._dialogBg);

        var banner = new cc.Sprite("#level_dialog_banner.png");
        banner.x = this._dialogBg.width/2;
        banner.y = this._dialogBg.height;
        this._dialogBg.addChild(banner);

        var closeBtn = new ccui.Button("btn_x.png", "btn_x-pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        closeBtn.x = this._dialogBg.width - closeBtn.width/2 + 20 * this._csf;
        closeBtn.y = this._dialogBg.height - closeBtn.height/2;
        this._dialogBg.addChild(closeBtn);

        closeBtn.addClickEventListener(this._closePressed.bind(this));
    },

    _addLayerContent: function() {
        var l = new cc.Layer();
        l.setContentSize(cc.size(this._dialogBg.width - 50, this._dialogBg.height/2));
        l.x = 25 * this._csf;
        l.y = 100 * this._csf;
        this._dialogBg.addChild(l);
        this._layerContent = l;
    },

    _addGamesSelector: function() {
        this._scenePool = [];
        var itemIdx = 0;
        var rowIdx = 1;
        var totalRow = Math.ceil(Object.keys(this._data).length / 3);
        var itemInARow = 3;
        var lastSelectorXPos = 0;
        var layerContentSizeHeight = this._layerContent.getContentSize().height;
        for (var data in this._data) {
            if (this._data.hasOwnProperty(data)) {
                var dt = this._data[data];
                var gameName = dt["1"].name;
                var gameData = dt["1"].data;

                // cc.log("itemIdx: " + itemIdx);
                // cc.log("lastSelectorXPos: " + lastSelectorXPos);
                var gameSelectorImageName = "icon_game_" + gameName + ".png";
                // cc.log("gameSelectorImageName " + gameSelectorImageName);
                var gameSelector = new ccui.Button(gameSelectorImageName, "", "", ccui.Widget.PLIST_TEXTURE);
                gameSelector.x = lastSelectorXPos + gameSelector.width/2 + 50 * this._csf;
                gameSelector.y = (itemIdx < itemInARow) ? (layerContentSizeHeight/2 + gameSelector.height/2) : (layerContentSizeHeight/2 - gameSelector.height/2);

                // set data to selector
                var gameTag = -1;
                for (var i = 0; i < GAME_IDS.length; i++) {
                    if (GAME_IDS[i].indexOf(gameName) > -1) {
                        gameTag = i;
                    }
                }

                gameSelector.setUserData(JSON.stringify(gameData));
                gameSelector.tag = gameTag;
                gameSelector.addClickEventListener(this._gameSelectorPressed.bind(this));

                this._layerContent.addChild(gameSelector);
                this._scenePool[gameTag] = [];
                this._scenePool[gameTag].push(dt);
                if (++itemIdx >= itemInARow && rowIdx < totalRow) {
                    rowIdx++;
                    lastSelectorXPos = 0;
                } else
                    lastSelectorXPos = lastSelectorXPos + gameSelector.width + 25 * this._csf;
            }
        }
    },

    _closePressed: function() {
        this.removeFromParent();
    },

    _fetchDataAtLevel: function(level) {
        var self = this;
        var dataPath = "res/config/levels/" + currentLanguage + "/" + "step-" + level + "." + currentLanguage +".json";
        cc.loader.loadJson(dataPath, function(err, data){
            if (!err) {
                self._data = data;
                self._addGamesSelector();
                // cc.log("self._data " + JSON.stringify(data));
            } else {
                cc.fileUtils.removeFile(Utils.getAssetsManagerPath() + res.Map_Data_JSON);
                cc.loader.loadJson(res.Map_Data_JSON, function(err, data) {
                    self._data = data;
                });
            }
        });
    },

    _gameSelectorPressed: function(b) {
        var data = b.getUserData();
        var gameName = GAME_IDS[b.tag];
        // cc.log("data _gameSelectorPressed : " + b.getUserData());
        // process redirecting
        SceneFlowController.getInstance().cacheData(this._level, gameName, this._scenePool[b.tag]);
        SceneFlowController.getInstance().moveToNextScene(gameName, data); 
    },

});