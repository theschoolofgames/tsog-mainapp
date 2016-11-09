ShopScreenLayer = cc.LayerColor.extend({
    _characterList: null,
    _index : 0,
    _character : null,
    _touchPos: null,
    _moveRight: null,
    _isTouchMoved: null, 

    ctor: function() {
        this._super(cc.color(255,255,255,255));
        this.addBackToHomeScene();
        this.addCurrency();
        this._characterList = CharacterManager.getInstance().getCharacterList();
        cc.log("characterList: " + JSON.stringify(this._characterList));
        this.showCharacter(this._index);
        // this.updateScrollView();
        cc.eventManager.addListener({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: true,
                onTouchBegan: this.onTouchBegan.bind(this),
                onTouchMoved: this.onTouchMoved.bind(this),
                onTouchEnded: this.onTouchEnded.bind(this),
        }, this);
        CurrencyManager.getInstance().incCoin(10000);
        CurrencyManager.getInstance().incDiamond(10000);
    },
    onTouchBegan: function(touch, event) {
        cc.log("onTouchBegan");
        this._touchPos = touch.getLocation();
            return true;
    },

    onTouchMoved: function(touch, event){
        cc.log("onTouchMoved");
        var touchPos = touch.getLocation();
        var delta = cc.pSub(touchPos, this._touchPos);
        cc.log(cc.pLengthSQ(delta));
        if(cc.pLengthSQ(delta) > 10) {
            this._isTouchMoved = true;
        };
        if(this._touchPos.x > touchPos.x)
            this._moveRight = false;
        else this._moveRight = true;
    },

    onTouchEnded:function(touch, event) {
        cc.log("onTouchEnded");
        if(this._isTouchMoved) {
            if(this._moveRight && this._index > 0) {
                this._index -= 1;
            }
            else if(!this._moveRight && this._index < this._characterList.length - 1)
                this._index += 1;
            cc.log("this._index: " + this._index);
            this.showCharacter(this._index);
        }
    },

    addBackToHomeScene: function(){
        var button = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        button.x = cc.winSize.width - button.width;
        button.y = cc.winSize.height - button.height/2 - 10;
        this.addChild(button, 9999);
        button.addClickEventListener(function(){
            cc.director.runScene(new HomeScene());
        });
        var lb = new cc.LabelBMFont("BACK TO HOME", "yellow-font-export.fnt");
        lb.scale = 0.5;
        lb.x = button.width/2;
        lb.y = button.height/2;
        button.addChild(lb);
    },


    addCurrency: function(){
        var coin = new cc.Sprite("res/SD/gold.png");
        coin.x = 100;
        coin.y = cc.winSize.height - coin.height/2 - 10;
        this.addChild(coin, 999);
        var coinAmount = CurrencyManager.getInstance().getCoin();
        var lbCoin = new cc.LabelBMFont(coinAmount.toString(), "res/font/custom_font.fnt");
        lbCoin.scale = 0.4;
        lbCoin.anchorX = 0;
        lbCoin.x = 50;
        lbCoin.y = coin.height/2;
        coin.addChild(lbCoin);

        var diamond = new cc.Sprite("res/SD/diamond.png");
        diamond.x = 400;
        diamond.y = cc.winSize.height - diamond.height/2 - 10;
        this.addChild(diamond, 999);
        var diamondAmount = CurrencyManager.getInstance().getDiamond();
        var lbDiamond = new cc.LabelBMFont(diamondAmount.toString(), "res/font/custom_font.fnt");
        lbDiamond.scale = 0.4;
        lbDiamond.anchorX = 0;
        lbDiamond.x = 50;
        lbDiamond.y = diamond.height/2;
        diamond.addChild(lbDiamond);

    },
    updateScrollView: function() {
        // cc.log("updateScrollView");
        // if (this._exited)
        //     return;
        // this._numberOfItem = [];
        // this._cells = [];
        // if (this._scrollView) {
        //     this._scrollView.removeFromParent();
        //     this._scrollView = null;
        // };

        // cc.log("updateScrollView");
        var scrollView = new ccui.ScrollView();
        this._scrollView = scrollView;
        numberOfCell = this._characterList.length;
    
        var viewSizeWidth = cc.winSize.width;
        var contentSizeWidth = numberOfCell * cc.winSize.width/2 + 500;
        contentSizeWidth = contentSizeWidth >= viewSizeWidth ? contentSizeWidth : viewSizeWidth;
        scrollView.setDirection(ccui.ScrollView.DIR_HORIZONTAL);
        scrollView.setTouchEnabled(true);

        scrollView.setInnerContainerSize(cc.size(contentSizeWidth, cc.winSize.height));
        scrollView.setContentSize(cc.size(viewSizeWidth, cc.winSize.height));
        scrollView.setScrollBarOpacity(255);
        scrollView.setSwallowTouches(false);
        scrollView.setBounceEnabled(true);
        scrollView.x = 0;
        scrollView.y = 100;
        for(var i = 0; i < numberOfCell; i ++){
            var characterCfg = this._characterList[i];
            var character = new AdiDogNode(true, characterCfg.name);
            scrollView.addChild(character);
            character.x = 500 + i * cc.winSize.width/2;
            character.y = 50;
            var unlocked = CharacterManager.getInstance().hasUnlocked(characterCfg.name);
            

            var characterName = new cc.LabelBMFont(characterCfg.name, "res/font/custom_font.fnt");
            characterName.x = character.width/2 - 300;
            characterName.y = character.height + 100;
            character.addChild(characterName);
        };
        this.addChild(scrollView);
        var container = new cc.Node();
        this._container = container;
        scrollView.addChild(container);
        return scrollView;
    },

    showCharacter: function(index) {
        cc.log("index: " + index);
        if(this._character) {
            this._character.removeFromParent();
            this._character = null;
        };

        var characterCfg = this._characterList[index];
        this._character = new AdiDogNode(true, characterCfg.name);
        this.addChild(this._character);
        this._character.x = cc.winSize.width/2;
        this._character.y = cc.winSize.height/2 - 100;
        var unlocked = CharacterManager.getInstance().hasUnlocked(characterCfg.name);
        var lbButton = "BUY";
        if(unlocked)
            lbButton = "Choose";

        cc.log("characterCfg.name: " + (CharacterManager.getInstance().getSelectedCharacter() == characterCfg.name));
        if(CharacterManager.getInstance().getSelectedCharacter() == characterCfg.name) {
            lbButton = "";
        };

        var characterName = new cc.LabelBMFont(characterCfg.name, "res/font/custom_font.fnt");
        characterName.x = this._character.width/2 - 300;
        characterName.y = this._character.height + 100;
        this._character.addChild(characterName);

        var button = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        button.x = this._character.width/2;
        button.y = -100;
        this._character.addChild(button, 9999);
        button.addClickEventListener(function(){
            cc.log("unlocked:  " + unlocked);
            if(!unlocked) {
                var buy = CharacterManager.getInstance().unlockCharacter(characterCfg.name);
                if(buy)
                    lb.setString("");
            }
            else {
                lb.setString("");
                CharacterManager.getInstance().selectCharacter(characterCfg.name);
            }
        });
        var lb = new cc.LabelBMFont(lbButton, "res/font/custom_font.fnt");
        lb.scale = 0.5;
        lb.x = button.width/2;
        lb.y = button.height/2;
        button.addChild(lb);
        if(!unlocked) {
            var price = characterCfg.price;
            var lbPrice =  new cc.LabelBMFont(price.toString(), "res/font/custom_font.fnt");
            lbPrice.scale = 0.4;
            lbPrice.x = button.width/2 - 20;
            lbPrice.y = - 20;
            button.addChild(lbPrice);
            var diamondIcon = new cc.Sprite("res/SD/diamond.png");
            diamondIcon.x = lbPrice.x + lbPrice.width/2 + 5;
            diamondIcon.y = lbPrice.y;
            button.addChild(diamondIcon);
        }
    }

    
});
var ShopScene = cc.Scene.extend({
    ctor: function(){
        this._super();
        var layer = new ShopScreenLayer();
        this.addChild(layer);
    }
});