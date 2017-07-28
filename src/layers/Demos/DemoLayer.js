var DemosLayer = cc.LayerColor.extend({
    currentElement: null,
    scrollView: null,
    currentElementIndex: 0,

    scrollViewInnerContainerSize: null,
    scrViewContainerHeigthToIncrease: 0,

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
        this.scrollView.setContentSize(cc.size(cc.winSize.width, cc.winSize.height));
        this.scrollView.x = cc.winSize.width*0.1;
        this.scrollView.y = 0;

        this.scrollViewContent = new cc.Node();
        // this.scrollViewContent.setLayoutType(ccui.Layout.LINEAR_VERTICAL);
        // this.scrollViewContent.setPosition(cc.winSize.width, this.scrollView.height/2);
        // scrollView.addChild(this.scrollViewContent);
        this.addChild(this.scrollView);

        this.addNextSentence();
    },

    addLabel: function(sentences) {
        cc.log("sentences -> " + sentences);
        this.label = new cc.LabelTTF(sentences, 'Arial', 32, cc.TEXT_ALIGNMENT_LEFT);
        this.label.x = this.label.width;
        // this.label.y = -this.label.height/2;

        
        var vBox = new ccui.VBox();
        // vBox.x = cc.winSize.width;
        // vBox.setContentSize(this.scrollView.getContentSize().width, 100);
        vBox.addChild(this.label);
        this.scrollView.addChild(vBox);
    },

    addButton: function(choices) {
        var choiceContents = Object.keys(choices);
        var firstChoiceContent = choiceContents[0];
        var secondChoiceContent = choiceContents[1];
        var button_1 = new ccui.Button("res/SD/btn_blue_wide.png", "res/SD/btn_blue_wide_pressed.png","");
        // button_1.scale = 2;
        button_1.x = cc.winSize.width/2;

        button_1.setTitleText(firstChoiceContent);
        button_1.setTitleFontSize(32);

        var button_2 = new ccui.Button("res/SD/btn_get_updates.png", "res/SD/btn_get_update_pressed.png","");
        // button_2.scale = 2;
        button_2.x = this.scrollView.width/2;

        button_2.setTitleText(secondChoiceContent);
        button_2.setTitleFontSize(32);

        var vBox1 = new ccui.VBox();
        var vBox2 = new ccui.VBox();

        // vBox1.setContentSize(this.scrollView.getContentSize().width, 100);
        // vBox2.setContentSize(this.scrollView.getContentSize().width, 100);
        button_1.addClickEventListener(function() {
            // add next sentences to scrollview
            vBox1.removeFromParent();
            vBox2.removeFromParent();

            this.currentElement = choices[firstChoiceContent];
            this.currentElementIndex++;
            this.addNextSentence();
        }.bind(this));

        button_2.addClickEventListener(function() {
            // add next sentences to scrollview
            vBox1.removeFromParent();
            vBox2.removeFromParent();

            this.currentElement = choices[secondChoiceContent];
            this.currentElementIndex++;
            this.addNextSentence();
        }.bind(this));

        var lp = new ccui.LinearLayoutParameter();
        // // lp.setGravity(ccui.LinearLayoutParameter.LEFT);
        lp.setMargin(new ccui.Margin(0, 0, 0, 0));
        button_1.setLayoutParameter(lp);
        button_2.setLayoutParameter(lp);
        // vBox1.addChild(button_1);
        // vBox2.addChild(button_2);

        this.scrollView.addChild(button_1);
        this.scrollView.addChild(button_2);

    },

    addNextSentence: function () {
        var sentences = this.currentElement['sentences'];
        var string = "";
        for (var i = 0; i < sentences.length; i++) {
            string += sentences[i] + "\n";
        }
        // var labelPos = cc.p(cc.winSize.width, this.scrollView.height *0.8);
        // if (this.label != null) {
        //     labelPos.y = this.label.y - this.label.height - 10;
        // }
        this.addLabel(string);
        
        if (this.currentElement.hasOwnProperty('choices')) {
            var choices = this.currentElement['choices'];
            this.addButton(choices);
        }
        // this.scrollViewInnerContainerSize.height += this.scrViewContainerHeigthToIncrease;
        // this.scrollView.setInnerContainerSize(this.scrollViewInnerContainerSize);
        // this.scrollViewContent.y += this.scrViewContainerHeigthToIncrease;

        this.scrollView.scrollToBottom(0.1, true);
    }
});
var DemosScene = cc.Scene.extend({
    ctor: function(){
        this._super();

        var layer = new DemosLayer();
        this.addChild(layer);
    }
});
