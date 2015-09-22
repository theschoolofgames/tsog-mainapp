var BACKEND_ADDRESS = "https://tsog.herokuapp.com/";
// var BACKEND_ADDRESS = "http://192.168.2.108:3000/";

var TAG_LOADING_INDICATOR_LAYER = 717;
var MOVE_DELAY_TIME = 1.5;

SCHOOL_INFO = [
    {
        school_id: "55e10c0b2eee625df1993a61",
        school_name: "Vietnam National University"
    },
    {
        school_id: "55e10c0b2eee625df1993a62",
        school_name: "Vietnam University of Commerce"
    },
    {
        school_id: "55e10c0b2eee625df1993a63",
        school_name: "Vietnam University of Fine Arts"
    },
    {
        school_id: "55e10c0b2eee625df1993a64",
        school_name: "Hanoi Open University"
    }
];

// GAME_INFO = [
//     {
//         game_id: "55e10c0b2eee625df1993a5f",
//         game_name: "Alphabet",
//         android_bundle: "com.hub102.abc",
//         ios_bundle: "com.hub102.abc"
//     },
//     {
//         game_id: "55e10c0b2eee625df1993a60",
//         game_name: "XYZ",
//         android_bundle: "com.hub102.xyz",
//         ios_bundle: "com.hub102.xyz"
//     },
//     {
//         game_id: "55e10c0b2eee625df1993a60",
//         game_name: "XYZ2",
//         android_bundle: "com.hub102.xyz",
//         ios_bundle: "com.hub102.xyz"
//     },
//     {
//         game_id: "55e10c0b2eee625df1993a60",
//         game_name: "XYZ3",
//         android_bundle: "com.hub102.xyz",
//         ios_bundle: "com.hub102.xyz"
//     },
//     {
//         game_id: "55e10c0b2eee625df1993a60",
//         game_name: "XYZ4",
//         android_bundle: "com.hub102.xyz",
//         ios_bundle: "com.hub102.xyz"
//     },
//     {
//         game_id: "55e10c0b2eee625df1993a60",
//         game_name: "XYZ5",
//         android_bundle: "com.hub102.xyz",
//         ios_bundle: "com.hub102.xyz"
//     },
//     {
//         game_id: "55e10c0b2eee625df1993a60",
//         game_name: "XYZ6",
//         android_bundle: "com.hub102.xyz",
//         ios_bundle: "com.hub102.xyz"
//     },
//     {
//         game_id: "55e10c0b2eee625df1993a60",
//         game_name: "XYZ7",
//         android_bundle: "com.hub102.xyz",
//         ios_bundle: "com.hub102.xyz"
//     },
//     {
//         game_id: "55e10c0b2eee625df1993a60",
//         game_name: "XYZ8",
//         android_bundle: "com.hub102.xyz",
//         ios_bundle: "com.hub102.xyz"
//     }
// ]

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

var ACCOUNT_LABEL_NAME = [
    "DAVID GUETTA",
    "HANA MAXCOVA",
    "MARVIN PUTIN",
    "NICK CHICKEN",
    "STEFAN SONGOHAN",
    "TONY SLARK"
];

var NUMBER_OF_TREES = 20;
var IPHONE_RESOLUTION = 16/9;
var DELTA_DELAY_TIME = 0.1;
// String

var STRING_SCHOOL_DATA  = "school_data";
var STRING_ACCOUNT_DATA  = "account_data";
var STRING_GAME_DATA  = "game_data";

var STRING_USER_ID = "user_id";
var STRING_SCHOOL_ID = "school_id";