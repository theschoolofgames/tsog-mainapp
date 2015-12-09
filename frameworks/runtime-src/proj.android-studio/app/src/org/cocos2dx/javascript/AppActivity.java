/****************************************************************************
Copyright (c) 2015 Chukong Technologies Inc.
 
http://www.cocos2d-x.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
****************************************************************************/
package org.cocos2dx.javascript;

import static android.widget.Toast.makeText;
import static edu.cmu.pocketsphinx.SpeechRecognizerSetup.defaultSetup;

import org.cocos2dx.lib.Cocos2dxActivity;
import org.cocos2dx.lib.Cocos2dxGLSurfaceView;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Bundle;
import android.provider.Settings;
import android.util.Log;
import android.widget.Toast;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.io.File;
import java.io.IOException;
import java.util.Map;
import java.util.HashMap;

import com.segment.analytics.Analytics;
import com.segment.analytics.Traits;
import com.segment.analytics.Properties;

import edu.cmu.pocketsphinx.Assets;
import edu.cmu.pocketsphinx.Hypothesis;
import edu.cmu.pocketsphinx.RecognitionListener;
import edu.cmu.pocketsphinx.SpeechRecognizer;

import com.h102.H102Record;

public class AppActivity extends Cocos2dxActivity implements
        RecognitionListener {

    private static final String TAG = AppActivity.class.getSimpleName();

    private static AppActivity app = null;
    private static String udid;

    private SpeechRecognizer recognizer;

    private static final String KWS_SEARCH = "wakeup";
    private static final String FORECAST_SEARCH = "forecast";
    private static final String DIGITS_SEARCH = "digits";
    private static final String PHONE_SEARCH = "phones";
    private static final String MENU_SEARCH = "menu";

    private static final String KEYPHRASE = "oh mighty computer";

    @Override
    protected void onCreate(final Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        new AsyncTask<Void, Void, Exception>() {
            @Override
            protected Exception doInBackground(Void... params) {
                try {
                    Assets assets = new Assets(AppActivity.this);
                    File assetDir = assets.syncAssets();
                    setupRecognizer(assetDir);
                } catch (IOException e) {
                    return e;
                }
                return null;
            }

            @Override
            protected void onPostExecute(Exception result) {
                if (result == null)
                    switchSearch(KWS_SEARCH);
//                if (result != null) {
//                    ((TextView) findViewById(R.id.caption_text))
//                            .setText("Failed to init recognizer " + result);
//                } else {
//                    switchSearch(KWS_SEARCH);
//                }
            }
        }.execute();
    }

    @Override
    public Cocos2dxGLSurfaceView onCreateView() {
        Cocos2dxGLSurfaceView glSurfaceView = new Cocos2dxGLSurfaceView(this);
        app = this;
        // TestCpp should create stencil buffer
        glSurfaceView.setEGLConfigChooser(5, 6, 5, 0, 16, 8);

        udid = Settings.System.getString(super.getContentResolver(), Settings.Secure.ANDROID_ID);
        Analytics.with(app).onIntegrationReady(Analytics.BundledIntegration.COUNTLY, new Analytics.Callback() {
            @Override
            public void onReady(Object instance) {
                Analytics.with(app).flush();
            }
        });

        return glSurfaceView;
    }

    // Reflection
    public static void showMessage(String title, String message) {
        final String aTitle = title, aMessage = message;
        app.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                AlertDialog alertDialog = new AlertDialog.Builder(app).create();
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

    public static boolean openScheme(String bundleId, String data) {
        PackageManager manager = app.getPackageManager();

        Intent i = manager.getLaunchIntentForPackage(bundleId);
        if (i == null) {
            AppActivity.showMessage("Error", "Target game not found");
            return false;
            //throw new PackageManager.NameNotFoundException();
        }
        i.setAction(Intent.ACTION_SEND);
        i.putExtra(Intent.EXTRA_TEXT, data);
        i.setType("text/plain");
        i.addCategory(Intent.CATEGORY_LAUNCHER);
        app.startActivity(i);
        return true;
    }

    public static String getId() {
        return udid;
    }

    public static void segmentIdentity(String userId, String traits) {
        Map<String, Object> retMap = new Gson().fromJson(traits, new TypeToken<HashMap<String, Object>>() {
        }.getType());

        Traits t = new Traits();
        for (Map.Entry<String, Object> entry : retMap.entrySet()) {
            t.putValue(entry.getKey(), entry.getValue());
        }

        Analytics.with(app).identify(userId, t, null);
    }

    public static void segmentTrack(String event, String properties) {
        Map<String, Object> retMap = new Gson().fromJson(properties, new TypeToken<HashMap<String, Object>>() {
        }.getType());

        Properties p = new Properties();
        for (Map.Entry<String, Object> entry : retMap.entrySet()) {
            p.putValue(entry.getKey(), entry.getValue());
        }
        Analytics.with(app).track(event, p);
    }

    public static boolean checkMic() {
        return H102Record.getInstance().checkMic();
    }

    public static boolean isRecording() {
        return H102Record.getInstance().isRecording();
    }

    public static void initRecord(String fileName) {
        H102Record.getInstance().initRecord(fileName);
    }

    public static void startRecord() {
        H102Record.getInstance().startRecord();
    }

    public static void stopRecord() {
        H102Record.getInstance().stopRecord();
    }



    @Override
    public void onBeginningOfSpeech() {
        Log.d(TAG, "onBeginningOfSpeech");
    }

    @Override
    public void onEndOfSpeech() {
        Log.d(TAG, "onEndOfSpeech");
        if (!recognizer.getSearchName().equals(KWS_SEARCH))
            switchSearch(KWS_SEARCH);
    }

    @Override
    public void onPartialResult(Hypothesis hypothesis) {

    }

    @Override
    public void onResult(Hypothesis hypothesis) {
        if (hypothesis != null) {
            String text = hypothesis.getHypstr();
            makeText(getApplicationContext(), text, Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    public void onError(Exception e) {

    }

    @Override
    public void onTimeout() {
        switchSearch(KWS_SEARCH);
    }

    private void setupRecognizer(File assetsDir) throws IOException {
        // The recognizer can be configured to perform multiple searches
        // of different kind and switch between them

        recognizer = defaultSetup()
                .setAcousticModel(new File(assetsDir, "en-us-ptm"))
                .setDictionary(new File(assetsDir, "cmudict-en-us.dict"))

                        // To disable logging of raw audio comment out this call (takes a lot of space on the device)
                .setRawLogDir(assetsDir)

                        // Threshold to tune for keyphrase to balance between false alarms and misses
                .setKeywordThreshold(1e-45f)

                        // Use context-independent phonetic search, context-dependent is too slow for mobile
                .setBoolean("-allphone_ci", true)

                .getRecognizer();
        recognizer.addListener(this);

        /** In your application you might not need to add all those searches.
         * They are added here for demonstration. You can leave just one.
         */

        // Create keyword-activation search.
        recognizer.addKeyphraseSearch(KWS_SEARCH, KEYPHRASE);
//
//        // Create grammar-based search for selection between demos
        File menuGrammar = new File(assetsDir, "menu.gram");
        recognizer.addGrammarSearch(MENU_SEARCH, menuGrammar);
//
//        // Create grammar-based search for digit recognition
//        File digitsGrammar = new File(assetsDir, "digits.gram");
//        recognizer.addGrammarSearch(DIGITS_SEARCH, digitsGrammar);
//
//        // Create language model search
//        File languageModel = new File(assetsDir, "weather.dmp");
//        recognizer.addNgramSearch(FORECAST_SEARCH, languageModel);
//
//        // Phonetic search
//        File phoneticModel = new File(assetsDir, "en-phone.dmp");
//        recognizer.addAllphoneSearch(PHONE_SEARCH, phoneticModel);
    }

    private void switchSearch(String searchName) {
        recognizer.stop();

        // If we are not spotting, start listening with timeout (10000 ms or 10 seconds).
        if (searchName.equals(KWS_SEARCH))
            recognizer.startListening(searchName);
        else
            recognizer.startListening(searchName, 10000);

        makeText(getApplicationContext(), searchName, Toast.LENGTH_SHORT).show();
    }
}