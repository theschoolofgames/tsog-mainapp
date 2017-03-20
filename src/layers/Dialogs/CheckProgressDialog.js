var CheckProgressDialog = Dialog.extend({
	background: null,
	ctor: function() {
		this._super();

		this.addBackground();
		this.addContent();
		this.addButton();
	},

	addBackground: function() {
		var bg = new cc.Sprite("res/SD/grownup/dialog_bg.png");
        bg.x = cc.winSize.width/2;
        bg.y = cc.winSize.height/2;
        this.addChild(bg);
        this.background = bg;

        var ribbon = new cc.Sprite("res/SD/grownup/ribbon.png");
        ribbon.x = bg.width/2;
        ribbon.y = bg.height - 10;
        bg.addChild(ribbon);
        var title = new cc.LabelBMFont(localizeForWriting("Check Progress"), "res/font/grownupcheckfont-export.fnt");
        title.scale = 0.5;
        title.x = ribbon.width/2;
        title.y = ribbon.height/2 + 23;
        ribbon.addChild(title);
        this._ribbon = ribbon;
	},

	addContent: function() {
		var title = new cc.LabelBMFont(localizeForWriting("Check real time\n assessment report"), "res/font/grownupcheckfont-export.fnt");
        title.scale = 0.5;
        title.textAlign = cc.TEXT_ALIGNMENT_CENTER;
        title.x = this.background.width/2;
        title.y = this.background.height* 0.75;
        this.background.addChild(title);
	},

	addButton: function() {
		var b = new ccui.Button("btn_save_progress.png", "btn_save_progress_pressed.png", "", ccui.Widget.PLIST_TEXTURE);
		b.scale = 0.8;
		b.x = this.background.width/2;
		b.y = b.height;
		this.background.addChild(b);

        var checkProgressCustomEvent = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: "checkProgressCustomEvent",
            callback: function(event){
                cc.director.replaceScene(new HomeScene());
            }.bind(this)
        });
        cc.eventManager.addListener(checkProgressCustomEvent, 1);

		b.addClickEventListener(function() {
			var currentScene = this.parent;
			this.close();
			currentScene.addChild(new GrownUpCheckDialog(function() {
				cc.director.replaceScene(new ProgressTrackerScene());
			}));
		}.bind(this));

		var title = new cc.LabelBMFont("OK", res.HomeFont_fnt);
		title.scale = 0.5;
		title.x = b.width/2;
		title.y = b.height/2 + 5;
		b.addChild(title);

		b = new ccui.Button(res.Button_x_normal_png, res.Button_x_pressed_png, "");
		b.x = this.background.width - b.width/2;
		b.y = this.background.height - b.height/2;
		this.background.addChild(b);

		b.addClickEventListener(function() {
	       this.close();
		}.bind(this));
	},
});

CheckProgressDialog._instance = null;


CheckProgressDialog.show = function() {
    KVDatabase.getInstance().set("game_new_session", false);
	cc.director.getRunningScene().addChild(new CheckProgressDialog(), 99999);
}