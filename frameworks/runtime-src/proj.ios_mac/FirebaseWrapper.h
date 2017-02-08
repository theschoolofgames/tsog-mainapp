//
//  FirebaseWrapper.h
//  tsog
//
//  Created by Nick Dong on 1/21/17.
//
//

#import <Foundation/Foundation.h>

@interface FirebaseWrapper : NSObject
+ (void)setCurrentViewController:(UIViewController *)pViewController;
+ (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary *)options;
+ (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity restorationHandler:(void (^)(NSArray *))restorationHandler;
+ (void)fetchConfigWithExpirationDuration:(NSString*)duration;
@end
