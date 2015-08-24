var AccountSelectorLayer = cc.Layer.extend({
    accountBtn: null,

    ctor: function () {
        this._super();

        this.createAccountButton(5);
        this.addBackButton();
    },

    createAccountButton: function (accNumber){
        var self = this;
        for ( var i = 0; i < accNumber; i++) {
            var s = ACCOUNT_INFO[i].sex;
            if (s === 0)
                var acc = new ccui.Button("female-avt.png", "", "", ccui.Widget.PLIST_TEXTURE);
            else
                var acc = new ccui.Button("male-avt.png", "", "", ccui.Widget.PLIST_TEXTURE);

            if (i < 3) {
                acc.x = ((cc.winSize.width / 4) * (i + 1));
                acc.y = cc.winSize.height * 0.75;
            }
            else {
                acc.x = ((cc.winSize.width / 4) * (i - 2));
                acc.y = cc.winSize.height * 0.25;
            }
            acc.tag = i;

            this.createAccountNameLabel(i, acc);

            this.addChild(acc);
            this.accountBtn = acc;

            acc.addClickEventListener(function() {self.callback()});
        }
        this.createPlusButton();
    },

    createPlusButton:function (){
        var p = new ccui.Button("plus-button.png", "", "", ccui.Widget.PLIST_TEXTURE);
        p.x = cc.winSize.width * 3/4;
        p.y = cc.winSize.height * 0.25;
        this.addChild(p);
    },

    callback: function () {
        cc.log("callback in account selector layer");
    },

    createAccountNameLabel: function(index, button) {
        var name = ACCOUNT_INFO[index].name;
        var lb = new cc.LabelTTF(name, "Arial", 24);
        lb.x = button.width / 2;
        lb.y = button.height / 8;
        button.addChild(lb);
    },

    addBackButton: function() {
        var self = this;
        var b = new ccui.Button("back-button.png", "", "", ccui.Widget.PLIST_TEXTURE);
        b.x = b.width / 2;
        b.y = cc.winSize.height - b.height / 2;
        this.addChild(b);

        b.addClickEventListener(function() {
            self.parent.addNewLayer(self, self.parent.schList);
        });
    },
});