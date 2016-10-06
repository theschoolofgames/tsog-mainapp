var StoryMainLayer = TestLayer.extend({
	subLabelArray: [],
	currentSubtitleArray: [],
	subtitles: [],
    words: [],
	currentCountTime: 0,
    currentSubtitle: null,
    TEXT_HEIGHT: 40,
    SUBTITLE_WIDTH: 900,
    currentSubLabelHeight: 0,
    _currentStory: null,
    _currentStorySceneIndex: 0,
    _backgroundSprite: null,
    _canPlay: false,

    _isTestScene: false,
    highlightBox: null,

	ctor:function(data, option, isTestScene){
        this._super(true);
        this._isTestScene = isTestScene;
        this._addButtons();
        this._fetchObjectData(data);
        cc.log("ctor option " + option);
        switch(option) {
            case "lion_and_mouse":
                this._currentStory = STORY_RESOURCES[0];
                break;
            case "goose_with_golden_egg":
                this._currentStory = STORY_RESOURCES[1];
                break;
            case "cunning_fox_clever_stork":
                this._currentStory = STORY_RESOURCES[2];
                break;
            case "the_hare_and_the_tortoise":
                this._currentStory = STORY_RESOURCES[3];
                break;
            default:
                this._currentStory = STORY_RESOURCES[0];
                break;
        }

        this.scheduleOnce(this._playStory, 1);

        this._addHighLightBox();
    },

    _addHighLightBox: function() {
        this.highlightBox = new cc.LayerColor(cc.color(255,0,0,100), 100, this.TEXT_HEIGHT);
        this.highlightBox.setPosition(-100, -100);
        this.addChild(this.highlightBox, 1000);
    },

    _playStory: function(){
        this.currentCountTime = 0;

        // @subLabelArray sometime not empty after call _stopStory(), so has to check when playing story
        for (var i = 0; i < this.subLabelArray.length; i++){
            this.removeChild(this.subLabelArray[i]);
        }
        
        this.subLabelArray = [];

        this._loadSubtitle(this._currentStory.subtitles[this._currentStorySceneIndex]);
        this._updateBackground(this._currentStory.arts[this._currentStorySceneIndex]);
        this._playSound(this._currentStory.sounds[this._currentStorySceneIndex]);
        this.scheduleUpdate();
        this._canPlay = true;

        this.highlightBox.setVisible(true);
        this.highlightBox.setPosition(-100,-100);
    },

    _stopStory: function(){
        this.unscheduleUpdate();
        this._canPlay = false;
        this._stopSound();
        this.currentCountTime = 0;
        this.subtitles = [];
        this.currentSubtitle = null;

        for (var i = 0; i < this.subLabelArray.length; i++){
            this.subLabelArray[i].visible = false;

            // Remove Highlight
            this.subLabelArray[i].removeChild(this.subLabelArray[i].getChildByTag(1001));

            this.removeChild(this.subLabelArray[i]);
        }

        this.subLabelArray = [];

        this.highlightBox.setVisible(false);
        this.highlightBox.setPosition(-100,-100);
    },

    update: function(dt) {
        if (!this._canPlay)
            return;

        this.currentCountTime += dt;

        if (this.currentSubtitle){

            // Shift words one-by-one, highlight by their position
            while (this.currentSubtitle.words.length > 0 && 
                this.currentCountTime * 1000 - this.currentSubtitle.start >= this.currentSubtitle.words[0].time){
                let currentWord = this.currentSubtitle.words.shift();

                this.currentSubtitle.highLightLayer.setContentSize(currentWord.width, this.TEXT_HEIGHT);
                this.currentSubtitle.highLightLayer.setPosition(cc.p(currentWord.wordPos.x, 
                    this.currentSubLabelHeight + currentWord.wordPos.y));
                this.currentSubtitle.highLightLayer.visible = false;

                this.highlightBox.setContentSize(currentWord.width, this.TEXT_HEIGHT);
                this.highlightBox.setPosition(cc.p(this.currentSubtitle.highLightLayer.getBoundingBoxToWorld().x, 
                    this.currentSubtitle.highLightLayer.getBoundingBoxToWorld().y));

                // cc.log("Local position (%d, %d)", this.currentSubtitle.highLightLayer.getBoundingBox().x, this.currentSubtitle.highLightLayer.getBoundingBox().y);
                // cc.log("World position (%d, %d) - ContentSize (%d, %d)", 
                //     this.currentSubtitle.highLightLayer.getBoundingBoxToWorld().x, 
                //     this.currentSubtitle.highLightLayer.getBoundingBoxToWorld().y,
                //     currentWord.width, this.TEXT_HEIGHT);
            }
        }

    	if (this.subtitles.length <= 0 && this.currentSubtitle.end <= this.currentCountTime * 1000) {
            if (this._currentStorySceneIndex >= this._currentStory.arts.length - 1){
                this._stopStory();
                // Complete story callback here
                this.completedScene();

                return;
            }
            else {
                this._stopStory();
                this._currentStorySceneIndex++;
                this._playStory();
            }

            return;
        }
       	
       	// Check if subtitle was end, hide this AFK label
        for (var i = 0; i < this.subLabelArray.length; i++){
        	if (this.currentCountTime * 1000 >= this.subLabelArray[i].getTag()){ // Tag of subLabel was end time of subtitle
                let subLabel = this.subLabelArray[i];
        		subLabel.visible = false;

                // Remove Highlight
                subLabel.removeChild(subLabel.getChildByTag(1001));
        	}
        }

       	// Check in-time subtitle, get available subtitle label and modify
        while (this.subtitles.length > 0 && this.currentCountTime * 1000 >= this.subtitles[0].start){
        	this.currentSubtitle = this.subtitles.shift();
        	var subLabel = this._getAvailableSubLabel();

            this._updateLabelWithSubtitle(subLabel, this.currentSubtitle);

            this.currentSubtitle.highLightLayer = new cc.LayerColor(cc.color(255,255,0,100), 100, this.TEXT_HEIGHT);
            this.currentSubtitle.highLightLayer.x = -100;
            this.currentSubtitle.highLightLayer.y = subLabel.height - this.TEXT_HEIGHT;
            this.currentSubtitle.highLightLayer.setTag(1001);

            this.currentSubLabelHeight = subLabel.height - this.TEXT_HEIGHT;
            subLabel.addChild(this.currentSubtitle.highLightLayer);

            if (this.subtitles.length <= 0)
                break;
        }
    },

    completedScene: function() {
        var self = this;
        this.runAction(
            cc.sequence(
                cc.delayTime(3),
                cc.callFunc(function() {
                    self._moveToNextScene();
                    // self.backToHome();
                })
            )
        )
    },

    _getAvailableSubLabel: function() {
        // if subLabelArray not empty and have visible label, return this label
        for (var i = 0; i < this.subLabelArray.length; i++){
            if (this.subLabelArray[i].visible == false){
                return this.subLabelArray[i];
            }
        }

        // @subLabelArray empty || visible label != avaiable
        var _subLabel = new cc.LabelTTF("", "Arial", 35);
        _subLabel.color = cc.color.BLACK;
        _subLabel.visible = true;
        _subLabel.setVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_TOP);
        _subLabel.boundingWidth = this.SUBTITLE_WIDTH;
        this.addChild(_subLabel);

        this.subLabelArray.push(_subLabel);
        
        return _subLabel;
    },

    _updateLabelWithSubtitle: function(label, subtitle) {
        label.setString(subtitle.message);
        label.setTag(subtitle.end);
        label.color = cc.color.BLACK;
        label.boundingWidth = this.SUBTITLE_WIDTH;
        label.setAnchorPoint(0.5, 0);
        label.x = (cc.winSize.width/2 - subtitle.marginR);
        label.y = 20;
        label.visible = true;
    },

    _convertTimeToMilisecond: function(timeString){ // Like: 12:20:19.45 
    	let times = timeString.split(':');
    	let hour = parseInt(times[0]);
    	let minute = parseInt(times[1]);
    	let second = parseInt(times[2].split('.')[0]);
    	let miliSecond = parseInt(times[2].split('.')[1]);
    	return miliSecond * 10 + second * 1000 + minute * 60 * 1000 + hour * 60 * 60 * 1000;
	},

    _loadSubtitle: function(subtitleFile) {
    	var self = this;
    	cc.loader.loadTxt(subtitleFile, function(err, data){
		    if(err) return console.log("Load failed: " + subtitleFile);
		    
		    // Success 
		    var dialogueArray = self._getDialogueArray(data);
		    for (var i = 0; i < dialogueArray.length; i++){
		    	var dialogueInfo = self._parseDetailDialogueLine(dialogueArray[i]);
		    	self.subtitles.push(dialogueInfo);
		    }
		});
    },

    _getDialogueArray: function(content) {
    	let eventsString = content.split('[Events]')[1];
    	return eventsString.trim().split('\n').slice(1); // remove description line: Format....
    },

    _parseDetailDialogueLine: function(line) {
    	// Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
    	// Sample: Dialogue: 0,0:00:00.00,0:00:08.00,Default,,0,0,0,,yeah yeah
    	let infoArray = line.substring(10).split(','); // remove 'Dialogue' title

        // Parse subtitle to words
        // {\k36}Once{\k0}{\k10} {\k41}upon{\k0}{\k11} {\k11}a
        let rawMessage = infoArray.slice(9).join(',');
        let wordWithTimeArray = rawMessage.split('{\\k');
        let wordArray = [];
        
        var _subLabel = new cc.LabelTTF("", "Arial", 35);
        _subLabel.color = cc.color.BLACK;
        _subLabel.x = -100;
        _subLabel.y = -100;

        let nextDuration = 0;
        let message = "";
        let messageHeight = this.TEXT_HEIGHT;
        let currentPos = cc.p(0,0);
        let currentWordWidth = 0;
        let currentLineString = "";

        for (let i = 0; i < wordWithTimeArray.length; i++){
            let _array = wordWithTimeArray[i].split('}');
            if (!_array[1])
                continue;

            _subLabel.setString(_array[1]);
            let currentWordWidth = _subLabel.getContentSize().width;
            let currentWordHeight = _subLabel.getContentSize().height;

            _subLabel.setString(currentLineString.concat(_array[1]));
            if (_subLabel.getContentSize().width > this.SUBTITLE_WIDTH){
                message = message.concat('\n').concat(_array[1]);
                currentLineString = _array[1];
                currentPos = cc.p(0, currentPos.y - _subLabel.getContentSize().height);  
                messageHeight += this.TEXT_HEIGHT;
            }
            else {
                message = message.concat(_array[1]);
                currentLineString = currentLineString.concat(_array[1]);
            }

            _subLabel.setString(currentLineString);

            let wordDuration = parseFloat(_array[0]) * 10;

            let wordInfo = {
                time: nextDuration,
                text: _array[1],
                wordPos: currentPos,
                width: currentWordWidth,
                height: currentWordHeight
            };

            // cc.log("Word Info => '%s' - '%s', (%d, %d)", wordInfo.text, currentLineString, currentPos.x, currentPos.y);

            if (wordInfo.text !== ' ')
                wordArray.push(wordInfo);

            currentPos = cc.p(_subLabel.getContentSize().width, currentPos.y);

            nextDuration += wordDuration;
        }

    	return {
    		start: this._convertTimeToMilisecond(infoArray[1]),
    		end: this._convertTimeToMilisecond(infoArray[2]),
    		marginL: parseInt(infoArray[5]),
    		marginR: parseInt(infoArray[6]),
    		marginV: parseInt(infoArray[7]),
    		message: message,
            messageHeight: messageHeight,
            words: wordArray,
    	};
    },

    _playSound: function(soundRes) {
    	cc.audioEngine.setMusicVolume(0.3);
        cc.audioEngine.playMusic(soundRes, false);
    },

    _stopSound: function() {
        cc.audioEngine.stopMusic(res.Story02_mp3);
    },

    _updateBackground: function(backgroundResource) {
        if (!this._backgroundSprite){
            this._backgroundSprite = new cc.Sprite(backgroundResource);
            this.addChild(this._backgroundSprite);
        }

        this._backgroundSprite.setTexture(cc.textureCache.addImage(backgroundResource));
        this._backgroundSprite.setAnchorPoint(0.5, 1);
        // this._backgroundSprite.setScale(0.8);
        this._backgroundSprite.x = cc.winSize.width / 2;
        this._backgroundSprite.y = cc.winSize.height;
    },

    _addButtons: function() {
    	var self = this;

        // BACK
        var btnBack = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        btnBack.x = btnBack.width / 2;
        btnBack.y = cc.winSize.height - btnBack.height*2/3
        btnBack.setLocalZOrder(1000);
        this.addChild(btnBack);
        btnBack.addClickEventListener(function() {
            self.backToHome();
        });

        var lbBack = new cc.LabelBMFont("BACK", "yellow-font-export.fnt");
        lbBack.scale = 0.6;
        lbBack.x = btnBack.width/2;
        lbBack.y = btnBack.height/2;
        btnBack.getRendererNormal().addChild(lbBack);
    },

    backToHome:function (sender) {
        this._stopStory();
        if (this._isTestScene) {
            cc.director.replaceScene(new cc.TransitionFade(1, new GameTestScene(), cc.color(255, 255, 255, 255))); 
            return;
        }

        // TODO remove after complete listening and speaking flow after story game
        Utils.updateStepData();
        SceneFlowController.getInstance().clearData();
        cc.director.replaceScene(new cc.TransitionFade(1, new MapScene(), cc.color(255, 255, 255, 255)));
    },

    toType: function(obj) {
      return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
    },

    _fetchObjectData: function(data) {
        // cc.log("data before map: " + JSON.stringify(data));
        var dataNextScene = [];
        if (data)
            dataNextScene = data.map(function(id) {
                var o = GameObject.getInstance().findById(id);
                if (o[0])
                    return o[0];
                else
                    return id;
            });
        this.setData(JSON.stringify(dataNextScene[0]));
        // cc.log("data after map: " + JSON.stringify(dataNextScene));
    },
});

var StoryMainScene = cc.Scene.extend({
    ctor: function(data, option, isTestScene) {
        this._super();
        this.name = "story";
        var storyMainLayer = new StoryMainLayer(data, option, isTestScene);
        this.addChild(storyMainLayer);
    }
});