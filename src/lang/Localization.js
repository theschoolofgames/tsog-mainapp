var currentLanguage = "en";

function localize(str) {
    cc.log("localize");
    return (languages[currentLanguage])[str] || str;
};

function localizeForWriting(str) {
    cc.log("localizeForWriting");
    return (languagesForWriting[currentLanguage])[str] || str;
};

function setLanguage(language){
    currentLanguage = language;
}