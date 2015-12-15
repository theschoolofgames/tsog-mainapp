package com.h102;

import android.media.AudioFormat;
import android.media.AudioRecord;
import android.util.Log;

import com.chipmunkrecord.ExtAudioRecorder;

import org.cocos2dx.javascript.AppActivity;
import org.cocos2dx.lib.Cocos2dxHelper;
import org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge;

import java.util.Timer;
import java.util.TimerTask;


/**
 * Created by nick on 12/8/15.
 */
public class Recorder {
    private static final String TAG = Recorder.class.getSimpleName();

    private static final String AUDIO_RECORDER_FILE = "record_sound.wav";
    private static final int BACKGROUND_SOUND_DETECTING_LOOP_DELAY = 400; // ms
    private static final int AUDIO_AMPLITUDE_THRESHOLD = 15000;
    private static final int MAX_RECORDING_TIME = 15;

    private ExtAudioRecorder mRecorder = null;

    private static final int RECORDER_SAMPLERATE = 44100;
    private static final int RECORDER_CHANNELS = AudioFormat.CHANNEL_IN_MONO;
    private static final int RECORDER_AUDIO_ENCODING = AudioFormat.ENCODING_PCM_16BIT;

    private int bufferSize = 0;
    private Timer timer;

    private static Recorder mSharedInstance = null;

    public static Recorder getInstance() {
        if (mSharedInstance == null) {
            mSharedInstance = new Recorder();
        }

        return mSharedInstance;
    }

    public Recorder() {
        bufferSize = AudioRecord.getMinBufferSize(RECORDER_SAMPLERATE,RECORDER_CHANNELS,RECORDER_AUDIO_ENCODING);
    }

    public boolean checkMic() {
        return true;
    }

    public boolean isRecording() {
        return mRecorder != null && mRecorder.getState() == ExtAudioRecorder.State.RECORDING;
    }

    public void initRecord() {
        if (mRecorder != null) {
            mRecorder.release();
        }

        mRecorder = ExtAudioRecorder.getInstanse(false);
        mRecorder.setOutputFile(getAudioFilePath());

        mRecorder.prepare();
    }

    private String getAudioFilePath() {
        return Cocos2dxHelper.getCocos2dxWritablePath() + "/" + AUDIO_RECORDER_FILE;
//        return "/sdcard/" + AUDIO_RECORDER_FILE;
    }

    public void startRecord() {
        if (mRecorder != null) {
            mRecorder.start();
        }
    }

    public void stopRecord() {
        if (mRecorder != null) {
            mRecorder.stop();
            mRecorder.release();
            mRecorder = null;
        }
    }

    public void startBackgroundSoundDetecting(final AppActivity app) {
        initRecord();
        startRecord();

        timer = new Timer();
        timer.scheduleAtFixedRate(new TimerTask() {

            long startTime = -1;

            @Override
            public void run() {

                int maxAmplitude = mRecorder.getMaxAmplitude();
                Log.w(TAG, "Amplitude: " + maxAmplitude);
                if (startTime < 0) {
                    if (maxAmplitude > AUDIO_AMPLITUDE_THRESHOLD) {
                        Log.w(TAG, "Start");
                        startTime = System.currentTimeMillis();
                        app.runOnGLThread(new Runnable() {
                            @Override
                            public void run() {
                                Cocos2dxJavascriptJavaBridge.evalString("AudioListener.getInstance().onStartedListening()");
                            }
                        });
                    }
                } else {
                    float deltaTime = (float)(System.currentTimeMillis() - startTime)/1000;
                    if (maxAmplitude < AUDIO_AMPLITUDE_THRESHOLD || deltaTime >= MAX_RECORDING_TIME ) {
                        Log.w(TAG, "Stop");
                        stopBackgroundSoundDetecting();
                        final String command = String.format("AudioListener.getInstance().onStoppedListening('%s', %f)", getAudioFilePath(), deltaTime);
                        app.runOnGLThread(new Runnable() {
                            @Override
                            public void run() {
                                Cocos2dxJavascriptJavaBridge.evalString(command);
                            }
                        });
                        return;
                    }
                }

                if (startTime < 0) {
                    Log.w(TAG, "Restart");
                    initRecord();
                    startRecord();
                }
            }
        }, 0, BACKGROUND_SOUND_DETECTING_LOOP_DELAY);
    }

    public void stopBackgroundSoundDetecting() {
        Log.w(TAG, "stopBackgroundSoundDetecting");
        timer.cancel();
        stopRecord();
    }

}
