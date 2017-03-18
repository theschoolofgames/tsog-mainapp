var EkStepHelper = EkStepHelper || {};
EkStepHelper.sendNavigateEvent = function(from, to) {
	var event = {
        "type": "NEXT", // type of event - NEXT, PREVIOUS, SKIP or EXIT
        "itype": "AUTO", // type of interaction - SWIPE, SCRUB (fast forward using page thumbnails) or AUTO
        "stageid": from, // game level, stage or page id on which the event happened
        "stageto": to // game level, stage of page id to which the navigation was done
  	};

    NativeHelper.callNative("sendTelemetryEvent", ["OE_NAVIGATE", JSON.stringify(event)]);
}