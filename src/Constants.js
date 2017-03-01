// var BACKEND_ADDRESS = "https://tsog.herokuapp.com/";
var BACKEND_ADDRESS = "http://130.211.195.223/";
// var BACKEND_ADDRESS = "http://localhost:3000/";
// var BACKEND_ADDRESS = "http://192.168.2.101:3000/";
// var BACKEND_ADDRESS = "http://192.168.1.17:3000/";


var TSOG_DEBUG = true;
var GAME_URL_ANDROID = "https://play.google.com/store/apps/details?id=com.theschoolofgames.tsog&hl=en";
var GAME_URL_IOS = "http://Coming Soon/";

var PAYWALL_DISABLED = true;
var SHOW_VERSION_LABEL = false;

var TAG_LOADING_INDICATOR_LAYER = 717;
var MOVE_DELAY_TIME = 1.5;

var RATIO_BETWEEN_MAX_AND_MIN_SCREEN_RATIO = ((16/9) / (4/3));

SCHOOL_NAME_COLOR = [
    res.RedFont_fnt,
    res.YellowFont_fnt,
    res.PurpleFont_fnt,
    res.GreenFont_fnt
];

var HINT_TOP_LEFT_ID = 0;
var HINT_TOP_RIGHT_ID = 1;
var HINT_BOTTOM_RIGHT_ID = 2;
var HINT_BOTTOM_LEFT_ID = 3;


var HINT_OFFSET = [
    {x: 35},
    {x: 35},
    {x: -35},
    {x: -35}
];

var TREE_POSITIONS = [
    {isTopRow: true, x : 0, flowerOffsetX: 30, flowerOffsetY: -40 },
    {isTopRow: false, x : 0, flowerOffsetX: 10, flowerOffsetY: -40 },
    {isTopRow: true, x : 30, flowerOffsetX: -30, flowerOffsetY: -48 },
    {isTopRow: false, x : 20, flowerOffsetX: -23, flowerOffsetY: -45 },
    {isTopRow: true, x : -20, flowerOffsetX: 10, flowerOffsetY: -57 },
    {isTopRow: false, x : -40, flowerOffsetX: 10, flowerOffsetY: -62 }
];

var NUMBER_OF_TREES = 20;
var IPHONE_RESOLUTION = 16/9;
var DELTA_DELAY_TIME = 0.1;
// String

var STRING_SCHOOL_DATA  = "school_data";
var STRING_ACCOUNT_DATA  = "account_data";
var STRING_STUDENT_DATA  = "student_data";
var STRING_GAME_DATA  = "game_data";
var STRING_GAME_ALPHARACING = "game_alpharacing";
var TIME_PLAY_BEGIN_SOUND = "time_play_begin_sound";
var SEGMENT = {
    SELECT_SCHOOL: "select_school",
    ENTER_GAME: "enter_game",
    LOAD_GAME: "load_game",
    CLICK_GAME: "click_game",
    LEVEL_START: "level_start",
    LEVEL_COMPLETE: "level_complete",
    LEVEL_INCOMPLETE: "level_incomplete",
    OBJECT_PICK_START: "object_pick_start",
    OBJECT_PICK_END: "object_pick_end",
    ANIMAL_CLICK: "animal_click",
    SPEAK_TEST: "speak_test",
    TALKING_ADI: "talking_adi",
    TOUCH_TEST: "touch_test",
    WRITE_TEST: "write_test"
}

var SHOP = false;
var GAME_ID = "566e78761d0e150800e22930";

var MOVE_DELAY_TIME = 1;
var ANIMATE_DELAY_TIME = 0.2;
var COUNT_DOWN_TIME = 3;

var NUMBER_ITEMS = 3;

var TIME_HINT = 2;
var CLOCK_INTERVAL = 1;
var TIME_INIT = 300;

var CHANGE_SCENE_TIME = 2;

var ROOM_ITEM_TYPE = {
    HEAVY_WEIGHT_ITEM: "HEAVY_WEIGHT_ITEM",
    LIGHT_WEIGHT_ITEM: "LIGHT_WEIGHT_ITEM"
}

