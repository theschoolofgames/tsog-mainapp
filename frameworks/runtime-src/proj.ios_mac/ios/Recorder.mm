//
//  Recorder.m
//  tsog
//
//  Created by Thuy Dong Xuan on 12/28/15.
//
//

#import "Recorder.h"
#import "RecorderQueue.h"

#import <AudioToolbox/AudioServices.h>

#import "ScriptingCore.h"

static Recorder *sharedEngine = nil;

@interface Recorder()

@property(nonatomic, retain) RecorderQueue* cachedBuffer;
@property(nonatomic, retain) NSData* cachedBufferData;

@end

@implementation Recorder

+ (Recorder *)sharedEngine
{
  @synchronized(self)
  {
    if (!sharedEngine)
      sharedEngine = [[Recorder alloc] init];
  }
  return sharedEngine;
}

- (instancetype)init {
  
  self.microphone = [EZMicrophone microphoneWithDelegate:self];
  self.isRecording = NO;
  self.secondOfSilence = kSecondOfSilence;
  self.cachedBuffer = [[RecorderQueue alloc] init];
  self.cachedBuffer.maxCapacity = [[AVAudioSession sharedInstance] sampleRate] * self.secondOfSilence;
  
//  UInt32 audioRouteOverride = kAudioSessionOverrideAudioRoute_Speaker;
//  AudioSessionSetProperty (kAudioSessionProperty_OverrideAudioRoute,
//                           sizeof (audioRouteOverride),&audioRouteOverride);
  
  [EZAudioUtilities setShouldExitOnCheckResultFail:NO];
  
  return self;
}

- (void)startFetchingAudio {
  
  AVAudioSession *session = [AVAudioSession sharedInstance];
  [session setCategory:AVAudioSessionCategoryPlayAndRecord withOptions:AVAudioSessionCategoryOptionDefaultToSpeaker error:nil];
  [session setActive:YES error:nil];
  
  [self.microphone startFetchingAudio];
}

- (void)stopFetchingAudio {
  [self.microphone stopFetchingAudio];
  
  if (self.isRecording) {
    self.isRecording = NO;
    [self.recorder closeAudioFile];
  }
  
  AVAudioSession *session = [AVAudioSession sharedInstance];
  [session setCategory:AVAudioSessionCategorySoloAmbient error:nil];
  [session setActive:YES error:nil];
}

//------------------------------------------------------------------------------
#pragma mark - EZMicrophoneDelegate
//------------------------------------------------------------------------------

- (void)microphone:(EZMicrophone *)microphone changedPlayingState:(BOOL)isPlaying
{
  NSLog(@"%@", isPlaying ? @"Microphone On" : @"Microphone Off");
}

//------------------------------------------------------------------------------

#warning Thread Safety
// Note that any callback that provides streamed audio data (like streaming microphone input) happens on a separate audio thread that should not be blocked. When we feed audio data into any of the UI components we need to explicity create a GCD block on the main thread to properly get the UI to work.
- (void)   microphone:(EZMicrophone *)microphone
     hasAudioReceived:(float **)buffer
       withBufferSize:(UInt32)bufferSize
 withNumberOfChannels:(UInt32)numberOfChannels
{
  float maxPeak = 0;
  
  for (int j = 0; j < bufferSize; j++)
  {
    float curSample = buffer[0][j];
    if (curSample > maxPeak)
    {
      maxPeak = curSample;
    }
  }
  
  [self.cachedBuffer enqueue:self.cachedBufferData maxPeak:maxPeak length:bufferSize];
  
//  NSLog(@"%f", [self.cachedBuffer getMaxPeak]);
  
  float bufferMaxPeak = [self.cachedBuffer getMaxPeak];
  
  if (self.isRecording) {
    float duration = self.recorder.duration;
    
    if (bufferMaxPeak < kPeakThresholdEnded || duration > kMaxRecordTime) {
//      NSLog(@"%f", bufferMaxPeak);
      self.isRecording = NO;
      
      [self.recorder closeAudioFile];
      [self.microphone stopFetchingAudio];
      
      while ([self.cachedBuffer.queue count] > 0)
        [self.cachedBuffer dequeue];
      
      dispatch_async(dispatch_get_main_queue(), ^{
        NSString* command = [NSString stringWithFormat:@"AudioListener.getInstance().onStoppedListening('%@', %f)", [[self testFilePathURL] path], duration];
        ScriptingCore::getInstance()->evalString([command UTF8String], NULL);
        
      });
    }
  }
  else {
    if (bufferMaxPeak > kPeakThresholdBegan) {
      dispatch_async(dispatch_get_main_queue(), ^{

        self.recorder = [EZRecorder recorderWithURL:[self testFilePathURL]
                                       clientFormat:[self.microphone audioStreamBasicDescription]
                                           fileType:EZRecorderFileTypeWAV
                                           delegate:self];
        self.isRecording = YES;
        NSLog(@"%f", bufferMaxPeak);
        
        for (int i = 0; i < [self.cachedBuffer.queue count]; i++) {
          NSDictionary* dictData = [self.cachedBuffer.queue objectAtIndex:i];
          NSData* data = [dictData objectForKey:@"data"];
          
          NSDictionary* dict = (NSDictionary*) [NSKeyedUnarchiver unarchiveObjectWithData:data];
          
          
          int numberOfBuffers = [dict[@"buffersCount"] intValue];
          
          AudioBufferList *audio = (AudioBufferList*)malloc(sizeof(AudioBufferList) + (numberOfBuffers-1)*sizeof(AudioBuffer));
          if ( !audio ) {
            return;
          }
          audio->mNumberBuffers = numberOfBuffers;
          NSArray *channels = dict[@"buffers"];
          for ( int i = 0; i < numberOfBuffers; i++ ) {
            NSData *data = channels[i][@"data"];
            int channelsPerBuffer = [channels[i][@"channels"] intValue];
            int bytesPerBuffer = [data length];
            if ( bytesPerBuffer > 0 ) {
              audio->mBuffers[i].mData = malloc(bytesPerBuffer);
              if ( !audio->mBuffers[i].mData ) {
//                for ( int j=0; jmBuffers[j].mData);
                free(audio);
                return;
              }
              memcpy(audio->mBuffers[i].mData, [data bytes], [data length]);
            } else {
              audio->mBuffers[i].mData = NULL;
            }
            audio->mBuffers[i].mDataByteSize = bytesPerBuffer;
            audio->mBuffers[i].mNumberChannels = channelsPerBuffer;
          }
          
          [self.recorder appendDataFromBufferList:audio
                                   withBufferSize:[[dictData objectForKey:@"length"] intValue]];
          
          for (int i = 0; i < numberOfBuffers; i++)
            free(audio->mBuffers[i].mData);
          free(audio);
        }
      
//      while ([self.cachedBuffer.queue count] > 0)
//        [self.cachedBuffer dequeue];
  
      
        ScriptingCore::getInstance()->evalString("AudioListener.getInstance().onStartedListening()", NULL);
      });
    }
  }
}

