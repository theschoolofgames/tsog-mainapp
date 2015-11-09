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
    }
}

// Args must be an array
NativeHelper.callNative = function(method, args) {
    if (!NativeHelperConfig[method][cc.sys.os]) {
        cc.log("WARNING: No config for os: " + cc.sys.os + " with method: " + method)
        return;
    }

    args = args || [];
    args = NativeHelperConfig[method][cc.sys.os].concat(args);
    return jsb.reflection.callStaticMethod.apply(this, args);
}