var FOREST_ITEM_TYPE = {
    FLY_ITEM: "FLY_ITEM",
    STAND_ITEM: "STAND_ITEM",
    LIE_ITEM: "LIE_ITEM",
    WATER_ITEM: "WATER_ITEM",
    MONKEY_ITEM: "MONKEY_ITEM",
    OWL_ITEM: "OWL_ITEM",
    FROG_ITEM: "FROG_ITEM",
    NEST_ITEM: "NEST_ITEM",
    SNAIL_ITEM: "SNAIL_ITEM",
    OCTOPUS_ITEM: "OCTOPUS_ITEM",
    DOLPHIN_ITEM: "DOLPHIN_ITEM",
    CROCODILE_ITEM: "CROCODILE_ITEM",
    BIRD_ITEM: "BIRD_ITEM",
    EAGLE_ITEM: "EAGLE_ITEM",
    SHARK_ITEM: "SHARK_ITEM",

}

var SMOKE_EFFECT_DELAY = 0.1;
var SMOKE_EFFECT_FRAMES = 8;

var SPARKLE_EFFECT_DELAY = 0.05;
var SPARKLE_EFFECT_FRAMES = 19;

var HUD_BAR_DISTANCE = 60;
var PROGRESSBAR_CHANGE_RATE = 20;
var DARK_STAR_NUMBERS = 3;

var ANIMAL_SOUNDS_LENGTH = [
    {
        name: "ANT",
        length: 3
    },
    {
        name: "OWL",
        length: 3
    },
    {
        name: "FROG",
        length: 3
    },
    {
        name: "MONKEY",
        length: 3
    },
    {
        name: "BEAR",
        length: 3
    },
    {
        name: "BEE", 
        length: 3
    },
    {
        name: "BIRD", 
        length: 3
    },
    {
        name: "CAT", 
        length: 3
    },
    {
        name: "COW",
        length: 3
    },
    {
        name : "DUCK",
        length: 3
    },
    {
        name : "ELEPHANT",
        length: 3
    },
    {
        name: "FISH",
        length: 3
    },
    {
        name: "HORSE", 
        length: 3
    },
    {
        name: "INSECT", 
        length: 3
    },
    {
        name: "LION", 
        length: 3
    },
    {
        name: "TIGER", 
        length: 3
    },
    {
        name: "RAT",
        length: 3
    },
    {
        name: "NEST",
        length: 3
    },
    {
        name: "PANDA",
        length: 3
    },
    {
        name: "RABBIT",
        length : 3
    },
    {
        name: "PUPPY",
        length: 3
    },
    {
        name: "PIG",
        length: 3
    },
    {
        name: "OCTOPUS",
        length: 3
    },
    {
        name: "CROCODILE",
        length: 3
    },
    {
        name: "DOLPHIN",
        length: 3
    },
    {
        name: "SNAIL",
        length: 3
    },
    {
        name: "ZEBRA",
        length: 3
    },
    {
        name: "SHEEP",
        length: 3
    },
    {
        name: "GOLDFISH",
        length: 3
    },
    {
        name: "EAGLE",
        length:3
    },
    {
        name: "HAMSTER",
        length: 3
    },
    {
        name: "GOAT",
        length: 3
    },
    {
        name: "GIRAFFE",
        length:3
    },
    {
        name: "DEER",
        length: 3
    },
    {
        name: "KITTEN",
        length: 3
    },
    {
        name: "SNAKE",
        length: 3
    },
    {
        name: "TURTLE",
        length: 3
    },
    {
        name: "FLY",
        length: 3
    },
    {
        name: "SQUIRREL",
        length:3
    },
    {name:"CAMEL", length: 3},
    {name: "FOX", length:3},
    {name: "SHARK", length:3},
    {name: "CHEETAH", length:3},
    {name: "CHICKEN", length:3},
    {name: "KANGAROO", length:3},
    {name: "LOBSTER", length:3},
    {name: "SCORPION", length:3},
    {name: "SEAL", length:3},
    {name: "WOLF", length:3}
];

