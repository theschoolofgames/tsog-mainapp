//
//  SimpleAudioRecordEngine_objc.m
//  tsog
//
//  Created by Thuy Dong Xuan on 12/7/15.
//
//

#import "SimpleAudioRecordEngine_objc.h"
#import "audio/ios/SimpleAudioEngine_objc.h"

@implementation SimpleAudioRecordEngine

@synthesize recorder = _recorder;


static SimpleAudioRecordEngine *sharedEngine = nil;


#pragma mark -
#pragma mark Life Cycle Methods

+ (SimpleAudioRecordEngine *)sharedEngine
{
    @synchronized(self)
    {
        if (!sharedEngine)
            sharedEngine = [[SimpleAudioRecordEngine alloc] init];
    }
    return sharedEngine;
}

+ (id)alloc
{
    @synchronized(self)
    {
        NSAssert(sharedEngine == nil, @"Attempted to allocate a second instance of a singleton");
        return [super alloc];
    }
    return nil;
}

- (id)init
{
    if ((self = [super init]))
    {
        NSError *error = nil;
        
        _audioSession = [AVAudioSession sharedInstance];
        [_audioSession setCategory:AVAudioSessionCategoryPlayAndRecord error:&error];
        
        if (error)
        {
            NSLog(@"1: error: %@", [error localizedDescription]);
        }
        
        [_audioSession setActive:YES error:&error];
        
        if (error)
        {
            NSLog(@"2: error: %@", [error localizedDescription]);
        }
    }
    
    return self;
}

- (void)dealloc
{
    [_recorder stop];
    [_recorder release];
    [_documentsPath release];
    [super dealloc];
}


#pragma mark -
#pragma mark Recording Methods

- (BOOL)checkMic
{
    if (_audioSession)
        return _audioSession.inputIsAvailable;
    
    return NO;
}

- (BOOL)isRecording
{
    if (!_recorder)
        return NO;
    
    return _recorder.isRecording;
}

- (void)initRecord:(NSString *)fileName
{
    if (_recorder)
    {
        [_recorder stop];
        [_recorder release];
        _recorder = nil;
    }
    
    NSURL *fileURL = [NSURL fileURLWithPath:[[self documentsPath] stringByAppendingPathComponent:fileName]];
    
    NSDictionary *settings = [NSDictionary dictionaryWithObjectsAndKeys:
                              [NSNumber numberWithFloat: 44100.0],                      AVSampleRateKey,
                              [NSNumber numberWithInt:   kAudioFormatLinearPCM],        AVFormatIDKey,
                              [NSNumber numberWithInt:   16],                           AVEncoderBitRateKey,
                              [NSNumber numberWithInt:   1],                            AVNumberOfChannelsKey,
                              [NSNumber numberWithInt:   AVAudioQualityMax],            AVEncoderAudioQualityKey,
                              nil];
    
    NSError *error = nil;
    
    _recorder = [[AVAudioRecorder alloc] initWithURL:fileURL settings:settings error:&error];
    [_recorder setMeteringEnabled:YES];
    _recorder.delegate = self;
    
    if (error)
    {
        NSLog(@"3: error: %@", [error localizedDescription]);
    }
}

- (void)startRecord
{
    if (_recorder)
    {
        NSError *setCategoryError = nil;
        [[AVAudioSession sharedInstance] setCategory: AVAudioSessionCategoryRecord error: &setCategoryError];
        if ([_recorder record])
        {
            NSLog(@"Success recording!");
        }
        else
        {
            NSLog(@"Fail recording!");
        }
    }
}

- (void)stopRecord
{
    NSError *setCategoryError = nil;
    [[AVAudioSession sharedInstance] setCategory: AVAudioSessionCategoryPlayback error: &setCategoryError];
    [_recorder stop];
}

- (NSString *)documentsPath
{
    if (!_documentsPath)
    {
        NSArray *searchPath = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
        _documentsPath = [searchPath objectAtIndex:0];
        [_documentsPath retain];
    }
    
    return _documentsPath;
}

- (float)peakPowerForChannel:(NSUInteger)channelNumber {
    if (_recorder) {
        [_recorder updateMeters];
        return [_recorder peakPowerForChannel:channelNumber];
    }
    return 0;
}


#pragma mark -
#pragma mark Audio Recording Delegate Methods

- (void)audioRecorderDidFinishRecording:(AVAudioRecorder *)recorder successfully:(BOOL)flag
{
    
}

@end
