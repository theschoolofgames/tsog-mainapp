var SchoolSelectorLayer = cc.Layer.extend({
    schNumber: 0,
    schoolBtn: [],

    ctor: function () {
        this._super();

        this.createSchoolButton(5);
    },

    createSchoolButton: function(schNumber) {
        var self = this;

        for ( var i = 0; i < schNumber; i++) {
            var sc = new ccui.Button("school.png", "", "", ccui.Widget.PLIST_TEXTURE);
            if (i < 2) {
                sc.x = ((cc.winSize.width / 3) * (i + 1));
                sc.y = cc.winSize.height * 0.75;
            } else {
                sc.x = ((cc.winSize.width / 4) * (i - 1)) ;
                sc.y = cc.winSize.height * 0.25;
            }
            sc.tag = i;
            var scName = new cc.Sprite("#school-name.png");
            scName.x = sc.width / 2;
            scName.y = -scName.height / 3;

            sc.addChild(scName);
            this.addChild(sc);

            this.schoolBtn.push(sc);

            sc.addClickEventListener(function() {self.callBack(this)});
        }
    },

    callBack: function(school) {
        // this.btn.tag get the tag of button are clicked
        var p = this.parent;
        var button = school.tag;

        p.addNewLayer(this, "accLayer", button);
    }
});