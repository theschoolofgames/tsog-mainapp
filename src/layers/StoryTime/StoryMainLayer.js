var StoryMainLayer = cc.Layer.extend({
	subLabelArray: [],
	currentSubtitleArray: [],
	subtitles: [],
	currentCountTime: 0,

	ctor:function(){
        this._super();

        this._addBackGround();
        this._addButtons();
        this._loadSubtitle(res.Story01_ass);
        this._addRichText();

        Utils.showVersionLabel(this);

    },

    _addRichText: function() {
        var uiRichText = new ccui.RichText();
        // uiRichText.ignoreContentAdaptWithSize(false);
        // uiRichText.setAnchorPoint(cc.p(0,0));
        // uiRichText.setContentSize(new cc.size(200, 100));
        uiRichText.x = cc.winSize.width/2;
        uiRichText.y = cc.winSize.height/2;

        var rtElement = new ccui.RichElementText(100, cc.color.BLACK, 255, "Some Text Some Text Some Text", "Arial", 24);
        var rtRedElement = new ccui.RichElementText(100, cc.color.RED, 255, "Red ", "Arial", 24);

        uiRichText.pushBackElement(rtRedElement);
        uiRichText.pushBackElement(rtElement);
        uiRichText.formatText();
        this.addChild(uiRichText);
    },

    update: function(dt) {
    	if (this.subtitles.length <= 0) return;

    	this.currentCountTime += dt;
       	
       	// Check if subtitle was end, hide this AFK label
        for (var i = 0; i < this.subLabelArray.length; i++){
        	if (this.currentCountTime * 1000 >= this.subLabelArray[i].getTag()){ // Tag of subLabel was end time of subtitle
        		this.subLabelArray[i].visible = false;
        	}
        }

       	// Check in-time subtitle, get available subtitle label and modify
        while (this.currentCountTime * 1000 >= this.subtitles[0].start && this.subtitles.length > 0){
        	var subtitleModel = this.subtitles.shift();
        	var subLabel = this._getAvailableSubLabel();
        	this._updateLabelWithSubtitle(subLabel, subtitleModel);
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
		var _subLabel = new cc.LabelTTF("", "Arial", 24);
		_subLabel.color = cc.color.BLACK;
		_subLabel.visible = true;
		this.addChild(_subLabel);

		this.subLabelArray.push(_subLabel);
		
		return _subLabel;
    },

    _updateLabelWithSubtitle: function(label, subtitle) {
    	label.setString(subtitle.message);
    	label.setTag(subtitle.end);
    	label.color = cc.color.BLACK;
        label.textAlign = cc.TEXT_ALIGNMENT_CENTER;
        label.boundingWidth = cc.winSize.width* 0.75;
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
		    	var dialogueInfo = self._getDetailDialogueLine(dialogueArray[i]);
		    	self.subtitles.push(dialogueInfo);
		    }
		});
    },

    _getDialogueArray: function(content) {
    	let eventsString = content.split('[Events]')[1];
    	return eventsString.trim().split('\n').slice(1); // remove description line: Format....
    },

    _getDetailDialogueLine: function(line) {
    	// Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
    	// Sample: Dialogue: 0,0:00:00.00,0:00:08.00,Default,,0,0,0,,yeah yeah
    	let infoArray = line.substring(10).split(','); // remove 'Dialogue' title

    	return {
    		start: this._convertTimeToMilisecond(infoArray[1]),
    		end: this._convertTimeToMilisecond(infoArray[2]),
    		marginL: parseInt(infoArray[5]),
    		marginR: parseInt(infoArray[6]),
    		marginV: parseInt(infoArray[7]),
    		message: infoArray[9]
    	};
    },

    _playSound: function() {
    	cc.audioEngine.setMusicVolume(0.3);
        cc.audioEngine.playMusic(res.Story01_mp3, false);
    },

    _stopSound: function() {
        cc.audioEngine.stopMusic(res.Story01_mp3);
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