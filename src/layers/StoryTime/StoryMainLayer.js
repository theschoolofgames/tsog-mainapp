var StoryMainLayer = cc.Layer.extend({
	subLabelArray: [],
	currentSubtitleArray: [],
	subtitles: [],
    words: [],
	currentCountTime: 0,
    currentSubtitle: null,
    TEXT_HEIGHT: 40,
    SUBTITLE_WIDTH: 700,
    currentSubLabelHeight: 0,

	ctor:function(){
        this._super();

        this._addBackGround();
        this._addButtons();
        this._loadSubtitle(res.Story02_ass);

        this._playStory();
    },

    update: function(dt) {
        this.currentCountTime += dt;

        if (this.currentSubtitle){

            // Shift words one-by-one, highlight by their position
            while (this.currentSubtitle.words.length > 0 && 
                this.currentCountTime * 1000 - this.currentSubtitle.start >= this.currentSubtitle.words[0].time){
                let currentWord = this.currentSubtitle.words.shift();

                this.currentSubtitle.highLightLayer.setContentSize(currentWord.width, this.TEXT_HEIGHT);
                this.currentSubtitle.highLightLayer.setPosition(cc.p(currentWord.wordPos.x, 
                    this.currentSubLabelHeight + currentWord.wordPos.y));

            }
        }

    	if (this.subtitles.length <= 0) return;
       	
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
        
        label.x = (cc.winSize.width/2 - subtitle.marginR);
        label.y = (cc.winSize.height/2 + subtitle.marginV);
        label.visible = true;
    },

    _playStory: function(){
    	this._playSound();
        this.scheduleUpdate();
        this.currentCountTime = 0;
        this.subLabelArray = [];
    },

    _stopStory: function(){
    	this._stopSound();
        this.unscheduleUpdate();
        this.currentCountTime = 0;
        this.subLabelArray = [];

        for (var i = 0; i < this.subLabelArray.length; i++){
        	this.subLabelArray[i].visible = false;
        }
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
            words: wordArray
    	};
    },

    _playSound: function() {
    	cc.audioEngine.setMusicVolume(0.3);
        cc.audioEngine.playMusic(res.Story02_mp3, false);
    },

    _stopSound: function() {
        cc.audioEngine.stopMusic(res.Story02_mp3);
    },

    _addBackGround: function() {
        var bg = new cc.Sprite(res.Bg_school_jpg);
        bg.x = cc.winSize.width / 2;
        bg.y = cc.winSize.height / 2;
        this.addChild(bg);
    },

    _addButtons: function() {
    	var self = this;

        // STOP BUTTON
        var btnStop = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        btnStop.x = btnStop.width / 2;
        btnStop.y = cc.winSize.height - btnStop.height*2/3 - 100;
        this.addChild(btnStop);
        btnStop.addClickEventListener(function() {
            self._stopStory();
        });

        var lbStop = new cc.LabelBMFont("STOP", "yellow-font-export.fnt");
        lbStop.scale = 0.6;
        lbStop.x = btnStop.width/2;
        lbStop.y = btnStop.height/2;
        btnStop.getRendererNormal().addChild(lbStop);

        // PLAY
        var btnPlay = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        btnPlay.x = btnPlay.width / 2;
        btnPlay.y = cc.winSize.height - btnPlay.height*2/3
        this.addChild(btnPlay);
        btnPlay.addClickEventListener(function() {
            self._playStory();
        });

        var lbPlay = new cc.LabelBMFont("PLAY", "yellow-font-export.fnt");
        lbPlay.scale = 0.6;
        lbPlay.x = btnPlay.width/2;
        lbPlay.y = btnPlay.height/2;
        btnPlay.getRendererNormal().addChild(lbPlay);
    },
});

var StoryMainScene = cc.Scene.extend({
    ctor: function() {
        this._super();
        this.name = "story";
        var storyMainLayer = new StoryMainLayer();
        this.addChild(storyMainLayer);
    }
});