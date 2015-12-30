var NativeHelper = NativeHelper || {};

var NativeHelperConfig = {
    callOpenScheme: {
        iOS: [
            "H102Wrapper",
            "openScheme:withData:"
        ],
        Android: [
            "com/h102/Wrapper",
            "openScheme",
            "(Ljava/lang/String;Ljava/lang/String;)Z"
        ]
    },
    getUDID: {
        iOS:[
            "H102Wrapper",
            "getUniqueDeviceId"
        ],
        Android: [
            "com/h102/Wrapper",
            "getId",
            "()Ljava/lang/String;"
        ]
    },
    showMessage: {
        iOS: [
            "H102Wrapper",
            "showMessage:message:"
        ], 
        Android: [
            "com/h102/Wrapper",
            "showMessage",
            "(Ljava/lang/String;Ljava/lang/String;)V"
        ]
    },
    // Segment
    segmentIdentity: {
        iOS: [
            "H102Wrapper",
            "segmentIdentity:traits:"
        ],
        Android: [
            "com/h102/Wrapper",
            "segmentIdentity",
            "(Ljava/lang/String;Ljava/lang/String;)V"
        ]
    },
    segmentTrack: {
        iOS: [
            "H102Wrapper",
            "segmentTrack:properties:"
        ],
        Android: [
            "com/h102/Wrapper",
            "segmentTrack",
            "(Ljava/lang/String;Ljava/lang/String;)V"
        ]
    },
    // Sound Recording
    checkMic: {
        iOS: [
            "H102Wrapper",
            "checkMic"
        ],
        Android: [
            "com/h102/Wrapper",
            "checkMic",
            "()Z"
        ]
    },
    isRecording: {
        iOS: [
            "H102Wrapper",
            "isRecording"
        ],
        Android: [
            "com/h102/Wrapper",
            "isRecording",
            "()Z"
        ]
    },
    startFetchingAudio: {
        iOS: [
            "H102Wrapper",
            "startFetchingAudio"
        ],
        Android: [
            "com/h102/Wrapper",
            "startRecord",
            "()V"
        ]
    },
    stopRecord: {
        iOS: [
            "H102Wrapper",
            "stopRecord"
        ],
        Android: [
            "com/h102/Wrapper",
            "stopRecord",
            "()V"
        ]
    },
    // Speech Recognition
    changeSpeechLanguageArray: {
        iOS: [
            "H102Wrapper",
            "changeSpeechLanguageArray:"
        ],
        Android: [
            "com/h102/Wrapper",
            "changeSpeechLanguageArray",
            "(Ljava/lang/String;)V" 
        ]
    },
    startSpeechRecognition: {
        iOS: [
            "H102Wrapper",
            "startSpeechRecognition:"
        ],
        Android: [
            "com/h102/Wrapper",
            "startSpeechRecognition",
            "(I)V"   
        ]
    },
    stopSpeechRecognition: {
        iOS: [
            "H102Wrapper",
            "stopSpeechRecognition"
        ],
        Android: [
            "com/h102/Wrapper",
            "stopSpeechRecognition",
            "()V"   
        ]
    },
    startRestClock: {
        iOS: [
            "H102Wrapper",
            "startRestClock:"
        ],
        Android: [
            "com/h102/Wrapper",
            "startRestClock",
            "()V"   
        ]
    }
}

// Args must be an array
NativeHelper.callNative = function(method, args) {
    if (!NativeHelperConfig[method] || !NativeHelperConfig[method][cc.sys.os]) {
        cc.log("WARNING: No config for os: " + cc.sys.os + " with method: " + method)
        return;
    }

    args = args || [];
    args = NativeHelperConfig[method][cc.sys.os].concat(args);
    return jsb.reflection.callStaticMethod.apply(this, args);
}
