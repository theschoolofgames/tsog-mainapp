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
    customLogging: {
        iOS: [
            "H102Wrapper",
            "fabricCustomLoggingWithKey:andValue:"
        ],
        Android: [
            "com/h102/Wrapper",
            "fabricCustomLogging",
            "(Ljava/lang/String;Ljava/lang/String;)V"
        ]
    },
    getVersionName: {
        iOS: [
            "H102Wrapper",
            "getVersionName"
        ],
        Android: [
            "com/h102/Wrapper",
            "getVersionName",
            "()Ljava/lang/String;"
        ]
    },
    getBuildNumber: {
        iOS: [
            "H102Wrapper",
            "getBuildNumber"
        ],
        Android: [
            "com/h102/Wrapper",
            "getVersionCode",
            "()Ljava/lang/String;"
        ]
    },
    showUpdateDialog: {
        iOS: [
            "H102Wrapper",
            "showUpdateDialog:forceUpdate:"
        ],
        Android: [
            "com/h102/Wrapper",
            "showUpdateDialog",
            "(Ljava/lang/String;Z)V"
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
            "startFetchingAudio",
            "()V"
        ]
    },
    stopFetchingAudio: {
        iOS: [
            "H102Wrapper",
            "stopFetchingAudio"
        ],
        Android: [
            "com/h102/Wrapper",
            "stopFetchingAudio",
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
    },
    // Noise Detection
    noiseDetectingLoop: {
        iOS: [
            "H102Wrapper",
            "startDetectingNoiseLevel:"
        ],
        Android: [
            "com/h102/Wrapper",
            "startDetectingNoiseLevel",
            "(F)V"   
        ]
    },
    cancelNoiseDetecting: {
        iOS: [
            "H102Wrapper",
            "cancelNoiseDetecting"
        ],
        Android: [
            "com/h102/Wrapper",
            "cancelNoiseDetecting",
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
