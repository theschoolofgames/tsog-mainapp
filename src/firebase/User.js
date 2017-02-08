var User = BaseFirebaseModel.extend({
    _className: "User",

    name: null,
    email: null,
    photoUrl: null,
    uid: null,

    children: null,

    ctor: function(data, initCallback) {
        try {
            data = JSON.parse(data);
        } catch(e) {
            return;
        }
        this.name = data.name;
        this.email = data.email;
        this.photoUrl = data.photoUrl;
        this.uid = data.uid;

        this.setDefaultValues({
         "childrenIds": []
        });

        this.hasMany("children", Child);

        this._super("/users/" + data.uid, data.uid, ["childrenIds"], initCallback);
    },

    createChild: function(cb) {
        var childId = FirebaseManager.getInstance().createChildAutoId("children");
        var childrenIds = this.getChildrenIds();
        childrenIds.push(childId);
        this.setChildrenIds(childrenIds); // to trigger save

        var newChild = new Child(childId, function(found) {
            cb && cb(found);
        });
        newChild.create();

        this.getChildren().push(newChild);
    },

    getFirstChild: function() {
        return this.getChildren()[0];
    },

    getCurrentChild: function() {
        return this.getFirstChild();
    }
});

User._instance = null;

User.getCurrentUser = function () {
  return User._instance;
};

User.isLoggedIn = function() {
    return User._instance != null;
};

User.getCurrentChild = function() {
    cc.assert(User.isLoggedIn(), "user is not logged in");

    return User.getCurrentUser().getCurrentChild();
};

User.logout = function() {
    User._instance = null;
    return true;
};

User.setCurrentUser = function(data, initCallback) {
    // debugLogStackTrace();
    cc.assert(data != null, "data cannot be null");

    User._instance = new User(data, initCallback);
    return User._instance;
};