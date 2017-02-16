var LevelProgress = BaseFirebaseModel.extend({
   _className: "LevelProgress",

    ctor: function(id, initCallback) {
        this.fixCocosBugs();
        this.setDefaultValues({
            "completedSteps": {}
        });
    	this._super("/levelProgresses/" + id, id, ["completedSteps"], initCallback);
    },

    winCurrentLevelStep: function() {
        Utils.updateStepData();
        return;
        debugLog("winCurrentLevelStep");
    	var currentLevel = SceneFlowController.getInstance().getCurrentStep();
	    var currentSceneIdx = SceneFlowController.getInstance().getCurrentSceneIdx();
	    var levelStep = currentLevel + "-" + currentSceneIdx;
	    debugLog("current level step: " + levelStep);

        var obj = this.getCompletedSteps();
        obj[levelStep] = true;
        this.setCompletedSteps(obj);
    }
});