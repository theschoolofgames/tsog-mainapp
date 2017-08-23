//
//  H102Wrapper.m
//  tsog
//
//  Created by Stefan Nguyen on 9/4/15.
//
//
#import "H102Wrapper.h"
#import <PDKeychainBindingsController/PDKeychainBindings.h>

#import <Crashlytics/Crashlytics.h>
#import "ScriptingCore.h"
#import "cocos2d.h"

#import "SimpleAudioRecordEngine_objc.h"
#import "SpeechRecognitionListener.h"

#import "AudioEngine.h"

#import "Dialog.h"

#import <FBSDKShareKit/FBSDKShareKit.h>

#import "AppController.h"

#import <FirebaseRemoteConfig/FirebaseRemoteConfig.h>
#import <FirebaseAnalytics/FirebaseAnalytics.h>

#import <Social/Social.h>

#import "DetectObjectViewController.h"
#import "SessionManager.h"

static UIViewController* viewController;
static double startTime = -1;
static BOOL invalidateTimer = NO;
static NSTimer* timer;

static int noiseDetectionLoopCount = 0;
static NSMutableArray* noiseDetectionArray = nil;
static BOOL isOpenedFromNotification = NO;

@implementation H102Wrapper

+ (void)setCurrentViewController:(UIViewController *)pViewController {
  viewController = pViewController;
}

+ (NSString*)getVersionName {
  NSString *version = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleShortVersionString"];
  return version;
}

+ (NSString*)getBuildNumber {
  NSString *build = [[[NSBundle mainBundle] infoDictionary] objectForKey:(NSString *)kCFBundleVersionKey];
  return build;
}

+ (void)showUpdateDialog:(NSString*)version forceUpdate:(BOOL) forceUpdate {
  Dialog* dialog = [[Dialog alloc] initWithTitle:@"New update found"
                                         message:[NSString stringWithFormat:@"Check out the new update for %@!\nAvailable now on %@", version, @"AppStore"]
                               cancelButtonTitle:@"OK"
                               otherButtonTitles:forceUpdate ? nil : @"No, thanks"];
  dialog.appStoreURL = @"itms://itunes.apple.com/us/app/apple-store/id1090937711?mt=8";
  [dialog show];
}

+ (void)showCoreMLDemo {
    CCLOG("showCoreMLDemo");
    
    // Set current diamonds and current object list
    [SessionManager sharedInstance].diamondCount = 100;
    
    UIStoryboard *sb = [UIStoryboard storyboardWithName:@"CoreMLDemo" bundle:nil];
    DetectObjectViewController *detectVC = [sb instantiateViewControllerWithIdentifier:@"DetectObjectViewController"];
    UINavigationController *nav = [[UINavigationController alloc] initWithRootViewController:detectVC];
    nav.navigationBarHidden = YES;
    
    AppController *appController = (AppController*)[[UIApplication sharedApplication] delegate];
    UIViewController *rootController = (UIViewController*)appController.viewController;
    [rootController presentViewController:nav animated:YES completion:nil];
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
+ (void)sendEmail: (NSString *)email {
    [[UIApplication sharedApplication] openURL:[NSURL URLWithString:email]];
}


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
//  dispatch_async(dispatch_get_main_queue(), ^{
//    NSData* traitData = [traits dataUsingEncoding:NSUTF8StringEncoding];
//    NSDictionary* traitDict = [NSJSONSerialization JSONObjectWithData:traitData options:0 error:nil];
//    
//    [[SEGAnalytics sharedAnalytics] identify:userId traits:traitDict];
//  });
}

+ (void)segmentTrack:(NSString *)event properties:(NSString *)properties {
//  dispatch_async(dispatch_get_main_queue(), ^{
//    NSData* propertiesData = [properties dataUsingEncoding:NSUTF8StringEncoding];
//    NSDictionary* propertiesDict = [NSJSONSerialization JSONObjectWithData:propertiesData options:0 error:nil];
//
//    [[SEGAnalytics sharedAnalytics] track:event properties:propertiesDict];
//    
//  });
}

