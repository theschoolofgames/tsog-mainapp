var MapLayer = cc.Layer.extend({
    _poolParts: [],
    _btnStepCoordinates: [],

    _mapData: null,
    _scrollView: null,

    ctor: function() {
        this._super();

        this._loadTmx();
        this._loadMapData();
        // this._loadMapBg();
        // this._addStepButton();
    },

    _loadMapBg: function() {
        var lastPartXPos = 0;
        var stepIndex = 1;
        var mapIndex = 1;

        var scrollView = new cc.ScrollView();
        for (var map in this._mapData) {
            if (this._mapData.hasOwnProperty(map) && map.indexOf("assessment") < 0) {
                var path = "Map_Part" + mapIndex + "_jpg";
                var mapPart = new cc.Sprite(res[path]);
                mapPart.x = lastPartXPos + mapPart.width/2;
                mapPart.y = cc.winSize.height/2;
                
                var _map = this._mapData[map];
                var _mapInArray = Object.keys(_map);
                var totalSteps = _mapInArray.length;
                cc.log("totalSteps -> " + totalSteps);
                for (var step in _map) {
                    if (_map.hasOwnProperty(step)) {
                        var val = _map[step];
                        // cc.log("val -> _mapInArray[totalSteps-1] " + val + " -> " + _mapInArray[totalSteps-1]);
                        var pos = this._btnStepCoordinates[stepIndex-1];
                        var btn = new ccui.Button("btn_level.png", "btn_level-pressed.png", "", ccui.Widget.PLIST_TEXTURE);
                        btn.x = pos.x + btn.width * 0.5 + mapPart.width * (parseInt(map) - 1);
                        btn.y = pos.y + btn.height * 1.5;
                        btn.setTitleText(val);
                        btn.setTitleFontSize(32);
                        btn.setTitleColor(cc.color.BLACK);
                        scrollView.addChild(btn, 1);

                        btn.addClickEventListener(this._stepPressed.bind(this));

                        if ((stepIndex%5 > 0) && _mapInArray[totalSteps-1] == step) {

                            cc.log("stepIndex: " + stepIndex);
                            cc.log("add bonus step -> " + (5 - (stepIndex%5)));
                            cc.log("step -> _mapInArray[totalSteps-1] " + step + " -> " + _mapInArray[totalSteps-1]);

                            stepIndex += 5 - (stepIndex%5);
                        }

                        stepIndex = (stepIndex >= this._btnStepCoordinates.length) ? 1 : (stepIndex+1);
                    }
                }
                
                scrollView.addChild(mapPart);

                lastPartXPos += mapPart.width;
                this._poolParts.push(mapPart);

                mapIndex = (mapIndex >= 4) ? 1 : (mapIndex+1);
            }
        }

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
        var csf = cc.director.getContentScaleFactor();
        var tiledMap = new cc.TMXTiledMap();
        tiledMap.initWithTMXFile(res.Map_TMX);

        // var group = tiledMap.getObjectGroup("buttonPart1");
        var self = this;
        tiledMap.getObjectGroups().forEach(function(group) {
            if (group.getGroupName().startsWith("buttonPart")) {
                group.getObjects().forEach(function(obj) {
                    self._btnStepCoordinates.push({
                        "x": obj.x * csf,
                        "y": obj.y * csf
                    }); 
                });
            }
        });
        // cc.log("this._btnStepCoordinates: " + JSON.stringify(this._btnStepCoordinates));
        // cc.log("this._btnStepCoordinates length : " + this._btnStepCoordinates.length);
    },

    _addStepButton: function(lastPartXPos) {
        
    },

    _stepPressed: function(b) {
        cc.log("_stepPressed");
    },
});

MapLayer.TotalMapPart = 4;

var MapScene = cc.Scene.extend({
    ctor:function() {
        this._super();

        var l = new MapLayer();
        this.addChild(l);
    }
});