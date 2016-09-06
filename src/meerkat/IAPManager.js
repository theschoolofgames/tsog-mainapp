var IAPManager = cc.Class.extend({

    purchaseCallback: null,

    ctor: function () {
        cc.assert(IAPManager._instance == null, "can be instantiated once only");
    },
    
    getLastestProductData: function() {
        sdkbox.IAP.refresh();
    },

    purchase: function(name) {
        sdkbox.IAP.purchase(name);
    },

    purchaseMonthlySubscription: function(callback){
        sdkbox.IAP.purchase(SUBSCRIPTION_IAP_NAME);
        
        this.purchaseCallback = callback;
    },

    restore: function(callback){
        // Set @subscribed to 0 (not subscribed) before restoring
        KVDatabase.getInstance().set("subscribed", 0);

        this.purchaseCallback = callback;

        if (cc.sys.os === "iOS")
            sdkbox.IAP.restore();
        else {
            var purchaseDatasJson = NativeHelper.callNative("getPurchases");
            //console.log(purchaseDatasJson);
            // Format @purchaseDatasJson:
            // [{"packageName":"", "productId":"",....},]
            //NativeHelper.callNative("showMessage", ["Purchased Products", purchaseDatasJson]);

            // Reformat Json string if has @',]' in the tail
            var jsonData;
            if (purchaseDatasJson.lastIndexOf(",]") == -1){
                jsonData = JSON.parse(purchaseDatasJson);
            }
            else {
                jsonData = JSON.parse(purchaseDatasJson.substr(0, purchaseDatasJson.lastIndexOf(",]")) + "]");
            }

            let hasPurchased = false; 

            for (var i = 0; i < jsonData.length; i++) {
                var receipt = jsonData[i];
                if (SUBSCRIPTION_IAP_ID_ANDROID == receipt.productId){
                    KVDatabase.getInstance().set("subscribed", 1);
                    Utils.startCountDownTimePlayed("showPayWall");
                    hasPurchased = true;
                    break;
                }
            }

            if (this.purchaseCallback && hasPurchased)
                this.purchaseCallback(true);
        }
    },

    init: function() {
        //console.log("SDKBox IAP start init");
        sdkbox.IAP.init();

        var self = this;

        if (cc.sys.os === "Android")
            NativeHelper.callNative("initInAppBillingService");

        //console.log("SDKBox IAP Set listener");
        sdkbox.IAP.setListener({
            onSuccess : function (product) {
                // Purchase success
                //console.log("onProductPurchaseSuccess");
                //console.log(JSON.stringify(product));

                // Only one type of IAP so dont need to check productID
                KVDatabase.getInstance().set("subscribed", 1);
                if (self.purchaseCallback)
                    self.purchaseCallback(true);
                // Utils.startCountDownTimePlayed("showPayWall");
            },
            onFailure : function (product, msg) {
                //console.log("onProductPurchaseFailure");
                //console.log(JSON.stringify(product));
                //console.log(msg);
                // Utils.startCountDownTimePlayed("showPayWall");
                if (self.purchaseCallback)
                    self.purchaseCallback(false);
            },
            onCanceled : function (product) {
                //Purchase was canceled by user
                // Utils.startCountDownTimePlayed("showPayWall");
                if (self.purchaseCallback)
                    self.purchaseCallback(false);
            },
            onRestored : function (product) {
                //Purchase restored
                console.log("onProductRestoreSuccess");
                //console.log(JSON.stringify(product));

                // Check list products, 
                // If subscription id existed 
                // Set @subscribed value = 1
                // else
                // Show message user need to renew subscription
                // Format: {"name":"subscription_monthly","id":"com.theschoolofgames.tsog.subscription.monthly","title":"Monthly Subscription","description":"Monthly Subscription","price":"4,99 US$","currencyCode":"USD","receipt":"","receiptCipheredPayload":""}
                if (SUBSCRIPTION_IAP_ID_IOS == product.id){
                    KVDatabase.getInstance().set("subscribed", 1);
                    if (self.purchaseCallback)
                        self.purchaseCallback(true);
                    // Utils.startCountDownTimePlayed("showPayWall");
                }
            },
            onProductRequestSuccess : function (products) {
                console.log("onProductRequestSuccess");
                //Returns you the data for all the iap products
                //You can get each item using following method
                // for (var i = 0; i < products.length; i++) {
                //     console.log(JSON.stringify(products[i]));
                // }
            },
            onProductRequestFailure : function (msg) {
                console.log("onProductRequestFailure");
                //console.log(msg);
                //When product refresh request fails.
            }
        });
    }
    
});

IAPManager._instance = null;

IAPManager.getInstance = function () {
  return IAPManager._instance || IAPManager.setupInstance();
};

IAPManager.setupInstance = function () {
    IAPManager._instance = new IAPManager();
    IAPManager._instance.init();
    return IAPManager._instance;
}