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

+ (void)logEventLevelUpWithLevel:(NSString*)level;
+ (void)logEventSelectContentWithContentType:(NSString*)contentType andItemId:(NSString*)itemId;
+ (void)logEventPostScoreWithScore:(NSString*)score andLevel:(NSString*)level andCharacter:(NSString*)character;
+ (void)logEventSpendVirtualCurrencyWithItemName:(NSString*)itemName andVirtualCurrencyName:(NSString*)currencyName andValue:(NSString*)value;
+ (void)logEventShareWithContentType:(NSString*)contentType andItemId:(NSString*)itemId;
+ (void)logEventAppOpen;

+ (BOOL)logoutSilently;

@end
