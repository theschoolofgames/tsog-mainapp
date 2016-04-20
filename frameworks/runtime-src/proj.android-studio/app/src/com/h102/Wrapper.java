package com.h102;

import com.crashlytics.android.Crashlytics;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

import com.hub102.tsog.BuildConfig;
import com.segment.analytics.Analytics;
import com.segment.analytics.Properties;
import com.segment.analytics.Traits;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.media.AudioRecord;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.util.Log;

import org.cocos2dx.javascript.AppActivity;
import org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge;

public class Wrapper
{
    public static AppActivity activity;

    public static String getVersionName() {
        return BuildConfig.VERSION_NAME;
    }

    public static String getVersionCode() {
        return BuildConfig.VERSION_CODE + "";
    }

    public static void showUpdateDialog(final String version, final boolean forceUpdate) {
        activity.runOnUiThread(new Runnable() {
           @Override
           public void run() {
               Dialog.show(activity, version, 0, forceUpdate);
           }
        });
    }

    public static void fabricCustomLogging(String key, String value) {
        Crashlytics.getInstance().core.setString(key, value);
    }

    public static String getId() {
        return Settings.System.getString(activity.getContentResolver(), Settings.Secure.ANDROID_ID);
    }

    public static void segmentIdentity(final String userId, final String traits) {
        new Thread() {
            public void run() {
                Map<String, Object> retMap = new Gson().fromJson(traits, new TypeToken<HashMap<String, Object>>() {
                }.getType());

                Traits t = new Traits();
                for (Map.Entry<String, Object> entry : retMap.entrySet()) {
                    t.putValue(entry.getKey(), entry.getValue());
                }

                Analytics.with(activity).identify(userId, t, null);
            }
        }.start();
    }

    public static void segmentTrack(final String event, final String properties) {
        new Thread() {
            public void run() {
                Map<String, Object> retMap = new Gson().fromJson(properties, new TypeToken<HashMap<String, Object>>() {
                }.getType());

                Properties p = new Properties();
                for (Map.Entry<String, Object> entry : retMap.entrySet()) {
                    p.putValue(entry.getKey(), entry.getValue());
                }
                Analytics.with(activity).track(event, p);
            }
        }.start();
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

//    public static boolean isRecording() {
//        return Recorder.getInstance().isRecording();
//    }

    public static void startFetchingAudio() {
        Recorder.getInstance().startFetchingAudio();
    }

    public static void stopFetchingAudio() {
        Recorder.getInstance().stopFetchingAudio();
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

    public static void startDetectingNoiseLevel(float detectingTime) {
        final int noiseDetectionLoopCount = (int)(detectingTime / 0.1f);

        Recorder.getInstance().startFetchingAudio();
        Recorder.getInstance().audioRecorder.setRecordPositionUpdateListener(new AudioRecord.OnRecordPositionUpdateListener() {
            int count = noiseDetectionLoopCount;
            final List<Double> noiseDetectionArray = new ArrayList<>();

            @Override
            public void onMarkerReached(AudioRecord recorder) {

            }

            @Override
            public void onPeriodicNotification(AudioRecord recorder) {
                count--;

                if (count < 0) {
                    Wrapper.stopFetchingAudio();

                    Double sum = 0d;
                    for (Double vals : noiseDetectionArray) {
                        sum += vals;
                    }
                    Double avgAmpl =  sum / noiseDetectionArray.size();
                    Log.w("WRAPPER", avgAmpl + "");

                    String value = avgAmpl > 33 ? "true" : "false";

                    final String command = String.format("SpeakingTestLayer.shouldSkipTest=%s", value);
                    Wrapper.activity.runOnGLThread(new Runnable() {
                        @Override
                        public void run() {
                            Cocos2dxJavascriptJavaBridge.evalString(command);
                        }
                    });

                } else {
                    int readAudio = recorder.read(Recorder.getInstance().buffer, 0, Recorder.getInstance().buffer.length); // Fill buffer
                    if (readAudio == AudioRecord.ERROR_BAD_VALUE || readAudio == AudioRecord.ERROR_INVALID_OPERATION)
                        return;

                    double fN = (double)readAudio;
                    double accum = 0;
                    for (int i = 0; i < readAudio; i ++)
                        accum += Math.abs((double)Recorder.getInstance().buffer[i]);

                    double soundLevel = accum/fN;

                    noiseDetectionArray.add(soundLevel);
                }
            }
        });
    }

    public static void cancelNoiseDetecting() {
        Recorder.getInstance().stopFetchingAudio();
    }
}