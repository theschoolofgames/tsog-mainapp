var AnalyticsManager = cc.Class.extend({
	ctor: function() {
		cc.assert(AnalyticsManager._instance == null, "can be instantiated once only");
	},

	logEventLevelUp: function(level) {
		NativeHelper.callNative("logEventLevelUp", 
			[level]);
	},

	logEventSelectContent: function(contentType, itemId) {
		NativeHelper.callNative("logEventSelectContent", 
			[contentType, itemId]);
	},

	logEventPostScore: function(score, level, character) {
		NativeHelper.callNative("logEventPostScore", 
			[score, level, character]);
	},

	logEventSpendVirtualCurrency: function(itemName, virtualCurrencyName, value) {
		NativeHelper.callNative("logEventSpendVirtualCurrency",
			[itemName, virtualCurrencyName, value]);
	},

	logEventShare: function(contentType, itemId) {
		NativeHelper.callNative("logEventShare",
			[contentType, itemId]);
	},

	logEventAppOpen: function() {
		NativeHelper.callNative("logEventAppOpen");
	}
});

AnalyticsManager._instance = null;
AnalyticsManager.getInstance = function() {
	return AnalyticsManager._instance || AnalyticsManager.setupInstance();
}
AnalyticsManager.setupInstance = function() {
	AnalyticsManager._instance = new AnalyticsManager();
	return AnalyticsManager._instance;
}