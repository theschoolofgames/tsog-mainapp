var NativeHelper = NativeHelper || {};

var NativeHelperConfig = {
    callOpenScheme: {
        iOS: [
            "H102Wrapper",
            "openScheme:withData:"
        ],
        Android: [
            "org/cocos2dx/javascript/AppActivity",
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
            "org/cocos2dx/javascript/AppActivity",
            "getId",
            "()Ljava/lang/String;"
        ]
    },
    segmentIdentity: {
        iOS: [
            "H102Wrapper",
            "segmentIdentity:traits:"
        ],
        Android: [
            "org/cocos2dx/javascript/AppActivity",
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
            "org/cocos2dx/javascript/AppActivity",
            "segmentTrack",
            "(Ljava/lang/String;Ljava/lang/String;)V"
        ]
    },
    checkMic: {
        iOS: [
            "H102Wrapper",
            "checkMic"
        ],
        Android: [
            "org/cocos2dx/javascript/AppActivity",
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
            "org/cocos2dx/javascript/AppActivity",
            "isRecording",
            "()Z"
        ]
    },
    initRecord: {
        iOS: [
            "H102Wrapper",
            "initRecord:"
        ],
        Android: [
            "org/cocos2dx/javascript/AppActivity",
            "initRecord",
            "(Ljava/lang/String;)V"
        ]
    },
    startRecord: {
        iOS: [
            "H102Wrapper",
            "startRecord"
        ],
        Android: [
            "org/cocos2dx/javascript/AppActivity",
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
            "org/cocos2dx/javascript/AppActivity",
            "stopRecord",
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
