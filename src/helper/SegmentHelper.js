var SegmentHelper = SegmentHelper || {};

SegmentHelper.identity = function(userId, userName, schoolId, schoolName) {
    traits = {
        userName: userName,
        schoolName: schoolName,
        schoolId: schoolId
    };

    NativeHelper.callNative("segmentIdentity", [userId, JSON.stringify(traits)]);
}

SegmentHelper.track = function(event, properties) {

    var userId = KVDatabase.getInstance().getString(STRING_USER_ID);
    var userName = KVDatabase.getInstance().getString(STRING_USER_NAME);
    var schoolId = KVDatabase.getInstance().getString(STRING_SCHOOL_ID);
    var schoolName = KVDatabase.getInstance().getString(STRING_SCHOOL_NAME);
    var udid = NativeHelper.callNative("getUDID");

    properties = properties || {};
    if (userId && userId != "")
        properties.user_id = userId;
    if (userName && userName != "")
        properties.user_name = userName;
    if (schoolId && schoolId != "")
        properties.school_id = schoolId;
    if (schoolName && schoolName != "")
        properties.school_name = schoolName;
    properties.udid = udid;

    NativeHelper.callNative("segmentTrack", [event, JSON.stringify(properties)]);
}
