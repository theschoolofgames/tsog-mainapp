var SchoolSelectorLayer = cc.Layer.extend({
    schNumber: 0,
    btn: null,

    ctor: function () {
        this._super();

        this.addBackground();
        this.createSchoolButton(5);
    },

    addBackground: function() {
        var bg = new cc.Sprite("#bg.png");
        bg.setScaleX(cc.winSize.width / bg.width);
        bg.x = cc.winSize.width / 2;
        bg.y = cc.winSize.height / 2;
        this.addChild(bg);
    },

    createSchoolButton: function(schNumber) {
        var self = this;

        for ( var i = 0; i < schNumber; i++) {
            var sc = new ccui.Button(res.School1_png, "", "");
            if (i < 2) {
                sc.x = ((cc.winSize.width / 3) * (i + 1));
                sc.y = cc.winSize.height * 0.75;
            } else {
                sc.x = ((cc.winSize.width / 4) * (i - 1)) ;
                sc.y = cc.winSize.height * 0.25;
            }
            sc.tag = i;
            var scName = new cc.Sprite(res.SchoolName_png);
            scName.x = sc.width / 2;
            scName.y = -scName.height / 3;

            sc.addChild(scName);
            this.addChild(sc);
            this.btn = sc;

            sc.addClickEventListener(function() {self.buttonCallBack()});
        }
    },

    buttonCallBack: function() {
        // this.btn.tag get the tag of button are clicked

    }
});