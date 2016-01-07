//
//  Recorder.h
//  tsog
//
//  Created by Thuy Dong Xuan on 12/28/15.
//
//

#import <EZAudio/EZAudio.h>

#define kSecondOfSilence      1.0
#define kPeakThresholdBegan   0.15
#define kPeakThresholdEnded   0.1
#define kMaxRecordTime        15

#define kAudioFilePath @"record_sound.wav"

@interface Recorder : NSObject<EZMicrophoneDelegate,EZRecorderDelegate>

@property (nonatomic, assign) BOOL isRecording;
@property (nonatomic, strong) EZMicrophone *microphone;
@property (nonatomic, strong) EZRecorder *recorder;

@property (nonatomic, assign) float secondOfSilence;

+ (Recorder *)sharedEngine;

- (void)startFetchingAudio;
- (void)stopFetchingAudio;

@end
