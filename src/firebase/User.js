var User = BaseFirebaseModel.extend({
    _className: "User",

    name: null,
    email: null,
    photoUrl: null,
    uid: null,

    _selectedChildIndex: null,

    ctor: function(data, initCallback) {
        this.fixCocosBugs();
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
            "childrenIds": [],
            "dynamicLink": "",
            "identifiedObjectsString": ""
        });

        this.hasMany("children", Child);

        this._super("/users/" + data.uid, data.uid, ["childrenIds", "dynamicLink", "subscription", "identifiedObjectsString"], initCallback);
    },

    isSubscriptionValid: function() {
        cc.log("isSubscriptionValid: %s -> %d", this.getSubscription(), this.getSubscription() != null);
        return this.getSubscription() != null;
    },

    createChild: function(cb) {
        var childId = FirebaseManager.getInstance().createChildAutoId("children");
        debugLog(this._className + ".createChild: " + childId);
        var childrenIds = this.getChildrenIds();
        childrenIds.push(childId);
        this.setChildrenIds(childrenIds); // to trigger save

        var newChild = new Child(childId, function(found) {
        });
        newChild.create();

        this.getChildren().push(newChild);

        return childId;
    },

    selectChild: function(id, cb) {
        debugLog(this._className + ".selectChild: " + id);
        debugLog("this.getChildren(): " + JSON.stringify(this.getChildren()));
        for (var i = 0; i < this.getChildren().length; i++) {
            debugLog("  - #" + i + ": " + this.getChildren()[i].getId());
            if (this.getChildren()[i].getId() == id) {
                this._selectedChildIndex = i;
                this.getChildren()[i].fetchDependencies(function() {
                    cb && cb();
                });
                return true;
            }
        }
        return false;
    },

    getCurrentChild: function() {
        // debugLog(this._className + ".getCurrentChild: _selectedChildIndex is " + this._selectedChildIndex);
        if (this._selectedChildIndex == null) {
            return null;
        }
        // debugLog("this.getChildren(): " + JSON.stringify(this.getChildren()));

        return this.getChildren()[this._selectedChildIndex];
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