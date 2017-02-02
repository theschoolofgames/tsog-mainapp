var ProgressTracker = cc.Class.extend({
    _current: null,

    ctor: function() {
        this.updateCurrent();
    },

    isLevelCompleted: function(level) {
        cc.assert((typeof level != "string") || level.length == 0, "Level must be string and cannot be null!");
        return true;
    },

    trackByLevel: function(level) {
        if (this.isLevelCompleted(level))
            return;

        // else --> track

        // update current progress
        this.updateCurrent();
    },

    getCurrent: function() {
        // return current progress for ProgressTracker page
        return this._current;
    },

    updateCurrent: function() {
        // update this._current 
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