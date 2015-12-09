//
//  SimpleAudioRecordEngine_objc.h
//  tsog
//
//  Created by Thuy Dong Xuan on 12/7/15.
//
//

#import <AVFoundation/AVFoundation.h>
#import <Foundation/Foundation.h>

@interface SimpleAudioRecordEngine : NSObject <AVAudioRecorderDelegate>
{
  AVAudioRecorder *_recorder;
  AVAudioSession *_audioSession;
  
  NSString *_documentsPath;
}

@property (nonatomic, retain) AVAudioRecorder *recorder;

+ (SimpleAudioRecordEngine *)sharedEngine;

- (BOOL)checkMic;
- (BOOL)isRecording;

- (void)initRecord:(NSString *)fileName;
- (void)startRecord;
- (void)stopRecord;

- (NSString *)documentsPath;

@end