//------------------------------------------------------------------------------

- (void)   microphone:(EZMicrophone *)microphone
        hasBufferList:(AudioBufferList *)bufferList
       withBufferSize:(UInt32)bufferSize
 withNumberOfChannels:(UInt32)numberOfChannels
{
  if (self.cachedBufferData)
    [self.cachedBufferData release];
  
//  self.cachedBufferData = [[NSData dataWithBytes:bufferList->mBuffers[0].mData length:bufferList->mBuffers[0].mDataByteSize] retain];
  NSMutableDictionary *dict = [NSMutableDictionary dictionaryWithObject:@(bufferList->mNumberBuffers) forKey:@"buffersCount"];
  
  
  NSMutableArray *buffers = [NSMutableArray array];
  for ( int i=0; i< bufferList->mNumberBuffers; i++ ) {
    NSData *data = [NSData dataWithBytes:bufferList->mBuffers[i].mData length:bufferList->mBuffers[i].mDataByteSize];
    NSDictionary *obj = @{@"data":data, @"channels":@(bufferList->mBuffers[i].mNumberChannels)};
    [buffers addObject:obj];
  }
  [dict setValue:buffers forKey:@"buffers"];
  
  NSData *data = [[NSKeyedArchiver archivedDataWithRootObject:dict] retain];
  self.cachedBufferData = data;
  
  // Getting audio data as a buffer list that can be directly fed into the EZRecorder. This is happening on the audio thread - any UI updating needs a GCD main queue block. This will keep appending data to the tail of the audio file.
  if (self.isRecording)
  {
    @try {
      [self.recorder appendDataFromBufferList:bufferList
                               withBufferSize:bufferSize];
    }
    @catch (NSException *exception) {
      NSLog(@"%@", exception.reason);
    }
  }
}

//------------------------------------------------------------------------------
#pragma mark - EZRecorderDelegate
//------------------------------------------------------------------------------

- (void)recorderDidClose:(EZRecorder *)recorder
{
  recorder.delegate = nil;
}

//------------------------------------------------------------------------------

- (void)recorderUpdatedCurrentTime:(EZRecorder *)recorder
{
//  __weak typeof (self) weakSelf = self;
//  NSString *formattedCurrentTime = [recorder formattedCurrentTime];
//  dispatch_async(dispatch_get_main_queue(), ^{
//    weakSelf.currentTimeLabel.text = formattedCurrentTime;
//  });
}

//------------------------------------------------------------------------------
#pragma mark - Utility
//------------------------------------------------------------------------------

- (NSArray *)applicationDocuments
{
  return NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
}

//------------------------------------------------------------------------------

- (NSString *)applicationDocumentsDirectory
{
  NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
  NSString *basePath = ([paths count] > 0) ? [paths objectAtIndex:0] : nil;
  return basePath;
}

//------------------------------------------------------------------------------

- (NSURL *)testFilePathURL
{
  return [NSURL fileURLWithPath:[NSString stringWithFormat:@"%@/%@",
                                 [self applicationDocumentsDirectory],
                                 kAudioFilePath]];
}

@end
