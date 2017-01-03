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

function localizeNumber(str) {
    currentLanguage = KVDatabase.getInstance().getString("currentLanguage", "en");
    cc.log("localizeNumber \t str \t" + str);
    return (numbersForLocalize[currentLanguage])[str] || str;
}

// Tony work around number case on speaking test
var numbersForLocalize = numbersForLocalize || {};
numbersForLocalize["en"] = {
    "1": "one",
    "2": "two",
    "3": "three",
    "4": "four",
    "5": "five",
    "6": "six",
    "7": "seven",
    "8": "eight",
    "9": "nine"
};
numbersForLocalize["sw"] = {
    "1": "moja",
    "2": "mbili",
    "3": "tatu",
    "4": "nne",
    "5": "tano",
    "6": "sita",
    "7": "saba",
    "8": "nane",
    "9": "tisa"
};