var SchoolSelectorLayer = cc.Layer.extend({
    schHolder: null,
    schoolBtn: [],
    schoolName: [],
    _searchArea: null,
    _searchButton: null,
    _searchField: null,
    _scrollView: null,
    _startTouchPosition: null,
    _leftArrowImg: null,
    _rightArrowImg: null,
    _isTouchMoved: false,

    _rows: 2,

    _vBoxes: [],

    ctor: function () {
        this._super();

        this.tag = 1;
        this.createBackground();
        this.resetAllChildren();
        this.name = "SchoolSelectorLayer";

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: false,
            onTouchBegan: this.onTouchBegan,
            onTouchMoved: this.onTouchMoved
        }, this);
    },

    onEnterTransitionDidFinish: function() {
        this._super();

        var self = this;
        var schoolData = DataManager.getInstance().getSchoolData();
        // cc.log("schoolData: " + JSON.stringify(schoolData));
        if (schoolData != null) {
            this.createSearchArea();
            this.createScrollView();
            this.refreshSchoolList();
            this.addArrowImage();
            if (!SchoolSelectorLayer.loadedData) {
                var loadingLayer = Utils.addLoadingIndicatorLayer(false);
                loadingLayer.setIndicactorPosition(cc.winSize.width - 40, 40);

                RequestsManager.getInstance().getSchools(function(succeed, data) {
                    Utils.removeLoadingIndicatorLayer();
                    if (succeed) {
                        SchoolSelectorLayer.loadedData = true;
                        if (JSON.stringify(schoolData) === JSON.stringify(data))
                            return;

                        DataManager.getInstance().setSchoolData(data);
                        self._scrollView.removeFromParent();
                        self.schoolBtn = [];
                        self.schoolName = [];
                        self._rightArrowImg.removeFromParent();
                        self._leftArrowImg.removeFromParent();

                        self.refreshSchoolList();
                        self.createScrollView();
                        self.addArrowImage();
                    }
                });
            }
        }
        else {
            Utils.addLoadingIndicatorLayer(true);
            RequestsManager.getInstance().getSchools(function(succeed, data) {
                Utils.removeLoadingIndicatorLayer();
                if (succeed) {
                    DataManager.getInstance().setSchoolData(data);
                    self.createSearchArea();
                    self.createScrollView();
                    self.refreshSchoolList();
                    self.addArrowImage();
                }
            });
        }
    },

    resetAllChildren: function() {
        this.schoolBtn = [];
    },

    addArrowImage: function() {
        var firstSchoolPos = this._getBtnPosition(0);

        var leftArrowImg = new cc.Sprite("#arrow-left.png");
        leftArrowImg.x = firstSchoolPos.x / 4;
        leftArrowImg.y = cc.winSize.height / 2;
        leftArrowImg.setVisible(false);

        var rightArrowImg = new cc.Sprite("#arrow-right.png");
        rightArrowImg.x = cc.winSize.width - firstSchoolPos.x / 4;
        rightArrowImg.y = cc.winSize.height / 2;
        rightArrowImg.setVisible(false);

        this.addChild(leftArrowImg);
        this.addChild(rightArrowImg);

        this._rightArrowImg = rightArrowImg;
        this._leftArrowImg = leftArrowImg;
    },

    createBackground: function() {
        var bg = new cc.Sprite(res.Bg_school_jpg);
        bg.x = cc.winSize.width / 2;
        bg.y = cc.winSize.height / 2;
        this.addChild(bg);
    },

    refreshSchoolList: function(data, animated) {
        var self = this;

        animated = animated == null ? true : animated;

        this._scrollView.removeAllItems();
        this._vBoxes = [];
        this._addPlusSchoolButton(animated);
        
        var currentItemCount = this._scrollView.getItems().length;
        var schoolData = data || DataManager.getInstance().getSchoolData();

        var itemIndex = 0;
        for (var i = 0; i < schoolData.length; i++) {
            var schoolIndex = schoolData[i].index || i;
            var vBox = this.createOrGetVBox(i + currentItemCount);

            var randBgIdx = i%2+1;
            var schoolButton = new ccui.Button("school_bg-"+ randBgIdx +".png", "", "", ccui.Widget.PLIST_TEXTURE);
            schoolButton.tag = i;
            schoolButton.setSwallowTouches(false);

            var lp = new ccui.LinearLayoutParameter();
            lp.setGravity(ccui.LinearLayoutParameter.RIGHT);
            if ((i + currentItemCount)%2 == 0)
                lp.setMargin(new ccui.Margin(
                    0, 
                    vBox.height/3 - schoolButton.height/2, 
                    vBox.width/2 - schoolButton.width/2, 
                    vBox.height/3 - schoolButton.height));
            schoolButton.setLayoutParameter(lp);

            vBox.addChild(schoolButton);

            if (!vBox.parent)
                this._scrollView.addChild(vBox);

            var font = SCHOOL_NAME_COLOR[schoolIndex%4];

            var schoolName = new cc.LabelBMFont(schoolData[i].school_name.toUpperCase(),
                font,
                schoolButton.width*1.5,
                cc.TEXT_ALIGNMENT_CENTER);
            schoolName.setScale(0.5);
            schoolName.x = schoolButton.width / 2;
            schoolName.y = schoolButton.height / 2;
            schoolButton.addChild(schoolName);

            // this.schoolName.push(i);

            // add bubble effect
            if (animated) {
                var delayTime = (i + currentItemCount) * DELTA_DELAY_TIME;
                this.addObjectAction(schoolButton, delayTime, (i + currentItemCount), function(index){
                    if (index < 4)
                        jsb.AudioEngine.play2d(res.bubble_sound_mp3);
                });
            }
            schoolButton.runAction(
                    cc.sequence(
                        cc.delayTime(0),
                        cc.callFunc(function(sender) {
                            self.runBubbleAnimation(sender);
                        })
                    )
                )
            //add event listener
            schoolButton.addClickEventListener(function(sender) {
                if (!self._isTouchMoved) {
                    jsb.AudioEngine.play2d(res.bubble_sound_mp3);

                    SegmentHelper.track(SEGMENT.SELECT_SCHOOL, 
                        { 
                            school_id: schoolData[sender.tag].school_id, 
                            school_name: schoolData[sender.tag].school_name 
                        });
                    
                    KVDatabase.getInstance().set(STRING_SCHOOL_ID, schoolData[sender.tag].school_id);
                    KVDatabase.getInstance().set(STRING_SCHOOL_NAME, schoolData[sender.tag].school_name);
                    cc.director.replaceScene(new AccountSelectorScene());
                }

            });
        }
        this._scrollView.requestRefreshView();
    },

    createOrGetVBox: function(index) {
        var boxIdx = Math.floor(index/2);
        var vbox = this._vBoxes[boxIdx];

        if (vbox == null) {
            vbox = new ccui.VBox();
            vbox.setContentSize(cc.size(cc.winSize.width*0.4, cc.winSize.height))
            this._vBoxes[boxIdx] = vbox;
        }

        return vbox;
    },

    addObjectAction: function(object, delayTime, index, func) {
        object.scale = 0;
        object.runAction(cc.sequence(
            cc.delayTime(delayTime),
            cc.callFunc(function() { func && func(index) }),
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

        searchButton.addClickEventListener(function(){
            NativeHelper.callNative("startRecord");
        });

        this._searchArea.addChild(searchButton, 9);
        this._searchButton = searchButton;
    },

    onSearchFieldInsertText: function(tf) {
        var str = tf.getString();

        var newStr = str.toUpperCase();
        var result = -1;
        var count = -1;
        var scName;

        var schoolData = DataManager.getInstance().getSchoolData();

        if (newStr == "") {
            this.refreshSchoolList(null, false);
            return;
        }

        var data = DataManager.getInstance().getSchoolData();
        data.forEach(function(elem, i) {
            elem.index = i;
        });
        data = data.filter(function(obj){
            if (obj.school_name.toUpperCase().search(newStr) >= 0)
                return obj;
        });        

        this.refreshSchoolList(data, false);
    },

    createSearchField: function() {
        var field = new cc.Sprite("#search_field.png");
        field.x = this._searchButton.x + field.width / 2;
        field.y = this._searchButton.height/2;

        var size = cc.size(field.width, field.height);
        // cc.log(field.width + " - " + field.height);  
        var tf = new ccui.TextField("Your School Name", "Arial", 32);

        tf.x = field.width / 2;
        tf.y = field.height / 2;

        field.addChild(tf);
        this._searchArea.addChild(field);
        this._searchField = tf;

        tf.addEventListener(this.onSearchFieldInsertText, this);
    },

    createScrollView: function(){
        var self = this;

        this._vBoxes = [];

        this._scrollView = new ccui.ListView();
        this._scrollView.setDirection(ccui.ScrollView.DIR_HORIZONTAL);
        this._scrollView.setTouchEnabled(true);
        this._scrollView.setSwallowTouches(false);
        this._scrollView.setBounceEnabled(true);
        this._scrollView.setContentSize(cc.size(cc.winSize.width, cc.winSize.height));
        this._scrollView.addEventListenerScrollView(function(pScrollView, event) {
            if (event == ccui.ScrollView.EVENT_SCROLL_TO_RIGHT || event == ccui.ScrollView.EVENT_BOUNCE_RIGHT)
                self._rightArrowImg.setVisible(false);
            else
                self._rightArrowImg.setVisible(true);

            if (event == ccui.ScrollView.EVENT_SCROLL_TO_LEFT || event == ccui.ScrollView.EVENT_BOUNCE_LEFT)
                self._leftArrowImg.setVisible(false);
            else
                self._leftArrowImg.setVisible(true);
        }, this);

        this._scrollView.x = 0;
        this._scrollView.y = 0;
        self.addChild(this._scrollView);

        // var innerWidth = Math.ceil((this.schoolBtn.length+1) / 2) * cc.winSize.width/2;
        // var innerHeight = cc.winSize.height;

        // this._scrollView.setInnerContainerSize(cc.size(innerWidth, innerHeight));
        // this._scrollView.addChild(this.schHolder);
    },

    isWideScreen: function(){
        return cc.winSize.width/cc.winSize.height > 1.7;
    },

    _getBtnPosition: function(index) {
        var x = Math.floor(index / this._rows);
        var y = (index % this._cols);
        var posX = cc.winSize.width * (0.3 + x/2.5);
        var posY = cc.winSize.height * (1 - 1/3 * (y+1));

        return {
            x: posX,
            y: posY
        }
    },
    // get random position to make different between school button
    getRandomedPosition: function(schoolButton) {
        var randomedValueX = Math.random() * 20 - 10;
        var randomedValueY = Math.random() * 20 - 10;
        var randomedPos =  cc.p(schoolButton.x + randomedValueX, schoolButton.y + randomedValueY);

        return randomedPos;
    },

    _addPlusSchoolButton: function(animated) {
        var index = this._scrollView.getItems().length;
        var randBgIdx = index%2+1;

        var vBox = this.createOrGetVBox(index);

        var plusBtn = new ccui.Button("school_bg-"+ randBgIdx +".png", "", "", ccui.Widget.PLIST_TEXTURE);
        plusBtn.setSwallowTouches(false);

        var plusImg = new cc.Sprite("plus.png");
        plusImg.x = plusBtn.width/2;
        plusImg.y = plusBtn.height/2;
        plusBtn.addChild(plusImg);

        var lp = new ccui.LinearLayoutParameter();
        lp.setGravity(ccui.LinearLayoutParameter.RIGHT);
        if (index%2 == 0)
            lp.setMargin(new ccui.Margin(
                    0, 
                    vBox.height/3 - plusBtn.height/2, 
                    vBox.width/2 - plusBtn.width/2, 
                    vBox.height/3 - plusBtn.height));
        plusBtn.setLayoutParameter(lp);

        vBox.addChild(plusBtn);

        if (!vBox.parent)
            this._scrollView.addChild(vBox);

        // plusBtn.setPosition(this._getBtnPosition(index));

        if (animated) {
            var delayTime = index * DELTA_DELAY_TIME;
            this.addObjectAction(plusBtn, delayTime, index, function(index){
                if (index < 4)
                    jsb.AudioEngine.play2d(res.bubble_sound_mp3);
            });
        }
        var self = this;
        plusBtn.runAction(
            cc.sequence(
                cc.delayTime(0),
                cc.callFunc(function() {
                    self.runBubbleAnimation(plusBtn);
                })
            )
        )

        plusBtn.addClickEventListener(function() {
            cc.director.replaceScene(new NewSchoolScene());
        });
    },

    runBubbleAnimation: function(button) {
        button.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.moveTo(MOVE_DELAY_TIME, this.getRandomedPosition(button)),
                    cc.moveTo(MOVE_DELAY_TIME, this.getRandomedPosition(button)),
                    cc.moveTo(MOVE_DELAY_TIME, this.getRandomedPosition(button)),
                    cc.moveTo(MOVE_DELAY_TIME, button.getPosition())
                )
            )
        )
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
        var delta = cc.pSub(touchedPos, targetNode._startTouchPosition);

        if(cc.pLengthSQ(delta) > 3 * 3) {  
            targetNode._isTouchMoved = true;
        }
    },
});

SchoolSelectorLayer.loadedData = false;

var SchoolSelectorScene = cc.Scene.extend({
    ctor: function() {
        this._super();

        var msLayer = new SchoolSelectorLayer();
        this.addChild(msLayer);
    }
});
