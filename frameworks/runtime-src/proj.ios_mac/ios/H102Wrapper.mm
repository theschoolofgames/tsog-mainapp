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

#import "Recorder.h"

#define kAmplitudeThreshole   -22
#define kMaxRecordingTime     15

static UIViewController* viewController;
static NSTimeInterval startTime = -1;
static BOOL isListening = false;

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

+ (BOOL)isRecording {
  return [Recorder sharedEngine].isRecording;
}

+ (void)initRecord {
//  [[SimpleAudioRecordEngine sharedEngine] initRecord:@"record_sound.wav"];
}

+ (void)startFetchingAudio {
//  [[SimpleAudioRecordEngine sharedEngine] startRecord];
  [[Recorder sharedEngine] startFetchingAudio];
}

+ (void)stopRecord {
  [[SimpleAudioRecordEngine sharedEngine] stopRecord];
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
    
  [H102Wrapper stopSpeechRecognition];
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
