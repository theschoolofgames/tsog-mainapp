/**
 * A brief explanation for "project.json":
 * Here is the content of project.json file, this is the global configuration for your game, you can modify it to customize some behavior.
 * The detail of each field is under it.
 {
    "project_type": "javascript",
    // "project_type" indicate the program language of your project, you can ignore this field

    "debugMode"     : 1,
    // "debugMode" possible values :
    //      0 - No message will be printed.
    //      1 - cc.error, cc.assert, cc.warn, cc.log will print in console.
    //      2 - cc.error, cc.assert, cc.warn will print in console.
    //      3 - cc.error, cc.assert will print in console.
    //      4 - cc.error, cc.assert, cc.warn, cc.log will print on canvas, available only on web.
    //      5 - cc.error, cc.assert, cc.warn will print on canvas, available only on web.
    //      6 - cc.error, cc.assert will print on canvas, available only on web.

    "showFPS"       : true,
    // Left bottom corner fps information will show when "showFPS" equals true, otherwise it will be hide.

    "frameRate"     : 60,
    // "frameRate" set the wanted frame rate for your game, but the real fps depends on your game implementation and the running environment.

    "id"            : "gameCanvas",
    // "gameCanvas" sets the id of your canvas element on the web page, it's useful only on web.

    "renderMode"    : 0,
    // "renderMode" sets the renderer type, only useful on web :
    //      0 - Automatically chosen by engine
    //      1 - Forced to use canvas renderer
    //      2 - Forced to use WebGL renderer, but this will be ignored on mobile browsers

    "engineDir"     : "frameworks/cocos2d-html5/",
    // In debug mode, if you use the whole engine to develop your game, you should specify its relative path with "engineDir",
    // but if you are using a single engine file, you can ignore it.

    "modules"       : ["cocos2d"],
    // "modules" defines which modules you will need in your game, it's useful only on web,
    // using this can greatly reduce your game's resource size, and the cocos console tool can package your game with only the modules you set.
    // For details about modules definitions, you can refer to "../../frameworks/cocos2d-html5/modulesConfig.json".

    "jsList"        : [
    ]
    // "jsList" sets the list of js files in your game.
 }
 *
 */

cc.game.onStart = function(){
    if(!cc.sys.isNative && document.getElementById("cocosLoading")) //If referenced loading.js, please remove it
        document.body.removeChild(document.getElementById("cocosLoading"));

    cc.log(jsb.fileUtils.getWritablePath());

    // Pass true to enable retina display, disabled by default to improve performance
    cc.view.enableRetina(false);
    // Adjust viewport meta
    cc.view.adjustViewPort(true);

    // Setup the resolution policy and design resolution size
    var mediumResource = { size: cc.size(960, 640), directory: "res/SD" };
    var largeResource = { size: cc.size(2730, 1536), directory: "res/HD" };
    var designResolutionSize = cc.size(960, 640);
    var frameSize = cc.director.getOpenGLView().getFrameSize();

    cc.view.setDesignResolutionSize(
        designResolutionSize.width,
        designResolutionSize.height,
        cc.ResolutionPolicy.FIXED_HEIGHT);

    if (cc.sys.isNative) {
        var searchPaths = jsb.fileUtils.getSearchPaths();

        if (frameSize.height >= largeResource.size.height) {
            searchPaths.push(largeResource.directory);
            cc.director.setContentScaleFactor(largeResource.size.height/designResolutionSize.height);
            cc.log("Use largeResource");
        } else {//if (frameSize.height >= mediumResource.size.height) {
            searchPaths.push(mediumResource.directory);
            cc.director.setContentScaleFactor(mediumResource.size.height/designResolutionSize.height);
            cc.log("Use mediumResource");
        } //else {
        //     searchPaths.push(smallResource.directory);
        //     cc.director.setContentScaleFactor(smallResource.size.height/designResolutionSize.height);
        //     cc.log("Use smallResource");
        // }
        searchPaths.push("res");
        jsb.fileUtils.setSearchPaths(searchPaths);
    }
    else {
        // web html5
        cc.view.setDesignResolutionSize(designResolutionSize.width,
            designResolutionSize.height,
            cc.ResolutionPolicy.SHOW_ALL);

        jsb.fileUtils.setSearchPaths("res/SD");
    }
    cc.log(cc.winSize.width + " - " + cc.winSize.height);

    // The game will be resized when browser size change
    cc.view.resizeWithBrowserSize(true);
    //load resources
    cc.LoaderScene.preload(g_resources, function () {
        KVDatabase.setupInstance(CocosKVImpl);
        RequestsManager.setupInstance();
        ConfigStore.setupInstance(true);
        AudioListener.setupInstance();
        SpeechRecognitionListener.setupInstance();
        GameListener.setupInstance();

        input.SingleTouch.setEnable (true);

        // NativeHelper.callNative("startRestClock", [GAME_CONFIG.timeToPauseGame]);

        cc.spriteFrameCache.addSpriteFrames(res.Forest_plist);
        cc.spriteFrameCache.addSpriteFrames(res.Smoke_effect_plist);
        cc.spriteFrameCache.addSpriteFrames(res.Sparkle_effect_plist);
        cc.spriteFrameCache.addSpriteFrames(res.Hud_plist);
        cc.spriteFrameCache.addSpriteFrames(res.Tutorial_plist);
        cc.spriteFrameCache.addSpriteFrames(res.School_plist);
        cc.spriteFrameCache.addSpriteFrames(res.Abc_plist);
        cc.spriteFrameCache.addSpriteFrames(res.Account_plist);
        cc.spriteFrameCache.addSpriteFrames(res.Loading_plist);
        cc.spriteFrameCache.addSpriteFrames(res.NewAccount_Plist);
        
        // cc.director.runScene(new MainScene());
        cc.director.runScene(new WritingTestScene(["TOYTRAIN","WATERMELON", "ABACUS"]));
        // cc.director.runScene(new ListeningTestScene(["HAT", "TOYTRAIN", "ABACUS", "UNIFORM", "APPLE"], "ForestScene", "RoomScene"));
        // cc.director.runScene(new SchoolSelectorScene());
        // cc.director.runScene(new AccountSelectorScene());
        // cc.director.runScene(new TalkingAdiScene());
        // cc.director.runScene(new RoomScene());
        // cc.director.runScene(new ForestScene());
        // cc.director.runScene(new SpeakingTestScene());

        cc.eventManager.addCustomListener(cc.game.EVENT_SHOW, function () {
            cc.spriteFrameCache.addSpriteFrames(res.Forest_plist);
            cc.spriteFrameCache.addSpriteFrames(res.Smoke_effect_plist);
            cc.spriteFrameCache.addSpriteFrames(res.Sparkle_effect_plist);
            cc.spriteFrameCache.addSpriteFrames(res.Hud_plist);
            cc.spriteFrameCache.addSpriteFrames(res.Tutorial_plist);
            cc.spriteFrameCache.addSpriteFrames(res.School_plist);
            cc.spriteFrameCache.addSpriteFrames(res.Abc_plist);
            cc.spriteFrameCache.addSpriteFrames(res.Account_plist);
            cc.spriteFrameCache.addSpriteFrames(res.Loading_plist);
            cc.spriteFrameCache.addSpriteFrames(res.NewAccount_Plist);
        });
    }, this);
};
cc.game.run();