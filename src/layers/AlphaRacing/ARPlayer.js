var ARPlayer = cc.Layer.extend({

	_velocity: cc.p(0,0),
	_onGround: false,
	_onRightCollision: false,
	_gravity: cc.p(0.0, -650.0),
	_collisionBoundingBox: null,
	_desiredPosition: cc.p(100,400),
	_forwardMarch: false,
	_mightAsWellJump: false,
	_adiDog: null,
	spriteSheet:null,
	runningAction:null,
	sprite:null,
	runAnimationFrames: [],
	isRunningAnim: false,

	ctor: function () {
		this._super();
		this.setAnchorPoint(0.5,0.5);
		this.setScale(Utils.screenRatioTo43() * 0.15);
        this.setPosition(cc.p(200,450));
        this.setDesiredPosition(cc.p(200,450));
        this.setContentSize(cc.size(65, 100));
		this._collisionBoundingBox = cc.rect(0, 0, this.getContentSize().width, this.getContentSize().height);
		
		return this;
	},

	onEnter: function() {
        this._super();        
        this.configAnimation();
    },

    onExit: function() {
    	this._super();
        this.unscheduleUpdate();
    },

    reduceHealth: function() {
        cc.log("ARPlayer: reduceHealth");
    },
	
 	updatea: function(dt) { 	
	 	let jumpForce = cc.p(0.0, 800.0);
	    let jumpCutoff = 450.0;
	    
	    if (this._mightAsWellJump && this._onGround) {
	        this._velocity = cc.pAdd(this._velocity, jumpForce);
	        // Sound jump
	        // console.log("Going to Jump");
	        this.jumpAnimation();
	    } 
	    else if (!this._mightAsWellJump && this._velocity.y > jumpCutoff) {
	        this._velocity = cc.p(this._velocity.x, jumpCutoff);
	        // console.log("Going to Jump 1");
	        // this.jumpAnimation();
	    }
	    
	    let forwardMove = cc.p(1200.0, 0.0);
	    let forwardStep = cc.p(0,0);
	    if (!this._onRightCollision)
	    	forwardStep = cc.pMult(forwardMove, dt);
	    
	    this._velocity = cc.p(this._velocity.x * 0.90, this._velocity.y);
	    
        this._velocity = cc.pAdd(this._velocity, forwardStep);
	    
	    let minMovement = cc.p(0.0, -450.0);
	    let maxMovement = cc.p(220.0, 550.0);

	    let gravityStep = cc.p(0,0);
	    if (!this._onGround)
	    	gravityStep = cc.pMult(this._gravity, dt);

	    this._velocity = cc.pClamp(this._velocity, minMovement, maxMovement);
    
	    this._velocity = cc.pAdd(this._velocity, gravityStep);
	    
	    let velocityStep = cc.pMult(this._velocity, dt);
	    // velocityStep = cc.p(velocityStep.x, velocityStep.y)

 		let position = cc.p(this.getPosition().x, this.getPosition().y);
 		this._desiredPosition = cc.pAdd(position, velocityStep);
 	},

 	configAnimation: function() {
 		cc.spriteFrameCache.addSpriteFrames(res.AdiDog_Run_plist);
        this.sprite = new cc.Sprite("#adi_run1.png");
        this.sprite.attr({x:10, y:65, anchorX: 1, anchorY: 1});
        this.addChild(this.sprite);

        this.runAnimationFrames = [];
        for (var i = 1; i <= 4; i++) {
            var str = "adi_run" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            this.runAnimationFrames.push(frame);
        }

        var animation = new cc.Animation(this.runAnimationFrames, 0.1);
        this.runningAction = new cc.RepeatForever(new cc.Animate(animation));
        // this.sprite = new cc.Sprite("#adi_run1.png");
        this.sprite.runAction(this.runningAction);
        // this.spriteSheet.addChild(this.sprite);
 	},

 	jumpAnimation: function() {
 		this.sprite.stopAllActions();
 		this.sprite.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("adi_jump1.png"));
 		this.isRunningAnim = false;
 	},

 	runAnimation: function() {
 		if (this.isRunningAnim)
 			return;

 		var animation = new cc.Animation(this.runAnimationFrames, 0.1);
        this.runningAction = new cc.RepeatForever(new cc.Animate(animation));
        this.sprite.runAction(this.runningAction);
        this.isRunningAnim = true;
 	},

 	setGravity: function(gravity) {
 		this._gravity = gravity;
 	},

 	getCollisionBoundingBox: function() {
 		let boundingBox = this.getContentSize();
 		
 		let boundingBoxRect = cc.rect(
 			this.getPosition().x - boundingBox.width / 2, 
 			this.getPosition().y - boundingBox.height / 2, 	
 			boundingBox.width, 
 			boundingBox.height);
 		return boundingBoxRect;
 	},

 	onGround: function() {
 		return this._onGround;
 	},

 	setOnGround: function(onGround) {
 		this._onGround = onGround;
 	},

 	onRightCollision: function() {
 		return this._onRightCollision;
 	},

 	setOnRightCollision: function(onRightCollision) {
 		this._onRightCollision = onRightCollision;
 	},

 	getVelocity: function() {
 		return this._velocity;
 	},

 	setVelocity: function(velocity) {
 		this._velocity = velocity;
 	},

 	getDesiredPosition: function(){
 		return this._desiredPosition;
 	},

 	setDesiredPosition: function(desiredPosition) {
 		// cc.log("setDesiredPosition: %d, %d", desiredPosition.x, desiredPosition.y);
 		this._desiredPosition = desiredPosition;
 	},

 	getForwardMarch: function(){
 		return this._forwardMarch;
 	},

 	setForwardMarch: function(forwardMarch) {
 		this._forwardMarch = forwardMarch;
 	},

 	getMightJump: function(){
 		return this._mightAsWellJump;
 	},

 	setMightJump: function(mightAsWellJump) {
 		this._mightAsWellJump = mightAsWellJump;
 	},
});