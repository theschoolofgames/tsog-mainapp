//
//  H102Wrapper.m
//  tsog
//
//  Created by Stefan Nguyen on 9/4/15.
//
//
#import "H102Wrapper.h"
#import <PDKeychainBindings.h>
#import <Analytics.h>

#import <Crashlytics/Crashlytics.h>
#import "ScriptingCore.h"
#import "cocos2d.h"

#import "SimpleAudioRecordEngine_objc.h"
#import "SpeechRecognitionListener.h"

static UIViewController* viewController;
static double startTime = -1;
static BOOL invalidateTimer = NO;
static NSTimer* timer;

@implementation H102Wrapper

+ (void)setCurrentViewController:(UIViewController *)pViewController {
  viewController = pViewController;
}

//+ (void)openScheme:(NSString *)bundleId withData:(NSString *)data {
//  NSURL *theURL = [NSURL URLWithString:[NSString stringWithFormat:@"%@://%@", bundleId, data]];
//  if ([[UIApplication sharedApplication] canOpenURL:theURL])
//    [[UIApplication sharedApplication] openURL:theURL];
//  else {
//    NSLog(@"Receiver not found");
//    UIAlertView *message = [[UIAlertView alloc] initWithTitle:@"Error"
//                                                      message:@"Target game not found"
//                                                     delegate:nil
//                                            cancelButtonTitle:@"OK"
//                                            otherButtonTitles:nil];
//    [message show];
//  }
//}

+ (void)showMessage:(NSString *)title message:(NSString *)message  {
  UIAlertView *alertView = [[UIAlertView alloc] initWithTitle:title
                                                      message:message
                                                     delegate:nil
                                            cancelButtonTitle:@"OK"
                                            otherButtonTitles:nil];
  
  [alertView show];
}

+ (NSString *)getUniqueDeviceId
{
  PDKeychainBindings *keychain = [PDKeychainBindings sharedKeychainBindings];
  NSString *uniqueIdentifier = [keychain objectForKey:@"keyVendor"];
  
  if (!uniqueIdentifier || !uniqueIdentifier.length) {
    
    NSUUID *udid = [[UIDevice currentDevice] identifierForVendor];
    uniqueIdentifier = [udid UUIDString];
    [keychain setObject:uniqueIdentifier forKey:@"keyVendor"];
  }
  
  return uniqueIdentifier;
}

+ (void)segmentIdentity:(NSString *)userId traits:(NSString *)traits {
  dispatch_async(dispatch_get_main_queue(), ^{
    NSData* traitData = [traits dataUsingEncoding:NSUTF8StringEncoding];
    NSDictionary* traitDict = [NSJSONSerialization JSONObjectWithData:traitData options:0 error:nil];
    
    [[SEGAnalytics sharedAnalytics] identify:userId traits:traitDict];
  });
}

+ (void)segmentTrack:(NSString *)event properties:(NSString *)properties {
  dispatch_async(dispatch_get_main_queue(), ^{
    NSData* propertiesData = [properties dataUsingEncoding:NSUTF8StringEncoding];
    NSDictionary* propertiesDict = [NSJSONSerialization JSONObjectWithData:propertiesData options:0 error:nil];
    
    [[SEGAnalytics sharedAnalytics] track:event properties:propertiesDict];
    
  });
}

+ (void)fabricCustomLoggingWithKey:(NSString *)key andValue:(NSString *)value {
    [[Crashlytics sharedInstance] setObjectValue:value forKey:key];
}

+ (void)initRecord {
  [[SimpleAudioRecordEngine sharedEngine] initRecord:@"record_sound.wav"];
}

+ (void)startRecord {
  [[SimpleAudioRecordEngine sharedEngine] startRecord];
}

+ (void)stopRecord {
  [[SimpleAudioRecordEngine sharedEngine] stopRecord];
}

