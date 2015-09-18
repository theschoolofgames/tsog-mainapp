var SchoolSelectorLayer = cc.Layer.extend({
    schHolder: null,
    schoolBtn: [],
    schoolName: [],
    _searchArea: null,
    _searchButton: null,
    _searchField: null,
    _scrollView: null,
    _startTouchPosition: null,

    _isTouchMoved: false,

    _cols: 2,
    _rows: 2,

    ctor: function () {
        this._super();
        this.createBackground();
        this.resetAllChildren();
        this.name = "SchoolSelectorLayer";

        var self = this;

        var schoolData = DataManager.getInstance().getSchoolData();
        if (schoolData != null) {
            this.createSearchArea();
            this.createSchoolButton();
            this.createScrollView();

            if (!SchoolSelectorLayer.loadedData) {
                this.runAction(cc.sequence(
                    cc.delayTime(0),
                    cc.callFunc(function() {
                        var loadingLayer = Utils.addLoadingIndicatorLayer(false);
                        loadingLayer.setIndicactorPosition(cc.winSize.width - 40, 40);

                        RequestsManager.getInstance().getSchools(function(succeed, data) {
                            Utils.removeLoadingIndicatorLayer();
                            if (succeed) {
                                DataManager.getInstance().setSchoolData(data);
                                self._scrollView.removeFromParent();
                                self.schoolBtn = [];
                                self.schoolName = [];
                                self.createSchoolButton();
                                self.createScrollView();
                                self.addArrowImage();
                                SchoolSelectorLayer.loadedData = true;
                            }
                        });
                    })));
            }
        }
        else {
            this.runAction(cc.sequence(
                cc.delayTime(0),
                cc.callFunc(function() {
                    Utils.addLoadingIndicatorLayer(true);
                    RequestsManager.getInstance().getSchools(function(succeed, data) {
                        Utils.removeLoadingIndicatorLayer();
                        if (succeed) {
                            DataManager.getInstance().setSchoolData(data);
                            self.createSearchArea();
                            self.createSchoolButton();
                            self.createScrollView();
                            self.addArrowImage();
                        }
                    });
                })));
        }

        cc.eventManager.addListener({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: false,
                onTouchBegan: this.onTouchBegan,
                onTouchMoved: this.onTouchMoved
        }, this);
    },

    resetAllChildren: function() {
        this.schoolBtn = [];
    },

    addArrowImage: function() {
        var leftArrowImg = new cc.Sprite("#arrow-left.png");
        leftArrowImg.x = leftArrowImg.width;
        leftArrowImg.y = cc.winSize.height / 2;

        var rightArrowImg = new cc.Sprite("#arrow-right.png");
        rightArrowImg.x = cc.winSize.width - rightArrowImg.width;
        rightArrowImg.y = cc.winSize.height / 2;

        if (cc.winSize.width/cc.winSize.height < IPHONE_RESOLUTION) {
            leftArrowImg.setScaleX(0.8);
            rightArrowImg.setScaleX(0.8);
        }


        this.addChild(leftArrowImg);
        this.addChild(rightArrowImg);
    },

    createBackground: function() {
        var bg = new cc.Sprite(res.Bg_school_jpg);
        // var scale = cc.winSize.width / bg.width;
        // bg.setScaleX(scale);
        bg.x = cc.winSize.width / 2;
        bg.y = cc.winSize.height / 2;
        this.addChild(bg);
    },

    createSchoolHolder: function(){
        this.schHolder = new cc.Layer();

        this.schHolder.width = this.schoolBtn[this.schoolBtn.length-1].y + this.schoolBtn[this.schoolBtn.length-1].width;
        this.schHolder.height = cc.winSize.height;
        for ( var i = 0; i < this.schoolBtn.length; i++) {
            this.schHolder.addChild(this.schoolBtn[i]);
        }
    },

    createSchoolButton: function() {
        var self = this;
        var scale, width, font;

        var schoolData = DataManager.getInstance().getSchoolData();

        var itemIndex = 0;
        for (var i = 0; i < schoolData.length; i++) {
            var randBgIdx = i%2+1;
            var schoolButton = new ccui.Button("school_bg-"+ randBgIdx +".png", "", "", ccui.Widget.PLIST_TEXTURE);
            schoolButton.setPosition(this._getBtnPosition(i));
            schoolButton.tag = i;
            schoolButton.setSwallowTouches(false);

            this.schoolBtn.push(schoolButton);

            // var randSchoolIdx = Math.floor(Math.random() * schoolData.length);
            font = SCHOOL_NAME_COLOR[i%4];

            var schoolName = new cc.LabelBMFont(schoolData[i].school_name.toUpperCase(),
                font,
                schoolButton.width*1.5,
                cc.TEXT_ALIGNMENT_CENTER);
            schoolName.setScale(0.5);
            schoolName.x = schoolButton.width / 2;
            schoolName.y = schoolButton.height / 2;
            schoolButton.addChild(schoolName);

            this.schoolName.push(i);

            var delayTime = i * DELTA_DELAY_TIME;

            if (i < 4)
                this.addObjectAction(schoolButton, delayTime, function(){
                    cc.audioEngine.playEffect(res.bubble_sound_mp3);
                });
            else
                this.addObjectAction(schoolButton, delayTime, function(){});
            //add event listener
            schoolButton.addClickEventListener(function(sender) {
                if (!self._isTouchMoved) {
                    cc.audioEngine.playEffect(res.bubble_sound_mp3);
                    if (cc.sys.isNative && (cc.sys.platform == sys.IPAD || cc.sys.platform == sys.IPHONE)) {
                        jsb.reflection.callStaticMethod("H102Wrapper",
                                                 "countlyRecordEvent:count:",
                                                 "select_school",
                                                 1);
                    }
                    KVDatabase.getInstance().set(STRING_SCHOOL_ID, schoolData[sender.tag].school_id);
                    cc.director.replaceScene(new AccountSelectorScene());
                }

            });
        }

        this.createSchoolHolder();
    },

    addObjectAction: function(object, delayTime, func) {
        object.scale = 0;
        object.runAction(cc.sequence(
                cc.delayTime(delayTime),
                cc.callFunc(func),
                cc.scaleTo(0.5, 1).easing(cc.easeElasticOut(0.6))
            ));
    },

    createSearchArea: function() {
        var sArea = new cc.Sprite();

        this._searchArea = sArea;

        this.createSearchButton();
        this.createSearchField();

        this._searchArea.width = this._searchButton.width + this._searchField.width;
        this._searchArea.height = this._searchButton.height;
        sArea.x = cc.winSize.width / 2 - this._searchField.width/4;
        sArea.y = cc.winSize.height - 50;
        this.addChild(this._searchArea, 99);
    },

    createSearchButton: function() {
        var self = this;
        var searchButton = new ccui.Button("search_button.png",
            "search_button-pressed.png",
            "",
            ccui.Widget.PLIST_TEXTURE);
        searchButton.x = searchButton.width;
        searchButton.y = searchButton.height/2;
        searchButton.setTouchEnabled(false);

        searchButton.addClickEventListener(function(){
            // self._searchField.onTouchBegan();
        });

        this._searchArea.addChild(searchButton, 9);
        this._searchButton = searchButton;

        var self = this;
    },

    onSearchFieldInsertText: function(tf) {
        var str = tf.getString();

        var newStr = str.toUpperCase();
        var result = -1;
        var count = -1;
        var scName;

        var schoolData = DataManager.getInstance().getSchoolData();

        if (newStr == "") {
            for ( var i = 0; i < this.schoolBtn.length; i++) {
                this.schoolBtn[i].setPosition(this._getBtnPosition(i));
                this.schoolBtn[i].setVisible(true);
            }
            var innerWidth = Math.ceil(((this.schoolBtn.length - 1) / 2) * cc.winSize.width / 2);
            this._scrollView.setInnerContainerSize(cc.size(innerWidth, cc.winSize.height));
            return;
        }

        for ( var i = 0; i < this.schoolBtn.length; i++) {
            var id = this.schoolName[i];
            scName = schoolData[id].school_name.toUpperCase();
            if (newStr != "") {
                result = scName.search(newStr);

                if ( result >= 0 ){
                    count++;
                    this.schoolBtn[i].setPosition(this._getBtnPosition(count));
                    this.schoolBtn[i].setVisible(true);
                    // cc.log(JSON.stringify(this.schoolBtn[count].getPosition()));
                } else {
                    this.schoolBtn[i].setVisible(false);
                }
            }
        }
        // reset scroll container size
        var innerWidth = Math.ceil((count - 1) / 2) * cc.winSize.width / 2;
        this._scrollView.setInnerContainerSize(cc.size(innerWidth, cc.winSize.height));
    },

    createSearchField: function() {
        var field = new cc.Sprite("#search_field.png");
        field.x = this._searchButton.x + field.width / 2;
        field.y = this._searchButton.height/2;

        var size = cc.size(field.width, field.height);
        cc.log(field.width + " - " + field.height);
        var tf = new ccui.TextField("Your School Name", "Arial", 32);

        // tf.setTouchAreaEnabled(true);

        // tf.setTouchSize(cc.size(600, 80));

        tf.x = field.width / 2;
        tf.y = field.height / 2;

        field.addChild(tf);
        this._searchArea.addChild(field);
        this._searchField = tf;

        tf.addEventListener(this.onSearchFieldInsertText, this);
    },

    createScrollView: function(){
        var self = this;
        this._scrollView = new ccui.ScrollView();
        this._scrollView.setDirection(ccui.ScrollView.DIR_HORIZONTAL);
        this._scrollView.setTouchEnabled(true);
        this._scrollView.setSwallowTouches(false);
        this._scrollView.setContentSize(cc.size(cc.winSize.width, cc.winSize.height));

        this._scrollView.x = 0;
        this._scrollView.y = 0;
        self.addChild(this._scrollView);

        var innerWidth = Math.ceil(this.schoolBtn.length / 4) * cc.winSize.width;
        var innerHeight = cc.winSize.height;

        this._scrollView.setBounceEnabled(true);
        this._scrollView.setInnerContainerSize(cc.size(innerWidth, innerHeight));
        this._scrollView.addChild(this.schHolder);

    },

    isWideScreen: function(){
        return cc.winSize.width/cc.winSize.height > 1.7;
    },

    _getBtnPosition: function(index) {
        var x = Math.floor(index / this._rows);
        var y = (index % this._cols);
        var posX = cc.winSize.width * (0.25 + x/2);
        var posY = cc.winSize.height * (1 - 1/3 * (y+1));

        return {
            x: posX,
            y: posY
        }
    },

    onTouchBegan: function(touch, event) {

        var targetNode = event.getCurrentTarget();
        var touchedPos = targetNode.convertToNodeSpace(touch.getLocation());
        targetNode._startTouchPosition = touchedPos;
        targetNode._isTouchMoved = false;
        return true;
    },

    onTouchMoved: function(touch, event) {
        var targetNode = event.getCurrentTarget();
        var touchedPos = targetNode.convertToNodeSpace(touch.getLocation());
        var deltaX = touchedPos.x - targetNode._startTouchPosition.x;
        var deltaY = touchedPos.y - targetNode._startTouchPosition.y;
        var sqrDistance = Math.pow(deltaX, 2) + Math.pow(deltaY, 2);

        if(sqrDistance > 9)
            targetNode._isTouchMoved = true;

        return true;
    }
});

SchoolSelectorLayer.loadedData = false;

var SchoolSelectorScene = cc.Scene.extend({
    ctor: function() {
        this._super();

        var msLayer = new SchoolSelectorLayer();
        this.addChild(msLayer);
    }
});
