var MapLayer = cc.Layer.extend({
    _poolParts: [],
    _btnStepCoordinates: [],

    _scrollView: null,

    ctor: function() {
        this._super();

        this._loadTmx();
        this._loadMapData();
        this._loadMapBg();
        // this._addStepButton();
    },

    _loadMapBg: function() {
        var scrollView = new cc.ScrollView();
        var lastPartXPos = 0;
        for (var i = 0; i < MapLayer.TotalMapPart; i++) {
            var path = "Map_Part" + (i+1) + "_jpg";
            cc.log("path -> " + res[path]);
            var mapPart = new cc.Sprite(res[path]);
            mapPart.anchorX = 0;
            mapPart.anchorY = 0;
            mapPart.x = lastPartXPos;

            scrollView.addChild(mapPart);

            for (var j = 0; j < 5; j++) {
                var pos = this._btnStepCoordinates[j];
                var btn = new ccui.Button("btn_level.png", "btn_level-pressed.png", "", ccui.Widget.PLIST_TEXTURE);
                btn.x = pos.x + (btn.anchorX - mapPart.anchorX) * btn.width;
                btn.y = pos.y + (btn.anchorY - mapPart.anchorY) * btn.height;
                scrollView.addChild(btn, 1);

                btn.addClickEventListener(this._stepPressed.bind(this));
            }

            lastPartXPos += + mapPart.width;
            this._poolParts.push(mapPart);

        }

        scrollView.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
        scrollView.setContentSize(cc.size(lastPartXPos, mapPart.height));
        scrollView.setViewSize(cc.director.getWinSize());
        this.addChild(scrollView);
        this._scrollView = scrollView;
    },

    _duplicateMapAt: function(idx) {},

    _loadMapData: function() {

    },

    _loadTmx: function() {
        this._btnStepCoordinates = [];

        var tiledMap = new cc.TMXTiledMap();
        tiledMap.initWithTMXFile(res.Map_TMX);

        var group = tiledMap.getObjectGroup("buttonPart1");
        var self = this;
        group.getObjects().forEach(function(obj) {
            self._btnStepCoordinates.push({
                "x": obj.x,
                "y": obj.y
            }); 
        });
        cc.log(JSON.stringify(self._btnStepCoordinates));
    },

    _addStepButton: function() {
        
    },

    _stepPressed: function(b) {},
});

MapLayer.TotalMapPart = 4;

var MapScene = cc.Scene.extend({
    ctor:function() {
        this._super();

        var l = new MapLayer();
        this.addChild(l);
    }
});