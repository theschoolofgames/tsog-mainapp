var EVENT_MISSION_PAGE_1 = "MISSION_PAGE_1";
var EVENT_PAY_PAGE_1 = "PAY_PAGE_1";
var EVENT_PLAY_FREE = "PLAY_FREE";
var EVENT_LOGIN_CANCEL = "LOGIN_CANCEL";
var EVENT_LOGIN_SUCCESS = "LOGIN_SUCCESS";
var EVENT_HOME_LOAD = "HOME_LOAD";
var EVENT_PLAY_CLICK = "PLAY_CLICK";
var EVENT_LEARN_CLICK = "LEARN_CLICK";
var EVENT_PETS_CLICK = "PETS_CLICK";
var EVENT_PETS_BASKET_CLICK = "PETS_BASKET_CLICK";
var EVENT_CHECK_NEW_ANIMAL = "CHECK_NEW_ANIMAL";
var EVENT_PARENTS_CLICK = "PARENTS_CLICK";
var EVENT_MISSION_PAGE_2 = "MISSION_PAGE_2";
var EVENT_MENU_LOAD = "MENU_LOAD";
var EVENT_PROGRESS_CHECK = "PROGRESS_CHECK";
var EVENT_SHARE_START = "SHARE_START";
var EVENT_PAY_PAGE_2 = "PAY_PAGE_2";

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
	},

	logCustomEvent: function(eventName) {
		debugLog("logCustomEvent - " + eventName);
		NativeHelper.callNative("logCustomEvent", [eventName]);
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