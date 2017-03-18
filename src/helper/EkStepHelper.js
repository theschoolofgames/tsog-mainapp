var EkStepHelper = EkStepHelper || {};
EkStepHelper.sendNavigateEvent = function(from, to) {
	var event = {
        "type": "NEXT", // type of event - NEXT, PREVIOUS, SKIP or EXIT
        "itype": "AUTO", // type of interaction - SWIPE, SCRUB (fast forward using page thumbnails) or AUTO
        "stageid": from, // game level, stage or page id on which the event happened
        "stageto": to // game level, stage of page id to which the navigation was done
  	};

    NativeHelper.callNative("sendTelemetryEvent", ["OE_NAVIGATE", JSON.stringify(event)]);
};

EkStepHelper.sendAssessEvent = function(word, correct, answer) {
	var event = {
        "qid": word, // unique assessment question id. its an required property.
        "pass": correct ? "Yes" : "No", // Yes, No. This is case-sensitive. default value: No.
        "score": 1, // score (Integer or decimal) given to this assessment, default is 1 if pass=YES or 0 if pass=NO
        "resvalues": [{"answer": answer}], // array of key-value pairs that represent child answer (result of this assessment)
        "length": 1, // time taken (decimal number) for this assessment in seconds
        "exlength": 1, // expected time (decimal number) in seconds that ideally child should take
        "params": [],
        "qindex": 0, // index of the question in a given questions set. default value is 0
        "uri": "" // Unique external resource identifier if any (for recorded voice, image, etc.)
  	};

    NativeHelper.callNative("sendTelemetryEvent", ["OE_ASSESS", JSON.stringify(event)]);
};

EkStepHelper.sendItemResponseEvent = function(id, type) {
    var event = {
        "qid": id, // unique assessment question id
        "type": type, // type of interaction. CHOOSE,DRAG,SELECT,MATCH,INPUT,SPEAK,WRITE
        "state": "SELECTED", // state of the response (SELECTED, UNSELECTED) - to allow the child to unselect an option
        "resvalues": []
    };

    NativeHelper.callNative("sendTelemetryEvent", ["OE_ITEM_RESPONSE", JSON.stringify(event)]);
};
