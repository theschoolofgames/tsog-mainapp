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

#import "SimpleAudioRecordEngine_objc.h"

static UIViewController* viewController;
static double startTime = -1;
static BOOL isListening = false;
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

+ (BOOL)checkMic {
  return [[SimpleAudioRecordEngine sharedEngine] checkMic];
}

+ (BOOL)isRecording {
  return [[SimpleAudioRecordEngine sharedEngine] isRecording];
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

+ (void)startBackgroundSoundDetecting {
  NSLog(@"startBackgroundSoundDetecting");
  [H102Wrapper initRecord];
  [H102Wrapper startRecord];
  timer = [NSTimer timerWithTimeInterval:1 target:self selector:@selector(soundDetectingLoop) userInfo:NULL repeats:YES];
  [[NSRunLoop mainRunLoop] addTimer:timer forMode:NSDefaultRunLoopMode];
//  [viewController performSelector:@selector(soundDetectingLoop) withObject:NULL afterDelay:0.3];
}

+ (void)soundDetectingLoop {
  
  float maxAmplitude = [[SimpleAudioRecordEngine sharedEngine] peakPowerForChannel:0];
  NSLog(@"Amplitude: %f", maxAmplitude);
  if (!isListening) {
    if (maxAmplitude > -18) {
      NSLog(@"Start");
      isListening = YES;
      ScriptingCore::getInstance()->evalString("AudioListener.getInstance().onStartedListening()", NULL);
    }
  } else {
    if (maxAmplitude < -18) {
      NSLog(@"Stop");
      double deltaTime = [[NSDate date] timeIntervalSince1970] - startTime;
      [H102Wrapper stopBackgroundSoundDetecting];
      NSString* command = [NSString stringWithFormat:@"AudioListener.getInstance().onStoppedListening('%@/%@', %f)", [SimpleAudioRecordEngine sharedEngine].documentsPath, @"record_sound.wav", deltaTime];
      ScriptingCore::getInstance()->evalString([command UTF8String], NULL);
      return;
    }
  }
  
  if (!isListening) {
    NSLog(@"Restart");
    [H102Wrapper initRecord];
    [H102Wrapper startRecord];
    startTime = [[NSDate date] timeIntervalSince1970];
  }
}

+ (void)stopBackgroundSoundDetecting {
  [timer invalidate];
  isListening = NO;
  [H102Wrapper stopRecord];
}

@end
