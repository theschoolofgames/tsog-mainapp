var currentLanguage = "en";

function localize(str) {
    // cc.log("localize");
    currentLanguage = KVDatabase.getInstance().getString("currentLanguage", "en");
    cc.log("localize: " + currentLanguage);
    return (languages[currentLanguage])[str] || str;
};

function localizeForWriting(str) {
    // cc.log("localizeForWriting");
    currentLanguage = KVDatabase.getInstance().getString("currentLanguage", "en");
    cc.log("localizeForWriting: " + currentLanguage);
    return (languagesForWriting[currentLanguage])[str] || str;
};

function setLanguage(language){
    currentLanguage = language;
}