var OBJECT_SOUNDS_LENGTH = [
    {name: "APPLE", length: 2},
    {name: "BANANA", length: 2},
    {name: "BOOK", length: 2},
    {name: "CHAIR", length: 2},
    {name: "PENCILS", length: 2},
    {name: "DESK", length: 2},
    {name: "DUSTER", length: 2},
    {name: "EGG", length: 2},
    {name: "GRAPE", length: 2},
    {name: "HAT", length: 2},
    {name: "JAR", length: 2},
    {name: "JOKER", length: 2},
    {name: "KEY", length: 2},
    {name: "KITE", length: 2},
    {name: "LAMP", length: 2},
    {name: "MAP", length: 2},
    {name: "ORANGE", length: 2},
    {name: "POTATO", length: 2},
    {name: "TOWEL", length: 2},
    {name: "UMBRELLA", length: 2},
    {name: "VEST", length: 2},
    {name: "WATCH", length: 2},
    {name: "PEN", length: 2},
    {name: "RAT", length: 2},
    {name: "STRAWBERRY", length: 2},
    {name: "SOCK", length: 2},
    {name: "LEMON", length: 2},
    {name: "MEDICINE", length: 2},
    {name: "NAIL", length: 2},
    {name: "NEST", length: 2},
    {name: "ONION", length: 2},
    {name: "PEN", length: 2},
    {name: "QUEEN" , length: 2},
    {name: "SALT", length : 2},
    {name: "TEACHER", length : 2},
    {name: "UNIFORM", length: 2},
    {name: "VEGETABLE", length: 2},
    {name: "VEHICLE", length: 2},
    {name: "WATERMELON", length: 2},
    {name: "XMAS", length: 2},
    {name: "XYLOPHONE", length: 2},
    {name: "ABACUS", length: 2},
    {name: "FLAG", length :2 },
    {name: "FEATHER", length: 2},
    {name: "TOMATO", length: 2},
    {name: "COMPUTER", length :2},
    {name: "ERASER", length: 2},
    {name: "GIFT", length: 2},
    {name: "INSECT", length : 2},
    {name: "JUICE", length:2},
    {name: "LEMON", length: 2},
    {name: "NAIL", length: 2},
    {name: "NEST", length: 2},
    {name: "QUEEN", length :2},
    {name: "RASPBERRY", length:2},
    {name: "TOYTRAIN", length:2},
    {name: "INSECT", length:2},
    {name: "JUICE", length:2},
    {name: "CRAYON", length: 2}
];
var NUMBERS_SOUNDS_LENGTH = [
    {name: "1", length: 2},
    {name: "2", length: 2},
    {name: "3", length: 2},
    {name: "4", length: 2},
    {name: "5", length: 2},
    {name: "6", length: 2},
    {name: "7", length: 2},
    {name: "8", length: 2},
    {name: "9", length: 2},
    {name: "10", length: 2}
];

// bitmap font
var FONT_COLOR = [
    res.RedFont_fnt,
    res.YellowFont_fnt,
    res.PurpleFont_fnt,
    res.GreenFont_fnt
];

