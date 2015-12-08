var AnimatedEffect = cc.Sprite.extend({

    _animFrames: null,
    _effectName: null,
    _effectNode: null,
    _effectDelay: 0,
    _effectFrames: 0,
    _loop: false,

    ctor: function(effectName, effectDelay, effectFrames, loop) {
        this._super("#" + effectName + "-1.png");

        this._effectName = effectName;
        this._effectFrames = effectFrames;
        this._effectDelay = effectDelay;
        this._loop = loop;

        this._addObjectEffect();
    },

    _addObjectEffect: function() {
        this._addAnimationFrames();
        var effectAnimation = new cc.Animation(this._animFrames, this._effectDelay);

        var self = this;
        var actions = [cc.animate(effectAnimation)];
        var effectAction = null;
        if (!this._loop) {
            actions.push(cc.callFunc(function() { self.removeFromParent(); } ));
            effectAction = cc.sequence(actions);
        } else
            effectAction = cc.repeatForever(cc.sequence(actions));

        this.runAction(effectAction);
    },

    _addAnimationFrames: function() {
        var animFrames = [];
        for (var i = 1; i < this._effectFrames; i++) {
            var str = this._effectName + "-" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            animFrames.push(frame);
        }
        this._animFrames = animFrames;
    },

    _addEffectNode: function() {
        var effectNode = new cc.Sprite("#" + this._effectName + "-1.png");
        effectNode.x = this._object.width/2;
        effectNode.y = effectNode.height/2 - 10;
        if (this._loop)
            effectNode.y = this._object.height/2;

        this._object.addChild(effectNode, 10);

        this._effectNode = effectNode;
    }

});

AnimatedEffect.create = function(parent, effectName, effectDelay, effectFrames, loop) {
    var effect = new AnimatedEffect(effectName, effectDelay, effectFrames, loop);
    effect.x = parent.width/2;
    effect.y = effect.height/2 - 10;
    if (loop)
        effect.y = parent.height/2;

    parent.addChild(effect, 10);

    return effect;
}