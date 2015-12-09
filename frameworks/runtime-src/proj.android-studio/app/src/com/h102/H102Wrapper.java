package com.h102;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.util.Map;
import java.util.HashMap;

import com.segment.analytics.Analytics;
import com.segment.analytics.Properties;
import com.segment.analytics.Traits;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.provider.Settings;

import org.cocos2dx.javascript.AppActivity;

public class H102Wrapper
{
    public static AppActivity activity;

    public static String getId() {
        return Settings.System.getString(activity.getContentResolver(), Settings.Secure.ANDROID_ID);
    }

    public static void segmentIdentity(String userId, String traits) {
        Map<String, Object> retMap = new Gson().fromJson(traits, new TypeToken<HashMap<String, Object>>() {
        }.getType());

        Traits t = new Traits();
        for (Map.Entry<String, Object> entry : retMap.entrySet()) {
            t.putValue(entry.getKey(), entry.getValue());
        }

        Analytics.with(activity).identify(userId, t, null);
    }

    public static void segmentTrack(String event, String properties) {
        Map<String, Object> retMap = new Gson().fromJson(properties, new TypeToken<HashMap<String, Object>>() {
        }.getType());

        Properties p = new Properties();
        for (Map.Entry<String, Object> entry : retMap.entrySet()) {
            p.putValue(entry.getKey(), entry.getValue());
        }
        Analytics.with(activity).track(event, p);
    }

    public static void showMessage(String title, String message) {
        final String aTitle = title, aMessage = message;
        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                AlertDialog alertDialog = new AlertDialog.Builder(activity).create();
                alertDialog.setTitle(aTitle);
                alertDialog.setMessage(aMessage);
                alertDialog.setButton(AlertDialog.BUTTON_NEUTRAL, "OK",
                        new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int which) {
                                dialog.dismiss();
                            }
                        });
                alertDialog.show();
            }
        });
    }

    public static boolean checkMic() {
        return H102Record.getInstance().checkMic();
    }

    public static boolean isRecording() {
        return H102Record.getInstance().isRecording();
    }

    public static void initRecord() {
        H102Record.getInstance().initRecord();
    }

    public static void startRecord() {
        H102Record.getInstance().startRecord();
    }

    public static void stopRecord() {
        H102Record.getInstance().stopRecord();
    }

    public static void startBackgroundSoundDetecting() {
        H102Record.getInstance().startBackgroundSoundDetecting(activity);
    }
}