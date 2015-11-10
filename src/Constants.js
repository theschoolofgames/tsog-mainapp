// var BACKEND_ADDRESS = "https://tsog.herokuapp.com/";

var BACKEND_ADDRESS = "http://localhost:3000/";

var SEGMENT_KEY = "TQB4UsWbEoiLkoRFyBXpthCtfc7nq4Ak"

var TAG_LOADING_INDICATOR_LAYER = 717;
var MOVE_DELAY_TIME = 1.5;

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
var STRING_GAME_DATA  = "game_data";

var STRING_USER_ID = "user_id";
var STRING_USER_NAME = "user_name";
var STRING_SCHOOL_ID = "school_id";
var STRING_SCHOOL_NAME = "school_name";

var SEGMENT = {
    SELECT_SCHOOL: "select_school",
    ENTER_GAME: "enter_game",
    LOAD_GAME: "load_game",
    CLICK_GAME: "click_game"
}
