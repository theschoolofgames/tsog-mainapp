var currentLanguage = "en";

function localize(str) {
    return (languages[currentLanguage])[str] || str;
};

function localizeForWriting(str) {
    return (languagesForWriting[currentLanguage])[str] || str;
};

function setLanguage(language){
    currentLanguage = language;
}