var STRING_USER_ID = "self_user_id";
var STRING_USER_NAME = "self_user_name";
var STRING_USER_ACCESS_TOKEN = "self_user_access_token";
var STRING_USER_FULL_ACCESS = "self_user_full_access";
var STRING_STUDENT_ID = "self_student_id";
var STRING_STUDENT_NAME = "self_student_name";
var STRING_SCHOOL_NAME = "self_school_name";
var STRING_SCHOOL_ID = "self_school_id";
var STRING_GAME_CONFIG = "self_game_config";
// ["English", "Chinese"], ["French", "Hindi"], ["Japanese", "Kannada"], ["Korean", "Philipino"], ["Swahili", "Spanish"]
var TALKING_ADI_LANGUAGE_SOUND_DURATION = [
    {
        lang: "English",
        soundDuration: 2
    },
    {
        lang: "Chinese",
        soundDuration: 4
    },
    {
        lang: "French",
        soundDuration: 4
    },
    {
        lang: "Hindi",
        soundDuration: 5
    },
    {
        lang: "Japanese",
        soundDuration: 7
    },
    {
        lang: "Kannada",
        soundDuration: 5
    },
    {
        lang: "Korean",
        soundDuration: 5
    },
    {
        lang: "Philipino",
        soundDuration: 3
    },
    {
        lang: "Swahili",
        soundDuration: 5
    },
    {
        lang: "Spanish",
        soundDuration: 5
    }
];
var ROOM_LANGUAGE_SOUND_DURATION = [
    {
        lang: "English",
        soundDuration: 2
    },
    {
        lang: "Chinese",
        soundDuration: 5
    },
    {
        lang: "French",
        soundDuration: 4
    },
    {
        lang: "Hindi",
        soundDuration: 5
    },
    {
        lang: "Japanese",
        soundDuration: 6
    },
    {
        lang: "Kannada",
        soundDuration: 3
    },
    {
        lang: "Korean",
        soundDuration: 5
    },
    {
        lang: "Philipino",
        soundDuration: 4
    },
    {
        lang: "Swahili",
        soundDuration: 2
    },
    {
        lang: "Spanish",
        soundDuration: 4
    }
];
var FOREST_LANGUAGE_SOUND_DURATION = [
    {
        lang: "English",
        soundDuration: 2
    },
    {
        lang: "Chinese",
        soundDuration: 3
    },
    {
        lang: "French",
        soundDuration: 3
    },
    {
        lang: "Hindi",
        soundDuration: 6
    },
    {
        lang: "Japanese",
        soundDuration: 5
    },
    {
        lang: "Kannada",
        soundDuration: 2
    },
    {
        lang: "Korean",
        soundDuration: 4
    },
    {
        lang: "Philipino",
        soundDuration: 4
    },
    {
        lang: "Swahili",
        soundDuration: 3
    },
    {
        lang: "Spanish",
        soundDuration: 3
    }
];
var SPEAKING_TEST_LANGUAGE_SOUND_DURATION = [
    {
        lang: "English",
        soundDuration: 4
    },
    {
        lang: "Chinese",
        soundDuration: 5
    },
    {
        lang: "French",
        soundDuration: 3
    },
    {
        lang: "Hindi",
        soundDuration: 6
    },
    {
        lang: "Japanese",
        soundDuration: 8
    },
    {
        lang: "Kannada",
        soundDuration: 4
    },
    {
        lang: "Korean",
        soundDuration: 6
    },
    {
        lang: "Philipino",
        soundDuration: 4
    },
    {
        lang: "Swahili",
        soundDuration: 3
    },
    {
        lang: "Spanish",
        soundDuration: 5
    }
];

var GAME_OBJECT_TYPES = [
    "object",
    "animal",
    "number",
    "word",
    "color",
    "shape"
];

var GAME_IDS = [
    "room",
    "shadow",
    "writing",
    "forest",
    "gofigure",
    "card",
    "freecolor",
    "train",
    "tree",
    "balloon",
    "storytime",
    "matching",
    "alpharacing",
    "spelling",
    "shoppingbasket",
    "fruiddition",
    "buildingblocks",
    "listening"
];

