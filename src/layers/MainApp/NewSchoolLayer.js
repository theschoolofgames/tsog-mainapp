var NewSchoolLayer = cc.Layer.extend({
    listener: null,

    ctor:function(){
        this._super();

        this._addBackGround();
        this._addNewSchool();
    },

    _addBackGround: function() {
        var bg = new cc.Sprite(res.Bg_school_jpg);
        bg.x = cc.winSize.width / 2;
        bg.y = cc.winSize.height / 2;
        this.addChild(bg);
    },

    _addNewSchool: function() {
        var holder = new cc.Layer();

        this.addChild(holder);

        var lb = new cc.LabelTTF("School Name", "Arial", 32);
        lb.color = cc.color.ORANGE;
        lb.x = holder.width/2 - lb.width;
        lb.y = holder.height/2 + lb.height;
        holder.addChild(lb);
        cc.log("lb width", lb.width/2);

        var fieldHolder = new cc.Sprite("#search_field.png");
        fieldHolder.x = holder.width/2 + fieldHolder.width/2;
        fieldHolder.y = lb.y;

        var tf = new ccui.TextField("Your School Name", "Arial", 26);

        tf.x = fieldHolder.width / 2;
        tf.y = fieldHolder.height / 2;

        tf.setTextColor(cc.color.GREEN);
        tf.setTouchSize(cc.size(fieldHolder.width, fieldHolder.height));
        tf.color = cc.color.RED;
        tf.setTouchAreaEnabled(true);
        tf.setMaxLengthEnabled(true);
        tf.setMaxLength(13);
        fieldHolder.addChild(tf);
        holder.addChild(fieldHolder);

        var btn = new ccui.Button("create-button.png","","");
        btn.x = holder.width/2;
        btn.y = holder.height/2 - btn.height;
        holder.addChild(btn);

        var self = this;
        var schoolData = DataManager.getInstance().getSchoolData();

        btn.addClickEventListener(function() {
            var newSchoolName = tf.getString();
            if (newSchoolName == null || newSchoolName == ""){
                cc.log("newSchoolName must be non-null");
                return;
            }

            for (var i = 0; i < schoolData.length; i++) {
                scName = schoolData[i].school_name.toUpperCase();
                var scNameWithoutSpace = scName.replace(/\s+/g, '');
                cc.log("scNameWithoutSpace: " + scNameWithoutSpace);

                if (scName.indexOf(newSchoolName.toUpperCase()) > -1 || scNameWithoutSpace.indexOf(newSchoolName.toUpperCase()) > -1){
                    cc.log("");
                    return;
                }

                var loadingLayer = Utils.addLoadingIndicatorLayer(true);
                loadingLayer.setIndicactorPosition(cc.winSize.width/2, cc.winSize.height/2);
                // if (success) 
                // NativeHelper.callNative("showMessage", ["Success", newSchoolName + " created successfully"])
                // remove indicator
                // Utils.removeLoadingIndicatorLayer();
                // else
                // NativeHelper.callNative("showMessage", ["Error", newSchoolName + " created failed"])
                return;
            }
        });
    }
});

var NewSchoolScene = cc.Scene.extend({
    ctor: function(){
        this._super();

        var layer = new NewSchoolLayer();
        this.addChild(layer);
    }
});