var CustomLabel = cc.Class.extend({
    ctor: function(){
    },

    getTTFConfig: function(fontFile, fontSize) {
        var ttfConfig = {
            fontFilePath: fontFile,
            fontSize: fontSize,
            outlineSize: 0,
            glyphs: 0,
            customGlyphs: "",
            distanceFieldEnable: true
        };
        return ttfConfig;
    },

    createCustomLabel: function (fontName, fontSize, color, outlineSize, text) { // color -> cc.color(), text -> String
        var titleLabel = cc.Label.createWithTTF(this.getTTFConfig(fontName, fontSize), text);
        titleLabel.enableOutline(color, outlineSize);
        titleLabel.setAlignment(cc.VERTICAL_TEXT_ALIGNMENT_CENTER); 

        return titleLabel;
    },
});

CustomLabel._instance = null;

CustomLabel.getInstance = function(){
    return CustomLabel._instance || CustomLabel.setupInstance();
};

CustomLabel.setupInstance = function(){
    CustomLabel._instance = new CustomLabel();
    return CustomLabel._instance;
};

CustomLabel.createWithTTF = function(fontName, fontSize, color, outlineSize, text) {
    return CustomLabel._instance.createCustomLabel(fontName, fontSize, color, outlineSize, text);
}