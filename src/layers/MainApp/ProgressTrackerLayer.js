var CustomTableViewCell = cc.TableViewCell.extend({
    avatar: null,    
    lbIndex: null,
    lbName: null,
    lbScore: null,
    progressColor:null,
    image: null,
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
        cc.log("PROGRESSTRACKER: " + JSON.stringify(key));

        this._filterGameObjectJSON("word");
        this.createTableView();
        this.addButton();
        this.addBackButton();
        // var test = new cc.Sprite("res/SD/objects/salt.png");
        // test.x = cc.winSize.width/2;
        // test.y = cc.winSize.height/2;
        // this.addChild(test, 1000);
        cc.log("TEST: " + GameObjectsProgress.getInstance().countCompleted("word_a"));
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
                this.createTableView();
                // this.addChild(new DialogPlayAlpharacing(false), HOME_DOOR_Z_ORDER+3);
                break;
            case "Numbers":
                cc.log("Numbers");
                this._filterGameObjectJSON("number");
                this.createTableView();
                // cc.director.runScene(new MapScene());
                break;
            case "Vocabulary":
                cc.log("Vocabulary");
                this._filterGameObjectJSON("object", "animal");
                this.createTableView();
                // cc.director.replaceScene(new TalkingAdiScene());
                break;
            case "Math":
                cc.log("Math");
                // cc.director.replaceScene(new TalkingAdiScene());
                break;
            default:
                break;
        };
        this._currentButton = button;
    },

    //TableView

    createTableView: function() {
        if(this._tableView)
            this._tableView.removeFromParent();
        this._tableView = new cc.TableView(this, cc.size(cc.winSize.width - 100, cc.winSize.height/2));
        this._tableView.setDelegate(this);
        this._tableView.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
        this._tableView.x = 30;
        this._tableView.y = 100;
        // var layer = new cc.LayerColor(cc.color.RED, cc.winSize.width - 100, cc.winSize.height/3 * 2);
        // this._tableView.addChild(layer,100000);
        this.addChild(this._tableView);
        this._tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
        cc.log("ODER: " + this._tableView.getVerticalFillOrder());
        
    },

    scrollViewDidScroll:function (view) {
    },
    scrollViewDidZoom:function (view) {
    },

    tableCellTouched:function (table, cell) {
        
    },

    tableCellSizeForIndex:function (table, idx) {
        return cc.size(200, cc.winSize.height/3 * 2);
    },

    tableCellAtIndex:function (table, idx) {
        cc.log("idx:" + idx);
        var self = this;
        var cell = table.dequeueCell();
        var index = idx;
        var data = this.arrayObjectInType[index];
        cc.log("DATA: " + JSON.stringify(data));
        if (!cell) {
            cell = this.createCell(this.arrayObjectInType[index], table, idx);
        }
        else {
            data = this.arrayObjectInType[index];
            if(data["type"] == "word" || data["type"] == "number")
                cell.lbName.setString(data["value"]);
            var id = data["id"];         
            var pecent = GameObjectsProgress.getInstance().countCompleted(id)/OBJECT_TOTAL_COMPLETED_COUNT;
            cell.progressColor.percentage = pecent * 100;
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
        cc.log("createCell: " + JSON.stringify(data));
        cell = new CustomTableViewCell();
        var palaceFrame = new cc.Sprite("res/SD/square.png");
        palaceFrame.x = 20;
        palaceFrame.y = 110;
        palaceFrame.anchorX = 0;
        palaceFrame.anchorY = 0
        palaceFrame.scale = 0.6;
        cell.addChild(palaceFrame);

        
        //ProgressBar
        var progressBarBg = new cc.Sprite("#progress-bar.png");
        progressBarBg.x = palaceFrame.width/2;
        progressBarBg.y = 40 + progressBarBg.height/2;
        palaceFrame.addChild(progressBarBg);
        //       
        cc.log("ID: " + data["id"]);  
        var id = data["id"];         
        var pecent = GameObjectsProgress.getInstance().countCompleted(id)/OBJECT_TOTAL_COMPLETED_COUNT;
        cc.log("pecent: " + pecent);
        var colorBar = new cc.Sprite("#colorbar.png");
        var gameProgressBar = new cc.ProgressTimer(colorBar);
        gameProgressBar.x = progressBarBg.width/2 - 1;
        gameProgressBar.y = progressBarBg.height/2 + 2;
        gameProgressBar.type = cc.ProgressTimer.TYPE_BAR;
        gameProgressBar.midPoint = cc.p(0, 1);
        gameProgressBar.barChangeRate = cc.p(1, 0);
        gameProgressBar.percentage = pecent * 100;
        // gameProgressBar.shaderProgram = shaderScrolling;
        progressBarBg.addChild(gameProgressBar);
        cell.progressColor = gameProgressBar;
        if(data["type"] == "word" || data["type"] == "number") {
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