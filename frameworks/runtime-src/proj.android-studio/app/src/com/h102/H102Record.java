package com.h102;

import android.media.AudioFormat;
import android.media.AudioRecord;

import com.chipmunkrecord.ExtAudioRecorder;

import org.cocos2dx.lib.Cocos2dxHelper;


/**
 * Created by nick on 12/8/15.
 */
public class H102Record {
    private static final String TAG = H102Record.class.getSimpleName();

    private static final String AUDIO_RECORDER_FOLDER = "AudioRecorder";
    private static final String AUDIO_RECORDER_TEMP_FILE = "record_temp.raw";

    private ExtAudioRecorder mRecorder = null;
    private boolean mIsRecording = false;

    private static final int RECORDER_SAMPLERATE = 44100;
    private static final int RECORDER_BPP = 16;
    private static final int RECORDER_CHANNELS = AudioFormat.CHANNEL_IN_MONO;
    private static final int RECORDER_AUDIO_ENCODING = AudioFormat.ENCODING_PCM_16BIT;

    private int bufferSize = 0;
    private Thread mRecordingThread = null;

    private String mFileName;

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
        return mIsRecording;
    }

    public void initRecord(String fileName) {
        if (mRecorder != null) {
            mRecorder.stop();
            mRecorder.release();
            mRecorder = null;
        }

        mIsRecording = false;
        mFileName = fileName;

        mRecorder = ExtAudioRecorder.getInstanse(false);
        mRecorder.setOutputFile(Cocos2dxHelper.getCocos2dxWritablePath() + "/" + fileName);

        mRecorder.prepare();
    }

    public void startRecord() {
        if (mRecorder != null) {
            mIsRecording = true;
            mRecorder.start();
        }
    }

    public void stopRecord() {
        mIsRecording = false;
        if (mRecorder != null) {
            mRecorder.stop();
            mRecorder.release();
            mRecorder = null;
        }
    }

}
