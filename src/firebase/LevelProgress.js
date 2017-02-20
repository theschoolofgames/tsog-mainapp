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
        // Utils.updateStepData();
        // return;
    	var currentStep = SceneFlowController.getInstance().getCurrentStep();
	    var currentSceneIdx = SceneFlowController.getInstance().getCurrentSceneIdx();
	    var currentStepGame = currentStep + "-" + currentSceneIdx;
        var completedSteps = this.getCompletedSteps();

        var dataPath = "res/config/levels/" + "step-" + currentStep + ".json";
        if (currentStepGame.indexOf("assessment") > - 1) {
            dataPath = "res/config/levels/" + currentStep + ".json";
        }

        if (jsb.fileUtils.isFileExist(dataPath)) {
            cc.loader.loadJson(dataPath, function(err, data) {
                if (!err && data) {
                    var beforeWinningStars = this.countStarsOfStep(completedSteps, currentStep);

                    completedSteps[currentStepGame] = true;
                    this.setCompletedSteps(completedSteps);

                    var afterWinningStars = this.countStarsOfStep(completedSteps, currentStep);

                    var stepTotalGames = Object.keys(data).length;
                    if (beforeWinningStars * 1.0 / stepTotalGames < NEW_LEVEL_UNLOCKING_STAR_RATIO) {
                        if (afterWinningStars * 1.0 / stepTotalGames >= NEW_LEVEL_UNLOCKING_STAR_RATIO) {
                            KVDatabase.getInstance().set("newLevelUnlocked", true);
                        }
                    }

                }
            }.bind(this));
        }
    },

    countStarsOfStep: function(data, step) {
        var count = 0;
        for (var key in data) {
            if (key.indexOf(step) == 0) {
                count++;
            }
        }
        return count;
    },
});