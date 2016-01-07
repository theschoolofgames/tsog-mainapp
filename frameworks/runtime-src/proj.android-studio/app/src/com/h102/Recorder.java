package com.h102;

import android.media.AudioFormat;
import android.media.AudioRecord;
import android.media.MediaRecorder;
import android.util.Base64;
import android.util.Log;

import com.chipmunkrecord.ExtAudioRecorder;

import org.cocos2dx.lib.Cocos2dxHelper;
import org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge;

import java.io.IOException;
import java.io.RandomAccessFile;
import java.util.Map;


/**
 * Created by nick on 12/8/15.
 */
public class Recorder {
    private static final String TAG = Recorder.class.getSimpleName();

    private final static int PEAK_THRESHOLD_BEGAN = 36;
    private final static float MAX_RECORD_TIME = 15.0f;

    private static Recorder mSharedInstance = null;
    private final static int[] sampleRates = {44100, 22050, 11025, 8000};

    private final static String FILE_NAME = "record_sound.wav";
    private final static float SECOND_OF_SILENCE = 1f;

    /**
     * INITIALIZING : recorder is initializing;
     * READY : recorder has been initialized, recorder not yet started
     * RECORDING : recording
     * ERROR : reconstruction needed
     * STOPPED: reset needed
     */
    public enum State {INITIALIZING, READY, RECORDING, ERROR, STOPPED};

    // The interval in which the recorded samples are output to the file
    private static final int TIMER_INTERVAL = 120;


    private boolean isRecording = false;

    // Recorder used for uncompressed recording
    private AudioRecord     audioRecorder = null;

    // Output file path
    private String          filePath = null;

    // Recorder state; see State
    private State          	state;

    // File writer (only in uncompressed mode)
    private RandomAccessFile randomAccessWriter;

    // Number of channels, sample rate, sample size(size in bits), buffer size, audio source, sample size(see AudioFormat)
    private short                    nChannels;
    private int                      sRate;
    private short                    bSamples;
    private int                      bufferSize;
    private int                      aSource;
    private int                      aFormat;

    // Number of frames written to file on each output(only in uncompressed mode)
    private int                      framePeriod;

    // Buffer for output(only in uncompressed mode)
    private byte[]                   buffer;

    // Number of bytes written to file after header(only in uncompressed mode)
    // after stop() is called, this size is written to the header/data chunk in the wave file
    private int                      payloadSize;

    private RecorderQueue            cachedBuffer;

    private float                    silenceTime = 0;

    private long startRecordTime = 0;

    public static Recorder getInstance() {
        if (mSharedInstance == null) {
            int i=0;
            do{
                mSharedInstance = new Recorder(sampleRates[i]);

            } while((++i<sampleRates.length) & !(mSharedInstance.getState() == Recorder.State.INITIALIZING));
        }

        return mSharedInstance;
    }

