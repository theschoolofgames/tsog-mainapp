package com.h102;

import android.os.AsyncTask;
import android.util.Log;

import org.cocos2dx.javascript.AppActivity;
import org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge;

import java.io.File;
import java.io.IOException;

import edu.cmu.pocketsphinx.Assets;
import edu.cmu.pocketsphinx.Hypothesis;
import edu.cmu.pocketsphinx.RecognitionListener;
import edu.cmu.pocketsphinx.SpeechRecognizer;

import static edu.cmu.pocketsphinx.SpeechRecognizerSetup.defaultSetup;

/**
 * Created by nick on 12/11/15.
 */
public class H102SpeechRecognition implements RecognitionListener {

    private static final String TAG = H102SpeechRecognition.class.getSimpleName();

    private static H102SpeechRecognition mSharedInstance = null;
    private static AppActivity app;

    private SpeechRecognizer recognizer;

    private static final String ANIMAL_SEARCH = "animals";

    public static H102SpeechRecognition setupInstance(AppActivity app) {
        if (mSharedInstance == null) {
            H102SpeechRecognition.app = app;
            return getInstance();
        }

        return mSharedInstance;
    }

    public static H102SpeechRecognition getInstance() {
        if (mSharedInstance == null) {
            mSharedInstance = new H102SpeechRecognition();
        }

        return mSharedInstance;
    }

    public H102SpeechRecognition() {
        new AsyncTask<Void, Void, Exception>() {
            @Override
            protected Exception doInBackground(Void... params) {
                try {
                    Assets assets = new Assets(app);
                    File assetDir = assets.syncAssets();
                    setupRecognizer(assetDir);
                } catch (IOException e) {
                    return e;
                }
                return null;
            }

            @Override
            protected void onPostExecute(Exception result) {
//                String commandForm = "SpeechRecognitionListener.getInstance().onSetupComplete(%b, '%s')";
//                if (result == null) {
//                    Cocos2dxJavascriptJavaBridge.evalString(String.format(commandForm, true, ""));
//                } else {
//                    Cocos2dxJavascriptJavaBridge.evalString(String.format(commandForm, false, result.getLocalizedMessage()));
//                }

//                if (result != null) {
//                    ((TextView) findViewById(R.id.caption_text))
//                            .setText("Failed to init recognizer " + result);
//                } else {
//                    switchSearch(KWS_SEARCH);
//                }
            }
        }.execute();
    }

    public void start() {
        recognizer.stop();
        recognizer.startListening(ANIMAL_SEARCH);
    }

    public void start(int timeout) {
        recognizer.stop();
        recognizer.startListening(ANIMAL_SEARCH, timeout);
    }

    public void stop() {
        recognizer.stop();
    }

    @Override
    public void onBeginningOfSpeech() {

    }

    @Override
    public void onEndOfSpeech() {

    }

    @Override
    public void onPartialResult(Hypothesis hypothesis) {
        if (hypothesis == null)
            return;

        Log.w(TAG, hypothesis.getHypstr());
    }

    @Override
    public void onResult(Hypothesis hypothesis) {
        final String commandForm = "SpeechRecognitionListener.getInstance().onResult('%s')";
        final String text = hypothesis == null ? "" : hypothesis.getHypstr();

        app.runOnGLThread(new Runnable() {
            @Override
            public void run() {
                Cocos2dxJavascriptJavaBridge.evalString(String.format(commandForm, text));
            }
        });
    }

    @Override
    public void onError(Exception e) {
        final String commandForm = "SpeechRecognitionListener.getInstance().onError('%s')";
        final String message = e.getLocalizedMessage();
        app.runOnGLThread(new Runnable() {
            @Override
            public void run() {
                Cocos2dxJavascriptJavaBridge.evalString(String.format(commandForm, message));
            }
        });
    }

    @Override
    public void onTimeout() {
        recognizer.stop();
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
//        recognizer.addKeyphraseSearch(KWS_SEARCH, KEYPHRASE);
//
//        // Create grammar-based search for selection between demos
        File animalGrammar = new File(assetsDir, "animals.gram");
        recognizer.addGrammarSearch(ANIMAL_SEARCH, animalGrammar);
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
}
