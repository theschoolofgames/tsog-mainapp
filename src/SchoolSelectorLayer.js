var SchoolSelectorLayer = cc.Layer.extend({
    schHolder: 0,
    schoolBtn: [],
    schoolName: [],
    _lastedSchool: null,
    _searchArea: null,
    _searchButton: null,
    _searchField: null,
    _scrollView: null,

    ctor: function () {
        this._super();
        this.addBackground();
        this.resetAllChildren();

        this._lastedSchool = cc.sys.localStorage.getItem("lastedSchool") || null;
        this.createSearchArea();
        this.createSchoolButton(8);
        this.createScrollView();
    },

    resetAllChildren: function() {
        this.schoolBtn = [];
    },

    addBackground: function() {
        var bg = new cc.Sprite("#bg-school.png");
        var scale = cc.winSize.width / bg.width;
        bg.setScaleX(scale);
        bg.x = cc.winSize.width / 2;
        bg.y = cc.winSize.height / 2;
        this.addChild(bg);
    },

    createSchoolHolder: function(schNumber){
        this.schHolder = new cc.Sprite();
        this.schHolder.x = cc.winSize.width / 3;
        this.schHolder.y = cc.winSize.height / 2;
        this.schHolder.width = this.schoolBtn[schNumber - 1].y + this.schoolBtn[schNumber -1].width;
        this.schHolder.height = cc.winSize.height;
        for ( var i = 0; i < this.schoolBtn.length; i++) {
            this.schHolder.addChild(this.schoolBtn[i]);
        }
    },

    createSchoolButton: function(schNumber) {
        var self = this;

        var w, r1, r2 = 0;
        var scale, width, font;
        for ( var i = 0; i < schNumber; i++) {
            r1 = Math.floor(Math.random() * 2 + 1);
            var sc = new ccui.Button("school_bg-"+ r1 +".png", "", "", ccui.Widget.PLIST_TEXTURE);

            w = Math.floor(i / 2);

            if (i > 1)
                sc.x = cc.winSize.width / 4 * 2 * w + sc.width/2;
            else {
                if (this.isWideScreen())
                    sc.x = cc.winSize.width / 4 - 70;
                else
                    sc.x = cc.winSize.width / 4;
            }

            if ((i % 2) == 0) {
                sc.y = cc.winSize.height / 3 *2;
            }
            else {
                sc.y = cc.winSize.height / 3;
            }
            sc.setSwallowTouches(false);
            sc.tag = i;

            r2 = Math.floor(Math.random() * 3);
            width = sc.width * 3;
            scale = 0.3;
            if (this.isWideScreen()) {
                font = res.RedFont_SD_fnt;
                scale = 0.6;
            }
            else
                font = res.RedFont_HD_fnt;

            var scName = new cc.LabelBMFont(SCHOOL_INFO[r2].name,
                            font,
                            width,
                            cc.TEXT_ALIGNMENT_CENTER);
            scName.setScale(scale);
            scName.x = sc.width / 2;
            scName.y = sc.height / 2;

            sc.addChild(scName);
            this.schoolName.push(r2);
            this.schoolBtn.push(sc);

            sc.addClickEventListener(function() {self.callBack(this)});
        }
        this.createSchoolHolder(schNumber);
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
        var button = new ccui.Button("search_button.png",
            "search_button-pressed.png",
            "",
            ccui.Widget.PLIST_TEXTURE);
        button.x = button.width;
        button.y = button.height/2;
        button.addClickEventListener(function(){});

        this._searchArea.addChild(button,9);
        this._searchButton = button;

        var self = this;
    },

    onSearchFieldInsertText: function(tf, text) {
        var str = tf.getString();
        cc.log("on textfield insert text: " + str);
        var found = false;
        var newStr = "";
        var n = -1;
        var count = -1;
        var scName;
        var a =[];

        for ( var i = 0; i< str.length;i++){
            newStr += str.charAt(i).toUpperCase();
        }

        for ( var i = 0; i < this.schoolBtn.length; i++) {
            var id = this.schoolName[i];
            scName = SCHOOL_INFO[id].name;
            if (newStr != "") {
                n = scName.search(newStr);
                if ( n >= 0 ){
                    count++;
                    this.schoolBtn[i].setPosition(this.schoolBtn[count].getPosition());
                    this.schoolBtn[i].setVisible(true);
                    cc.log(JSON.stringify(this.schoolBtn[count].getPosition()));
                } else {
                    this.schoolBtn[i].setVisible(false);
                }
            }
        }
    },

    createSearchField: function() {
        var field = new cc.Sprite("#search_field.png");
        field.x = this._searchButton.x + field.width / 2;
        field.y = this._searchButton.height/2;

        var size = cc.size(field.width, field.height);
        var tf = new ccui.TextField("Your School Name", "Arial", 30);

        tf.x = field.width / 2;
        tf.y = field.height / 2;

        field.addChild(tf);
        this._searchArea.addChild(field);
        this._searchField = tf;
        tf.addEventListener(this.onSearchFieldInsertText, this);

    },

    callBack: function(school) {
        // this.btn.tag get the tag of button are clicked
        var p = this.parent;
        var button = school.tag;
        cc.sys.localStorage.setItem("lastedSchool", button);
        p.addNewLayer(this, "accLayer", button);
    },

    createScrollView: function(){
        var self = this;
        this._scrollView = new ccui.ScrollView();
        this._scrollView.setDirection(ccui.ScrollView.DIR_HORIZONTAL);
        this._scrollView.setTouchEnabled(true);
        this._scrollView.setContentSize(cc.size(cc.winSize.width, cc.winSize.height));

        this._scrollView.x = 0;
        this._scrollView.y = 0;
        self.addChild(this._scrollView);

        var innerWidth = Math.ceil(this.schoolBtn.length / 4) * cc.winSize.width;
        var innerHeight = cc.winSize.height - this._searchArea.height;
        // cc.log("inner width: " + innerWidth);
        // cc.log("inner height: " + innerHeight);
        this._scrollView.setInnerContainerSize(cc.size(innerWidth, innerHeight));
        this._scrollView.addChild(this.schHolder);

    },

    isWideScreen: function(){
        return cc.winSize.width/cc.winSize.height > 1.7;
    }
});