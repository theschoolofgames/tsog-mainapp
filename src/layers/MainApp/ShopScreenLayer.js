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
    _showDialog: true,

    _hudLayer: null,
    _canTouchArrow: true,

    ctor: function() {
        this._super(cc.color(255,255,255,255));
        var bg = new cc.Sprite("res/SD/BG-shop.jpg");
        bg.x = cc.winSize.width/2;
        bg.y = cc.winSize.height/2;
        bg.scale = cc.winSize.height/bg.height;
        this._scale = bg.scale;
        this.addChild(bg, 0);
        // this.addBackToHomeScene();
        this._characterList = CharacterManager.getInstance().getCharacterList();

        // cc.log("characterList: " + JSON.stringify(this._characterList));
        this.addArrows();
        this.showCharacter(this._index);
        // this.updateScrollView();
        // cc.eventManager.addListener({
        //         event: cc.EventListener.TOUCH_ONE_BY_ONE,
        //         swallowTouches: true,
        //         onTouchBegan: this.onTouchBegan.bind(this),
        //         onTouchMoved: this.onTouchMoved.bind(this),
        //         onTouchEnded: this.onTouchEnded.bind(this),
        // }, this);

        this._addHudLayer();
        CurrencyManager.getInstance().incCoin(10000);
        CurrencyManager.getInstance().incDiamond(10000);
        this._hudLayer.updateBalance();
    },

    _addHudLayer: function() {
        this._hudLayer = new ShopHUDLayer(this);
        this.addChild(this._hudLayer);
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
                    // cc.spawn(
                        cc.fadeTo(0.5, 0),
                        // cc.moveTo(0.5, position)    
                    // ),
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
        var button = new ccui.Button("back.png", "back-pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        button.x = cc.winSize.width/2 - 300;
        button.y = cc.winSize.height - button.height/2 - 10;
        this.addChild(button, 9999);
        button.addClickEventListener(function(){
            cc.director.runScene(new HomeScene());
        });
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
        // this.showFinger(index);
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
        this._character.x = cc.winSize.width/2 - 200;
        this._character.y = cc.winSize.height/2 - 300 * this._scale;
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
        characterName.x = this._character.width/2 + 185;
        characterName.y = cc.winSize.height/2 + 50;
        this._character.addChild(characterName);
        this._name = characterName;

        var characterHeathy = new cc.LabelBMFont("", "res/font/custom_font.fnt");
        characterHeathy.scale = 0.4;
        characterHeathy.anchorX = 0;
        characterHeathy.x = this._character.width/2 + 185;
        characterHeathy.y = cc.winSize.height/2;
        for(var i = 0; i < characterCfg.heathy; i ++) {
            var heart = new cc.Sprite("#heart-1.png");
            heart.scale = 1/characterHeathy.scale - 0.4;
            heart.x = characterHeathy.width + 50 + i * 120;
            heart.y = characterHeathy.height/2;
            characterHeathy.addChild(heart);
        };
        this._character.addChild(characterHeathy);
        this._heathy = characterHeathy;
        var button = new ccui.Button("button-unlock.png", "button-unlock-pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        button.x = cc.winSize.width/2 + 150;
        button.y = cc.winSize.height/2 - 100;
        if(unlocked) {
            button.x = cc.winSize.width/2 + 80;
            button.loadTextures("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        }
        if(characterCfg.name == CharacterManager.getInstance().getSelectedCharacter())
            button.setVisible(false);
        this._button = button;
        var self = this;
        this.addChild(button, 10);
        button.addClickEventListener(function(){
            cc.log("unlocked:  " + unlocked);
            unlocked = CharacterManager.getInstance().hasUnlocked(characterCfg.name);
            if(!unlocked) {
                var buy = CharacterManager.getInstance().unlockCharacter(characterCfg.name);
                if(buy) {
                    cc.log("button.x");
                    button.x = cc.winSize.width/2;
                    lbPrice.removeFromParent();
                    lb.setString("Choose");
                    self._character.adiJump();
                    self._hudLayer.updateBalance();
                    button.loadTextures("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
                }
                else {
                    self._character.adiShakeHead();
                    var diamondsNeed = characterCfg.price - CurrencyManager.getInstance().getDiamond();
                    var text = "You need " + diamondsNeed + " diamonds to unlock this charater from Alpharacing Game!";
                    if(self._showDialog) {
                        self._showDialog = false;
                        self.runAction(cc.sequence(
                            cc.delayTime(1),
                            cc.callFunc(function(){
                                self.addChild(new AlertDialog(text), 99999);
                            })
                        ));
                    }
                }
            }
            else {
                lb.setString("");
                self._character.adiJump();
                CharacterManager.getInstance().selectCharacter(characterCfg.name);
                self.runAction(cc.sequence(
                    cc.delayTime(1),
                    cc.callFunc(function(){
                        cc.director.runScene(new TalkingAdiScene());
                    })
                ));
            }
        });
        var lb = new cc.LabelBMFont(lbButton, res.HomeFont_fnt);
        lb.scale = 0.7;
        lb.x = button.width/2;
        lb.y = button.height/2;
        button.addChild(lb);
        if(!unlocked) {
            var price = characterCfg.price;
            var lbPrice =  new cc.LabelBMFont(price.toString(), res.HomeFont_fnt);
            lbPrice.scale = 0.7;
            lbPrice.x = button.width/2 - 20;
            lbPrice.y = button.height/2 + 8;
            button.addChild(lbPrice);
        }
    },

    showFinger: function(index) {
        if(this._fingerToRight)
            this._fingerToRight.removeFromParent();
        if(this._fingerToLeft)
            this._fingerToLeft.removeFromParent();
        this._fingerToLeft = null;
        this._fingerToRight = null;

        if(index == 0 ) {
            this._fingerToRight = new TutorialLayer(cc.p(cc.winSize.width/3, 100),cc.p(50,100));
            this.addChild(this._fingerToRight, 10);
        }
        else if(index == this._characterList.length - 1) {
            this._fingerToLeft = new TutorialLayer(cc.p(cc.winSize.width/3 * 2,100), cc.p(cc.winSize.width - 50, 100));
            this.addChild(this._fingerToLeft, 10);
        }
        else if(0 < index < this._characterList.length - 1) {
            this._fingerToLeft = new TutorialLayer(cc.p(cc.winSize.width/3 * 2,100), cc.p(cc.winSize.width - 50, 100));
            this.addChild(this._fingerToLeft, 10);
            this._fingerToRight = new TutorialLayer(cc.p(cc.winSize.width/3, 100),cc.p(50,100));
            this.addChild(this._fingerToRight, 10);
        };

    },

    _pressArrow: function(){
        var self  = this;
        var mask = new  cc.LayerColor(cc.color(0,0,0,0));
        mask.width = cc.winSize.width;
        mask.height = cc.winSize.height;
        this._mask = mask;
        this.addChild(this._mask, 9999);

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function(touch, event) { return true; }
        }, mask);
        cc.log("_pressArrow");
        this._character.runAction(cc.sequence(
            // cc.spawn(
                cc.fadeOut(0.5),
                // cc.moveTo(0.5, position)    
            // ),
            cc.callFunc(function(){
                mask.removeFromParent();
                self.showCharacter(self._index);
            })
        ));
    },

    addArrows: function() {
        var self = this;
        this._arrowleft = new ccui.Button("navigate.png", "", "", ccui.Widget.PLIST_TEXTURE);
        this._arrowleft.x = 100;
        this._arrowleft.y = cc.winSize.height/2;
        this.addChild(this._arrowleft);
        this._arrowleft.addClickEventListener(function(){
            if(self._index == 0)
                return;
            self._index --;
            self._pressArrow();
        });
        // Utils.runAnimation(this._arrowleft, "navigate", 0.3, 2, true, 0.3);

        this._arrowright = new ccui.Button("navigate.png", "", "", ccui.Widget.PLIST_TEXTURE);
        this._arrowright.x = cc.winSize.width - 100;
        this._arrowright.y = cc.winSize.height/2;
        this.addChild(this._arrowright);
        this._arrowright.rotation = - 180;
        this._arrowright.addClickEventListener(function(){
            if(self._index == self._characterList.length - 1)
                return;
            self._index ++;
            self._pressArrow();
        });
        // Utils.runAnimation(this._arrowright, "navigate", 0.3, 2, true, 0.3);
    },
});
var ShopScene = cc.Scene.extend({
    ctor: function(){
        this._super();
        var layer = new ShopScreenLayer();
        this.addChild(layer);
    }
});