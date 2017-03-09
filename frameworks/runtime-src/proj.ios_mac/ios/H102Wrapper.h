//
//  H102Wrapper.h
//  tsog
//
//  Created by Stefan Nguyen on 9/4/15.
//
//
#import <Foundation/Foundation.h>
#import <FBSDKShareKit/FBSDKShareKit.h>

#ifndef tsog_H102Wrapper_h
#define tsog_H102Wrapper_h

@interface H102Wrapper : NSObject

+ (void)setCurrentViewController:(UIViewController*)pViewController;

+ (void)showMessage:(NSString *)title message:(NSString *)message;

+ (void)segmentIdentity:(NSString *)userId traits:(NSString *)traits;
+ (void)segmentTrack:(NSString *)event properties:(NSString *)traits;
+ (void)startRestClock:(NSNumber *)timeToPauseGame;

+ (void)shareNativeWithCaption:(NSString*)caption andURL:(NSString*)url;
+ (void)shareWhatsappWithCaption:(NSString*)caption andURL:(NSString*)url;
+ (void)shareFacebookWithTitle:(NSString *)title andDescription:(NSString*)description andURL:(NSString*)url;
+ (void)shareTwitterWithDescription:(NSString*)description andURL:(NSString*)url;

+ (NSString*)getCountryCode;
+ (void)startLocalNotificationWithFireDate:(NSTimeInterval)fireDateInSeconds;
+ (BOOL)isPNPerMissionAllowed;
@end


@interface FBSharingDelegator : NSObject <FBSDKSharingDelegate>
- (void)sharer:(id<FBSDKSharing>)sharer didCompleteWithResults:(NSDictionary *)results;
- (void)sharer:(id<FBSDKSharing>)sharer didFailWithError:(NSError *)error;
- (void)sharerDidCancel:(id<FBSDKSharing>)sharer;
@end

#endif
