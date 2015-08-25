var LoginLayer = cc.Layer.extend({
    _passwordList: [],
    accountClicked: null,

    ctor: function (account) {
        this._super();

        this.accountClicked = account;

        this.createAccountImage();
        this.createPasswordField();
        this.createPasswordList();
        this.addBackButton();
    },

    createAccountImage: function() {
        var s = ACCOUNT_INFO[this.accountClicked].sex;
        var acc;
        if (s === 0)
            acc = new ccui.Button("female-avt.png", "", "", ccui.Widget.PLIST_TEXTURE);
        else
            acc = new ccui.Button("male-avt.png", "", "", ccui.Widget.PLIST_TEXTURE);

        acc.x = cc.winSize.width / 2;
        acc.y = cc.winSize.height / 2;

        this.createAccountNameLabel(this.accountClicked, acc);
        this.addChild(acc);
    },

    createAccountNameLabel: function(index, button) {
        var name = ACCOUNT_INFO[index].name;
        var lb = new cc.LabelTTF(name, "Arial", 24);
        lb.x = button.width / 2;
        lb.y = button.height / 8 + lb.height/2;
        button.addChild(lb);
    },

    createPasswordField: function() {

    },

    createPasswordList: function() {

    },

    addBackButton: function() {
        var self = this;
        var b = new ccui.Button("back-button.png", "", "", ccui.Widget.PLIST_TEXTURE);
        b.x = b.width / 2;
        b.y = cc.winSize.height - b.height / 2;
        this.addChild(b);

        b.addClickEventListener(function() {
            self.parent.addNewLayer(self, "accLayer");
        });

    },
});