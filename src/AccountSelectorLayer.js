var AccountSelectorLayer = cc.Layer.extend({
    accountBtn: [],
    school: null,

    ctor: function () {
        this._super();

        this.createAccountButton(5);
        this.addBackButton();
    },

    createAccountButton: function (accNumber){
        var self = this;
        var acc;
        for ( var i = 0; i < accNumber; i++) {
            var s = ACCOUNT_INFO[i].sex;
            if (s === 0)
                acc = new ccui.Button(res.Female_png, "", "");
            else
                acc = new ccui.Button(res.Male_png, "", "");

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
            this.accountBtn.push(acc);

            acc.addClickEventListener(function() {
                self.callback(this);
            });
        }
        this.createPlusButton();
    },

    createPlusButton:function (){
        var self = this;
        var p = new ccui.Button(res.Plus_png, "", "");
        p.x = cc.winSize.width * 3/4;
        p.y = cc.winSize.height * 0.25;
        p.addClickEventListener(function() {
            self.parent.addNewLayer(this, "signUpLayer");
            cc.log("going to sign up layer");
        });
        this.addChild(p);
    },

    callback: function (account) {
        var p = this.parent;
        var button = account.tag;
        p.addNewLayer(this, "loginLayer", button);
    },

    createAccountNameLabel: function(index, button) {
        var name = ACCOUNT_INFO[index].name;
        var lb = new cc.LabelTTF(name, "Arial", 24);
        lb.x = button.width / 2;
        lb.y = button.height / 8 + lb.height/2;
        button.addChild(lb);
    },

    addBackButton: function() {
        var self = this;
        var b = new ccui.Button(res.Back_png, "", "");
        b.x = b.width / 2;
        b.y = cc.winSize.height - b.height / 2;
        this.addChild(b);

        b.addClickEventListener(function() {
            self.parent.addNewLayer(self, "schLayer");
        });

    },

});