+ (void)fabricCustomLoggingWithKey:(NSString *)key andValue:(NSString *)value {
    [[Crashlytics sharedInstance] setObjectValue:value forKey:key];
}

+ (void)changeAudioRoute {
  NSError *error = nil;
  [[AVAudioSession sharedInstance] setCategory: AVAudioSessionCategoryPlayAndRecord error: &error];
  if (error) NSLog(@"%@", error.localizedDescription);
  [[AVAudioSession sharedInstance] overrideOutputAudioPort:AVAudioSessionPortOverrideSpeaker error:&error];
  if (error) NSLog(@"%@", error.localizedDescription);
  [[AVAudioSession sharedInstance] setActive:YES error:&error];
  if (error) NSLog(@"%@", error.localizedDescription);
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
  dispatch_async(dispatch_get_main_queue(), ^{
    NSLog(@"startBackgroundSoundDetecting");
//    [[AVAudioSession sharedInstance] setCategory:AVAudioSessionCategoryPlayAndRecord withOptions:AVAudioSessionCategoryOptionDefaultToSpeaker error:nil];
    [H102Wrapper initRecord];
    [H102Wrapper startRecord];
    startTime = -1;
    invalidateTimer = NO;
    timer = [NSTimer timerWithTimeInterval:0.5 target:self selector:@selector(soundDetectingLoop:) userInfo:NULL repeats:YES];
    [[NSRunLoop mainRunLoop] addTimer:timer forMode:NSDefaultRunLoopMode];
  });
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
      cocos2d::Director::getInstance()->getScheduler()->performFunctionInCocosThread([]() {
        ScriptingCore::getInstance()->evalString("AudioListener.getInstance().onStartedListening()");
      });
    }
  } else {
    if (maxAmplitude < -20) {
      NSLog(@"Stop");
      double deltaTime = [[NSDate date] timeIntervalSince1970] - startTime;
      [H102Wrapper stopFetchingAudio];
      cocos2d::Director::getInstance()->getScheduler()->performFunctionInCocosThread([=]() {
        NSString* command = [NSString stringWithFormat:@"AudioListener.getInstance().onStoppedListening('%@/%@', %f)", [SimpleAudioRecordEngine sharedEngine].documentsPath, @"record_sound.wav", deltaTime];
        ScriptingCore::getInstance()->evalString([command UTF8String]);
      });
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

+ (void)changeSpeechLanguageArray:(NSString*)languageCode data:(NSString *)serializedString {
  NSData* data = [serializedString dataUsingEncoding:NSUTF8StringEncoding];
  NSArray* array = [NSJSONSerialization JSONObjectWithData:data options:0 error:nil];
  
  NSMutableArray* uppercaseArray = [[NSMutableArray alloc] init];
  for (NSString* s in array) {
    [uppercaseArray addObject:[s uppercaseString]];
  }
  
  [[SpeechRecognitionListener sharedEngine] setLanguageData:languageCode array:uppercaseArray];
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
    ScriptingCore::getInstance()->evalString([command UTF8String]);
  }
  
  [[SpeechRecognitionListener sharedEngine] suspend];
}

+ (void)stopSpeechRecognition {
  [[SpeechRecognitionListener sharedEngine] stop];
//  cocos2d::experimental::AudioEngine::end();
//  [[AVAudioSession sharedInstance] setCategory:AVAudioSessionCategorySoloAmbient error:nil];
//  [[AVAudioSession sharedInstance] setActive:YES error:nil];
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
        ScriptingCore::getInstance()->evalString([command UTF8String]);
    });
}

+ (void)startDetectingNoiseLevel:(NSNumber*)t {
  float detectingTime = [t floatValue];
  
  [[AVAudioSession sharedInstance] setCategory:AVAudioSessionCategoryPlayAndRecord withOptions:AVAudioSessionCategoryOptionDefaultToSpeaker error:nil];
  [H102Wrapper initRecord];
  [H102Wrapper startRecord];
  
  noiseDetectionLoopCount = detectingTime / 0.1;
  if (noiseDetectionArray)
      [noiseDetectionArray release];
  noiseDetectionArray = [NSMutableArray new];
  invalidateTimer = NO;
  
  timer = [NSTimer timerWithTimeInterval:0.1 target:self selector:@selector(noiseDetectingLoop:) userInfo:nil repeats:YES];
  [[NSRunLoop mainRunLoop] addTimer:timer forMode:NSDefaultRunLoopMode];
}

