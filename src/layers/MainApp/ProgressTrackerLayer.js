var CustomTableViewCell = cc.TableViewCell.extend({
    avatar: null,    
    lbIndex: null,
    lbName: null,
    lbScore: null,
    progressColor:null,
    image: null,
    percent: null,
    palaceFrame:null,
    draw:function (ctx) {
        this._super(ctx);
    }
});
var MAX_WIDTH = 150;
var NAME_TAB = ["Alphabets","Numbers", "Vocabulary", "Math"];
var PROGRESSTRACKER = [];
var ProgressTrackerLayer = cc.LayerColor.extend({
    _tableView: null,
    arrayObjectInType: [],
    _index : 0,
    _scrollBar: null,
    _scrollPoint: null,
    _currentIdx: 0,
    _typeTab: null,
    _tabBg: null,

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
        this._createBackground();
        this._addPageBorders();
        this._typeTab = "alphabets";
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
    _createBackground: function() {
        var topPageW = cc.winSize.width;
        var topPageH = cc.winSize.height / 5;

        var bottomPageW = cc.winSize.width;
        var bottomPageH = cc.winSize.height - topPageH;

        var topPage = new cc.LayerColor(cc.color(94, 63, 48, 255), topPageW, topPageH);
        topPage.setPosition(0, cc.winSize.height - topPageH);
        this.addChild(topPage);

        var bottomPage = new cc.LayerColor(cc.color(107, 76, 61, 255), bottomPageW, bottomPageH);
        bottomPage.setPosition(0, 0);
        this.addChild(bottomPage);

        var payBackground = RepeatingSpriteNode.create(res.Pay_background_png, cc.winSize.width, bottomPageH);
        payBackground.setAnchorPoint(0, 1);
        payBackground.x = 10;
        payBackground.y = bottomPageH - 10;
        this.addChild(payBackground);

        var pageBreakingLine = new cc.Sprite(res.Pay_breaking_line_png);
        pageBreakingLine.setAnchorPoint(0, 0.5);
        pageBreakingLine.setScale(cc.winSize.width / pageBreakingLine.width);
        pageBreakingLine.x = 0;
        pageBreakingLine.y = bottomPageH;
        this.addChild(pageBreakingLine);

        this._bottomPageH = bottomPageH;
    },

    _addPageBorders: function() {
        var topBorder = RepeatingSpriteNode.create(res.Pay_border_png, cc.winSize.width, 0);
        topBorder.setAnchorPoint(0, 1);
        topBorder.x = 0;
        topBorder.y = cc.winSize.height;
        this.addChild(topBorder);

        var bottomBorder = RepeatingSpriteNode.create(res.Pay_border_png, cc.winSize.width, 0);
        bottomBorder.setScale(-1, -1);
        bottomBorder.x = cc.winSize.width;
        bottomBorder.y = 0;
        this.addChild(bottomBorder);
    },

    onExit: function() {
        this._super();
        this._tableView = null;
    },
    addBackButton: function(){
        var self = this;
        var button = new ccui.Button("back.png", "back-pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        button.x = 50;
        button.y = cc.winSize.height - 70;
        this.addChild(button);
        button.addClickEventListener(function(){
            AudioManager.getInstance().play(res.ui_click_mp3_2, false, null);
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
        this._bgBtnChoose = new cc.Sprite("res/SD/progresstracker/tab.png");
        for(var i = 0; i < 4; i++){
            var button = new ccui.Button("res/SD/progresstracker/tab-normal.png", "res/SD/progresstracker/tab-normal.png", "");
            button.x = 200 + i * (button.width - 2);
            button.y = cc.winSize.height - 75;
            var string = NAME_TAB[i];
            // button.setColor(cc.color.RED);
            var lb = new cc.LabelBMFont(localizeForWriting(string), "res/font/progresstrackerfont-export.fnt");
            lb.scale = 0.63;
            lb.x = button.width/2;
            lb.y = button.height/2 + 10;
            button.name = string;
            button.addChild(lb);
            this.addChild(button, 5);
            // button.setColor(cc.color.GREEN);
            if(i == 0) {
                // button.setColor(cc.color.RED);
                button.setZOrder(10);
                this._currentButton = button;
                // button.setEnabled(false);
                this._bgBtnChoose.x = button.width/2 + 1;
                this._bgBtnChoose.y = button.height/2 - 1;
                button.addChild(this._bgBtnChoose, 1);
                var lbChoose = new cc.LabelBMFont(localizeForWriting(string), "res/font/grownupcheckfont-export.fnt");
                lbChoose.scale = 0.4;
                lbChoose.x = this._bgBtnChoose.width/2;
                lbChoose.y = this._bgBtnChoose.height/2 + 10;
                lbChoose.tag = 1;
                this._bgBtnChoose.addChild(lbChoose);
            };
            button.addClickEventListener(this._onPressed.bind(this));
        }
    },

    _onPressed: function(button) {
        AudioManager.getInstance().play(res.ui_click_mp3_0, false, null);

        this._currentButton.setZOrder(1);
        // this._currentButton.setColor(cc.color.GREEN);
        // this._currentButton.enabled = (true);
        button.setZOrder(10);
        this._bgBtnChoose.removeFromParent();
        var buttonName = button.name;
        // button.setColor(cc.color.RED);
        // button.enabled = (false);
        this._bgBtnChoose = new cc.Sprite("res/SD/progresstracker/tab.png");
        this._bgBtnChoose.x = button.width/2 + 1;
        this._bgBtnChoose.y = button.height/2 - 1;
        var lbChoose = new cc.LabelBMFont(localizeForWriting(buttonName), "res/font/grownupcheckfont-export.fnt");
        lbChoose.scale = 0.4;
        lbChoose.x = this._bgBtnChoose.width/2;
        lbChoose.y = this._bgBtnChoose.height/2 + 10;
        lbChoose.tag = 1;
        button.addChild(this._bgBtnChoose, 1);
        this._bgBtnChoose.addChild(lbChoose);
        switch(buttonName) {
            case "Alphabets":
                cc.log("Alphabets");
                this._typeTab = "alphabets";
                this._filterGameObjectJSON("word");
                // this.addChild(new DialogPlayAlpharacing(false), HOME_DOOR_Z_ORDER+3);
                this._scale = 2;
                break;
            case "Numbers":
                cc.log("Numbers");
                this._typeTab = "number";
                this._filterGameObjectJSON("number");
                this._scale = 2;
                // cc.director.runScene(new MapScene());
                break;
            case "Vocabulary":
                cc.log("Vocabulary");
                this._typeTab = "vocabulary";
                this._filterGameObjectJSON("object", "animal");
                // cc.director.replaceScene(new TalkingAdiScene());
                break;
            case "Math":
                cc.log("Math");
                this._typeTab = "math";
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
        var scrollbar = new cc.Sprite("res/SD/progresstracker/bar-scroll.png");
        scrollbar.x = cc.winSize.width/2;
        scrollbar.y = this._tableView.y - 40;
        this.addChild(scrollbar,5);
        this._scrollBar = scrollbar;
        var pointScroll = new cc.Sprite("res/SD/progresstracker/point-scroll.png");
        pointScroll.anchorX = 0;
        pointScroll.x = 0;
        pointScroll.y = this._scrollBar.height/2;
        this._scrollBar.addChild(pointScroll);
        this._scrollPoint = pointScroll;
        this._scrollBar.visible = false;
    },

    //TableView

    createTableView: function() {
        // if(this._tabBg){
        //     this._tabBg.removeFromParent();
        // };
        // var tabBg = new cc.Sprite(this._typeTab + "-tab-bg.png");
        // tabBg.x = cc.winSize.width/2;
        // tabBg.y = cc.winSize.height/2;
        // this.addChild(tabBg);
        // this._tabBg = tabBg;

        if(this._tableView)
            this._tableView.removeFromParent();
        this._tableView = new cc.TableView(this, cc.size(cc.winSize.width - 70, cc.winSize.height/3 * 2));
        this._tableView.setDelegate(this);
        this._tableView.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
        this._tableView.x = 30;
        this._tableView.y = 80;
        this.createScrollBar();
        this.addChild(this._tableView, 2);
        this._tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
        
    },

    scrollViewDidScroll:function (view) {
        this._scrollBar.stopAllActions();
        this._scrollBar.visible = true;
        this._scrollBar.opacity = 255;
        cc.log("getContentSize : " + this._tableView.getContentSize().width);
        cc.log("POS: " + this._tableView.getContentOffset().x);
        
        this._scrollPoint.x = - (this._scrollBar.width - this._scrollPoint.width) * this._tableView.getContentOffset().x/(this._tableView.getContentSize().width - 1000 * Utils.getScaleFactorTo16And9());
    },
    scrollViewDidZoom:function (view) {
    },

    tableCellTouched:function (table, cell) {
        var pos = cell.getPosition();
        cc.log("POS: " + pos.x);
    },

    tableCellSizeForIndex:function (table, idx) {
        cc.log("tableCellSizeForIndex");
        var width = 300;
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
                cell.lbName.setString(localizeForWriting(data["value"]).toUpperCase());
                if(localizeForWriting(data["value"]).length > 10)
                    cell.lbName.scale = cell.palaceFrame.width/(cell.lbName.width + 50);
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
        var imagePath = "res/SD/progresstracker/square.png";
        if(this._type == "math")
            imagePath  = "res/SD/progresstracker/square2.png";
        var palaceFrame = new cc.Sprite(imagePath);
        // var palaceFrame = new cc.Scale9Sprite("res/SD/square.png", cc.rect(20.833333333,170.83333333, 83.333333333, 125));
        // palaceFrame.setPreferredSize(cc.size(100, 195.83333333));
        palaceFrame.x = 20;
        palaceFrame.y = 100;
        palaceFrame.anchorX = 0;
        palaceFrame.anchorY = 0;
        cell.addChild(palaceFrame);
        cell.palaceFrame = palaceFrame;
        
        //ProgressBar
        var progressBarBg = new cc.Sprite("res/SD/progresstracker/progressbarbg-tracker.png");
        progressBarBg.x = palaceFrame.width/2;
        progressBarBg.y = -10 - progressBarBg.height/2;
        palaceFrame.addChild(progressBarBg);
        //       
        var id = data["id"];         
        var percent = GameObjectsProgress.getInstance().countCompleted(id)/OBJECT_TOTAL_COMPLETED_COUNT * 100;
        percent = Math.ceil(percent);
        var colorBar = new cc.Sprite("res/SD/progresstracker/color-tracker.png");
        var gameProgressBar = new cc.ProgressTimer(colorBar);
        gameProgressBar.x = progressBarBg.width/2 - 1;
        gameProgressBar.y = progressBarBg.height/2;
        gameProgressBar.type = cc.ProgressTimer.TYPE_BAR;
        gameProgressBar.midPoint = cc.p(0, 1);
        gameProgressBar.barChangeRate = cc.p(1, 0);
        gameProgressBar.percentage = percent;
        progressBarBg.addChild(gameProgressBar);
        cell.progressColor = gameProgressBar;
        cell.percent = new cc.LabelBMFont(percent.toString() + "%","res/font/grownupcheckfont-export.fnt");
        cell.percent.x = gameProgressBar.x;
        cell.percent.y = gameProgressBar.y - 40;
        cell.percent.scale = 0.6;
        progressBarBg.addChild(cell.percent);
        var light = new cc.Sprite("res/SD/progresstracker/light.png");
        light.x = palaceFrame.width/2;
        light.y = palaceFrame.height/2;
        palaceFrame.addChild(light);

        // gameProgressBar.shaderProgram = shaderScrolling;
        if(data["type"] == "word" || data["type"] == "number" || data["type"] == "math") {
            cell.lbName = new cc.LabelBMFont(data["value"],  "res/font/grownupcheckfont-export.fnt");
            cell.lbName.scale = 2.3;
            cell.lbName.y = palaceFrame.height/2 + 30;
            if(data["type"] == "math"){
                cell.lbName.scale = 1.2;
                cell.lbName.y = palaceFrame.height/2 + 10;
            }
            cell.lbName.x = palaceFrame.width/2;
            palaceFrame.addChild(cell.lbName);
        };
        if(data["type"] == "object" || data["type"] == "animal") {
            light.y = light.y  + 20;
            var spritePath = "objects/" + data["value"].toLowerCase() + ".png";
            if (!jsb.fileUtils.isFileExist("res/SD/" + spritePath)) 
                spritePath = "animals/" + data["value"].toLowerCase() + ".png";
            cell.image = new cc.Sprite("res/SD/" + spritePath);
            palaceFrame.addChild(cell.image);
            cell.image.x = palaceFrame.width/2;
            cell.image.y = palaceFrame.height/2 + 50;
            this.setScaleImage(cell.image);
            cell.lbName = new cc.LabelBMFont(localizeForWriting(data["value"]).toUpperCase(),  "res/font/grownupcheckfont-export.fnt");
            cell.lbName.scale = 0.5;
            cell.lbName.x = palaceFrame.width/2;
            cell.lbName.y = 40;
            palaceFrame.addChild(cell.lbName);
        };
        if(localizeForWriting(data["value"]).length > 10)
            cell.lbName.scale = cell.palaceFrame.width/(cell.lbName.width + 50);

        return cell;
    },
    setScaleImage: function(sprite){
        sprite.scale = 1;
        var scale = MAX_WIDTH/ Math.max(sprite.width,sprite.height);
        sprite.scale = scale;
    }

})