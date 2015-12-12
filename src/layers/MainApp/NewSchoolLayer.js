var NewSchoolLayer = cc.Layer.extend({
    listener: null,

    ctor:function(){
        this._super();

        this._addBackGround();
        this._addNewSchool();
        this._addBackBtn();
    },

    _addBackGround: function() {
        var bg = new cc.Sprite(res.Bg_school_jpg);
        bg.x = cc.winSize.width / 2;
        bg.y = cc.winSize.height / 2;
        this.addChild(bg);
    },

    _addNewSchool: function() {
        var holder = new cc.Layer();
        holder.x = -100;
        holder.y = 120;

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
            if (newSchoolName == null || newSchoolName.trim() == ""){
                NativeHelper.callNative("showMessage", ["Missing field", "Please enter school name"]);
                return;
            }

            var loadingLayer = Utils.addLoadingIndicatorLayer(true);

            RequestsManager.getInstance().createSchool(newSchoolName.trim(), function(succeed, data) {
                Utils.removeLoadingIndicatorLayer();

                if (succeed) {
                    schoolData.unshift(data);
                    DataManager.getInstance().setSchoolData(schoolData);
                    
                    SegmentHelper.track(SEGMENT.SELECT_SCHOOL, 
                        { 
                            school_id: data.school_id, 
                            school_name: data.school_name 
                        });
                    
                    KVDatabase.getInstance().set(STRING_SCHOOL_ID, data.school_id);
                    KVDatabase.getInstance().set(STRING_SCHOOL_NAME, data.school_name);
                    cc.director.replaceScene(new AccountSelectorScene());

                    NativeHelper.callNative("showMessage", ["Created school successfully!", "Now you can create students for your new school"]);
                } else {
                     NativeHelper.callNative("showMessage", ["Error", data.message]);
                 }
            });
        });
    },

    _addBackBtn: function() {
        var bb = new ccui.Button("back.png",
                                 "back-pressed.png",
                                 "",
                                 ccui.Widget.PLIST_TEXTURE);

        bb.x = bb.width ;
        bb.y = cc.winSize.height - bb.height*2/3;
        bb.addClickEventListener(function() {
            cc.director.replaceScene(new SchoolSelectorScene());
        });
        this.addChild(bb);
    },
});

var NewSchoolScene = cc.Scene.extend({
    ctor: function(){
        this._super();

        var layer = new NewSchoolLayer();
        this.addChild(layer);
    }
});