+ (void)noiseDetectingLoop:(NSTimer*) theTimer {
  if (invalidateTimer) {
    [theTimer invalidate];
    return;
  }
  
  noiseDetectionLoopCount--;
  
  if (noiseDetectionLoopCount < 0) {
    [H102Wrapper stopRecord];
    [timer invalidate];
    timer = nil;
    
    float avgAmpl = [[noiseDetectionArray valueForKeyPath:@"@avg.floatValue"] floatValue];
    NSLog(@"avgAmpl: %f", avgAmpl);
    if (avgAmpl > -25)
      ScriptingCore::getInstance()->evalString("NativeHelper.onReceive('noiseDetectingLoop', 'onNoiseDetected', [true])");
    else
      ScriptingCore::getInstance()->evalString("NativeHelper.onReceive('noiseDetectingLoop', 'onNoiseDetected', [false])");
  } else {
    float maxAmplitude = [[SimpleAudioRecordEngine sharedEngine] peakPowerForChannel:0];
//    NSLog(@"%f", maxAmplitude);
    [noiseDetectionArray addObject:[NSNumber numberWithFloat:maxAmplitude]];
  }
}

+ (void)cancelNoiseDetecting {
  [H102Wrapper stopRecord];
  invalidateTimer = YES;
  timer = nil;
}

+(void)openUrlWith:(NSString*)url {
  [[UIApplication sharedApplication] openURL:[NSURL URLWithString:url]];
}

+ (BOOL)hasGrantPermission:(NSString*)permission {
  if ([permission isEqualToString:@"RECORD_AUDIO"]) {
    AVAudioSession * audioSession = [AVAudioSession sharedInstance];
    AVAudioSessionRecordPermission systemState = [audioSession recordPermission];
    
    return systemState == AVAudioSessionRecordPermissionGranted;
  } else if ([permission isEqualToString:@"WRITE_EXTERNAL_STORAGE"]) {
    return true;
  } else if ([permission isEqualToString:@"ACCESS_NOTIFICATION_POLICY"]){
    if ([[UIApplication sharedApplication] respondsToSelector:@selector(currentUserNotificationSettings)]){
      UIUserNotificationSettings *grantedSettings = [[UIApplication sharedApplication] currentUserNotificationSettings];
      if (grantedSettings.types != UIUserNotificationTypeNone) {
        return true;
      }
    }
  }
  
  return false;
}

+ (void)requestPermission:(NSString*)permission {
  if ([permission isEqualToString:@"RECORD_AUDIO"]) {
    AVAudioSession * audioSession = [AVAudioSession sharedInstance];
    [audioSession requestRecordPermission:^(BOOL granted) {
      dispatch_async(dispatch_get_main_queue(), ^{
        NSString* jsCmd = [NSString stringWithFormat:@"NativeHelper.onReceive('RequestPermission', 'onRequestPermission', [%@])", granted ? @"true" : @"false"];
        ScriptingCore::getInstance()->evalString([jsCmd UTF8String]);
      });
    }];
  }
  
  if ([permission isEqualToString:@"ACCESS_NOTIFICATION_POLICY"]) {
    if ([UIApplication instancesRespondToSelector:@selector(registerUserNotificationSettings:)]){
      [[UIApplication sharedApplication] registerUserNotificationSettings:[UIUserNotificationSettings settingsForTypes:UIUserNotificationTypeAlert|UIUserNotificationTypeBadge|UIUserNotificationTypeSound categories:nil]];
    }
  }
}

