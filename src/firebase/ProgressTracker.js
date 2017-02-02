var ProgressTracker = cc.Class.extend({
    _current: null,

    _calculatedObj: {},

    ctor: function() {
        this.updateCurrent();
        this.getCurrent();
    },

    _calcProgress: function() {
        this._calculatedObj = {};
        var objectArray = Object.keys(this._current);
        for (var i = 0; i < objectArray.length; i++) {
            var o = objectArray[i];
            var completedLevelIds = this._current[o]["completedLevelIds"];
            var idArray = Object.keys(completedLevelIds);
            this._calculatedObj[o] = idArray.length / 3;
            cc.log(objectArray[i] + "---" + idArray.length);
        }

        // cc.log("_calcProgress _calculatedObj " + JSON.stringify(this._calculatedObj));
        return this._calculatedObj;
    },

    track: function(id, level) {
        GameObjectsProgress.getInstance().setProgressById(id, level);
    },

    getCurrent: function() {
        // return current progress for ProgressTracker page
        
        return this._calcProgress();;
    },

    updateCurrent: function() {
        // update this._current 
        this._current = GameObjectsProgress.getInstance().getObjectsProgress();
        // cc.log("_current ProgressTracker -> " + JSON.stringify(this._current));
    },
});

ProgressTracker._instance = null;

ProgressTracker.getInstance = function() {
    return ProgressTracker._instance || ProgressTracker.setupInstance();
};

ProgressTracker.setupInstance = function() {
    ProgressTracker._instance = new ProgressTracker();
    return ProgressTracker._instance;
};