    /*
	*
	* Method used for recording.
	*
	*/
    private AudioRecord.OnRecordPositionUpdateListener updateListener = new AudioRecord.OnRecordPositionUpdateListener()
    {
        public void onPeriodicNotification(AudioRecord recorder)
        {
            int readAudio = audioRecorder.read(buffer, 0, buffer.length); // Fill buffer

            if (readAudio == AudioRecord.ERROR_BAD_VALUE || readAudio == AudioRecord.ERROR_INVALID_OPERATION)
                return;

            if (state == State.STOPPED)
                return;

            double fN = (double)readAudio;

            double accum = 0;
            for (int i = 0; i < readAudio; i ++)
            {
                accum += Math.abs((double)buffer[i]);
            }

            double soundLevel = accum/fN;

//            Log.e("123", String.format("%f %f", soundLevel, accum));

            if (isRecording) {

                try
                {
                    randomAccessWriter.write(buffer); // Write buffer to file
                    payloadSize += buffer.length;
                }
                catch (IOException e)
                {
                    Log.e(ExtAudioRecorder.class.getName(), "Error occured in updateListener, recording is aborted");
                    //stop();
                }

                float duration = (float)(System.currentTimeMillis() - startRecordTime)/1000;

                if (soundLevel < PEAK_THRESHOLD_BEGAN)
                    silenceTime += (float)buffer.length / sRate;
                else
                    silenceTime = 0;

                if (silenceTime > SECOND_OF_SILENCE || duration > MAX_RECORD_TIME) {
                    isRecording = false;
                    stopFetchingAudio();
                    Log.w("Duration", duration + "");
                    final String command = String.format("AudioListener.getInstance().onStoppedListening('%s', %f)", filePath, duration + SECOND_OF_SILENCE/2);
                    Wrapper.activity.runOnGLThread(new Runnable() {
                        @Override
                        public void run() {
                            Cocos2dxJavascriptJavaBridge.evalString(command);
                        }
                    });
                }
            }
            else {

                cachedBuffer.enqueue(buffer, buffer.length);

                if (soundLevel > PEAK_THRESHOLD_BEGAN) {
                    isRecording = true;

                    startRecordTime = System.currentTimeMillis();

                    while (cachedBuffer.size() > 0) {
                        Map<String, Object> dict = cachedBuffer.dequeue();
                        byte[] data = Base64.decode((String) dict.get("data"), Base64.DEFAULT);
                        int length = (int)dict.get("length");

                        try
                        {
                            randomAccessWriter.write(data); // Write buffer to file
                            payloadSize += length;
                        }
                        catch (IOException e)
                        {
                            Log.e(ExtAudioRecorder.class.getName(), "Error occured in updateListener, recording is aborted");
                            //stop();
                        }
                    }

                    final String command = String.format("AudioListener.getInstance().onStartedListening()");
                    Wrapper.activity.runOnGLThread(new Runnable() {
                        @Override
                        public void run() {
                            Cocos2dxJavascriptJavaBridge.evalString(command);
                        }
                    });
                }
            }
        }

        public void onMarkerReached(AudioRecord recorder)
        {
            // NOT USED
        }
    };

    public Recorder(int sampleRate) {
        bSamples = 16;
        nChannels = 1;

        aSource = MediaRecorder.AudioSource.MIC;
        sRate   = sampleRate;
        aFormat = AudioFormat.ENCODING_PCM_16BIT;

        framePeriod = sampleRate * TIMER_INTERVAL / 1000;
        bufferSize = framePeriod * 2 * bSamples * nChannels / 8;
        if (bufferSize < AudioRecord.getMinBufferSize(sampleRate, nChannels, aFormat))
        { // Check to make sure buffer size is not smaller than the smallest allowed one
            bufferSize = AudioRecord.getMinBufferSize(sampleRate, nChannels, aFormat);
            // Set frame period and timer interval accordingly
            framePeriod = bufferSize / ( 2 * bSamples * nChannels / 8 );
            Log.w(ExtAudioRecorder.class.getName(), "Increasing buffer size to " + Integer.toString(bufferSize));
        }

        filePath = Cocos2dxHelper.getCocos2dxWritablePath() + "/" + FILE_NAME;
//            filePath = "/sdcard/" + FILE_NAME;

        this.initRecorder();

        cachedBuffer = new RecorderQueue();
        cachedBuffer.setMaxCapacity((int)(sampleRate * SECOND_OF_SILENCE));
    }

    private void initRecorder() {
        try {
            audioRecorder = new AudioRecord(aSource, sRate, nChannels+1, aFormat, bufferSize);

            if (audioRecorder.getState() != AudioRecord.STATE_INITIALIZED){
                Log.w(Recorder.class.getName(), "AudioRecord initialization failed");
                throw new Exception("AudioRecord initialization failed");
            }
            audioRecorder.setRecordPositionUpdateListener(updateListener);
            audioRecorder.setPositionNotificationPeriod(framePeriod);

            state = State.INITIALIZING;
        }
        catch (Exception e)
        {
            if (e.getMessage() != null)
            {
                Log.e(Recorder.class.getName(), e.getMessage());
            }
            else
            {
                Log.e(Recorder.class.getName(), "Unknown error occured while initializing recording");
            }
            state = State.ERROR;
        }
    }

    public State getState()
    {
        return state;
    }

