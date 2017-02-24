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

+ (BOOL)logoutSilently {
    return [[FUIAuth defaultAuthUI] signOutWithError:nil];
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
        [dict setObject:[user.photoURL absoluteString] forKey:@"photoURL"];
    [dict setObject:user.uid forKey:@"uid"];
    
    NSError * err;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:dict options:0 error:&err];
    NSString *json = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
    
    return json;
}

+ (void)setData:(NSString*)key value:(NSString*)valueString {
  NSError* error = nil;
  NSData* data = [valueString dataUsingEncoding:NSUTF8StringEncoding];
  id values = [NSJSONSerialization JSONObjectWithData:data options:0 error:&error];
  
  if (error)
    values = valueString;
  
  FIRDatabaseReference* root = [[FIRDatabase database] reference];
  FIRDatabaseReference* child = [root child:key];
  
  [child setValue:values];
}

+ (void)updateChildValues:(NSString*)path value:(NSString*)valueString {
    NSError* error = nil;
    NSData* data = [valueString dataUsingEncoding:NSUTF8StringEncoding];
    id values = [NSJSONSerialization JSONObjectWithData:data options:0 error:&error];
    
    if (error)
        values = valueString;
    
    FIRDatabaseReference* root = [[FIRDatabase database] reference];
    FIRDatabaseReference* child = [root child:path];
    
    [child updateChildValues:values];
}

+ (void)setInteger:(NSString*)key value:(NSNumber*)value {
    FIRDatabaseReference* root = [[FIRDatabase database] reference];
    FIRDatabaseReference* child = [root child:key];
    
    [child setValue:value];
}

+ (void)setFloat:(NSString*)key value:(NSNumber*)value {
    // obj-c can use NSNumber here
    [self setInteger:key value:value];
}

+ (void)fetchData:(NSString*)path {
  FIRDatabaseReference* root = [[FIRDatabase database] reference];
  FIRDatabaseReference* child = [root child:path];
  
  [child observeEventType:FIRDataEventTypeValue withBlock:^(FIRDataSnapshot * _Nonnull snapshot) {
    NSString* dataString = @"{}";
    
    if (snapshot.exists) {
      if([snapshot.value isKindOfClass:[NSArray class]] || [snapshot.value isKindOfClass:[NSDictionary class]]){
        //Is array
        NSData *jsonData = [NSJSONSerialization dataWithJSONObject:snapshot.value options:0 error:nil];
        dataString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
      } else {
        dataString = [snapshot.value stringValue];
      }
    } else {
        [child removeAllObservers];
    }
    
    [Cocos2dxHelper evalString:[NSString stringWithFormat:@"NativeHelper.onReceive('Firebase', 'onFetchedData', ['%@', '%@', %@, '%@'])", child.key, dataString, !snapshot.exists ? @"true" : @"false", path ]];
  }];
}

+ (NSString*)createChildAutoId:(NSString*)path {
  return [[[[FIRDatabase database] reference] child:path] childByAutoId].key;
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

+ (BOOL)application:(UIApplication *)application
continueUserActivity:(NSUserActivity *)userActivity
 restorationHandler:(void (^)(NSArray *))restorationHandler {
    BOOL handled = [[FIRDynamicLinks dynamicLinks]
                    handleUniversalLink:userActivity.webpageURL
                    completion:^(FIRDynamicLink * _Nullable dynamicLink,
                                 NSError * _Nullable error) {
                        NSLog(@"%@", dynamicLink.url.absoluteString);
                        
                        NSURLComponents * urlComponents = [[NSURLComponents alloc] initWithURL:dynamicLink.url resolvingAgainstBaseURL:false];
                        NSArray * queryItems = urlComponents.queryItems;
                        for (int i = 0; i < [queryItems count]; i++) {
                            NSURLQueryItem* component = [queryItems objectAtIndex:i];
                            if ([component.name isEqualToString:@"inviter_id"]) {
                                [Cocos2dxHelper evalString:[NSString stringWithFormat:@"NativeHelper.onReceive('Firebase', 'onGameStartedFromDeeplink', ['%@'])", component.value]];
                                break;
                            }
                        }
//
                    }];
    
    return handled;
}

+ (void)fetchConfigWithExpirationDuration:(NSString*)duration {
    FIRRemoteConfig* remoteConfig = [FIRRemoteConfig remoteConfig];
    [remoteConfig fetchWithExpirationDuration:[duration integerValue] completionHandler:^(FIRRemoteConfigFetchStatus status, NSError * _Nullable error) {
        NSString* jsonString = @"{}";
        NSString* success = @"false";
        
        if (status == FIRRemoteConfigFetchStatusSuccess) {
            success = @"true";
            [remoteConfig activateFetched];
        }

        NSSet<NSString*>* configKeys = [remoteConfig keysWithPrefix:@""];
        NSMutableDictionary* configs = [[NSMutableDictionary alloc] init];
        for (NSString* key in configKeys) {
            configs[key] = [remoteConfig[key] stringValue];
        }
        
        NSData *jsonData = [NSJSONSerialization dataWithJSONObject:configs options:0 error:nil];
        if (jsonData) {
            jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
        }
        
        NSString* evaluatedString = [[NSString alloc] initWithFormat:@"NativeHelper.onReceive('Firebase', 'onFetchedConfig', [%@, '%@'])", success, jsonString ];
        [Cocos2dxHelper evalString:evaluatedString];
    }];
}

+(void)logEventLevelUpWithLevel:(NSString*)level {
    [FIRAnalytics logEventWithName:kFIREventLevelUp parameters:@{
                                                                 kFIRParameterLevel: level
                                                                 }];
}

+(void)logEventSelectContentWithContentType:(NSString*)contentType andItemId:(NSString*)itemId {
    [FIRAnalytics logEventWithName:kFIREventSelectContent parameters:@{
                                                                       kFIRParameterContentType:contentType,
                                                                       kFIRParameterItemID: itemId
                                                                       }];
}

+(void)logEventPostScoreWithScore:(NSString*)score andLevel:(NSString*)level andCharacter:(NSString*)character {
    [FIRAnalytics logEventWithName:kFIREventPostScore parameters:@{
                                                                   kFIRParameterScore: score,
                                                                   kFIRParameterLevel: level,
                                                                   kFIRParameterCharacter: character
                                                                   }];
}

+(void)logEventSpendVirtualCurrencyWithItemName:(NSString*)itemName andVirtualCurrencyName:(NSString*)currencyName andValue:(NSString*)value {
    [FIRAnalytics logEventWithName:kFIREventSpendVirtualCurrency parameters:@{
                                                                              kFIRParameterItemName: itemName,
                                                                              kFIRParameterVirtualCurrencyName: currencyName,
                                                                              kFIRParameterValue: value
                                                                              }];
}

+(void)logEventShareWithContentType:(NSString*)contentType andItemId:(NSString*)itemId {
    [FIRAnalytics logEventWithName:kFIREventSelectContent parameters:@{
                                                                       kFIRParameterContentType: contentType,
                                                                       kFIRParameterItemID: itemId
                                                                       }];
}

+(void)logEventAppOpen {
    [FIRAnalytics logEventWithName:kFIREventAppOpen parameters:nil];
}

@end
