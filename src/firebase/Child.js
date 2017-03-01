var Child = BaseFirebaseModel.extend({
   _className: "Child",

    ctor: function(id, initCallback) {
        this.fixCocosBugs();
        this.setDefaultValues({
            "coin": COIN_START_GAME,
            "diamond": DIAMOND_START_GAME,
            "selectedCharacter": "adi"
        });

	    this.hasOne("levelProgress", LevelProgress);
        this.hasOne("gameObjectsProgress", GameObjectsProgress);
        this.hasOne("charactersProgress", CharactersProgress);
        
        this._super("/children/" + id, id, 
            ["coin", "diamond", "selectedCharacter", 
            "levelProgressId", "gameObjectsProgressId", "charactersProgressId"], 
            initCallback);
    },

    create: function() {
    	this._super();

        ///////////////////////////////////////
    	var levelProgressId = FirebaseManager.getInstance().createChildAutoId("levelProgresses");
        this.setLevelProgressId(levelProgressId); // to trigger save

        var levelProgress = new LevelProgress(levelProgressId, function(found) {
        });
        levelProgress.create();

        ///////////////////////////////////////
        var gameObjectsProgressId = FirebaseManager.getInstance().createChildAutoId("gameObjectsProgress");
        this.setGameObjectsProgressId(gameObjectsProgressId);

        var gameObjectsProgress = new GameObjectsProgress(gameObjectsProgressId, function(found) {
        });
        gameObjectsProgress.create();

        ///////////////////////////////////////
        var charactersProgressId = FirebaseManager.getInstance().createChildAutoId("charactersProgress");
        this.setCharactersProgressId(charactersProgressId);

        var charactersProgress = new CharactersProgress(charactersProgressId, function(found) {
        });
        charactersProgress.create();
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

    _createGameObjectsProgress: function(cb) {
        var objId = FirebaseManager.getInstance().createChildAutoId("gameObjectsProgress");
        this.setGameObjectsProgressId(objId);

        var newObj = new GameObjectsProgress(objId, function(found) {
            cb && cb(found);
        });
        newObj.create();

        this.setGameObjectsProgress(newObj);
    },

    _createCharactersProgress: function(cb) {
        var objId = FirebaseManager.getInstance().createChildAutoId("charactersProgress");
        this.setCharactersProgressId(objId);

        var objId = new CharactersProgress(objId, function(found) {
            cb && cb(found);
        })
        newObj.create();

        this.setCharactersProgress(newObj);
    },

    winCurrentLevelStep: function() {
    	return this.getLevelProgress().winCurrentLevelStep();
    },

    getGameObjectsLearned: function() {
        return this.getGameObjectsProgress().getGameObjectsLearned();
    },

    countGameObjectsCompleted: function(gameObjectId) {
        return this.getGameObjectsProgress().countCompleted(gameObjectId);
    },
});