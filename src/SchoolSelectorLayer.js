var SchoolSelectorLayer = cc.Layer.extend({
    schNumber: 0,
    schoolBtn: [],
    _lastedSchool: null,
    _searchArea: null,
    _searchButton: null,
    _searchField: null,

    ctor: function () {
        this._super();

        this._lastedSchool = cc.sys.localStorage.getItem("lastedSchool") || null;
        this.createSchoolButton(4);
        this.createSearchArea();
    },

    createSchoolButton: function(schNumber) {
        var self = this;

        for ( var i = 0; i < schNumber; i++) {
            var sc = new ccui.Button("school_bg.png", "", "", ccui.Widget.PLIST_TEXTURE);
            if (i < 2) {
                sc.x = ((cc.winSize.width / 3 - 20) * (i + 1)) + 50*i;
                sc.y = cc.winSize.height / 2 + 120;
            } else {
                sc.x = ((cc.winSize.width / 3 -20) * (i - 1)) + 50 *(i - 2);
                sc.y = cc.winSize.height / 2 - 120;
            }
            sc.tag = i;

            // var scName = new cc.LabelTTF(SCHOOL_INFO[i].name, "Arial", 30);
            var scName = new cc.Sprite("#school_name-" + (i + 1) +".png");
            scName.x = sc.width / 2;
            scName.y = sc.height / 2;

            sc.addChild(scName);
            this.addChild(sc);

            this.schoolBtn.push(sc);

            sc.addClickEventListener(function() {self.callBack(this)});
        }
    },

    createSearchArea: function() {
        var sArea = new cc.Sprite();

        this._searchArea = sArea;

        this.createSearchButton();
        this.createSearchField();

        this._searchArea.width = this._searchButton.width + this._searchField.width;
        this._searchArea.height = this._searchButton.height;
        sArea.x = cc.winSize.width / 2 - this._searchField.width/2;
        sArea.y = cc.winSize.height - 50;
        this.addChild(this._searchArea);
    },

    createSearchButton: function() {
        var button = new ccui.Button("search_button.png",
            "search_button-pressed.png",
            "",
            ccui.Widget.PLIST_TEXTURE);
        button.x = button.width;
        button.y = button.height/2;
        this._searchArea.addChild(button,9);
        this._searchButton = button;
    },

    createSearchField: function() {
        var field = new cc.Sprite("#search_field.png");
        field.x = this._searchButton.x + field.width / 2;
        field.y = this._searchButton.height/2;

        var tf = new ccui.TextField();
        tf.x = field.width / 2;
        tf.y = field.height / 2;
        field.addChild(tf);
        this._searchArea.addChild(field);
        this._searchField = tf;
    },

    callBack: function(school) {
        // this.btn.tag get the tag of button are clicked
        var p = this.parent;
        var button = school.tag;
        cc.sys.localStorage.setItem("lastedSchool", school);
        p.addNewLayer(this, "accLayer", button);
    }
});