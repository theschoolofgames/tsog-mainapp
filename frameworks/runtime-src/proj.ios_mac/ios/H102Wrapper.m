//
//  H102Wrapper.m
//  tsog
//
//  Created by Stefan Nguyen on 9/4/15.
//
//
#import "H102Wrapper.h"
#import "PDKeychainBindings.h"
#import <Analytics.h>

@implementation H102Wrapper

+ (void)openScheme:(NSString *)bundleId withData:(NSString *)data {
  NSURL *theURL = [NSURL URLWithString:[NSString stringWithFormat:@"%@://%@", bundleId, data]];
  if ([[UIApplication sharedApplication] canOpenURL:theURL])
    [[UIApplication sharedApplication] openURL:theURL];
  else {
    NSLog(@"Receiver not found");
    UIAlertView *message = [[UIAlertView alloc] initWithTitle:@"Error"
                                                      message:@"Target game not found"
                                                     delegate:nil
                                            cancelButtonTitle:@"OK"
                                            otherButtonTitles:nil];
    [message show];
  }
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
  NSData* traitData = [traits dataUsingEncoding:NSUTF8StringEncoding];
  NSDictionary* traitDict = [NSJSONSerialization JSONObjectWithData:traitData options:0 error:nil];
  
  [[SEGAnalytics sharedAnalytics] identify:userId traits:traitDict];
}

+ (void)segmentTrack:(NSString *)event properties:(NSString *)properties {
  NSData* propertiesData = [properties dataUsingEncoding:NSUTF8StringEncoding];
  NSDictionary* propertiesDict = [NSJSONSerialization JSONObjectWithData:propertiesData options:0 error:nil];
  
  [[SEGAnalytics sharedAnalytics] track:event properties:propertiesDict];
}

@end
