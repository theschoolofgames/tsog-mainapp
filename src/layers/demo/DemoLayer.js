var DemosLayer = cc.LayerColor.extend({
    currentElement: null,
    scrollView: null,
    currentElementIndex: 0,

    scrollViewContentSize: null,
    labelLineHeight: 32,
    labelHeight: null,

    ctor: function() {
        this._super(cc.color(255, 255, 255, 255));
        cc.log("DemosLayer ctor");
        this.addNavButtons();
        cc.loader.loadJson("src/layers/demo/demoStory.json", function(error, jsonData) {
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
        this.scrollView.setGravity(ccui.ListView.GRAVITY_CENTER_VERTICAL);

        this.scrollViewContentSize = cc.size(cc.winSize.width*0.9, cc.winSize.height *0.8);
        this.scrollView.setContentSize(this.scrollViewContentSize);
        this.scrollView.x = cc.winSize.width*0.1;
        this.scrollView.y = cc.winSize.height*0.8;
        this.scrollView.anchorY = 1;
        // this.scrollView.setItemsMargin(1);
        
        this.addChild(this.scrollView);

        this.addNextSentence();
    },

    addLabel: function(sentences) {
        let label = new ccui.Text(sentences, "Arial", 32);
        // label.anchorY = 1;
        label.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);
        label.boundingWidth = this.scrollView.getContentSize().width * 0.8;
        label.setTextColor(cc.color.BLACK);
        this.labelHeight = label.height;
        let lp = new ccui.LinearLayoutParameter();

        lp.setMargin(new ccui.Margin(this.scrollView.getContentSize().width*0.1, 0, 0, 0));

        label.setLayoutParameter(lp);

        let hBox = new ccui.HBox();
        hBox.setContentSize(this.scrollView.getContentSize().width, this.labelHeight);
        hBox.addChild(label);

        label.setOpacity(0);
        label.runAction(cc.fadeTo(1, 255));
        this.scrollView.addChild(hBox);
    },

    addButton: function(choices) {
        let choiceContents = Object.keys(choices);
        let firstChoiceContent = choiceContents[0];
        let secondChoiceContent = choiceContents[1];
        let buttonScale = 1.35;
        let titleSize = 32/buttonScale;

        let button_1 = new ccui.Button("res/SD/btn_blue_wide.png", "res/SD/btn_blue_wide_pressed.png", "");
        button_1.scale = buttonScale;
        button_1.setUserData(firstChoiceContent);

        let button1Label = new ccui.Text(firstChoiceContent, "Arial", titleSize);
        button1Label.setPosition(button_1.width/2, button_1.height/2);
        button1Label.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        button1Label.boundingWidth = button_1.width - 40;
        button_1.addChild(button1Label);

        let button_2 = new ccui.Button("res/SD/btn_get_updates.png", "res/SD/btn_get_updates_pressed.png", "");
        button_2.scale = buttonScale;
        button_2.setUserData(secondChoiceContent);

        let button2Label = new ccui.Text(secondChoiceContent, "Arial", titleSize);
        button2Label.setPosition(button_2.width/2, button_2.height/2);
        button2Label.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        button2Label.boundingWidth = button_2.width - 40;
        button_2.addChild(button2Label);

        this.hBox1 = new ccui.HBox();
        this.hBox2 = new ccui.HBox();

        this.hBox1.setContentSize(this.scrollView.getContentSize().width, button_1.height*button_1.scale + 20);
        this.hBox2.setContentSize(this.scrollView.getContentSize().width, button_2.height*button_2.scale + 20);

        button_1.addClickEventListener(this.addButtonClickEventListener.bind(this));
        button_2.addClickEventListener(this.addButtonClickEventListener.bind(this));

        let lp1 = new ccui.LinearLayoutParameter();
        let lp2 = new ccui.LinearLayoutParameter();

        lp1.setMargin(new ccui.Margin(this.scrollView.getContentSize().width/4, button_1.height/2, 0, 0));
        lp2.setMargin(new ccui.Margin(this.scrollView.getContentSize().width/4, button_2.height/4, 0, button_2.height + this.labelLineHeight));

        button_1.setLayoutParameter(lp1);
        button_2.setLayoutParameter(lp2);
        this.hBox1.addChild(button_1);
        this.hBox2.addChild(button_2);

        button_1.setOpacity(0);
        button_2.setOpacity(0);
        button_1.runAction(cc.fadeTo(1.5, 255));
        button_2.runAction(cc.fadeTo(1.5, 255));

        this.scrollView.addChild(this.hBox1);
        this.scrollView.addChild(this.hBox2);
    },

    addNextSentence: function () {
        var sentences = this.currentElement['sentences'];
        var string = "";
        for (var i = 0; i < sentences.length; i++) {
            string += sentences[i];
            if (i < sentences.length - 1) {
                string += "\n";
            }
        }
        
        this.addLabel(string);
        
        if (this.currentElement.hasOwnProperty('choices')) {
            var choices = this.currentElement['choices'];
            this.addButton(choices);

            // let innerSize = this.scrollView.getInnerContainerSize();
            // if (innerSize.height >= this.scrollViewContentSize.height) {
            //     this.scrollView.setInnerContainerSize(cc.size(innerSize.width, innerSize.height + 100));
            // }
        } else {
        }
        this.scrollView.forceDoLayout();
        
        this.scrollView.scrollToBottom(2, true);
        cc.log("getitemMargin -> " + this.scrollView.getItemsMargin());
    },

    addButtonClickEventListener: function(button) {
        /*
            userData == button title
        */
        let buttonUserData = button.getUserData();

        this.scrollView.removeChild(this.hBox1);
        this.scrollView.removeChild(this.hBox2);

        this.hBox1 = null;
        this.hBox2 = null;

        this.currentElement = this.currentElement['choices'][buttonUserData];
        this.currentElementIndex++;
        this.addNextSentence();

    },

    addNavButtons: function() {
        var demos = [
            {
                func: function() {
                    cc.director.runScene(new HomeScene());
                },
                text: "Back To Home"
            },
            {
                func: function() {
                    cc.director.runScene(new DemosStoryScene());
                },
                text: "Create New Story"
            }
        ];

        for (let i = 0; i < demos.length; i++) {
            var buttonPlay = new ccui.Button("btn_save_progress.png", "btn_save_progress_pressed.png", "", ccui.Widget.PLIST_TEXTURE);
            buttonPlay.x = buttonPlay.width/2 + 10 + (buttonPlay.width + 10) * i;
            buttonPlay.y = cc.winSize.height - buttonPlay.height/2 - 10;

            this.addChild(buttonPlay);
            var lbPlay = CustomLabel.createWithTTF(res.HELVETICARDBLK_ttf.srcs[0], 26, cc.color("#b15a10"), 1, demos[i].text);

            buttonPlay.addChild(lbPlay,1);
            lbPlay.x = buttonPlay.width/2;
            lbPlay.y = buttonPlay.height/2 + 8;
            buttonPlay.addClickEventListener(demos[i].func);
        }
    },
});
var DemosStoryScene = cc.Scene.extend({
    ctor: function(){
        this._super();

        var layer = new DemosLayer();
        this.addChild(layer);
    }
});