    /**
     *
     * Prepares the recorder for recording, in case the recorder is not in the INITIALIZING state and the file path was not set
     * the recorder is set to the ERROR state, which makes a reconstruction necessary.
     * In case uncompressed recording is toggled, the header of the wave file is written.
     * In case of an exception, the state is changed to ERROR
     *
     */
    public void prepare()
    {
        try
        {
            if (state == State.INITIALIZING || state == State.STOPPED)
        {
                if ((audioRecorder.getState() == AudioRecord.STATE_INITIALIZED) & (filePath != null))
                {
                    // write file header

                    randomAccessWriter = new RandomAccessFile(filePath, "rw");

                    randomAccessWriter.setLength(0); // Set file length to 0, to prevent unexpected behavior in case the file already existed
                    randomAccessWriter.writeBytes("RIFF");
                    randomAccessWriter.writeInt(0); // Final file size not known yet, write 0
                    randomAccessWriter.writeBytes("WAVE");
                    randomAccessWriter.writeBytes("fmt ");
                    randomAccessWriter.writeInt(Integer.reverseBytes(16)); // Sub-chunk size, 16 for PCM
                    randomAccessWriter.writeShort(Short.reverseBytes((short) 1)); // AudioFormat, 1 for PCM
                    randomAccessWriter.writeShort(Short.reverseBytes(nChannels));// Number of channels, 1 for mono, 2 for stereo
                    randomAccessWriter.writeInt(Integer.reverseBytes(sRate)); // Sample rate
                    randomAccessWriter.writeInt(Integer.reverseBytes(sRate*bSamples*nChannels/8)); // Byte rate, SampleRate*NumberOfChannels*BitsPerSample/8
                    randomAccessWriter.writeShort(Short.reverseBytes((short)(nChannels*bSamples/8))); // Block align, NumberOfChannels*BitsPerSample/8
                    randomAccessWriter.writeShort(Short.reverseBytes(bSamples)); // Bits per sample
                    randomAccessWriter.writeBytes("data");
                    randomAccessWriter.writeInt(0); // Data chunk size not known yet, write 0

                    buffer = new byte[framePeriod*bSamples/8*nChannels];
                    state = State.READY;
                }
                else
                {
                    Log.e(Recorder.class.getName(), "prepare() method called on uninitialized recorder");
                    state = State.ERROR;
                }
            }
            else
            {
                Log.e(Recorder.class.getName(), "prepare() method called on illegal state");
//                release();
                state = State.ERROR;
            }
        }
        catch(Exception e)
        {
            if (e.getMessage() != null)
            {
                Log.e(Recorder.class.getName(), e.getMessage());
            }
            else
            {
                Log.e(Recorder.class.getName(), "Unknown error occured in prepare()");
            }
            state = State.ERROR;
        }
    }

    /**
     *
     *
     * Starts the recording, and sets the state to RECORDING.
     * Call after prepare().
     *
     */
    public void start()
    {
        if (state == State.READY)
        {
            payloadSize = 0;
            audioRecorder.startRecording();
            audioRecorder.read(buffer, 0, buffer.length);
            state = State.RECORDING;
        }
        else
        {
            Log.e(ExtAudioRecorder.class.getName(), "start() called on illegal state");
            state = State.ERROR;
        }
    }

    /**
     *
     *
     *  Stops the recording, and sets the state to STOPPED.
     * In case of further usage, a reset is needed.
     * Also finalizes the wave file in case of uncompressed recording.
     *
     */
    public void stop()
    {
        if (state == State.RECORDING)
        {
            audioRecorder.stop();

            try
            {
                randomAccessWriter.seek(4); // Write size to RIFF header
                randomAccessWriter.writeInt(Integer.reverseBytes(36+payloadSize));

                randomAccessWriter.seek(40); // Write size to Subchunk2Size field
                randomAccessWriter.writeInt(Integer.reverseBytes(payloadSize));

                randomAccessWriter.close();
            }
            catch(IOException e)
            {
                Log.e(ExtAudioRecorder.class.getName(), "I/O exception occured while closing output file");
                state = State.ERROR;
            }
            state = State.STOPPED;
        }
        else
        {
            Log.e(ExtAudioRecorder.class.getName(), "stop() called on illegal state");
            state = State.ERROR;
        }
    }

    public void startFetchingAudio() {
        final Recorder self = this;
        new Thread() {
            public void run() {
//                self.initRecorder();
                self.prepare();
                self.start();
            }
        }.start();
    }

    public void stopFetchingAudio() {
        stop();
        silenceTime = 0;
    }

    /*
	 *
	 * Converts a byte[2] to a short, in LITTLE_ENDIAN format
	 *
	 */
    private short getShort(byte argB1, byte argB2)
    {
        return (short)(argB1 | (argB2 << 8));
    }
}
