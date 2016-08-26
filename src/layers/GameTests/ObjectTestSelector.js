var ObjectsTableViewCell = cc.TableViewCell.extend({
    _sprite: null,
    _label: null,

    ctor: function(){
        this._super();
        
        this._sprite = new cc.Sprite(res.checkbox_normal);
        this._sprite.anchorX = 0;
        this._sprite.anchorY = 0;
        this._sprite.x = 0;
        this._sprite.y = 0;
        this.addChild(this._sprite);

        this._label = new cc.LabelTTF("id", "Helvetica", 25.0);
        this._label.x = 50;
        this._label.y = 0;
        this._label.anchorX = 0;
        this._label.anchorY = 0;
        this.addChild(this._label);
    },

    draw:function (ctx) {
        this._super(ctx);
    },

    check: function(isChecked) {
        if (isChecked)
            this._sprite.setTexture(res.checkbox_active);
        else 
            this._sprite.setTexture(res.checkbox_normal);
    },

    getLabel: function() {
        return this._label;
    },
});

var ObjectTestSelectorLayer = cc.Layer.extend({
    gameObjectJson: null,
    arrayObjectInType: [],
    _gameId: "",

    ctor:function(gameId){
        this._super();

        this.arrayObjectInType = [];
        this._gameId = gameId;

        this._addButtons();

        this._parseGameObjectJSON();
    },

    _parseGameObjectJSON: function() {
        let self = this;
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

        console.log("GameObjects => " + self.gameObjectJson.length);

        for (var i = 0; i <= GAME_OBJECT_TYPES.length - 1; i++) {
            var objectArray = self.gameObjectJson.filter((gameObject) => {
                if (!gameObject.hasOwnProperty("isChecked")){
                    gameObject.isChecked = false;
                }

                return gameObject.type == GAME_OBJECT_TYPES[i];
            });

            self.arrayObjectInType.push(objectArray);
        }

        console.log("Aray Object:  => " + self.arrayObjectInType[0].length);

        this._addTypesTable();
    },

    _addTypesTable: function() {
        var winSize = cc.director.getWinSize();

        var tableView = new cc.TableView(this, cc.size(winSize.width / 4, winSize.height / 2 - 30));
        tableView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        tableView.x = 20;
        tableView.y = winSize.height / 2;
        tableView.setDelegate(this);
        tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
        tableView.tag = 0;
        this.addChild(tableView);
        tableView.reloadData();

        var label = new cc.LabelTTF("Object", "Helvetica", 25.0);
        label.x = 20;
        label.y = winSize.height - 40;
        label.anchorX = 0;
        label.anchorY = 0;
        label.setColor(new cc.Color(124,252,0,1.0));
        this.addChild(label);

        tableView = new cc.TableView(this, cc.size(winSize.width / 4, winSize.height / 2 - 30));
        tableView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        tableView.x = winSize.width / 4 + 20;
        tableView.y = winSize.height / 2;
        tableView.setDelegate(this);
        tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
        tableView.tag = 1;
        this.addChild(tableView);
        tableView.reloadData();

        label = new cc.LabelTTF("Animal", "Helvetica", 25.0);
        label.x = winSize.width / 4 + 20;
        label.y = winSize.height - 40;
        label.anchorX = 0;
        label.anchorY = 0;
        label.setColor(new cc.Color(124,252,0,1.0));
        this.addChild(label);

        tableView = new cc.TableView(this, cc.size(winSize.width / 4, winSize.height / 2 - 30));
        tableView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        tableView.x = winSize.width / 4 * 2 + 20;
        tableView.y = winSize.height / 2;
        tableView.setDelegate(this);
        tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
        tableView.tag = 2;
        this.addChild(tableView);
        tableView.reloadData();

        label = new cc.LabelTTF("Number", "Helvetica", 25.0);
        label.x = winSize.width / 4 * 2 + 20;
        label.y = winSize.height - 40;
        label.anchorX = 0;
        label.anchorY = 0;
        label.setColor(new cc.Color(124,252,0,1.0));
        this.addChild(label);

        tableView = new cc.TableView(this, cc.size(winSize.width / 4, winSize.height / 2 - 30));
        tableView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        tableView.x = 20;
        tableView.y = 0;
        tableView.setDelegate(this);
        tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
        tableView.tag = 3;
        this.addChild(tableView);
        tableView.reloadData();

        label = new cc.LabelTTF("Word", "Helvetica", 25.0);
        label.x = 20;
        label.y = winSize.height / 2 - 40;
        label.anchorX = 0;
        label.anchorY = 0;
        label.setColor(new cc.Color(124,252,0,1.0));
        this.addChild(label);

        tableView = new cc.TableView(this, cc.size(winSize.width / 4, winSize.height / 2 - 30));
        tableView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        tableView.x = winSize.width / 4 + 20;
        tableView.y = 0;
        tableView.setDelegate(this);
        tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
        tableView.tag = 4;
        this.addChild(tableView);
        tableView.reloadData();

        label = new cc.LabelTTF("Color", "Helvetica", 25.0);
        label.x = winSize.width / 4 + 20;
        label.y = winSize.height / 2 - 40;
        label.anchorX = 0;
        label.anchorY = 0;
        label.setColor(new cc.Color(124,252,0,1.0));
        this.addChild(label);

        tableView = new cc.TableView(this, cc.size(winSize.width / 4, winSize.height / 2 - 30));
        tableView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        tableView.x = winSize.width / 4 * 2 + 20;
        tableView.y = 0;
        tableView.setDelegate(this);
        tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
        tableView.tag = 5;
        this.addChild(tableView);
        tableView.reloadData();

        label = new cc.LabelTTF("Shape", "Helvetica", 25.0);
        label.x = winSize.width / 4 * 2 + 20;
        label.y = winSize.height / 2 - 40;
        label.anchorX = 0;
        label.anchorY = 0;
        label.setColor(new cc.Color(124,252,0,1.0));
        this.addChild(label);

        return true;  
    },

    _addButtons: function() {
        var winSize = cc.director.getWinSize();

        // Back Menu
        var itemBack = new cc.MenuItemFont("Back", this.backToGameSelector, this);
        itemBack.x = winSize.width - 100;
        itemBack.y = 100;
        var menuBack = new cc.Menu(itemBack);
        menuBack.x = 0;
        menuBack.y = 0;
        this.addChild(menuBack);

        // Back Menu
        var itemStart = new cc.MenuItemFont("Start", this.startGame, this);
        itemStart.x = winSize.width - 100;
        itemStart.y = 200;
        var menuStart = new cc.Menu(itemStart);
        menuStart.x = 0;
        menuStart.y = 0;
        this.addChild(menuStart);
    },

    backToGameSelector:function (sender) {
        cc.director.replaceScene(new cc.TransitionFade(1, new GameTestScene(), cc.color(255, 255, 255, 255)));
    },

    startGame:function (sender) {
        var checkedItems = [];
        for (var i = 0; i < this.arrayObjectInType.length; i++){
            var arrayObjects = this.arrayObjectInType[i];
            for (var j = 0; j < arrayObjects.length; j++){
                if (arrayObjects[j].isChecked) {
                    checkedItems.push(arrayObjects[j].id);   
                }
            }
        }

        // console.log("Game Selected: " + this._gameId);
        // console.log("Array Checked => \n" + JSON.stringify(checkedItems));
        if (!checkedItems.length)
            return;
        if (this._gameId == "writing"){
            cc.director.runScene(new WritingTestScene(checkedItems));
        }
        if (this._gameId == "gofigure") {
            checkedItems = checkedItems.filter(function(obj) {
                if (obj.indexOf("shape") > -1)
                    return obj;
            });
            
            cc.director.runScene(new GoFigureTestScene(checkedItems));
        }   
        else if (this._gameId == "shadow"){
            cc.director.runScene(new ShadowGameScene(checkedItems));   
        }
    },

    scrollViewDidScroll:function (view) {
    },
    scrollViewDidZoom:function (view) {
    },

    tableCellTouched:function (table, cell) {
        let tableTag = table.tag;
        var selectedItem = this.arrayObjectInType[tableTag][cell.getIdx()];
        selectedItem.isChecked = (selectedItem.isChecked) ? false : true;
        console.log("Label content string: " + cell.getLabel().getString());
        cell.check(selectedItem.isChecked);
    },

    tableCellSizeForIndex:function (table, idx) {
        // if (idx == 2) {
        //     return cc.size(100, 100);
        // }
        return cc.size(cc.winSize.width / 4, 60);
    },

    currentArrayIndex: 0,

    tableCellAtIndex:function (table, idx) {
        let tableTag = table.tag;
        if (tableTag >= 0)
            this.currentArrayIndex = tableTag;
        
        let strValue = this.arrayObjectInType[this.currentArrayIndex][idx].id;
        let isChecked = this.arrayObjectInType[this.currentArrayIndex][idx].isChecked;
        
        var cell = table.dequeueCell();
        
        if (!cell) {
            cell = new ObjectsTableViewCell();
            cell.getLabel().setString(strValue);
            cell.check(isChecked);

        } else {
            cell.getLabel().setString(strValue);
            cell.check(isChecked);
        }

        return cell;
    },

    numberOfCellsInTableView:function (table) {
        let tableTag = table.tag;
        if (tableTag >= 0)
            this.currentArrayIndex = tableTag;

        return this.arrayObjectInType[this.currentArrayIndex].length;
    },
});

var ObjectTestScene = cc.Scene.extend({
    ctor:function (gameId) {
        this._super();
        var layer = new ObjectTestSelectorLayer(gameId);
        this.addChild(layer);
    }
});