+ (void)shareNativeWithCaption:(NSString*)caption andURL:(NSString*)url {
    AppController *appController = (AppController*)[[UIApplication sharedApplication] delegate];
    UIViewController *rootController = (UIViewController*)appController.viewController;
    UIActivityViewController *activityController = [[UIActivityViewController alloc] initWithActivityItems:@[caption, url] applicationActivities:nil];
    
    if (UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPhone) {
        // For iPhone
        [rootController presentViewController:activityController animated:YES completion:nil];
    } else {
        // For iPad, present it as a popover as you already know
        UIPopoverController *popup = [[UIPopoverController alloc] initWithContentViewController:activityController];
        CGRect rect = CGRectMake(rootController.view.bounds.size.width/2, rootController.view.bounds.size.height/2, 1, 1);
        //Change rect according to where you need to display it. Using a junk value here
        [popup presentPopoverFromRect:rect inView:rootController.view permittedArrowDirections:0 animated:YES];
    }
}

+ (void)shareWhatsappWithCaption:(NSString*)caption andURL:(NSString*)url {
    url = [url stringByReplacingOccurrencesOfString:@":" withString:@"%3A"];
    url = [url stringByReplacingOccurrencesOfString:@"/" withString:@"%2F"];
    url = [url stringByReplacingOccurrencesOfString:@"?" withString:@"%3F"];
    url = [url stringByReplacingOccurrencesOfString:@"," withString:@"%2C"];
    url = [url stringByReplacingOccurrencesOfString:@"=" withString:@"%3D"];
    url = [url stringByReplacingOccurrencesOfString:@"&" withString:@"%26"];
    url = [url stringByReplacingOccurrencesOfString:@" " withString:@"%20"];
    
    caption = [caption stringByReplacingOccurrencesOfString:@":" withString:@"%3A"];
    caption = [caption stringByReplacingOccurrencesOfString:@"/" withString:@"%2F"];
    caption = [caption stringByReplacingOccurrencesOfString:@"?" withString:@"%3F"];
    caption = [caption stringByReplacingOccurrencesOfString:@"," withString:@"%2C"];
    caption = [caption stringByReplacingOccurrencesOfString:@"=" withString:@"%3D"];
    caption = [caption stringByReplacingOccurrencesOfString:@"&" withString:@"%26"];
    caption = [caption stringByReplacingOccurrencesOfString:@" " withString:@"%20"];
    
    NSString* urlWhats = [NSString stringWithFormat:@"whatsapp://send?text=%@%@%@", caption, @"%0A", url];
//    NSString *urlWhats = @"whatsapp://send?text=Hello%2C%20World!";
    NSURL* whatsappURL = [NSURL URLWithString:urlWhats];
    if ([[UIApplication sharedApplication] canOpenURL:whatsappURL]) {
        [[UIApplication sharedApplication] openURL:whatsappURL];
    } else {
        UIAlertView* alert = [[UIAlertView alloc] initWithTitle:@"WhatsApp not installed" message:@"Your device has no WhatsApp installed." delegate:self cancelButtonTitle:@"OK" otherButtonTitles: nil];
        [alert show];
    }
}


+ (void)shareFacebookWithTitle:(NSString *)title andDescription:(NSString*)description andURL:(NSString*)url {
    FBSDKShareLinkContent* content = [[FBSDKShareLinkContent alloc] init];
    content.contentTitle = title;
    content.contentDescription = description;
    content.contentURL = [NSURL URLWithString:url];
    
    FBSDKShareDialog* dialog = [[FBSDKShareDialog alloc] init];
    dialog.fromViewController = [UIApplication sharedApplication].keyWindow.rootViewController;
    dialog.mode = FBSDKShareDialogModeNative;
    dialog.shareContent = content;
    dialog.delegate = [FBSharingDelegator new];
    
    if (![dialog canShow]) {
        dialog.mode = FBSDKShareDialogModeBrowser;
    }
    
    [dialog show];
    
//    [FBSDKShareDialog showFromViewController:[UIApplication sharedApplication].keyWindow.rootViewController withContent:content delegate:nil];
}


