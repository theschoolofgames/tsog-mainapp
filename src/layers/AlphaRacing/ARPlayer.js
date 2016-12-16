var ARPlayer = cc.PhysicsSprite.extend({

    _space: null,
    _body: null,

    _mass: 10,

    _desiredVel: 200,

    ctor: function(space) {
        this._super("#adi_run1.png");
        this.scale = 0.2;

        this._space = space;

        cc.log("ARPlayer: width: " + this.width * this.scaleX);
        cc.log("ARPlayer: height: " + this.height * this.scaleY);

        var body = space.addBody(new cp.Body(this._mass, Infinity));
        body.setPos(cc.p(50, cc.winSize.height * 0.8));
        this._body = body;

        var shape = space.addShape(new cp.BoxShape(body, this.width * this.scaleX, this.height * this.scaleY));
        shape.setFriction(0);
        shape.setElasticity(0);
        shape.setCollisionType(CHIPMUNK_COLLISION_TYPE_DYNAMIC);

        // this.setIgnoreBodyRotation(false);

        this.setBody(body);

        StateMachine.create({
            target: this,
            initial: 'running',
            events: [
                { name: 'run',      from: ['running', 'jumping'],           to: 'running' },
                { name: 'jump',     from: ['running', 'idling'],            to: 'jumping' },
                { name: 'die',      from: ['running', 'jumping'],           to: 'died' },
            ]
        });
    },

    update: function(dt) {

        var vel = this.getBody().getVel();
        var velChange = this._desiredVel - vel.x;
        var impulse = velChange * this.getBody().m;

        if (this.current == "running") {
            this.getBody().applyImpulse(cc.p(impulse, 0), cc.p());
        } else if (this.current == "jumping") {
            this.getBody().applyForce(cc.p(impulse, 0), cc.p());
        }
    },

    getBody: function() {
        return this._body;
    },

    getVelocity: function() {
        return this.getBody().getVel();
    },

    // StateMachine Callbacks
    onrun: function(event, from, to, msg) {
        cc.log("onrun " + event + " " + from + " " + to + " " + msg);
    },

    onjump: function(event, from, to, msg) {
        this.getBody().applyImpulse(cc.p(0, 5000), cc.p());
        cc.log("onjump " + event + " " + from + " " + to + " " + msg);
    },

    ondie: function(event, from, to, msg) {
        cc.log("ondie " + event + " " + from + " " + to + " " + msg);
    },

    onrunning: function(event, from, to) {
        cc.log("onrunning " + event + " " + from + " " + to);
    },

    onjumping: function(event, from, to) {
        cc.log("onjumping " + event + " " + from + " " + to);
    },

    ondied: function(event, from, to) {
        cc.log("ondied " + event + " " + from + " " + to);
    }
});