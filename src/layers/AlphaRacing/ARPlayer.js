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

	_health: 1,

	_lbHealth: null,

    _boostState: ARBooster.State.NONE,

	ctor: function () {
		this._super();
		this.setScale(Utils.screenRatioTo43() * 0.15);
        this.setPosition(cc.p(200,450));
        this.setDesiredPosition(cc.p(200,450));
        this.setContentSize(cc.size(65, 100));
		this._collisionBoundingBox = cc.rect(0, 0, this.getContentSize().width, this.getContentSize().height);
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

    die: function() {
    	var event = new cc.EventCustom(EVENT_AR_GAMEOVER);
    	cc.eventManager.dispatchEvent(event);
    	this.rotation = -90;
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

 	},

 	jumpAnimation: function() {

 	},

 	runAnimation: function() {

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

    // BOOSTER STATE
    // Follow up this one: http://www.alanzucconi.com/2015/07/26/enum-flags-and-bitwise-operators/
    setBoostFlag: function(flag) {
        this._boostState |= flag;
    },

    unsetBoostFlag: function(flag) {
        this._boostState &= ~flag;
    },

    hasBoostFlag: function(flag) {
        return (this._boostState & flag) == flag;
    },

    toggleBoostFlag: function(flag) {
        this._boostState ^= flag;
    }
});
