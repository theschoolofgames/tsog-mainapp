var SpeakingTestForBuildingBlocks = SpeakingTestLayer.extend({
    ctor: function (data, duration) {
        this._super(data, duration);
    },

    // _playObjectSound: function() {
                
    // },

    _fetchObjectData: function(data) {
        this._data = data[0];

        this._data["third"] = this._data["third"].map(function(o){
            return Utils.getValueOfObjectById(o);
        });

        this._names = this._data["third"];   
        // this.setData(this._data);
        // cc.log("data after map: " + JSON.stringify(this._names));
    },

});

var SpeakingTestForBuildingBlocksScene = cc.Scene.extend({
    ctor: function(data, duration){
        this._super();

        var layer = new SpeakingTestForBuildingBlocks(data, duration);
        this.addChild(layer);
    }
});