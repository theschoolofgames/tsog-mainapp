var SpeakingTestForFruiddition = SpeakingTestLayer.extend({
    ctor: function (data, duration) {
        this._super(data, duration);
    },

    _fetchObjectData: function(data) {
        this._data = data[0];

        this._data["third"] = this._data["third"].map(function(o){
            return Utils.getValueOfObjectById(o);
        });

        this._names = this._data["third"];   
        this.setData(this._data);
    },

});

var SpeakingTestForFruidditionScene = cc.Scene.extend({
    ctor: function(data, duration){
        this._super();

        var layer = new SpeakingTestForFruiddition(data, duration);
        this.addChild(layer);
    }
});