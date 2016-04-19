var TutorialLayer = cc.Layer.extend({
	_objects: null,
	_object: null,
	_shadeObjects: null,
	_shadeObject: null,
	_animFrames: null,
	_effectNode:null,
    _shouldShuffle: false,

	ctor: function(objects, shadeObjects, shouldShuffle /* = false*/) {
		this._super();
		this._objects = objects;
		this._shadeObjects = shadeObjects;
        this._shouldShuffle = shouldShuffle;
		this.getRandomObject();
		if (this._shadeObjects == null)
			this.showTappingTutorial();
		else 
            this.showDraggingTutorial();
	},

	_addAnimationFrames: function() {
        var animFrames = [];
        for (var i = 1; i <= 2; i++) {
            var str = "finger" + "-" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            animFrames.push(frame);
        }
        this._animFrames = animFrames;
    },

    _addEffectNode: function() {
        var effectNode = new cc.Sprite("#finger-1.png");
        effectNode.x = this._object.x;
        effectNode.y = this._object.y;
		effectNode.anchorX = 0.3;
		effectNode.anchorY = 0.7; 
        this.addChild(effectNode, 999);

        this._effectNode = effectNode;
    },

    showTappingTutorial: function() {
        this._addAnimationFrames();
        this._addEffectNode();
        // cc.log("this._animFrames: " + JSON.stringify(this._animFrames))
        var effectAnimation = new cc.Animation(this._animFrames ,0.5);        
        var effectNodeAction = cc.repeatForever(
                                    cc.sequence(
                                    	cc.delayTime(0.3),
                                        cc.animate(effectAnimation)
                                    )
                                );
        this._effectNode.runAction(effectNodeAction);
    },
 	showDraggingTutorial: function() {
 		var self = this;
 		var finger = new cc.Sprite("#finger-1.png");
  		finger.x = this._object.x;
 		finger.y = this._object.y;
 		finger.anchorX = 0.3;
 		finger.anchorY = 0.7;
 		this.addChild(finger);
 		var correctPos = this._shadeObject.getPosition();

 		var repeatAction = cc.sequence(
 			cc.delayTime(0.5),
 			cc.callFunc(function(){
 				finger.setSpriteFrame("finger-2.png");
 			}),
 			cc.delayTime(0.5),
			cc.spawn(
				cc.moveTo(1, correctPos),
				cc.fadeOut(1.2)
			),
			cc.delayTime(0.5),
			cc.callFunc(function() {
				finger.x = self._object.x;
				finger.y = self._object.y;
				finger.opacity = 255;	 					
				finger.setSpriteFrame("finger-1.png");
			})
		)

 		finger.runAction(cc.repeatForever(repeatAction));
 	},

	getRandomObject: function(){
        if (this._shouldShuffle) {
            var i = Math.floor(Math.random() * (this._objects.length - 1));
            this._object = this._objects[i];
            if(this._shadeObjects)
                this._shadeObject = this._shadeObjects[i]
        } else {
            this._object = this._objects[0];
            if(this._shadeObjects)
                this._shadeObject = this._shadeObjects[0];
        }
	},



});