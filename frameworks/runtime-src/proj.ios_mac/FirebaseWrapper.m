//
//  FirebaseWrapper.m
//  tsog
//
//  Created by Nick Dong on 1/21/17.
//
//

#import "FirebaseWrapper.h"

@import Firebase;
@import FirebaseAuth;
@import FirebaseAuthUI;
@import FirebaseGoogleAuthUI;
@import FirebaseFacebookAuthUI;

#import "FirebaseDelegate.h"
#import "Cocos2dxHelper.h"

static UIViewController* viewController;

@implementation FirebaseWrapper

+ (void)setCurrentViewController:(UIViewController *)pViewController {
    viewController = pViewController;
}

+ (BOOL)isLoggedIn {
    return [FIRAuth auth].currentUser != nil;
}

+ (void)login {
    FUIAuth *authUI = [FUIAuth defaultAuthUI];
    NSArray<id<FUIAuthProvider>> *providers = @[
                                                [[FUIGoogleAuth alloc] init],
                                                [[FUIFacebookAuth alloc] init]
                                                ];
    authUI.providers = providers;
    
    UINavigationController *authViewController = [authUI authViewController];
    
    [viewController presentViewController:authViewController animated:YES completion:nil];
}

+ (void)logout {
    if ([[FUIAuth defaultAuthUI] signOutWithError:nil])
        [Cocos2dxHelper evalString:@"NativeHelper.onReceive('Firebase', 'onLoggedOut')"];
}

+ (NSString*)getUserInfo {
    if (![self isLoggedIn])
        return nil;
    
    FIRUser *user = [FIRAuth auth].currentUser;
    
    NSMutableDictionary *dict = [NSMutableDictionary new];
    if (user.displayName)
        [dict setObject:user.displayName forKey:@"name"];
    if (user.email)
        [dict setObject:user.email forKey:@"email"];
    if (user.photoURL)
        [dict setObject:user.photoURL forKey:@"photoURL"];
    [dict setObject:user.uid forKey:@"uid"];
    
    NSError * err;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:dict options:0 error:&err];
    NSString *json = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
    
    return json;
}

+ (void)setDatabaseAttribute:(NSString*)keysString value:(NSString*)value {
  NSData *data = [keysString dataUsingEncoding:NSUTF8StringEncoding];
  NSArray* keys = [NSJSONSerialization JSONObjectWithData:data options:0 error:nil];
  
  FIRDatabaseReference* root = [[FIRDatabase database] reference];
  
  for (NSUInteger i = 0; i < [keys count]; i++)
    root = [root child:[keys objectAtIndex:i]];
}

#pragma mark Private Methods
+ (void)initialize {
    [FIRApp configure];
    [FUIAuth defaultAuthUI].delegate = [FirebaseDelegate new];
}

+ (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary *)options {
    NSString *sourceApplication = options[UIApplicationOpenURLOptionsSourceApplicationKey];
    return [[FUIAuth defaultAuthUI] handleOpenURL:url sourceApplication:sourceApplication];
}

@end
