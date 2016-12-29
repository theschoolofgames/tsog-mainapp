var ARAlphabetWorker = cc.Class.extend({

    ctor: function(player, array, hudLayer) {
        this._player = player;
        this._array = array;
        this._hudLayer = hudLayer;
    },

    update: function(dt) {

        for (var i = this._array.length-1; i >= 0; i--) {
            let delta = cc.pSub(this._player.getPosition(), this._array[i].getPosition());

            if (this._player.hasBoostFlag(ARMagnet.getBoostFlag()) && 
                cc.pLengthSQ(delta) < 200*200) { // 50 * 50

                this._array[i].setPosition(cc.pLerp(this._player.getPosition(), this._array[i].getPosition(), 0.9));
            }

            if (cc.rectIntersectsRect(this._player.getBoundingBox(), this._array[i].getBoundingBox())) {
                var addedCoin = this._player.hasBoostFlag(ARDouble.getBoostFlag()) ? 2 : 1;

                var cameraPos = cc.Camera.getDefaultCamera().getPosition();
                var ratioX = (this._player.x - cameraPos.x + cc.winSize.width/2);
                var ratioY = (this._player.y - cameraPos.y + cc.winSize.height/2);

                this._hudLayer.popGold(addedCoin, ratioX, ratioY);
                CurrencyManager.getInstance().incDiamond(addedCoin);

                var object = new cc.LabelBMFont("+" + addedCoin.toString(), res.CustomFont_fnt);
                object.scale = 0.5;
                object.setPosition(this._array[i].getPosition());
                this._array[i].parent.addChild(object, AR_PLAYER_ZODER+1);

                object.runAction(cc.sequence(
                        cc.spawn(
                            cc.moveBy(0.8, cc.p(0, 100)),
                            cc.fadeOut(0.8)
                        ),
                        cc.callFunc(sender => sender.removeFromParent())
                    ));

                this._array[i].removeFromParent();
                this._array.splice(i, 1);
            }
        }
    }
})