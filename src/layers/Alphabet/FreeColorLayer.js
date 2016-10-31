var BRUSH_COLOR = ["red", "blue", "green", "yellow", "pink", "brown", "black", "purple", "orange", "white"];
var BRUSH_COLOR_HEX = [
    cc.color.RED, 
    cc.color("#00aaff"),    // Blue
    cc.color.GREEN, 
    cc.color.YELLOW, 
    cc.color("#ff69b4"),    // Pink
    cc.color("#7f5200"),    // Brown
    cc.color.BLACK,
    cc.color("#551a8b"),    // Purple
    cc.color("#8B4513"),     // Orange
    cc.color.WHITE
];

var FREECOLOR_OBJECT_WIDTH = 70;
var FREECOLOR_OBJECT_HEIGHT = 70;
var FREECOLOR_SHADER_WIDTH = 600;
var FREECOLOR_SHADER_HEIGHT = 400;

var FreeColorLayer = TestLayer.extend({
    _brushColorButtons: [],
    _currentBrushColor: cc.color.GREEN,
    _objectsArray: [],
    _objects: [],
    _objectNames: [],

    _baseRenderer: null,
    _tmpRenderer: null,
    _objRenderers: [],

    _collidedRenderers: [],

    _blockTouch: false,

    gridCellSize: 150,
    _colorButtonScale: 0.5,
    _currentObjectShowing: null,

    ctor: function(objectIdArray, timeForScene, timeForScene) {
        this._super(true);
        this._objects = [];
        this._brushColorButtons = [];
        this._objectsArray = [];
        this._objectNames = [];
        this._createRenderTexture();

        this._filterObjectsByType(objectIdArray);
        this.addObjects(this._objectsArray);
        // this._addHudLayer(timeForScene);
        this._addColorButton();

        cc.eventManager.addListener({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: true,
                onTouchBegan: this.onTouchBegan.bind(this),
                onTouchMoved: this.onTouchMoved.bind(this),
                onTouchEnded: this.onTouchEnded.bind(this)
        }, this);
        var self  = this;
        this.runAction(cc.sequence(
            cc.delayTime(1),
            cc.callFunc(function(){
                self._begin = true;
            })
        ));
        this._addNextButton();
    },

    _addHudLayer: function(timeForScene){
        cc.log("_addHudLayer");
        var hudLayer = new HudLayer(this, true, timeForScene);
        hudLayer.x = 0;
        hudLayer.y = cc.winSize.height - 80;
        this.addChild(hudLayer, 99);
        this._hudLayer = hudLayer;
        // this._hudLayer.setProgressLabelStr(this._touchCounting, this._names.length);
    },

    _createRenderTexture: function() {
        this._baseRenderer = new cc.RenderTexture(cc.winSize.width, cc.winSize.height);
        // this._baseRenderer.retain();
        this._baseRenderer.x = cc.winSize.width/2;
        this._baseRenderer.y = cc.winSize.height/2;
        this._baseRenderer.getSprite().opacity = 128;
        this.addChild(this._baseRenderer, Z_OBJECT+1);
        // this._baseRenderer.visible = false;

        this._tmpRenderer = new cc.RenderTexture(cc.winSize.width, cc.winSize.height);
        this._tmpRenderer.setPosition(this._baseRenderer.getPosition());
        this._tmpRenderer.getSprite().opacity = 128;
        this.addChild(this._tmpRenderer, Z_OBJECT+2);      
    },

    _createObjectRender: function(object) {
        var rt = new cc.RenderTexture(object.width*object.userData.scaleFactor, object.height*object.userData.scaleFactor);
        rt.x = object.x;
        rt.y = object.y;
        // rt.clear(255, 0, 0, 128);
        rt.visible = false;

        this._objRenderers.push(rt);

        this.addChild(rt, Z_OBJECT+2);
    },

    // only accept object with type: animals and objects
    _filterObjectsByType: function(objectIdArray) {
        cc.log("FreeColorLayer: " + JSON.stringify(objectIdArray));
        this._parseGameObjectJSON();
        var tempArray = [];
        if (!this._gameObjectJson || this._gameObjectJson.length == 0)
            return;

        for (var i = 0; i < objectIdArray.length; i++){            
            let itemObject = this._gameObjectJson.find((gameObject) => {
                return gameObject.id === objectIdArray[i];
            });

            if (itemObject.type === "object" || itemObject.type === "animal")
                tempArray.push({"id": itemObject.id, "type": itemObject.type});
        }

        this._objectsArray = tempArray;
    },

    _parseGameObjectJSON: function() {
        let self = this;
        cc.loader.loadJson(res.Game_Object_JSON, function(err, data) {
            if (!err) {
                self._gameObjectJson = data;
            } else {
                cc.fileUtils.removeFile(Utils.getAssetsManagerPath() + res.Game_Object_JSON);
                cc.loader.loadJson(res.Game_Object_JSON, function(err, data) {
                    self._gameObjectJson = data;
                });
            }
        });

        console.log("GameObjects => " + self._gameObjectJson.length);
    },

    // One side of screen (960x640) ( width: 853 -> 1138)
    // Each grid is 150x150 => 5 cell in width, 3 cell in height (except the header(2 rows) & bottom row, right & left column)
    generateCoordinateArray: function() { 
        let coorArray = [];

        // width
        for (var i = -2; i <= 2; i++){
            let pointX = cc.winSize.width/2 + this.gridCellSize * i;

            // height
            for (var j = 0; j < 3; j++){
                let pointY = this.gridCellSize / 2 + this.gridCellSize * j;
                let objPosition = {
                    x: pointX,
                    y: pointY,
                    anchorX: 0.5,
                    anchorY: 0.5,
                    z: 5
                };

                coorArray.push(objPosition);
            }
        }

        return coorArray;
    },

    addObjects: function(objectArray) {
        // var coordinateObjectArray = shuffle(this.generateCoordinateArray());
        
        for ( var i = 0; i < objectArray.length; i++) {
            var obj = this.addObjectButton(objectArray[i], i);
            if (obj)
                this._createObjectRender(obj);
        }
    },

    addObjectButton: function(gameObject, index) {
        // console.log("Object position: " + JSON.stringify(objPosition));
        NativeHelper.callNative("customLogging", ["Sprite", "objects/" + gameObject.id + ".png"]);
        var imageDir = "";
        if (gameObject.type === "object"){
            imageDir = "objects/";
        }
        else if (gameObject.type === "animal"){
            imageDir = "animals/";
        } else if (gameObject.type === "word")
            imageDir = "alphabets/";
        else if (gameObject.type === "number")
            return null;
        else 
            return null;

        var objImageName = imageDir + gameObject.id + ".png";
        var object = new cc.Sprite(objImageName);
        self = this;
        cc.log("gameObject: " + JSON.stringify(gameObject));
        // object.setAnchorPoint(objPosition.anchorX, objPosition.anchorY);

        object.scale = (object.width > FREECOLOR_OBJECT_WIDTH) ? FREECOLOR_OBJECT_HEIGHT/object.width : FREECOLOR_OBJECT_HEIGHT/object.height;
        object.x = object.width * object.scale + index*(object.width + 10 * Utils.getScaleFactorTo16And9()) * object.scale;
        object.y = 100;
        object.tag = index;
        object.userData = { scaleFactor: object.scale, imageName: objImageName}
        this.addChild(object, Z_OBJECT);
        cc.log("object.x: " + object.x);
        // var shader = cc.GLProgram.createWithFilenames(res.PositionTextureColor_noMVP_vsh, res.Outline_fsh);
        // var shaderState = cc.GLProgramState.getOrCreateWithGLProgram(shader);
        // shaderState.setUniformFloat("width", object.width * cc.contentScaleFactor());
        // shaderState.setUniformFloat("height", object.height * cc.contentScaleFactor());
        // object.shaderProgram = shader;

        this._objectNames.push({name: gameObject.id, tag: object.tag});

        this.animateObjectIn(object, index);
        this._objects.push(object);
        // this.runObjectAction(this, 0,
        //     function(){
        //         if (Global.NumberGamePlayed)
        //             self._lastClickTime = self._hudLayer.getRemainingTime();
        //     }
        // )

        return object;
    },

    _addColorButton: function() {
        for (var i = 0; i < BRUSH_COLOR.length; i++) {
            var btnImgNameNormal = "btn_" + BRUSH_COLOR[i] +".png";
            var btnImgNamePressed = "btn_" + BRUSH_COLOR[i] +"-pressed.png";
            var b = new ccui.Button(btnImgNameNormal, btnImgNamePressed, "", ccui.Widget.PLIST_TEXTURE);
            b.scale = this._colorButtonScale;
            b.x = b.width + i*(b.width + 10 * Utils.getScaleFactorTo16And9()) * this._colorButtonScale;
            b.y = (cc.winSize.height - 50) * Utils.getScaleFactorTo16And9();
            b.tag = i;
            b.opacity = (i == 2) ? 255 : 180;
            b.addClickEventListener(this._changeBrushColorPressed.bind(this));
            this.addChild(b, 99);
            this._brushColorButtons.push(b);
        }
    },

    _changeBrushColorPressed: function(button) {
        var color = BRUSH_COLOR_HEX[button.tag]

        for (var i = 0; i < this._brushColorButtons.length; i++) {
            var b = this._brushColorButtons[i];
            if (b.tag == button.tag)
                b.opacity = 255;
            else
                b.opacity = 180;
        }

        this._currentBrushColor = color;
    },

    _displayObject: function() {
        if (this._characterNodes.length > 0) {
            this._characterNodes.forEach(function(obj) {obj.removeFromParent();});
        }
        this._characterNodes = [];

        var objName = this._writingWords[this._nameIdx];
        cc.log("objName: " + objName);
        cc.log("_nameIdx: " + this._nameIdx);
        this._wordScale = 1;
        var charArrays = [];
        var totalWidth = 0;
        var s = new cc.Sprite("#" + objName + ".png");
        this.addChild(s);

        this._characterNodes.push(s);

        totalWidth = s.width;
        // totalWidth -= CHAR_SPACE;
        if (totalWidth > cc.winSize.width * 0.7)
            this._wordScale = Math.min(this._wordScale, cc.winSize.width * 0.7/totalWidth);

        s.scale = this._wordScale;
        s.x = cc.winSize.width * 0.65 - totalWidth/2 * this._wordScale + s.width/2 * this._wordScale - 10;
        s.y = cc.winSize.height/2 * Utils.getScaleFactorTo16And9();
    },

    animateObjectIn: function(object, delay) {
        var oldScale = object.scale;
        object.scale = 0;
        var self = this;
        object.runAction(
            cc.sequence(
                cc.delayTime(delay * ANIMATE_DELAY_TIME),
                cc.callFunc(function() {
                    jsb.AudioEngine.play2d("sounds/smoke.mp3"),
                    AnimatedEffect.create(object, "smoke", SMOKE_EFFECT_DELAY, SMOKE_EFFECT_FRAMES, false);
                }),
                cc.scaleTo(0.7, 1 * oldScale).easing(cc.easeElasticOut(0.9))
            )
        );

        // this.runObjectAction(this, 0,
        //     function(){
        //         if (Global.NumberGamePlayed > 1)
        //         self._lastClickTime = self._hudLayer.getRemainingTime();
        //     }
        // )
    },

    runObjectAction: function(object, delayTime, func) {
        object.runAction(cc.sequence(
            cc.delayTime(delayTime),
            cc.callFunc(func)
        ));
    },

    onTouchBegan: function(touch, event) {
        if (this._blockTouch)
            return false;
        return true;
    },

    onTouchMoved: function(touch, event) {
        var touchedPos = touch.getLocation();
        var prevPos = touch.getPreviousLocation();

        // var renderPos = this.convertToRTSpace(touchedPos);
        // var prevRenderPos = this.convertToRTSpace(prevPos);

        var distance = cc.pDistance(touchedPos, prevPos);
        var dif = cc.pSub(touchedPos, prevPos);
        if(!this._begin)
            return;
        this._tmpRenderer.begin();
        for (var i = 0; i < distance; i++) {
            var delta = i / distance;
            var newPos = cc.p(touchedPos.x + (dif.x * delta), touchedPos.y + (dif.y * delta));
            var brush = new cc.Sprite("brush_small.png");  
            // brush.scale = this._wordScale * 0.9;          
            brush.setPosition(newPos);
            brush.visit();

            for (var j = 0; j < this._objects.length; j++) {
                if (cc.rectIntersectsRect(brush.getBoundingBox(), this._objects[j].getBoundingBox()) && 
                    this._collidedRenderers.indexOf(this._objRenderers[j]) < 0) {

                    this._collidedRenderers.push(this._objRenderers[j]);
                }
            }
        }
        this._tmpRenderer.end();
        this._tmpRenderer.getSprite().color = this._currentBrushColor
    },

    onTouchEnded: function(touch, event) {
        var self = this;
        var touchLoc = touch.getLocation();
        var image = this._tmpRenderer.newImage(); 
        this._blockTouch = true;

        this._objects.forEach(function(object) {
            var objBBox = object.getBoundingBox();
            if (cc.rectContainsPoint(objBBox, touchLoc)) {
                self._tmpRenderer.clear(0,0,0,0);
                self._baseRenderer.clear(0,0,0,0);

                self._playObjectSound(object);
                self._showNewObject(object);
                return;
            }
        });

        this._tmpRenderer.getSprite().runAction(cc.sequence(
            // cc.tintTo(0.3, 0, 255, 0),
            cc.callFunc(function() {
                self._blockTouch = false;

                var sprite = new cc.Sprite(self._tmpRenderer.getSprite().getTexture());
                sprite.flippedY = true;
                sprite.setPosition(self._tmpRenderer.getPosition());

                sprite.color = self._currentBrushColor;
                self._baseRenderer.begin();
                sprite.visit();
                self._baseRenderer.end();
                h102.Utils.forceRender();

                for (var i = 0; i < self._collidedRenderers.length; i++) {
                    var rt = self._collidedRenderers[i];
                    if (!rt)
                        continue;
                    var contentSize = rt.getSprite().getContentSize();

                    var rtOriginPos = cc.p(rt.x - contentSize.width/2, rt.y - contentSize.height/2);
                    sprite.anchorX = sprite.anchorY = 0;
                    sprite.setPosition(-rtOriginPos.x, -rtOriginPos.y);

                    rt.begin();
                    sprite.visit();
                    rt.end();
                    h102.Utils.forceRender();
                }

                self._collidedRenderers = [];

                self._tmpRenderer.clear(0,0,0,0);
            })
        ));
    },  

    _showNewObject: function(object) {
        if (this._currentObjectShowing)
            this._currentObjectShowing.removeFromParent();
        // clear current object and painted color
        this._currentObjectShowing = null;
        

        var imgName = object.getUserData().imageName;
        var sprite = new cc.Sprite(imgName);
        sprite.scale = (sprite.width > FREECOLOR_SHADER_WIDTH) ? FREECOLOR_SHADER_HEIGHT/sprite.width/sprite.height/sprite.width : FREECOLOR_SHADER_HEIGHT/sprite.height;
        sprite.x = cc.winSize.width/2;
        sprite.y = cc.winSize.height/2;
        this.addChild(sprite);

        var shader = cc.GLProgram.createWithFilenames(res.PositionTextureColor_noMVP_vsh, res.Outline_fsh);
        var shaderState = cc.GLProgramState.getOrCreateWithGLProgram(shader);
        shaderState.setUniformFloat("width", FREECOLOR_SHADER_WIDTH * cc.contentScaleFactor());
        shaderState.setUniformFloat("height", FREECOLOR_SHADER_HEIGHT * cc.contentScaleFactor());
        sprite.shaderProgram = shader;

        this._currentObjectShowing = sprite;
    },

    _addNextButton: function() {
        var btn = new ccui.Button("next.png", "next-pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        btn.x = cc.winSize.width - btn.width;
        btn.y = cc.winSize.height/2;
        btn.addClickEventListener(function() {
            Utils.updateStepData();
            SceneFlowController.getInstance().clearData();
            cc.director.runScene(new MapScene());
        }.bind(this));
        this.addChild(btn, 999999);
    },

    _playObjectSound: function(object) {
        var name = object.getUserData().imageName;
        name = name.slice(0, -4);
        cc.log("name: " + name);
        // object case
        var soundName = "res/sounds/" + name.toLowerCase() + ".mp3";
        // if (!jsb.fileUtils.isFileExist(soundName)) {
        //     // animal case
        //     soundName = "res/sounds/animals/" + name.toLowerCase() + ".mp3";
        //     if (!jsb.fileUtils.isFileExist(soundName)) {
        //         // alphabets case
        //         soundName = "res/sounds/alphabets/" + name.toUpperCase() + ".mp3";
        //         // number case
        //         if (!jsb.fileUtils.isFileExist(soundName))
        //             soundName = "res/sounds/alphabets/A.mp3";
        //     }
        // }
        cc.log("soundName: " + soundName);
        var audioId = jsb.AudioEngine.play2d(soundName);
        // jsb.AudioEngine.setFinishCallback(audioId, function(audioId, audioPath) {
        //     callback && callback(audioId);
        // });
    },
})

var FreeColorScene = cc.Scene.extend({
    ctor: function(objectIdArray, timeForScene, timeForScene) {
        this._super();
        var layer = new FreeColorLayer(objectIdArray, timeForScene, timeForScene);
        this.addChild(layer);
    }
});