var STORY_RESOURCES = {
    "en": [
        {
            "subtitles": [
                "res/subtitles/en/story01-01.ass",
                "res/subtitles/en/story01-02.ass",
                "res/subtitles/en/story01-03.ass",
                "res/subtitles/en/story01-04.ass",
            ],
            "arts": [
                "stories/Storytime1-1.jpg",
                "stories/Storytime1-2.jpg",
                "stories/Storytime1-3.jpg",
                "stories/Storytime1-4.jpg",
            ],
            "sounds": [
                "res/sounds/stories/en/story01-01.mp3",
                "res/sounds/stories/en/story01-02.mp3",
                "res/sounds/stories/en/story01-03.mp3",
                "res/sounds/stories/en/story01-04.mp3"
            ]
        },
        {
            "subtitles": [
                "res/subtitles/en/story02-01.ass",
                "res/subtitles/en/story02-02.ass",
                "res/subtitles/en/story02-03.ass"
            ],
            "arts": [
                "stories/Storytime2-1.jpg",
                "stories/Storytime2-2.jpg",
                "stories/Storytime2-3.jpg"
            ],
            "sounds": [
                "res/sounds/stories/en/story02-01.mp3",
                "res/sounds/stories/en/story02-02.mp3",
                "res/sounds/stories/en/story02-03.mp3"
            ]
        },
        {
            "subtitles": [
                "res/subtitles/en/story03-01.ass",
                "res/subtitles/en/story03-02.ass",
                "res/subtitles/en/story03-03.ass",
                "res/subtitles/en/story03-04.ass"
            ],
            "arts": [
                "stories/Storytime3-1.jpg",
                "stories/Storytime3-2.jpg",
                "stories/Storytime3-3.jpg",
                "stories/Storytime3-4.jpg"
            ],
            "sounds": [
                "res/sounds/stories/en/story03-01.mp3",
                "res/sounds/stories/en/story03-02.mp3",
                "res/sounds/stories/en/story03-03.mp3",
                "res/sounds/stories/en/story03-04.mp3"
            ]
        },
        {
            "subtitles": [
                "res/subtitles/en/story04-01.ass",
                "res/subtitles/en/story04-02.ass",
                "res/subtitles/en/story04-03.ass"
            ],
            "arts": [
                "stories/Storytime4-1.jpg",
                "stories/Storytime4-2.jpg",
                "stories/Storytime4-3.jpg"
            ],
            "sounds": [
                "res/sounds/stories/en/story04-01.mp3",
                "res/sounds/stories/en/story04-02.mp3",
                "res/sounds/stories/en/story04-03.mp3"
            ]
        },
        {
            "subtitles": [
                "res/subtitles/en/story05-01.ass",
                "res/subtitles/en/story05-02.ass",
                "res/subtitles/en/story05-03.ass"
            ],
            "arts": [
                "stories/Storytime5-1.jpg",
                "stories/Storytime5-2.jpg",
                "stories/Storytime5-3.jpg"
            ],
            "sounds": [
                "res/sounds/stories/en/story05-01.mp3",
                "res/sounds/stories/en/story05-02.mp3",
                "res/sounds/stories/en/story05-03.mp3"
            ]
        },
        {
            "subtitles": [
                "res/subtitles/en/story06-01.ass",
                "res/subtitles/en/story06-02.ass"
            ],
            "arts": [
                "stories/Storytime6-1.jpg",
                "stories/Storytime6-2.jpg"
            ],
            "sounds": [
                "res/sounds/stories/en/story06-01.mp3",
                "res/sounds/stories/en/story06-02.mp3"
            ]
        }
    ],

    "sw": [
        {
            "subtitles": [
                "res/subtitles/sw/story01-title.ass",
                "res/subtitles/sw/story01-01.ass",
                "res/subtitles/sw/story01-02.ass",
                "res/subtitles/sw/story01-03.ass",
                "res/subtitles/sw/story01-04.ass",
                "res/subtitles/sw/story01-05.ass",
                "res/subtitles/sw/story01-06.ass",
                "res/subtitles/sw/story01-moral.ass",
            ],
            "arts": [
                "stories/Storytime1-1.jpg",
                "stories/Storytime1-1.jpg",
                "stories/Storytime1-2.jpg",
                "stories/Storytime1-2.jpg",
                "stories/Storytime1-3.jpg",
                "stories/Storytime1-3.jpg",
                "stories/Storytime1-4.jpg",
                "stories/Storytime1-4.jpg",
            ],
            "sounds": [
                "res/sounds/stories/sw/story01-title.mp3",
                "res/sounds/stories/sw/story01-01.mp3",
                "res/sounds/stories/sw/story01-02.mp3",
                "res/sounds/stories/sw/story01-03.mp3",
                "res/sounds/stories/sw/story01-04.mp3",
                "res/sounds/stories/sw/story01-05.mp3",
                "res/sounds/stories/sw/story01-06.mp3",
                "res/sounds/stories/sw/story01-moral.mp3",
            ]
        },
        {
            "subtitles": [
                "res/subtitles/sw/story02-title.ass",
                "res/subtitles/sw/story02-01.ass",
                "res/subtitles/sw/story02-02.ass",
                "res/subtitles/sw/story02-03.ass",
                "res/subtitles/sw/story02-moral.ass"
            ],
            "arts": [
                "stories/Storytime2-1.jpg",
                "stories/Storytime2-1.jpg",
                "stories/Storytime2-2.jpg",
                "stories/Storytime2-3.jpg",
                "stories/Storytime2-3.jpg"
            ],
            "sounds": [
                "res/sounds/stories/sw/story02-title.mp3",
                "res/sounds/stories/sw/story02-01.mp3",
                "res/sounds/stories/sw/story02-02.mp3",
                "res/sounds/stories/sw/story02-03.mp3",
                "res/sounds/stories/sw/story02-moral.mp3"
            ]
        },
        {
            "subtitles": [
                "res/subtitles/sw/story03-title.ass",
                "res/subtitles/sw/story03-01.ass",
                "res/subtitles/sw/story03-02.ass",
                "res/subtitles/sw/story03-03.ass",
                "res/subtitles/sw/story03-04.ass",
                "res/subtitles/sw/story03-05.ass",
                "res/subtitles/sw/story03-06.ass",
                "res/subtitles/sw/story03-07.ass",
                "res/subtitles/sw/story03-08.ass",
                "res/subtitles/sw/story03-09.ass",
                "res/subtitles/sw/story03-10.ass",
                "res/subtitles/sw/story03-11.ass",
                "res/subtitles/sw/story03-moral.ass",
            ],
            "arts": [
                "stories/Storytime3-1.jpg",
                "stories/Storytime3-1.jpg",
                "stories/Storytime3-1.jpg",
                "stories/Storytime3-2.jpg",
                "stories/Storytime3-2.jpg",
                "stories/Storytime3-2.jpg",
                "stories/Storytime3-2.jpg",
                "stories/Storytime3-2.jpg",
                "stories/Storytime3-3.jpg",
                "stories/Storytime3-4.jpg",
                "stories/Storytime3-4.jpg",
                "stories/Storytime3-4.jpg",
                "stories/Storytime3-4.jpg",
            ],
            "sounds": [
                "res/sounds/stories/sw/story03-title.mp3",
                "res/sounds/stories/sw/story03-01.mp3",
                "res/sounds/stories/sw/story03-02.mp3",
                "res/sounds/stories/sw/story03-03.mp3",
                "res/sounds/stories/sw/story03-04.mp3",
                "res/sounds/stories/sw/story03-05.mp3",
                "res/sounds/stories/sw/story03-06.mp3",
                "res/sounds/stories/sw/story03-07.mp3",
                "res/sounds/stories/sw/story03-08.mp3",
                "res/sounds/stories/sw/story03-09.mp3",
                "res/sounds/stories/sw/story03-10.mp3",
                "res/sounds/stories/sw/story03-11.mp3",
                "res/sounds/stories/sw/story03-moral.mp3"
            ]
        },
        {
            "subtitles": [
                "res/subtitles/sw/story04-title.ass",
                "res/subtitles/sw/story04-01.ass",
                "res/subtitles/sw/story04-02.ass",
                "res/subtitles/sw/story04-03.ass",
                "res/subtitles/sw/story04-moral.ass",
            ],
            "arts": [
                "stories/Storytime4-1.jpg",
                "stories/Storytime4-1.jpg",
                "stories/Storytime4-2.jpg",
                "stories/Storytime4-3.jpg",
                "stories/Storytime4-3.jpg"
            ],
            "sounds": [
                "res/sounds/stories/sw/story04-title.mp3",
                "res/sounds/stories/sw/story04-01.mp3",
                "res/sounds/stories/sw/story04-02.mp3",
                "res/sounds/stories/sw/story04-03.mp3",
                "res/sounds/stories/sw/story04-moral.mp3"
            ]
        },
        {
            "subtitles": [
                "res/subtitles/sw/story05-title.ass",
                "res/subtitles/sw/story05-01.ass",
                "res/subtitles/sw/story05-02.ass",
                "res/subtitles/sw/story05-03.ass",
                "res/subtitles/sw/story05-04.ass",
                "res/subtitles/sw/story05-05.ass",
                "res/subtitles/sw/story05-06.ass"
            ],
            "arts": [
                "stories/Storytime5-1.jpg",
                "stories/Storytime5-1.jpg",
                "stories/Storytime5-2.jpg",
                "stories/Storytime5-2.jpg",
                "stories/Storytime5-3.jpg",
                "stories/Storytime5-3.jpg",
                "stories/Storytime5-3.jpg",
            ],
            "sounds": [
                "res/sounds/stories/sw/story05-title.mp3",
                "res/sounds/stories/sw/story05-01.mp3",
                "res/sounds/stories/sw/story05-02.mp3",
                "res/sounds/stories/sw/story05-03.mp3",
                "res/sounds/stories/sw/story05-04.mp3",
                "res/sounds/stories/sw/story05-05.mp3",
                "res/sounds/stories/sw/story05-06.mp3"
            ]
        },
        {
            "subtitles": [
                "res/subtitles/sw/story06-title.ass",
                "res/subtitles/sw/story06-01.ass",
                "res/subtitles/sw/story06-02.ass",
                "res/subtitles/sw/story06-03.ass",
                "res/subtitles/sw/story06-moral.ass",
            ],
            "arts": [
                "stories/Storytime6-1.jpg",
                "stories/Storytime6-1.jpg",
                "stories/Storytime6-2.jpg",
                "stories/Storytime6-2.jpg",
                "stories/Storytime6-2.jpg",
            ],
            "sounds": [
                "res/sounds/stories/sw/story06-title.mp3",
                "res/sounds/stories/sw/story06-01.mp3",
                "res/sounds/stories/sw/story06-02.mp3",
                "res/sounds/stories/sw/story06-03.mp3",
                "res/sounds/stories/sw/story06-moral.mp3"
            ]
        }
    ]
};

