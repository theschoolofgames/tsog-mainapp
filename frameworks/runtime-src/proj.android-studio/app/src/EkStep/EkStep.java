package EkStep;
import android.app.Activity;
import android.app.Application;
import android.content.Intent;
import android.content.res.AssetManager;
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

    private static final String partnerName = "TSOG";
    private static final String partnerId = "com.theschoolofgames.tsog";
    private static final String partnerPublicKey = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDrgyJbtE4rU8rcyYQURr0eOO08pySMKBJmy4FwylD3Q+EIBnhCDRDDg5sJgADzxqpx7GUvDfAQZjYZo5aJFuy+eswvhRS4IGdInSM9O2b7FcPmCAZdS09/0+OwbWqQHf4cFBe4DoKRkvFH/8FCmlxSeI0NiqGAgiqU0OiwQt2aTQIDAQAB";

    public static String getGeLaunchGameEvent() {
        return GE_LAUNCH_GAME_EVENT;
    }

    public static String getGeGameEndEvent() {
        return GE_GAME_END_EVENT;
    }

    //    private static RegisterResponseHandler responseHandler;
    private static final String GE_LAUNCH_GAME_EVENT = "{'eid': 'GE_LAUNCH_GAME','ets': '1442816723','ver': '2.0','gdata': {'id': 'com.theschoolofgames.tsog','ver': '1.0'},'sid': '','uid': '','did': '','edata': {'eks': {}},'tags':[]}";
    private static final String GE_GAME_END_EVENT = "{'eid': 'GE_GAME_END','ets': '1442816723','ver': '2.0','gdata': {'id': 'com.theschoolofgames.tsog','ver': '1.0'},'sid': '','uid': '','did': '','edata': {'eks': {}},'tags':[]}";
    private final Activity activity;

    public EkStep(Activity activity) {
        this.activity = activity;

        registerPartner(activity);
    }

    @Override
    public void onRegisterSuccess(GenieResponse genieResponse) {
        Log.w("GenieResponse register", genieResponse.toString());
    }

    @Override
    public void onRegisterFailure(GenieResponse genieResponse) {
        Log.w("GenieResponse register", genieResponse.toString());
    }

    @Override
    public void onSuccessTelemetry(GenieResponse genieResponse) {
        Log.w("Telemetry success", genieResponse.toString());
    }

    @Override
    public void onFailureTelemetry(GenieResponse genieResponse) {
        Log.w("Telemetry failure", genieResponse.toString());
    }

    private void registerPartner(Context context){
        Partner partner = new Partner(context);

        RegisterResponseHandler responseHandler = new RegisterResponseHandler(this);
        partner.register(partnerId, partnerPublicKey, responseHandler);
        Log.w("EkStep", "Register partner");
    }

    // String event -> Json string
    public void sendTelemetryEvent(String event) {
        Telemetry telemetry = new Telemetry(activity);

        TelemetryResponseHandler responseHandler = new TelemetryResponseHandler(this);
        telemetry.send(event, responseHandler);
    }

    private void launchGenieApp(){
        PackageManager manager = activity.getPackageManager();
        try {
            Intent intent = manager.getLaunchIntentForPackage("org.ekstep.genieservices");
            intent.addCategory(Intent.CATEGORY_LAUNCHER);
            activity.startActivity(intent);
        } catch (Exception e) {}
    }
}