+ (void)startFetchingAudio {
  NSLog(@"startBackgroundSoundDetecting");
  [H102Wrapper initRecord];
  [H102Wrapper startRecord];
  startTime = -1;
  invalidateTimer = NO;
  timer = [NSTimer timerWithTimeInterval:1 target:self selector:@selector(soundDetectingLoop:) userInfo:NULL repeats:YES];
  [[NSRunLoop mainRunLoop] addTimer:timer forMode:NSDefaultRunLoopMode];
  //  [viewController performSelector:@selector(soundDetectingLoop) withObject:NULL afterDelay:0.3];
}

+ (void)soundDetectingLoop:(NSTimer*) timer {
  if (invalidateTimer) {
    [timer invalidate];
    return;
  }
  
  float maxAmplitude = [[SimpleAudioRecordEngine sharedEngine] peakPowerForChannel:0];
  NSLog(@"Amplitude: %f", maxAmplitude);
  if (startTime < 0) {
    if (maxAmplitude > -20) {
      NSLog(@"Start");
      startTime = [[NSDate date] timeIntervalSince1970];
      ScriptingCore::getInstance()->evalString("AudioListener.getInstance().onStartedListening()", NULL);
    }
  } else {
    if (maxAmplitude < -20) {
      NSLog(@"Stop");
      double deltaTime = [[NSDate date] timeIntervalSince1970] - startTime;
      [H102Wrapper stopFetchingAudio];
      NSString* command = [NSString stringWithFormat:@"AudioListener.getInstance().onStoppedListening('%@/%@', %f)", [SimpleAudioRecordEngine sharedEngine].documentsPath, @"record_sound.wav", deltaTime];
      ScriptingCore::getInstance()->evalString([command UTF8String], NULL);
      return;
    }
  }
  
  if (startTime < 0) {
    NSLog(@"Restart");
    [H102Wrapper initRecord];
    [H102Wrapper startRecord];
  }
}

+ (void)stopFetchingAudio {
  invalidateTimer = YES;
  [H102Wrapper stopRecord];
}

+ (void)changeSpeechLanguageArray:(NSString *)serializedString {
  NSData* data = [serializedString dataUsingEncoding:NSUTF8StringEncoding];
  NSArray* array = [NSJSONSerialization JSONObjectWithData:data options:0 error:nil];
  
  NSMutableArray* uppercaseArray = [[NSMutableArray alloc] init];
  for (NSString* s in array) {
    [uppercaseArray addObject:[s uppercaseString]];
  }
  
  [[SpeechRecognitionListener sharedEngine] setLanguageData:uppercaseArray];
}

+ (void)startSpeechRecognition:(NSNumber*) timeout {
  [[SpeechRecognitionListener sharedEngine] start];
  
  if (timeout) {
    float delay = ([timeout floatValue] / 1000);
    [[H102Wrapper class] performSelector:@selector(startSpeechRecognitionDelay) withObject:nil afterDelay:delay];
  }
}

+ (void)startSpeechRecognitionDelay {
  if ([[SpeechRecognitionListener sharedEngine] isListening]) {
    NSString* command = [NSString stringWithFormat:@"SpeechRecognitionListener.getInstance().onResult('%@')", @""];
    ScriptingCore::getInstance()->evalString([command UTF8String], NULL);
  }
  
  [[SpeechRecognitionListener sharedEngine] suspend];
}

+ (void)stopSpeechRecognition {
  [[SpeechRecognitionListener sharedEngine] stop];
}

+ (void)startRestClock:(NSNumber *)timeToPauseGame {
    NSLog(@"startRestClock");
    float time = [timeToPauseGame floatValue];
    [self performSelector:@selector(pauseGame) withObject:nil afterDelay:time];
}

+ (void)pauseGame {
    NSLog(@"game is paused");
    dispatch_async(dispatch_get_main_queue(), ^{
        //Your main thread code goes in here
        NSString* command = [NSString stringWithFormat:@"GameListener.getInstance().pauseGame()"];
        ScriptingCore::getInstance()->evalString([command UTF8String], NULL);
    });
}

@end
