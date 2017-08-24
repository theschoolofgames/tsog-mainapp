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
    showCoreMLDemo: {
        iOS: [
            "H102Wrapper",
            "showCoreMLDemo:"
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
    sendEmail: {
        iOS: [
            "H102Wrapper",
            "sendEmail:"
        ], 
        Android: [
            "com/h102/Wrapper",
            "sendEmail",
            "(Ljava/lang/String;)V"
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
    changeAudioRoute: {
        iOS: [
            "H102Wrapper",
            "changeAudioRoute"
        ]
    },
    // Speech Recognition
    changeSpeechLanguageArray: {
        iOS: [
            "H102Wrapper",
            "changeSpeechLanguageArray:data:"
        ],
        Android: [
            "com/h102/Wrapper",
            "changeSpeechLanguageArray",
            "(Ljava/lang/String;Ljava/lang/String;)V" 
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
    },

    // IAP functions
    initInAppBillingService: {
        iOS: [
            "H102Wrapper",
            "initInAppBillingService"
        ],
        Android: [
            "com/h102/Wrapper",
            "initInAppBillingService",
            "()V"
        ]
    },

    unbindInAppBillingService: {
        iOS: [
            "H102Wrapper",
            "unbindInAppBillingService"
        ],
        Android: [
            "com/h102/Wrapper",
            "unbindInAppBillingService",
            "()V"
        ]
    },

    getPurchases: {
        iOS: [
            "H102Wrapper",
            "getPurchases"
        ],
        Android: [
            "com/h102/Wrapper",
            "getPurchases",
            "()Ljava/lang/String;"
        ]
    },

    openUrlWith: {
        iOS: [
            "H102Wrapper",
            "openUrlWith:"
        ],
        Android: [
            "com/h102/Wrapper",
            "openUrlWith",
            "(Ljava/lang/String;)V"  
        ]
    },

    // Permission
    hasGrantPermission: {
        iOS: [
            "H102Wrapper",
            "hasGrantPermission:"
        ],
        Android: [
            "com/h102/Wrapper",
            "hasGrantPermission",
            "(Ljava/lang/String;)Z"
        ]
    },

    requestPermission: {
        iOS: [
            "H102Wrapper",
            "requestPermission:"
        ],
        Android: [
            "com/h102/Wrapper",
            "requestPermission",
            "(Ljava/lang/String;)V"
        ]
    },

    // Firebase 
    isLoggedIn: {
        iOS: [
            "FirebaseWrapper",
            "isLoggedIn"
        ],
        Android: [
            "com/h102/FirebaseWrapper",
            "isLoggedIn",
            "()Z"
        ]
    },
    login: {
        iOS: [
            "FirebaseWrapper",
            "login"
        ],
        Android: [
            "com/h102/FirebaseWrapper",
            "login",
            "()V"   
        ]
    },
    logout: {
        iOS: [
            "FirebaseWrapper",
            "logout"
        ],
        Android: [
            "com/h102/FirebaseWrapper",
            "logout",
            "()V"   
        ]
    },
    getUserInfo: {
        iOS: [
            "FirebaseWrapper",
            "getUserInfo"
        ],
        Android: [
            "com/h102/FirebaseWrapper",
            "getUserInfo",
            "()Ljava/lang/String;"
        ]
    },
    setData: {
        iOS: [
            "FirebaseWrapper",
            "setData:value:"
        ],
        Android: [
            "com/h102/FirebaseWrapper",
            "setData",
            "(Ljava/lang/String;Ljava/lang/String;)V"
        ]
    },
    updateChildValues: {
        iOS: [
            "FirebaseWrapper",
            "updateChildValues:value:"
        ],
        Android: [
            "com/h102/FirebaseWrapper",
            "updateChildValues",
            "(Ljava/lang/String;Ljava/lang/String;)V"
        ]
    },
    setInteger: {
        iOS: [
            "FirebaseWrapper",
            "setInteger:value:"
        ],
        Android: [
            "com/h102/FirebaseWrapper",
            "setInteger",
            "(Ljava/lang/String;I)V"
        ]
    },
    setFloat: {
        iOS: [
            "FirebaseWrapper",
            "setFloat:value:"
        ],
        Android: [
            "com/h102/FirebaseWrapper",
            "setFloat",
            "(Ljava/lang/String;F)V"
        ]
    },
    fetchData: {
        iOS: [
            "FirebaseWrapper",
            "fetchData:"
        ],
        Android: [
            "com/h102/FirebaseWrapper",
            "fetchData",
            "(Ljava/lang/String;)V"
        ]
    },
    fetchConfig: {
        iOS: [
            "FirebaseWrapper",
            "fetchConfigWithExpirationDuration:"
        ],
        Android: [
            "com/h102/FirebaseWrapper",
            "fetchConfig",
            "(Ljava/lang/String;)V"
        ]
    },
    createChildAutoId: {
        iOS: [
            "FirebaseWrapper",
            "createChildAutoId:"
        ],
        Android: [
            "com/h102/FirebaseWrapper",
            "createChildAutoId",
            "(Ljava/lang/String;)Ljava/lang/String;"
        ]
    },
    shareNative: {
        iOS: [
            "H102Wrapper",
            "shareNativeWithCaption:andURL:"
        ],
        Android: [
            "com/h102/Wrapper",
            "shareNative",
            "(Ljava/lang/String;Ljava/lang/String;)V"
        ]
    },
    shareWhatsapp: {
        iOS: [
            "H102Wrapper",
            "shareWhatsappWithCaption:andURL:"
        ],
        Android: [
            "com/h102/Wrapper",
            "shareWhatsapp",
            "(Ljava/lang/String;Ljava/lang/String;)V"   
        ]
    },
    shareFacebook: {
        iOS: [
            "H102Wrapper",
            "shareFacebookWithTitle:andDescription:andURL:"
        ],
        Android: [
            "com/h102/Wrapper",
            "shareFacebook",
            "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V"
        ]
    },
    shareTwitter: {
        iOS: [
            "H102Wrapper",
            "shareTwitterWithDescription:andURL:"
        ], 
        Android: [
            "com/h102/Wrapper",
            "shareTwitter",
            "(Ljava/lang/String;Ljava/lang/String;)V"
        ]
    },
    logEventLevelUp: {
        iOS: [
            "FirebaseWrapper",
            "logEventLevelUpWithLevel:"
        ],
        Android: [
            "com/h102/FirebaseWrapper",
            "logEventLevelUp",
            "(Ljava/lang/String;)V"   
        ]
    },
    logEventSelectContent: {
        iOS: [
            "FirebaseWrapper",
            "logEventSelectContentWithContentType:andItemId:"
        ],
        Android: [
            "com/h102/FirebaseWrapper",
            "logEventSelectContent",
            "(Ljava/lang/String;Ljava/lang/String;)V"   
        ]
    },
    logEventPostScore: {
        iOS: [
            "FirebaseWrapper",
            "logEventPostScoreWithScore:andLevel:andCharacter:",
        ],
        Android: [
            "com/h102/FirebaseWrapper",
            "logEventPostScore",
            "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V"   
        ]
    },
    logEventSpendVirtualCurrency: {
        iOS: [
            "FirebaseWrapper",
            "logEventSpendVirtualCurrencyWithItemName:andVirtualCurrencyName:andValue:"
        ],
        Android: [
            "com/h102/FirebaseWrapper",
            "logEventSpendVirtualCurrency",
            "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V"
        ]
    },
    logEventShare: {
        iOS: [
            "FirebaseWrapper",
            "logEventShareWithContentType:andItemId:"
        ],
        Android: [
            "com/h102/FirebaseWrapper",
            "logEventShare",
            "(Ljava/lang/String;Ljava/lang/String;)V"   
        ]
    },
    logEventAppOpen: {
        iOS: [
            "FirebaseWrapper",
            "logEventAppOpen"
        ],
        Android: [
            "com/h102/FirebaseWrapper",
            "logEventAppOpen",
            "()V"
        ]
    },

    logCustomEvent: {
        iOS: [
            "FirebaseWrapper",
            "logCustomEventWithName:"
        ],
        Android: [
            "com/h102/FirebaseWrapper",
            "logCustomEvent",
            "(Ljava/lang/String;)V"
        ]
    },

    getCountryCode: {
        iOS: [
            "H102Wrapper",
            "getCountryCode"
        ],
        Android: [
            "com/h102/Wrapper",
            "getCountryCode",
            "()Ljava/lang/String;"
        ]
    },

    cancelLocalNotificationsWithTag: {
        iOS: [
            "H102Wrapper",
            "cancelLocalNotificationsWithTag:"
        ],
        Android: [
            "com/h102/Wrapper",
            "cancelLocalNotificationsWithTag",
            "(Ljava/lang/String;)V"
        ]
    },

    startDailyNotif: {
        iOS: [
            "H102Wrapper",
            "startDailyNotif"
        ],
        Android: [
            "com/h102/Wrapper",
            "startDailyNotif",
            "()V"
        ]
    },

    startTwoDaysNotif: {
        iOS: [
            "H102Wrapper",
            "startTwoDaysNotif"
        ],
        Android: [
            "com/h102/Wrapper",
            "startTwoDaysNotif",
            "()V"
        ]
    },

    isOpenedFromNotification: {
        iOS: [
            "H102Wrapper",
            "isOpenedFromNotification"
        ],
        Android: [
            "com/h102/Wrapper",
            "isOpenedFromNotification",
            "()Z"
        ]
    },

    openStore: {
        iOS: [
            "H102Wrapper",
            "openStore"
        ],
        Android: [
            "com/h102/Wrapper",
            "openStore",
            "()V"
        ]
    }
}

var NativeHelperListener = {};

// Args must be an array
NativeHelper.callNative = function(method, args) {
    if (!NativeHelperConfig[method] || !NativeHelperConfig[method][cc.sys.os]) {
        cc.log("WARNING: No config for os: " + cc.sys.os + " with method: " + method)
        return;
    }

    args = args || [];
    // debugLog("NativeHelper.callNative: " + method + ", args: " + JSON.stringify(args));
    
    args = NativeHelperConfig[method][cc.sys.os].concat(args);
    return jsb.reflection.callStaticMethod.apply(this, args);
}

NativeHelper.setListener = function(name, listener) {
    NativeHelperListener[name] = listener;
}

NativeHelper.removeListener = function(name) {
    delete NativeHelperListener[name];
}

NativeHelper.onReceive = function(name, fnName, args) {
    if (NativeHelperListener[name]) {
        args = args || [];

        NativeHelperListener[name][fnName].apply(NativeHelperListener[name], args);
    }
    else
        cc.error("WARNING: listener " + name + " not found");
}