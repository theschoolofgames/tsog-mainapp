package com.h102;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;

import com.segment.analytics.Analytics;
import com.segment.analytics.Properties;
import com.segment.analytics.Traits;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;

import org.cocos2dx.javascript.AppActivity;

public class Wrapper
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
        return Recorder.getInstance().checkMic();
    }

    public static boolean isRecording() {
        return Recorder.getInstance().isRecording();
    }

    public static void initRecord() {
        Recorder.getInstance().initRecord();
    }

    public static void startRecord() {
        Recorder.getInstance().startRecord();
    }

    public static void stopRecord() {
        Recorder.getInstance().stopRecord();
    }

    public static void startBackgroundSoundDetecting() {
        Recorder.getInstance().startBackgroundSoundDetecting(activity);
    }

    public static void changeSpeechLanguageArray(String serializedString) throws IOException {
        ArrayList<String> arrayList = new Gson().fromJson(serializedString, new TypeToken<ArrayList<String>>() {}.getType());
        SpeechRecognizer.getInstance().updateNewLanguageArray(arrayList);
    }

    public static void startSpeechRecognition(final int timeout) {
        SpeechRecognizer.getInstance().start();

        if (timeout > 0) {
            final Handler handler = new Handler(Looper.getMainLooper());
            handler.postDelayed(new Runnable() {
                @Override
                public void run() {
                    SpeechRecognizer.getInstance().stop();
                }
            }, timeout);
        }

    }

    public static void stopSpeechRecognition() {
        SpeechRecognizer.getInstance().stop();
    }
}