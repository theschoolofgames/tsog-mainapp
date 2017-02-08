var CustomTableViewCell = cc.TableViewCell.extend({
    avatar: null,    
    lbIndex: null,
    lbName: null,
    lbScore: null,
    progressColor:null,
    image: null,
    percent: null,
    draw:function (ctx) {
        this._super(ctx);
    }
});
var MAX_WIDTH = 200;
var NAME_TAB = ["Alphabets","Numbers", "Vocabulary", "Math"];
var PROGRESSTRACKER = [];
var ProgressTrackerLayer = cc.LayerColor.extend({
    _tableView: null,
    arrayObjectInType: [],
    _index : 0,
    _scrollBar: null,
    _scrollPoint: null,
    _currentIdx: 0,
    ctor: function () {
        // body...
        this._super(cc.color(255,255,255,255));
        cc.loader.loadJson(res.Progress_Config_JSON, function(err, data) {
            if (!err) {
                PROGRESSTRACKER = data;
            } else {
                cc.fileUtils.removeFile(Utils.getAssetsManagerPath() + res.Progress_Config_JSON);
                cc.loader.loadJson(res.Progress_Config_JSON, function(err, data) {
                    PROGRESSTRACKER = data;
                });
            }
        });
        var key = Object.keys(PROGRESSTRACKER);

        this._filterGameObjectJSON("word");
        this.createTableView();
        this.addButton();
        this.addBackButton();
        
        // var test = new cc.Sprite("res/SD/objects/salt.png");
        // test.x = cc.winSize.width/2;
        // test.y = cc.winSize.height/2;
        // this.addChild(test, 1000);
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function() { return true },
        }, this);

        this.scheduleUpdate();
        // cc.log("TEST: " + GameObjectsProgress.getInstance().countCompleted("word_a"));
    },
    update: function (dt) {
        // cc.log("IsDraging: " + this._tableView.isDragging());  
        var self = this;
        if(!this._tableView.isDragging() && !this._tableView.isTouchMoved()) {
            this._scrollBar.runAction(cc.sequence(
                cc.delayTime(1.5),
                cc.fadeOut(0.5),
                cc.callFunc(function(){
                    self._scrollBar.visible = false
                })
            )) 
        };
    },

    onExit: function() {
        this._super();
        this._tableView = null;
    },
    addBackButton: function(){
        var self = this;
        var button = new ccui.Button("back.png", "back-pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        button.x = 50;
        button.y = cc.winSize.height - 50;
        this.addChild(button);
        button.addClickEventListener(function(){
            self.removeFromParent();
        });
    },

    _filterGameObjectJSON: function(key, key2) {
        let self = this;
        this._type = key;
        self.arrayObjectInType = [];
        cc.loader.loadJson(res.Game_Object_JSON, function(err, data) {
            if (!err) {
                self.gameObjectJson = data;
            } else {
                cc.fileUtils.removeFile(Utils.getAssetsManagerPath() + res.Game_Object_JSON);
                cc.loader.loadJson(res.Game_Object_JSON, function(err, data) {
                    self.gameObjectJson = data;
                });
            }
        });

            var objectArray = self.gameObjectJson.filter((gameObject) => {
                if(key2)
                    return gameObject.type == key || gameObject.type == key2;
                return gameObject.type == key;
            });
            self.arrayObjectInType = (objectArray);

        console.log("Aray Object:  => " + JSON.stringify(objectArray));

    },

    addButton: function(){
        for(var i = 0; i < 4; i++){
            var button = new ccui.Button("block-empty.png", "", "", ccui.Widget.PLIST_TEXTURE);
            button.x = 200 + i * button.width;
            button.y = cc.winSize.height - 100;
            var string = NAME_TAB[i];
            // button.setColor(cc.color.RED);
            var lb = new cc.LabelBMFont(string, res.HudFont_fnt);
            lb.scale = 0.5;
            lb.x = button.width/2;
            lb.y = button.height/2;
            button.name = string;
            button.addChild(lb);
            this.addChild(button);
            button.setColor(cc.color.GREEN);
            if(i == 0) {
                button.setColor(cc.color.RED);
                this._currentButton = button;
            };
            button.addClickEventListener(this._onPressed.bind(this));
        }
    },

    _onPressed: function(button) {
        AudioManager.getInstance().play(res.ui_click_mp3_0, false, null);
        this._currentButton.setColor(cc.color.GREEN);
        var buttonName = button.name;
        button.setColor(cc.color.RED);
        switch(buttonName) {
            case "Alphabets":
                cc.log("Alphabets");
                this._filterGameObjectJSON("word");
                // this.addChild(new DialogPlayAlpharacing(false), HOME_DOOR_Z_ORDER+3);
                this._scale = 2;
                break;
            case "Numbers":
                cc.log("Numbers");
                this._filterGameObjectJSON("number");
                this._scale = 2;
                // cc.director.runScene(new MapScene());
                break;
            case "Vocabulary":
                cc.log("Vocabulary");
                this._filterGameObjectJSON("object", "animal");
                // cc.director.replaceScene(new TalkingAdiScene());
                break;
            case "Math":
                cc.log("Math");
                this._filterGameObjectJSON("math");
                this._scale = 1;
                // cc.director.replaceScene(new TalkingAdiScene());
                break;
            default:
                break;
        };
        this._currentButton = button;
        this.createTableView();
    },
    //CreateScrollBar
    createScrollBar: function () {
        // body...
        if(this._scrollBar)
            this._scrollBar.removeFromParent();
        var scrollbar = new cc.Sprite("res/SD/bar-scroll.png");
        scrollbar.x = cc.winSize.width/2;
        scrollbar.y = this._tableView.y - 50;
        this.addChild(scrollbar);
        this._scrollBar = scrollbar;
        scrollbar.scale = 2;
        var pointScroll = new cc.Sprite("res/SD/point-scroll.png");
        pointScroll.anchorX = 0;
        pointScroll.x = 0;
        pointScroll.y = this._scrollBar.height/2;
        this._scrollBar.addChild(pointScroll);
        this._scrollPoint = pointScroll;
        this._scrollBar.visible = false;
    },

    //TableView

    createTableView: function() {
        if(this._tableView)
            this._tableView.removeFromParent();
        this._tableView = new cc.TableView(this, cc.size(cc.winSize.width - 100, cc.winSize.height/2));
        this._tableView.setDelegate(this);
        this._tableView.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
        this._tableView.x = 30;
        this._tableView.y = 150;
        this.createScrollBar();
        this.addChild(this._tableView, 1);
        this._tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
        
    },

    scrollViewDidScroll:function (view) {
        this._scrollBar.stopAllActions();
        this._scrollBar.visible = true;
        this._scrollBar.opacity = 255;
        cc.log("getContentSize : " + this._tableView.getContentSize().width);
        
        this._scrollPoint.x = - this._scrollBar.width * this._tableView.getContentOffset().x/this._tableView.getContentSize().width;
    },
    scrollViewDidZoom:function (view) {
    },

    tableCellTouched:function (table, cell) {
        var pos = cell.getPosition();
        cc.log("POS: " + pos.x);
    },

    tableCellSizeForIndex:function (table, idx) {
        cc.log("tableCellSizeForIndex");
        var width = 200;
        if(this._type == "math")
            width = 400;
        return cc.size(width, cc.winSize.height/3 * 2);
    },

    tableCellAtIndex:function (table, idx) {
        this._index = idx;
        var self = this;
        var cell = table.dequeueCell();
        var index = idx;
        var data = this.arrayObjectInType[index];
        if (!cell) {
            cell = this.createCell(this.arrayObjectInType[index], table, idx);
        }
        else {
            data = this.arrayObjectInType[index];
            if(data["type"] == "word" || data["type"] == "number" || data["type"] == "math")
                cell.lbName.setString(data["value"]);
            var id = data["id"];     
            var percent = GameObjectsProgress.getInstance().countCompleted(id)/OBJECT_TOTAL_COMPLETED_COUNT * 100;
            percent = Math.ceil(percent);
            cell.progressColor.percentage = percent;
            cell.percent.setString(percent + "%");
            if(data["type"] == "object" || data["type"] == "animal") {
                var spritePath = "objects/" + data["value"].toLowerCase() + ".png";
                if (!jsb.fileUtils.isFileExist("res/SD/" + spritePath)) 
                    spritePath = "animals/" + data["value"].toLowerCase() + ".png";
                // cc.spriteFrameCache.
                cell.lbName.setString(data["value"].toUpperCase());
                cell.image.setTexture("res/SD/" + spritePath);
                this.setScaleImage(cell.image);
            };
            
        };
        return cell;
    },

    numberOfCellsInTableView:function (table) {
        var data = this.arrayObjectInType;
        return data.length;
    },

    createCell: function(data, table, idx) {
        cell = new CustomTableViewCell();
        var imagePath = "res/SD/square.png";
        if(this._type == "math")
            imagePath  = "res/SD/square2.png";
        var palaceFrame = new cc.Sprite(imagePath);
        // var palaceFrame = new cc.Scale9Sprite("res/SD/square.png", cc.rect(20.833333333,170.83333333, 83.333333333, 125));
        // palaceFrame.setPreferredSize(cc.size(100, 195.83333333));
        palaceFrame.x = 20;
        palaceFrame.y = 110;
        palaceFrame.anchorX = 0;
        palaceFrame.anchorY = 0;
        palaceFrame.scale = 0.6;
        cell.addChild(palaceFrame);

        
        //ProgressBar
        var progressBarBg = new cc.Sprite("#progress-bar.png");
        progressBarBg.x = palaceFrame.width/2;
        progressBarBg.y = 70 + progressBarBg.height/2;
        palaceFrame.addChild(progressBarBg);
        //       
        var id = data["id"];         
        var percent = GameObjectsProgress.getInstance().countCompleted(id)/OBJECT_TOTAL_COMPLETED_COUNT * 100;
        percent = Math.ceil(percent);
        var colorBar = new cc.Sprite("#colorbar.png");
        var gameProgressBar = new cc.ProgressTimer(colorBar);
        gameProgressBar.x = progressBarBg.width/2 - 1;
        gameProgressBar.y = progressBarBg.height/2 + 2;
        gameProgressBar.type = cc.ProgressTimer.TYPE_BAR;
        gameProgressBar.midPoint = cc.p(0, 1);
        gameProgressBar.barChangeRate = cc.p(1, 0);
        gameProgressBar.percentage = percent;
        progressBarBg.addChild(gameProgressBar);
        cell.progressColor = gameProgressBar;
        cell.percent = new cc.LabelBMFont(percent.toString() + "%",res.CustomFont_fnt);
        cell.percent.x = gameProgressBar.x;
        cell.percent.y = gameProgressBar.y - 40;
        cell.percent.scale = 0.5;
        progressBarBg.addChild(cell.percent);

        // gameProgressBar.shaderProgram = shaderScrolling;
        if(data["type"] == "word" || data["type"] == "number" || data["type"] == "math") {
            cell.lbName = new cc.LabelBMFont(data["value"],  res.HomeFont_fnt);
            cell.lbName.scale = 2;
            cell.lbName.x = palaceFrame.width/2;
            cell.lbName.y = palaceFrame.height/2 + 30;
            palaceFrame.addChild(cell.lbName);
        };
        if(data["type"] == "object" || data["type"] == "animal") {
            var spritePath = "objects/" + data["value"].toLowerCase() + ".png";
            if (!jsb.fileUtils.isFileExist("res/SD/" + spritePath)) 
                spritePath = "animals/" + data["value"].toLowerCase() + ".png";
            cell.image = new cc.Sprite("res/SD/" + spritePath);
            palaceFrame.addChild(cell.image);
            cell.image.x = palaceFrame.width/2;
            cell.image.y = palaceFrame.height/2 + 100;
            this.setScaleImage(cell.image);
            cell.lbName = new cc.LabelBMFont(data["value"].toUpperCase(),  res.HomeFont_fnt);
            cell.lbName.scale = 0.5;
            cell.lbName.x = palaceFrame.width/2;
            cell.lbName.y = progressBarBg.y + 50;
            palaceFrame.addChild(cell.lbName);
        };

        return cell;
    },
    setScaleImage: function(sprite){
        sprite.scale = 1;
        var scale = MAX_WIDTH/ Math.max(sprite.width,sprite.height);
        sprite.scale = scale;
    }

})