// var AR_TMX_LEVELS = [res.AR_Level_01_TMX, res.AR_Level_02_TMX, res.AR_Level_03_TMX];
// var AR_TMX_LEVELS = [res.AR_New_Level_01_TMX, res.AR_New_Level_02_TMX, res.AR_New_Level_03_TMX, res.AR_New_Level_04_TMX, res.AR_New_Level_05_TMX, res.AR_New_Level_06_TMX];
var AR_TMX_LEVELS = [res.AR_New_Level_01_Custom_TMX, res.AR_New_Level_02_Custom_TMX, res.AR_New_Level_03_Custom_TMX];

var TIME_TO_PAUSE_GAME = 5;
var AFTER_CHECKING_NOISE_TIME = 3;

var MAX_NAME_LENGTH_DISPLAYED = 14;
var KEYBOARD_ANIMATION_DURATION = 0.1;

var SUBSCRIPTION_IAP_NAME = "subscription_monthly";
var SUBSCRIPTION_IAP_ID_IOS = "com.theschoolofgames.tsog.subscription.monthly";
var SUBSCRIPTION_IAP_ID_ANDROID = "com.theschoolofgames.tsog.subscription.month";

var STORYTIME_VOICE_FOR_LISTENING = STORYTIME_VOICE_FOR_LISTENING || {};
STORYTIME_VOICE_FOR_LISTENING["en"] = {
    "animal": "Pick the animal in the story",
    "object": "Pick the objects in the story",
    "bird": "Pick the bird in the story",
    "live": "Where did the animals live"
};

