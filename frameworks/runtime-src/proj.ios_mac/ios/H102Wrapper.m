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

#import "SimpleAudioRecordEngine_objc.h"

@implementation H102Wrapper

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

+ (void)initRecord:(NSString *)fileName {
  [[SimpleAudioRecordEngine sharedEngine] initRecord:fileName];
}

+ (void)startRecord {
  [[SimpleAudioRecordEngine sharedEngine] startRecord];
}

+ (void)stopRecord {
  [[SimpleAudioRecordEngine sharedEngine] stopRecord];
}

@end
