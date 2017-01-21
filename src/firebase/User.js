var User = cc.Class.extend({
    name: null,
    email: null,
    photoUrl: null,
    uid: null,

    ctor: function(stringData) {
        var data;
        try {
            data = JSON.parse(stringData);
        } catch(e) {
            return;
        }

        this.name = data.name;
        this.email = data.email;
        this.photoUrl = data.photoUrl;
        this.uid = data.uid;
    },
})