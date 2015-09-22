var res = {
    Account_plist: "account.plist",
    Account_png: "account.png",
    School_plist: "school.plist",
    School_png: "school.png",
    Game_plist: "game.plist",
    Game_png: "game.png",
    Loading_plist: "loading.plist",
    Loading_png: "loading.png",
    // Temporary
    LoginSucceed_png: "login-succeed.png",
    Welcome_jpg:"welcome.jpg",
    // Bg
    Bg_account_jpg: "bg/bg-account.jpg",
    Bg_school_jpg: "bg/bg-school.jpg",
    Bg_game_jpg: "bg/bg-game.jpg",
    // Font
    RedFont_png: "red-font-export.png",
    YellowFont_png: "yellow-font-export.png",
    PurpleFont_png: "purple-font-export.png",
    GreenFont_png: "green-font-export.png",
    RedFont_fnt: "red-font-export.fnt",
    YellowFont_fnt: "yellow-font-export.fnt",
    PurpleFont_fnt: "purple-font-export.fnt",
    GreenFont_fnt: "green-font-export.fnt",
    // Sound
    bubble_sound_mp3: "res/sound/bubble.mp3",
    rustle_sound_mp3: "res/sound/rustle.mp3",
    bubble_scroll_sound_mp3: "res/sound/bubble-scroll.mp3"
};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}