var currentLanguage = "en";

function localize(str) {
    // cc.log("localize");
    currentLanguage = KVDatabase.getInstance().getString("currentLanguage", "en");
    return (languages[currentLanguage])[str] || str;
};

function localizeForWriting(str) {
    // cc.log("localizeForWriting");
    currentLanguage = KVDatabase.getInstance().getString("currentLanguage", "en");
    return (languagesForWriting[currentLanguage])[str] || str;
};

function setLanguage(language){
    if (!language)
        language = KVDatabase.getInstance().getString("currentLanguage", "en");
    currentLanguage = language;

    KVDatabase.getInstance().set("currentLanguage", language);
}