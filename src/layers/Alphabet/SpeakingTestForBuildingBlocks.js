var SpeakingTestForBuildingBlocks = SpeakingTestLayer.extend({
    ctor: function (data, duration) {
        this._super(data, duration);
    },

    _playObjectSound: function() {
        
    },

    _fetchObjectData: function(data) {
        this._data = data;
        this._names = data["third"];   
        this.setData(this._data);
        cc.log("data after map: " + JSON.stringify(this._names));
    },

});

var SpeakingTestForBuildingBlocksScene = cc.Scene.extend({
    ctor: function(data, duration){
        this._super();

        var layer = new SpeakingTestForBuildingBlocks(data, duration);
        this.addChild(layer);
    }
});