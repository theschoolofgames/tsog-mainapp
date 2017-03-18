package EkStep;
import android.app.Activity;
import android.app.Application;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.res.AssetManager;
import android.provider.Settings;
import android.util.Log;


import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Handler;
import android.widget.Toast;

import org.cocos2dx.javascript.AppActivity;

import java.io.IOException;
import java.io.InputStream;

import org.ekstep.genieservices.aidls.domain.Profile;
import org.ekstep.genieservices.sdks.Partner;
import org.ekstep.genieservices.sdks.Telemetry;
import org.ekstep.genieservices.sdks.UserProfile;
import org.ekstep.genieservices.sdks.response.GenieResponse;
import org.ekstep.genieservices.sdks.response.IResponseHandler;
import org.json.JSONException;

/**
 * Created by Tony on 1/13/17.
 */
public class EkStep implements IRegister, ITelemetryData{
    private static final String TAG = "EkStep";
    private static final String partnerName = "TSOG";
    private static final String partnerId = "com.theschoolofgames.tsog";
    private static final String partnerPublicKey = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDrgyJbtE4rU8rcyYQURr0eOO08pySMKBJmy4FwylD3Q+EIBnhCDRDDg5sJgADzxqpx7GUvDfAQZjYZo5aJFuy+eswvhRS4IGdInSM9O2b7FcPmCAZdS09/0+OwbWqQHf4cFBe4DoKRkvFH/8FCmlxSeI0NiqGAgiqU0OiwQt2aTQIDAQAB";

    private static EkStep instance;

    private String appVersionName;
    private String deviceId;

    public static EkStep getInstance() {
        assert(instance != null);
        return instance;
    }

    public static EkStep setup(Activity activity) {
        EkStep.instance = new EkStep(activity);
        EkStep.instance.registerPartner(activity.getApplicationContext());

        try {
            PackageInfo pInfo = activity.getPackageManager().getPackageInfo(activity.getPackageName(), 0);
            instance.appVersionName = pInfo.versionName;
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        }

        instance.deviceId = Settings.Secure.getString(activity.getContentResolver(),
                Settings.Secure.ANDROID_ID);

        return instance;
    }

    //    private static RegisterResponseHandler responseHandler;
    private final Activity activity;

    public EkStep(Activity activity) {
        this.activity = activity;
    }

    @Override
    public void onRegisterSuccess(GenieResponse genieResponse) {
        Log.i("GenieResponse register", genieResponse.toString());
    }

    @Override
    public void onRegisterFailure(GenieResponse genieResponse) {
        Log.e("GenieResponse register", genieResponse.toString());
    }

    @Override
    public void onSuccessTelemetry(GenieResponse genieResponse) {
        Log.i("Telemetry success", genieResponse.toString());
    }

    @Override
    public void onFailureTelemetry(GenieResponse genieResponse) {
        Log.e("Telemetry failure", genieResponse.toString());
    }

    private void registerPartner(Context context){
        Partner partner = new Partner(context);

        RegisterResponseHandler responseHandler = new RegisterResponseHandler(this);
        partner.register(partnerId, partnerPublicKey, responseHandler);
        Log.w("EkStep", "Register partner");
    }

    public static void sendTelemetryEvent(String name) {
        sendTelemetryEvent(name, "{}");
    }
    public static void sendTelemetryEvent(String name, String eventDetail) {
        Log.i(TAG, "sendTelemetryEvent: " + name + ", eventDetail: " + eventDetail);
        long timestamp = System.currentTimeMillis();
        String data = "{'eid': '" + name +
                "','ets': '" + timestamp +
                "','ver': '2.0','gdata': {'id': '" + partnerId +
                "','ver': '" + instance.appVersionName +
                "'},'sid': '','uid': '','did': '" + instance.deviceId +
                "','edata': {'eks': " + eventDetail + "},'tags':[]}";

        Log.i(TAG, "  -> full string: " + data);
        Telemetry telemetry = new Telemetry(instance.activity);

        TelemetryResponseHandler responseHandler = new TelemetryResponseHandler(instance);
        telemetry.send(data, responseHandler);
    }

    private void launchGenieApp(){
        PackageManager manager = activity.getPackageManager();
        try {
            Intent intent = manager.getLaunchIntentForPackage("org.ekstep.genieservices");
            intent.addCategory(Intent.CATEGORY_LAUNCHER);
            activity.startActivity(intent);
        } catch (Exception e) {}
    }
};
