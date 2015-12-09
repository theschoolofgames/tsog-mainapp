package com.h102;

import android.media.AudioFormat;
import android.media.AudioRecord;
import android.util.Log;

import com.chipmunkrecord.ExtAudioRecorder;

import org.cocos2dx.javascript.AppActivity;
import org.cocos2dx.lib.Cocos2dxHelper;
import org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge;


/**
 * Created by nick on 12/8/15.
 */
public class H102Record {
    private static final String TAG = H102Record.class.getSimpleName();

    private static final String AUDIO_RECORDER_FILE = "record_sound.wav";
    private static final int BACKGROUND_SOUND_DETECTING_LOOP_DELAY = 1000; // ms
    private static final int AUDIO_AMPLITUDE_THRESHOLD = 15000;

    private ExtAudioRecorder mRecorder = null;

    private static final int RECORDER_SAMPLERATE = 44100;
    private static final int RECORDER_BPP = 16;
    private static final int RECORDER_CHANNELS = AudioFormat.CHANNEL_IN_MONO;
    private static final int RECORDER_AUDIO_ENCODING = AudioFormat.ENCODING_PCM_16BIT;

    private int bufferSize = 0;
    private Thread mBackgroundSoundDetectingThread = null;

    private static H102Record mSharedInstance = null;

    public static H102Record getInstance() {
        if (mSharedInstance == null) {
            mSharedInstance = new H102Record();
        }

        return mSharedInstance;
    }

    public H102Record() {
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
//        return Cocos2dxHelper.getCocos2dxWritablePath() + "/" + AUDIO_RECORDER_FILE;
        return "/sdcard/" + AUDIO_RECORDER_FILE;
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

        Log.w(TAG, "startBackgroundSoundDetecting");
        mBackgroundSoundDetectingThread = new Thread(new Runnable() {
            @Override
            public void run() {
                Object obj = new Object();
                try {
                    synchronized (obj) {
                        long startTime = -1;
                        long expectedtime = System.currentTimeMillis();
                        while (true) {//Or any Loops
                            while (System.currentTimeMillis() < expectedtime) {}
                            expectedtime += BACKGROUND_SOUND_DETECTING_LOOP_DELAY;//Sample expectedtime += 1000; 1 second sleep

                            if (startTime < 0) {
                                Log.w(TAG, "Restart");
                                initRecord();
                                startRecord();
                            }

                            obj.wait(BACKGROUND_SOUND_DETECTING_LOOP_DELAY);//Sample obj.wait(1000); 1 second sleep

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
                                if (maxAmplitude < AUDIO_AMPLITUDE_THRESHOLD) {
                                    Log.w(TAG, "Stop");
                                    final String command = String.format("AudioListener.getInstance().onStoppedListening('%s', %d)", getAudioFilePath(), System.currentTimeMillis()-startTime);
                                    app.runOnGLThread(new Runnable() {
                                        @Override
                                        public void run() {
                                            Cocos2dxJavascriptJavaBridge.evalString(command);
                                        }
                                    });
                                    stopBackgroundSoundDetecting();
                                    break;
                                }
                            }
                        }
                    }
                } catch (InterruptedException ex) {
                    //SomeFishCatching
                }

            }
        }, "detectSoundOnBackground");

        mBackgroundSoundDetectingThread.start();
    }

    public void stopBackgroundSoundDetecting() {
        Log.w(TAG, "stopBackgroundSoundDetecting");
        mBackgroundSoundDetectingThread = null;
        stopRecord();
    }

}
