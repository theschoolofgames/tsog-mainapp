ShopScreenLayer = cc.LayerColor.extend({
    _characterList: null,
    _index : 0,
    _character : null,
    _touchPos: null,
    _moveRight: null,
    _isTouchMoved: false, 
    _showOtherCharacter: null,
    _heathy: null,
    _name : null,
    _oldPostion: null,
    _arrowleft: null,
    _arrowright: null,

    ctor: function() {
        this._super(cc.color(255,255,255,255));
        this.addBackToHomeScene();
        this.addCurrency();
        this._characterList = CharacterManager.getInstance().getCharacterList();
        cc.log("characterList: " + JSON.stringify(this._characterList));
        this.addArrows();
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
        this._isTouchMoved = false;
        this._showOtherCharacter = false;
        this._oldPostion = this._character.getPosition();
        this._touchPos = touch.getLocation();
            return true;
    },

    onTouchMoved: function(touch, event){
        cc.log("onTouchMoved");
        var touchPos = touch.getLocation();
        var delta = cc.pSub(touchPos, this._touchPos);
        cc.log(cc.pLengthSQ(delta));
        position = cc.p(this._oldPostion.x + delta.x, this._character.y);
        this._character.setPosition(position);
        if(cc.pLengthSQ(delta) > 10000) {
            this._isTouchMoved = true;
        };
        if(this._touchPos.x > touchPos.x)
            this._moveRight = false;
        else this._moveRight = true;
    },

    onTouchEnded:function(touch, event) {
        cc.log("onTouchEnded: " + this._isTouchMoved);
        var position = null;
        if(this._isTouchMoved) {
            if(this._moveRight && this._index > 0) {
                this._index -= 1;
                this._showOtherCharacter = true;
                position = cc.p(this._character.x + 600, this._character.y);
            }
            else if(!this._moveRight && this._index < this._characterList.length - 1) {
                this._showOtherCharacter = true;
                this._index += 1;
                position = cc.p(this._character.x - 600, this._character.y);
            }
            cc.log("this._index: " + this._index);
            var self  = this;
            if(this._showOtherCharacter) {
                this._character.runAction(cc.sequence(
                    cc.spawn(
                        cc.fadeTo(0.5, 0),
                        cc.moveTo(0.5, position)    
                    ),
                    cc.callFunc(function(){
                        self.showCharacter(self._index);
                    })
                ));
            }
            else
                this._character.setPosition(this._oldPostion);
            // this.showCharacter(this._index);
        }
        else if (!this._isTouchMoved)
            this._character.setPosition(this._oldPostion);
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
            
            var name = characterCfg.name.toUpperCase();
            // name[0] = name[0].toUpCase();
            var characterName = new cc.LabelBMFont(name, "res/font/custom_font.fnt");
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
        if(index == 0) {
            this._arrowleft.setVisible(false);
            this._arrowright.setVisible(true);
        } else if  (index == this._characterList.length - 1) {
            this._arrowleft.setVisible(true);
            this._arrowright.setVisible(false);
        } else if  (0 < index < this._characterList.length - 1) {
            this._arrowleft.setVisible(true);
            this._arrowright.setVisible(true);
        };
        cc.log("index: " + index);
        if(this._character) {
            this._character.removeFromParent();
            this._heathy.removeFromParent();
            this._name.removeFromParent();
            this._button.removeFromParent();
            this._heathy = null,
            this._name = null,
            this._character = null;
            this._button = null;
        };

        var characterCfg = this._characterList[index];
        this._character = new AdiDogNode(true, characterCfg.name);
        this.addChild(this._character);
        // this._character.opacity = 100;
        this._character.x = 300;
        this._character.y = cc.winSize.height/2 - 100;
        var unlocked = CharacterManager.getInstance().hasUnlocked(characterCfg.name);
        var lbButton = "";
        if(unlocked)
            lbButton = "Choose";

        cc.log("characterCfg.name: " + (CharacterManager.getInstance().getSelectedCharacter() == characterCfg.name));
        if(CharacterManager.getInstance().getSelectedCharacter() == characterCfg.name) {
            lbButton = "";
        };
        var name = characterCfg.name.toUpperCase();
        var characterName = new cc.LabelBMFont("" + name, "res/font/custom_font.fnt");
        characterName.scale = 0.4;
        characterName.anchorX = 0;
        characterName.x = cc.winSize.width/2;
        characterName.y = cc.winSize.height/2 + 100;
        this.addChild(characterName);
        this._name = characterName;

        var characterHeathy = new cc.LabelBMFont("", "res/font/custom_font.fnt");
        characterHeathy.scale = 0.4;
        characterHeathy.anchorX = 0;
        characterHeathy.x = cc.winSize.width/2;;
        characterHeathy.y = cc.winSize.height/2 + 50;
        for(var i = 0; i < characterCfg.heathy; i ++) {
            var heart = new cc.Sprite("res/SD/diamond.png");
            heart.scale = 1/characterHeathy.scale - 0.4;
            heart.x = characterHeathy.width + 50 + i * 120;
            heart.y = characterHeathy.height/2;
            characterHeathy.addChild(heart);
        };
        this.addChild(characterHeathy);
        this._heathy = characterHeathy;
        var button = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        button.x = cc.winSize.width/2 + 100;
        button.y = cc.winSize.height/2 - 100;
        this._button = button;
        var self = this;
        this.addChild(button, 9999);
        button.addClickEventListener(function(){
            self._character.adiJump();
            cc.log("unlocked:  " + unlocked);
            if(!unlocked) {
                var buy = CharacterManager.getInstance().unlockCharacter(characterCfg.name);
                if(buy) {
                    lbPrice.removeFromParent();
                    lb.setString("Choose");
                }

            }
            else {
                lb.setString("");
                CharacterManager.getInstance().selectCharacter(characterCfg.name);
            }
        });
        var lb = new cc.LabelBMFont(lbButton, "res/font/custom_font.fnt");
        lb.scale = 0.7;
        lb.x = button.width/2;
        lb.y = button.height/2;
        button.addChild(lb);
        if(!unlocked) {
            var price = characterCfg.price;
            var lbPrice =  new cc.LabelBMFont(price.toString(), "res/font/custom_font.fnt");
            lbPrice.scale = 0.7;
            lbPrice.x = button.width/2 - 20;
            lbPrice.y = button.height/2;;
            button.addChild(lbPrice);
            var diamondIcon = new cc.Sprite("res/SD/diamond.png");
            diamondIcon.scale = 1/ lbPrice.scale;
            diamondIcon.x = lbPrice.width + 50;
            diamondIcon.y = lbPrice.height/2;
            lbPrice.addChild(diamondIcon);
        }
    },

    addArrows: function() {
        this._arrowleft = new cc.Sprite("#navigate-1.png");
        this._arrowleft.x = 100;
        this._arrowleft.y = cc.winSize.height/2;
        this.addChild(this._arrowleft);
        this._arrowleft.rotation = 90;
        Utils.runAnimation(this._arrowleft, "navigate", 0.2, 2, true, 0.25);

        this._arrowright = new cc.Sprite("#navigate-1.png");
        this._arrowright.x = cc.winSize.width - 100;
        this._arrowright.y = cc.winSize.height/2;
        this.addChild(this._arrowright);
        this._arrowright.rotation = - 90;
        Utils.runAnimation(this._arrowright, "navigate", 0.2, 2, true, 0.25);
    }

    
});
var ShopScene = cc.Scene.extend({
    ctor: function(){
        this._super();
        var layer = new ShopScreenLayer();
        this.addChild(layer);
    }
});