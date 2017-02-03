var CustomTableViewCell = cc.TableViewCell.extend({
    avatar: null,    
    lbIndex: null,
    lbName: null,
    lbScore: null,
    progressColor:null,
    draw:function (ctx) {
        this._super(ctx);
    }
});
var NAME_TAB = ["Alphabets","Numbers", "Vocabulary", "Math"];
var PROGRESSTRACKER = [];
var ProgressTrackerLayer = cc.LayerColor.extend({
    _tableView: null,
    arrayObjectInType: [],

    ctor: function () {
        // body...
        this._super(cc.color(255,255,255,255));
        this.addBackground();
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
    },
    onExit: function() {
        this._super();
        this._tableView = null;
    },

    _filterGameObjectJSON: function(key) {
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

                return gameObject.type == key;
            });
            self.arrayObjectInType = (objectArray);

        console.log("Aray Object:  => " + JSON.stringify(objectArray));

    },

    addBackground: function(){
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
            button.addClickEventListener(this._onPressed.bind(this));
        }
    },

    _onPressed: function(button) {
        AudioManager.getInstance().play(res.ui_click_mp3_0, false, null);
        this._button = button;
        var buttonName = button.name;
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
                // cc.director.runScene(new MapScene());
                break;
            case "Vocabulary":
                cc.log("Vocabulary");
                this._filterGameObjectJSON("object");
                // cc.director.replaceScene(new TalkingAdiScene());
                break;
            case "Math":
                cc.log("Math");
                // cc.director.replaceScene(new TalkingAdiScene());
                break;
            default:
                break;
        }
    },

    //TableView

    createTableView: function() {
        if(this._tableView)
            this._tableView.removeFromParent();
        this._tableView = new cc.TableView(this, cc.size(cc.winSize.width - 100, cc.winSize.height/4 * 3));
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

    // scrollViewDidScroll:function (view) {
    // },
    // scrollViewDidZoom:function (view) {
    // },

    // tableCellTouched:function (table, cell) {
    //     var index = this.numberOfCellsInTableView(table)-cell.getIdx()-1;
    // },

    tableCellSizeForIndex:function (table, idx) {
        return cc.size(200, cc.winSize.height/3 * 2);
    },

    tableCellAtIndex:function (table, idx) {
        cc.log("idx:" + idx);
        var self = this;
        var cell = table.dequeueCell();
        var index = idx;
        var data = this.arrayObjectInType[index];
        if (!cell) {
            cell = this.createCell(this.arrayObjectInType[index], table, idx);
        }
        else {
            data = this.arrayObjectInType[index];
            cell.lbName.setString(data["value"]);
            // var texture = cc.textureCache.addImage("default-avatar.png");
            // cell.avatar.setTexture(texture);
        }
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
        palaceFrame.y = 26;
        palaceFrame.anchorX = 0;
        palaceFrame.anchorY = 0
        palaceFrame.scale = 0.6;
        cell.addChild(palaceFrame);

        // cell.avatar = new cc.Sprite("default-avatar.png");
        // cell.avatar.x = clipper.width/2;
        // cell.avatar.y = clipper.height/2;
        // cell.avatar.scale = 30 / cell.avatar.width;
        // cell.avatar.tag = 114;
        // // Not load real avatar
        // cell.avatar.userData = false;
        // clipper.addChild(cell.avatar);

        cell.lbName = new cc.LabelBMFont(data["value"],  res.HomeFont_fnt);
        cell.lbName.x = 100;
        cell.lbName.y = palaceFrame.height/2;
        palaceFrame.addChild(cell.lbName);

        

        return cell;
    }

})