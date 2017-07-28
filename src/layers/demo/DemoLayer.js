var DemosLayer = cc.LayerColor.extend({
    currentElement: null,
    scrollView: null,
    currentElementIndex: 0,

    scrollViewInnerContainerSize: null,
    labelLineHeight: 32,
    labelHeight: null,

    ctor: function() {
        this._super(cc.color(0,0,0,255));

        cc.loader.loadJson("src/layers/Demos/demoStory.json", function(error, jsonData) {
            this.currentElement = jsonData;
            this.addScrollView();
        }.bind(this))
    },

    addScrollView: function() {
        this.scrollView = new ccui.ListView();
        this.scrollView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        this.scrollView.setTouchEnabled(true);
        this.scrollView.setSwallowTouches(false);
        this.scrollView.setBounceEnabled(true);

        this.scrollViewInnerContainerSize = cc.size(cc.winSize.width*0.9, cc.winSize.height);
        this.scrollView.setContentSize(this.scrollViewInnerContainerSize);
        this.scrollView.x = cc.winSize.width*0.1;
        this.scrollView.y = 0;
        
        this.addChild(this.scrollView);

        this.addNextSentence();
    },

    addLabel: function(sentences) {
        let label = new cc.LabelTTF(sentences, 'Arial', 32, cc.TEXT_ALIGNMENT_LEFT);
        label.textAlign = cc.TEXT_ALIGNMENT_LEFT;
        label.x = this.scrollView.getContentSize().width*0.5;
        label.boundingWidth = this.scrollView.getContentSize().width * 0.7;
        label.anchorY = 1;

        this.labelHeight = label.height;
        let hBox = new ccui.HBox();
        hBox.setContentSize(this.scrollView.getContentSize().width, this.labelLineHeight);
        hBox.addChild(label);

        let lp = new ccui.LinearLayoutParameter();

        lp.setMargin(new ccui.Margin(0, this.labelLineHeight, 0, this.labelLineHeight));

        hBox.setLayoutParameter(lp);
        this.scrollView.addChild(hBox);
    },

    addButton: function(choices) {
        let choiceContents = Object.keys(choices);
        let firstChoiceContent = choiceContents[0];
        let secondChoiceContent = choiceContents[1];
        let button_1 = new ccui.Button("res/SD/btn_blue_wide.png", "res/SD/btn_blue_wide_pressed.png","");
        button_1.scale = 1.5;

        button_1.setTitleText(firstChoiceContent);
        button_1.setTitleFontSize(32);

        let button_2 = new ccui.Button("res/SD/btn_get_updates.png", "res/SD/btn_get_updates_pressed.png","");
        button_2.scale = 1.5;

        button_2.setTitleText(secondChoiceContent);
        button_2.setTitleFontSize(32);

        let hBox1 = new ccui.HBox();
        let hBox2 = new ccui.HBox();

        hBox1.setContentSize(this.scrollView.getContentSize().width, button_1.height*button_1.scale);
        hBox2.setContentSize(this.scrollView.getContentSize().width, button_2.height*button_2.scale);

        button_1.addClickEventListener(function() {
            // add next sentences to scrollview
            this.scrollView.removeChild(hBox1);
            this.scrollView.removeChild(hBox2);

            this.addLabel(firstChoiceContent);

            this.currentElement = choices[firstChoiceContent];
            this.currentElementIndex++;
            this.addNextSentence();
        }.bind(this));

        button_2.addClickEventListener(function() {
            // add next sentences to scrollview
            this.scrollView.removeChild(hBox1);
            this.scrollView.removeChild(hBox2);

            this.addLabel(secondChoiceContent);

            this.currentElement = choices[secondChoiceContent];
            this.currentElementIndex++;
            this.addNextSentence();
        }.bind(this));

        let lp1 = new ccui.LinearLayoutParameter();

        lp1.setMargin(new ccui.Margin(this.scrollView.getContentSize().width/4, this.labelHeight, 0, 0));

        button_1.setLayoutParameter(lp1);
        button_2.setLayoutParameter(lp1);
        hBox1.addChild(button_1);
        hBox2.addChild(button_2);

        this.scrollView.addChild(hBox1);
        this.scrollView.addChild(hBox2);

    },

    addNextSentence: function () {
        var sentences = this.currentElement['sentences'];
        var string = "";
        for (var i = 0; i < sentences.length; i++) {
            string += sentences[i] + "\n";
        }
        
        this.addLabel(string);
        
        if (this.currentElement.hasOwnProperty('choices')) {
            var choices = this.currentElement['choices'];
            this.addButton(choices);
        }
        this.scrollView.forceDoLayout();
        // this.scrollView.doLayout();
        // this.scrollView.scrollToBottom(0.1, true);
    }
});
var DemosStoryScene = cc.Scene.extend({
    ctor: function(){
        this._super();

        var layer = new DemosLayer();
        this.addChild(layer);
    }
});
