var SchoolSelectorLayer = cc.Layer.extend({
    schNumber: 0,
    scBtn: null,

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
            this.scBtn = sc;

            sc.addClickEventListener(function() {self.callBack()});
        }
    },

    callBack: function() {
        // this.btn.tag get the tag of button are clicked
        cc.log("callback in school selector layer");
        var parent = this.parent;
        parent.addNewLayer(this, parent.accList);
    }
});