STORYTIME_VOICE_FOR_LISTENING["sw"] = {
    "animal": "Chagua wanyama katika hadithi",
    "object": "Chagua vitu katika hadithi",
    "bird": "Chagua ndege katika hadithi",
    "live": "Wapi wanyama kuishi"
};

var EVENT_AR_FIREBALL_ACTIVE = "event_ar_fireball_active";
var EVENT_AR_GAMEOVER = "event_ar_gameover";
var EVENT_AR_REVIVAL = "event_ar_revival";
var ALPHARACING_DATA =[
    {
      "value": "A",
      "amount": "50"
    },
    {
      "value": "a",
      "amount": "50"
    }
];
var COIN_NEED_TO_PLAY_ALPHARACING = 5;
var COIN_START_GAME = 50;
var DIAMOND_START_GAME = 0;

var LANGUAGE = [
    "English", 
    "Swahili"
];

var LANGUAGE_CODE = {
    "English": "en",
    "Swahili": "sw"
};

var FONT_NUMBER = [
    res.HudFont_fnt,
    res.HomeFont_fnt
];


var EVENT_LANGUAGE_DIALOG_CLOSE = "event_lang_dialog_close";
var MAX_BLOCK_NUMBER_SCALE = 0.8;

var GAME_OBJECTS_PROGRESS = "game_objects_progress";

