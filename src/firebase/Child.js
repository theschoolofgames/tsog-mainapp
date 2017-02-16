var Child = BaseFirebaseModel.extend({
   _className: "Child",

    ctor: function(id, initCallback) {
        this.fixCocosBugs();
        this.setDefaultValues({
            "coin": COIN_START_GAME,
            "diamond": DIAMOND_START_GAME
        });

	    this.hasOne("levelProgress", LevelProgress);
        
        this._super("/children/" + id, id, ["coin", "diamond" ,"levelProgressId"], initCallback);
    },

    create: function() {
    	this._super();

    	var levelProgressId = FirebaseManager.getInstance().createChildAutoId("levelProgresses");
        this.setLevelProgressId(levelProgressId); // to trigger save

        var levelProgress = new LevelProgress(levelProgressId, function(found) {
        });
        levelProgress.create();
    },

    _createLevelProgress: function(cb) {
        var objId = FirebaseManager.getInstance().createChildAutoId("levelProgresses");
        this.setLevelProgressId(objId); // to trigger save

        var newObj = new LevelProgress(objId, function(found) {
            cb && cb(found);
        });
        newObj.create();

        this.setLevelProgress(newObj);
    },

    winCurrentLevelStep: function() {
    	return this.getLevelProgress().winCurrentLevelStep();
    }
});