+ (void)shareTwitterWithDescription:(NSString*)description andURL:(NSString*)url {
    AppController *appController = (AppController*)[[UIApplication sharedApplication] delegate];
    UIViewController *rootController = (UIViewController*)appController.viewController;
    if ([SLComposeViewController isAvailableForServiceType:SLServiceTypeTwitter]) {
        SLComposeViewController* tweetShare = [SLComposeViewController composeViewControllerForServiceType:SLServiceTypeTwitter];
//        [tweetShare addImage:[UIImage imageNamed:@"monkey.jpg"]];
        [tweetShare addURL:[NSURL URLWithString:url]];
        [tweetShare setInitialText:description];
        [rootController presentViewController:tweetShare animated:true completion:nil];
    } else {
        UIAlertController* alert = [UIAlertController alertControllerWithTitle:@"Accounts" message:@"Please login to a Twitter account to tweet." preferredStyle:UIAlertControllerStyleAlert];
        [alert addAction:[UIAlertAction actionWithTitle:@"OK" style:UIAlertActionStyleDefault handler:nil]];
        [rootController presentViewController:alert animated:true completion:nil];
    }
}

+ (NSString*)getCountryCode {
    return [[NSLocale currentLocale] objectForKey:NSLocaleCountryCode];
}

+ (void)startLocalNotificationWithFireDate:(NSTimeInterval)fireDateInSeconds withTag:(NSString*)tag{
    UILocalNotification* localNotification = [[UILocalNotification alloc] init];
    localNotification.fireDate = [NSDate dateWithTimeIntervalSinceNow:fireDateInSeconds];
    localNotification.soundName = UILocalNotificationDefaultSoundName;
    localNotification.alertBody = @"👨‍👩‍👧‍👦 Regular practice leads to faster learning. Start Now 😀";
    localNotification.timeZone = [NSTimeZone defaultTimeZone];
    NSDictionary *userInfo = [NSDictionary dictionaryWithObject:tag forKey:tag];
    localNotification.userInfo = userInfo;
  
    [[UIApplication sharedApplication] scheduleLocalNotification:localNotification];
}

+(void)onRequestedPNPermission {
  NSString* jsCmd = [NSString stringWithFormat:@"KVDatabase.getInstance().set('get_notifications', true)"];
  ScriptingCore::getInstance()->evalString([jsCmd UTF8String]);
  
  // schedule daily PN
  [self startDailyNotif];
  
  // schedule 2 days PN
  [self startTwoDaysNotif];
  
//  [self showMessage:@"The School Of Games" message:@"We'll keep you posted on learning progress"];
}

+ (void)cancelLocalNotificationsWithTag:(NSString*) tag{
  for (UILocalNotification *notification in [[[UIApplication sharedApplication] scheduledLocalNotifications] copy]){
    NSDictionary *userInfo = notification.userInfo;
    if ([tag isEqualToString:[userInfo objectForKey:tag]]){
      [[UIApplication sharedApplication] cancelLocalNotification:notification];
    }
  }
}

+ (void)startDailyNotif {
  [self startLocalNotificationWithFireDate:86400 withTag:@"kTagDailyLocalNotif"];
}

+ (void)startTwoDaysNotif {
  [self startLocalNotificationWithFireDate:172800 withTag:@"kTagTwoDaysLocalNotif"];
}

+ (bool)isOpenedFromNotification {
  return isOpenedFromNotification;
}

+ (void)setOpenedFromNotification: (bool)isOpened {
  isOpenedFromNotification = isOpened;
}

+ (void)openStore {
  NSString *iTunesLink = @"itms://itunes.apple.com/us/app/apple-store/id1090937711?mt=8";
  [[UIApplication sharedApplication] openURL:[NSURL URLWithString:iTunesLink]];
}

@end
@implementation FBSharingDelegator
- (void)sharer:(id<FBSDKSharing>)sharer didCompleteWithResults:(NSDictionary *)results {
    NSLog(@"sharer didCompleteWithResults: %@", results);
}

/**
 Sent to the delegate when the sharer encounters an error.
 - Parameter sharer: The FBSDKSharing that completed.
 - Parameter error: The error.
 */
- (void)sharer:(id<FBSDKSharing>)sharer didFailWithError:(NSError *)error {
    NSLog(@"sharer didFailWithError: %@", [error description]);
}

/**
 Sent to the delegate when the sharer is cancelled.
 - Parameter sharer: The FBSDKSharing that completed.
 */
- (void)sharerDidCancel:(id<FBSDKSharing>)sharer {
    NSLog(@"sharerDidCancel");
}
@end
