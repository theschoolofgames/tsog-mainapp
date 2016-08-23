var GoFigureTestLayer = WritingTestLayer.extend({
    ctor: function(objectsArray, oldSceneName) {
        this._super();
        this._objectsArray = objectsArray;
        this._oldSceneName = oldSceneName;
    }
});