var OBJECT_TOTAL_COMPLETED_COUNT = 3;

var DYNAMIC_LINK = "https://ua23d.app.goo.gl/?link=http://theschoolofgames.org?inviter_id%3D%s&apn=com.theschoolofgames.tsog&isi=1090937711&ibi=com.theschoolofgames.tsog&st=Free%20Download&sd=Pre-school%20app%20for%20children%20aged%202%20-%206%20to%20learn%20vocabulary%2C%20numbers%20and%20reading.&si=https://ucarecdn.com/a898b43b-1ff2-4c47-93eb-7ce583e031c2/share_post.png&utm_source=share_msg&at=share_msg"

var LINK_SHORTEN_API = "https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=AIzaSyBIxcQiwDT5YlP8u0V9d2_YfAoVCHA5ygY";

var FACEBOOK_SHARING_TITLE = "";

var NATIVE_SHARING_DESCRIPTION = "Love School of Games, a fun preschool game. Download it today & spread their mission to educate every child.";
var WHATSAPP_SHARING_DESCRIPTION = "Love @theschoolofgames. A fun numbers & vocabulary game. Download it today & spread their mission to educate every child.";
var FACEBOOK_SHARING_DESCRIPTION = "Love School of Games, a fun preschool game. Download it today & spread their mission to educate every child.";
var TWITTER_SHARING_DESCRIPTION = "Love @schoolofgames_ , fun #preschool app. Download it today & spread their mission to #educate every child.";

var SET_SMALL_ID = "com.theschoolofgames.tsog.set1";
var SET_SMALL_PRICE = "$4.99";
var SET_SMALL_COINS = "250";
var SET_SMALL_DIAMONDS = "250";

var SET_MEDIUM_ID = "com.theschoolofgames.tsog.set2";
var SET_MEDIUM_PRICE = "$14.99";
var SET_MEDIUM_COINS = "750";
var SET_MEDIUM_DIAMONDS = "1000";

var SET_BIG_ID = "com.theschoolofgames.tsog.set3";
var SET_BIG_PRICE = "$59.99";
var SET_BIG_COINS = "5000";
var SET_BIG_DIAMONDS = "6000";

var TIME_FOR_ADULT_TOCH = 3;

var NEW_LEVEL_UNLOCKING_STAR_RATIO = 0.6;
var TEXT_AT_GROWNUP_1 = "The School of Games is product of Equally Pbc. Equally is a public "
                        + "benefit corporation. School of Games wants to provide" 
                        + "equal education to every child.";
var TEXT_AT_GROWNUP_2 = "For support suggestion contact at";
var TEXT_AT_GROWNUP_3 = "info@theschoolofgames.org";
var TEXT_AT_GROWNUP_4 = "See your privacy policy & terms & conditions";
var TEXT_AT_GROWNUP_5 = "Visit us at theschoolofgames.org";

var GAME_URL_ANDROID = "https://play.google.com/store/apps/details?id=com.theschoolofgames.tsog&hl=en";
var GAME_URL_IOS = "https://itunes.apple.com/us/app/the-school-of-games/id1090937711?mt=8";
var FACEBOOK_FAN_PAGE = "https://www.facebook.com/theschoolofgames/";
var TWITTER_FAN_PAGE = "https://twitter.com/schoolofgames_";
var WEB_URL = "http://www.theschoolofgames.org";
var PRIVACY_POLICY_URL = "http://www.theschoolofgames.org/privacy-policy/";
var EMAIL_ADRESS_GAME = "info@theschoolofgames.org";

var SHARING_OPTIONS = {
    "default": "facebook,whatsapp"
}