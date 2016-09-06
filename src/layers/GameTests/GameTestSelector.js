var GameTestTableCell = cc.TableViewCell.extend({
    _label: null,

    ctor: function(){
        this._super();
        
        var cellSize = this.getContentSize();

        this._label = new cc.LabelTTF("id", "Helvetica", 25.0);
        this._label.setHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this._label.setVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this._label.x = cellSize.width / 2;
        this._label.y = 0;
        this._label.anchorX = 0;
        this._label.anchorY = 0;
        this.addChild(this._label);
    },

    draw:function (ctx) {
        this._super(ctx);
    },

    getLabel: function() {
        return this._label;
    },
});

var GameTestSelectorLayer = cc.Layer.extend({
    gameObjectJson: null,
    arrayObjectInType: [],

    ctor:function(){
        this._super();
        
        this._addGamesTable()
        this._addButtons();
    },

    _addGamesTable: function() {
        var winSize = cc.director.getWinSize();

        var tableView = new cc.TableView(this, cc.size(winSize.width / 2, winSize.height - 40));
        tableView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        tableView.x = winSize.width / 2 - tableView.width / 2;
        tableView.y = 0;
        tableView.setDelegate(this);
        tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
        tableView.tag = 0;
        this.addChild(tableView);
        tableView.reloadData();

        var label = new cc.LabelTTF("Select Game", "Helvetica", 25.0);
        label.x = winSize.width / 2 - label.width / 2;
        label.y = winSize.height - 40;
        label.anchorX = 0;
        label.anchorY = 0;
        label.setColor(new cc.Color(124,252,0,1.0));
        this.addChild(label);

        return true;  
    },

    _addButtons: function() {
        var winSize = cc.director.getWinSize();

        // Back Menu
        var itemBack = new cc.MenuItemFont("Back", this.backToHome, this);
        itemBack.x = winSize.width - 100;
        itemBack.y = 200;
        var menuBack = new cc.Menu(itemBack);
        menuBack.x = 0;
        menuBack.y = 0;
        this.addChild(menuBack);
    },

    backToHome:function (sender) {
        cc.director.replaceScene(new cc.TransitionFade(1, new MainScene(), cc.color(255, 255, 255, 255)));
    },

    toObjectSelectorScene: function (id) {
        switch (id){
            case "story":
                cc.director.replaceScene(new cc.TransitionFade(1, new StoryMainScene(), cc.color(255, 255, 255, 255)));
                break;
            default: 
                cc.director.replaceScene(new cc.TransitionFade(1, new ObjectTestScene(id), cc.color(255, 255, 255, 255)));
                break;
        }
    },

    scrollViewDidScroll:function (view) {
    },
    scrollViewDidZoom:function (view) {
    },

    tableCellTouched:function (table, cell) {
        this.toObjectSelectorScene(GAME_IDS[cell.getIdx()]);
    },
    tableCellTouched2:function () {
        cc.log("cell touched at index: ");
    },

    tableCellSizeForIndex:function (table, idx) {
        // if (idx == 2) {
        //     return cc.size(100, 100);
        // }
        return cc.size(cc.winSize.width / 2, 60);
    },

    tableCellAtIndex:function (table, idx) {
        let strValue = GAME_IDS[idx];
        strValue = strValue.toUpperCase();
        
        var cell = table.dequeueCell();
        
        if (!cell) {
            cell = new GameTestTableCell();
            cell.getLabel().setString(strValue);

        } else {
            cell.getLabel().setString(strValue);
        }

        return cell;
    },

    numberOfCellsInTableView:function (table) {

        return GAME_IDS.length;
    },
});

var GameTestScene = cc.Scene.extend({
    ctor: function(){
        this._super();
        var layer = new GameTestSelectorLayer();
        this.addChild(layer);
    }
});