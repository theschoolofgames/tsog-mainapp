//
//  KahunaAnalytics.h
//  KahunaSDK
//
//  Copyright (c) 2012-2015 Kahuna. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <CoreLocation/CoreLocation.h>
#import <SystemConfiguration/SystemConfiguration.h>

static NSString* const KAHUNA_CREDENTIAL_USERNAME = @"username";
static NSString* const KAHUNA_CREDENTIAL_EMAIL = @"email";
static NSString* const KAHUNA_CREDENTIAL_FACEBOOK = @"fbid";
static NSString* const KAHUNA_CREDENTIAL_TWITTER = @"twtr";
static NSString* const KAHUNA_CREDENTIAL_LINKEDIN = @"lnk";
static NSString* const KAHUNA_CREDENTIAL_USER_ID = @"user_id";
static NSString* const KAHUNA_CREDENTIAL_GOOGLE_PLUS = @"gplus_id";
static NSString* const KAHUNA_CREDENTIAL_INSTALL_TOKEN = @"install_token";

typedef enum {
    KAHRegionMonitoringServices     = 1 << 0    // This monitors for regions (circular) to find if a user enters or exits a region.
} KAHLocationServicesFeatures;

// Delegate for all Kahuna callbacks.
/*!
 @protocol
 
 @abstract
 KahunaDelegate is a protocol defined for the host app to implement to receive Kahuna callbacks.
 
 @discussion
 The SDK will trigger call backs for In-App and Push messages when its property 'delegate' is set with a receiving class that implements the KahunaDelegate protocol.
 
 */
@protocol KahunaDelegate <NSObject>
@optional
- (void) kahunaPushReceived: (NSString *) message withDictionary: (NSDictionary *) extras __attribute__((deprecated("use method 'kahunaPushMessageReceived:withDictionary:withApplicationState:' instead")));
- (void) kahunaPushMessageReceived: (NSString *) message withDictionary: (NSDictionary *) extras __attribute__((deprecated("use method 'kahunaPushMessageReceived:withDictionary:withApplicationState:' instead")));
- (void) kahunaPushMessageReceived: (NSString *) message withDictionary: (NSDictionary *) extras withApplicationState:(UIApplicationState) applicationState;
- (void) kahunaInAppMessageReceived: (NSString *) message withDictionary: (NSDictionary *) extras;
@end

/*!
 @class
 KahunaUserCredentials.
 
 @abstract
 Use this class to fill your credentials and pass it to the loginWithCredentials API.
 
 @discussion
 The credentials submitted using KahunaUserCredentials should be unique.
 
 <pre>
 // Identify your users <br>
 NSError *error = nil; <br>
 KahunaUserCredentials *uc = [[KahunaUserCredentials alloc] init]; <br>
 [uc addCredential:KAHUNA_CREDENTIAL_USERNAME withValue:@"John"]; <br>
 [uc addCredential:KAHUNA_CREDENTIAL_EMAIL withValue:@"Wayne@email.com"]; <br>
 [Kahuna loginWithCredentials:uc error:&error]; <br>
 </pre>
 
 For more API documentation please visit <br>
 <a href="https://www.usekahuna.com/tap/getstarted/ios/" target="_new">Kahuna Getting Started Guide</a>.
 */
@interface KahunaUserCredentials : NSObject {
    NSMutableDictionary *_credentials;
}

/*!
 @method
 
 @abstract
 This API adds a credential for a specific key.
 
 @discussion
 This API is used to add one of the following credentials to be passed into the loginWithCredentials API : <br>
 <li>username</li>
 <li>email</li>
 <li>user_id</li>
 <li>fbid</li>
 <li>lnkd</li>
 <li>twtr</li>
 <li>gplus_id</li>
 <li>install_token</li>
 
 @param key         A non-empty string key.
 @param value       A non-empty string value.
 */
- (void) addCredential:(NSString *)key withValue:(NSString*) value;

/*!
 @method
 
 @abstract
 This API gets the credentials for a specific key.
 
 @param key         A non-empty string key.
 */
- (NSArray*) getCredentialsListForKey:(NSString*)key;

@end


/*!
 @class
 Kahuna API.
 
 @abstract
 This is your main interface with Kahuna.
 
 @discussion
 Use the Kahuna APIs to capture user identity, user attribtutes and user actions.
 
 <pre>
 - (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions <br>
 { <br>
    // Turn on Deep Integration Mode <br>
    [Kahuna setDeepIntegrationMode:true];
 
    // Initializing the API <br>
    [Kahuna launchWithKey:@"<YourSecretKey>"];
 
    // Identify your users <br>
    NSError *error = nil; <br>
    KahunaUserCredentials *uc = [[KahunaUserCredentials alloc] init]; <br>
    [uc addCredential:KAHUNA_CREDENTIAL_USERNAME withValue:@"John"]; <br>
    [Kahuna loginWithCredentials:uc error:&error]; <br>
 
        : <br>
        : <br>
    return YES; <br>
 } <br>
 <br>
 - (void) itemPurchased { <br>
    // Event tracking <br>
    [Kahuna track:@"Purchase Made"]; <br>
        : <br>
        : <br>
 } <br>
 </pre>
 
 For more API documentation please visit <br>
 <a href="https://www.usekahuna.com/tap/getstarted/ios/" target="_new">Kahuna Getting Started Guide</a>.
 */
@interface Kahuna : NSObject <NSURLConnectionDelegate>

/*!
 @property
 
 @abstract
 A delegate for receiving callbacks from Kahuna.
 
 @discussion
 The KahunaDelegate helps in getting callbacks from Kahuna for Push and In-App messages. This delegate needs to be set as soon as the app launches and should preferably be set before any other calls to Kahuna.
 */
@property (weak) id <KahunaDelegate> delegate; // Kahuna delegate.

/*!
 @property
 
 @abstract
 This property sets the badge number for the application.
 
 @discussion
 To clear the badge set it to 0.
 */
@property (assign) NSInteger badgeNumber;

/*!
 @method
 
 @abstract
 Returns a singleton of Kahuna.
 
 @discussion
 Use this API only when you want to access instance members/properties of Kahuna class (like 'delegate', 'badgeNumber'). <br>In all other cases
 user the static APIs defined on the Kahuna class.
 */
+ (instancetype) sharedInstance;

/*!
 @method
 
 @abstract
 This API Launches Kahuna with your secret key.
 
 @discussion
 This API sets the secret key in the Kahuna SDK and this secret key is used to authenticate your traffic from the SDK to the server.<br><br>
 This API <b><u>should be called</u></b> inside the app delegate method <i>application:didFinishLaunchingWithOptions:</i>
 
 @param kahunaSecretKey        Secret key for authenticating your SDK traffic.
 */
+ (void) launchWithKey: (NSString *) kahunaSecretKey;

/*!
 @method
 
 @abstract
 This API identifies a user uniquely amongst all your users.
 
 @discussion
 This API is used to log in a user with unique credentials. Credentials can be one of the following : <br>
 <li>username</li>
 <li>email</li>
 <li>user_id</li>
 <li>fbid</li>
 <li>lnkd</li>
 <li>twtr</li>
 <li>gplus_id</li>
 <li>install_token</li>
 
 @param credentials        An instance of class <i>KahunaUserCredentials</i> representing all the credentials to use to log the user in.
 @param error An error object that will be returned when credentials are nil or empty.
 
 <b><font color="red">IMPORTANT !!</font></b> Do not use this API to mimic a user logout by passing in nil or empty credentials. There is a separate API "logout" for logging user's out.
 
 */
+ (void) loginWithCredentials:(KahunaUserCredentials*) credentials error:(NSError**) error;

/*!
 @method
 
 @abstract
 This API tracks a user action.
 
 @discussion
 An event is some action performed by the user like watching a video or clicking on a button.
 
 @param eventString        A string describing the action
 */
+ (void) trackEvent: (NSString *) eventString;

/*!
 @method
 
 @abstract
 This API tracks an event and associates the event with a count and value.
 
 @discussion
 An event is some action performed by the user like purchasing. Tracking event with count and value is typically used for e-commerce transactions.
 
 @param eventString        A string describing the action.
 @param count        The total number of items purchased.
 @param value        The lowest common monetary value for the purchase (e.g.: Cents in US currency).
 */
+ (void) trackEvent: (NSString *) eventString
          withCount: (long) count
           andValue: (long) value;

/*!
 @method
 
 @abstract
 This API sets the attributes for the current user.
 
 @discussion
 You can add any attribute to the user as long as the attribute name and value are NSStrings.
 
 @param userAttributes        A dictionary of key:value pair strings to describe the user.
 */
+ (void) setUserAttributes: (NSDictionary *) userAttributes;

/*!
 @method
 
 @abstract
 This API creates an empty KahunaUserCredentials instance with which you can add new credentials.
 
 @discussion
 This is a convenience method to create a new <i>KahunaUserCredentials</i> instance.
 */
+ (KahunaUserCredentials *) createUserCredentials;

/*!
 @method
 
 @abstract
 This API gets the credentials for the current user.
 
 @discussion
 To get the array list of credentials, call the getCredentialsListForKey method on the returned <i>KahunaUserCredentials</i> object.
 */
+ (KahunaUserCredentials *) getUserCredentials;

/*!
 @method
 
 @abstract
 This API gets the attributes for the current user.
 
 */
+ (NSDictionary *) getUserAttributes;

/*!
 @method
 
 @abstract
 This API logs out the current user. All attributes and credentials for this user are sent to the server
 and cleared from the local cache.
 
 @discussion
  <b><font color="red">IMPORTANT !!</font></b> This API is <b><u>critical in disassociating</u></b> a user from this device to allow the next user to log in. So please ensure that you call this API before you attempt to log in the next user. This API should accompany the user's log out sequence, so call this API whenever the user is logging out of your app.
 */
+ (void) logout;

/*!
 @method
 
 @abstract
 This API is used to send the APNS push token to Kahuna.
 
 @discussion
 This API is critical in ensuring marketing campaigns can be setup to reach your users. Call this API inside <i>application:didRegisterForRemoteNotificationsWithDeviceToken:</i> if you are not using <b>Deep Integration</b>.<br><br>
 <b><font color="red">IMPORTANT !!</font></b> If you are using <b>Deep Integration</b> mode do not call this API as the SDK will retrieve the push token directly from OS.
 
 @param deviceToken        The push token generated by the OS.
 */
+ (void) setDeviceToken: (NSData *) deviceToken;

/*!
 @method
 
 @abstract
 This API is used to notify the SDK of push registration failures.
 
 @discussion
 This API is critical in ensuring push token registration failures are communicated to Kahuna.<br><br>
 <b><font color="red">IMPORTANT !!</font></b> If you are using <b>Deep Integration</b> mode do not call this API as the SDK will retrieve the registration failure directly from OS.
 
 @param error        The error object.
 */
+ (void) handleNotificationRegistrationFailure: (NSError *) error;

/*!
 @method
 
 @abstract
 This API is used to handle incoming push notifications.
 
 @discussion
 Call this API inside <i>application:didFinishLaunchingWithOptions:</i> and pass in the launchOptions value for key UIApplicationLaunchOptionsRemoteNotificationKey and the UIApplication state. See example below.
 
 Also call this API inside one of following methods if you are not using <b>Deep Integration</b>.
 <li><i>application:didReceiveRemoteNotification:</i></li>
 <li><i>application:didReceiveRemoteNotification:fetchCompletionHandler:</i></li>
 <br>
 <b><font color="red">IMPORTANT !!</font></b> If you are using <b>Deep Integration</b> mode do not call this API in the above 2 methods as the SDK will call this API automatically. <br>
 <b><font color="red">IMPORTANT !!</font></b> You still need to call this API inside <i>application:didFinishLaunchingWithOptions:</i> as by the time <b>Deep Integration</b> is turned on the application has already launched. <br>
 
 <pre>
 - (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions <br>
 { <br>
    // Turn on Deep Integration Mode <br>
    [Kahuna setDeepIntegrationMode:true];
 
    // Initializing the API <br>
    [Kahuna launchWithKey:@"<YourSecretKey>"]; <br>
 
    // Handle notification that gets sent when the app is launched <br>
    <b>
    [Kahuna handleNotification:[launchOptions valueForKey:UIApplicationLaunchOptionsRemoteNotificationKey] <br>
          withApplicationState:application.applicationState]; <br>
    </b>
        : <br>
        : <br>
    return YES; <br>
 } <br>
 </pre>
 
 @param userInfo        The APS dictionary retrieved from the push notification.
 @param appState        The application state.
 */
+ (void) handleNotification: (NSDictionary *) userInfo
       withApplicationState: (UIApplicationState) appState;

/*!
 @method
 
 @abstract
 This API is used to handle incoming push notifications along with the push action. (Actionable Push notifications are new in iOS 8.0)
 
 @discussion
 Call this API inside the method <i>application:handleActionWithIdentifier:forRemoteNotification:completionHandler:</i> and pass in the userInfo, actionIdentifier and the application state if you are not using <b>Deep Integration</b>.
 <br><br>
 <b><font color="red">IMPORTANT !!</font></b> If you are using <b>Deep Integration</b> mode do not call this API as the SDK will call this API automatically. <br>
 
 @param userInfo                The APS dictionary retrieved from the push notification.
 @param actionIdentifier        The action the user took for an actionable push notification.
 @param appState                The application state.
 */
+ (void) handleNotification: (NSDictionary *) userInfo
       withActionIdentifier: (NSString*) actionIdentifier
       withApplicationState: (UIApplicationState) appState;

/*!
 @method
 
 @abstract
 This API is used to turn on detailed logs from the SDK in the console log.
 
 @discussion
 Use this API for debugging purpose only. Call this API with YES before calling launchWithKey: to see all logs.
 <br><br>
 <b><font color="red">IMPORTANT !!</font></b> Do not ship your application to the app store with debugging turned on. <br>
 
 @param setting                True/False to turn on/off debug mode.
 */
+ (void) setDebugMode : (Boolean) setting;

/*!
 @method
 
 @abstract
 This API is used to get the device ID generated by Kahuna.
 
 @discussion
 Use this API to tie any business data for this device in your backend databases.
 */
+ (NSString *) getKahunaDeviceId;

/*!
 @method
 
 @abstract
 This API allows the host application to deeply integrate with Kahuna SDK.
 
 @discussion
 Enabling this API allows Kahuna to capture vital information automatically without having to write code for it.
 Call this API inside <i>application:didFinishLaunchingWithOptions:</i> and make sure this is the first API called in that method. See example below.
 <br><br>
 <b><font color="red">IMPORTANT !!</font></b> When <b>Deep Integration</b> mode is turned on the following Kahuna APIs should not be called directly since the Kahuna SDK will interact with the
 OS to automatically call the necessary APIs.
 <li>setDeviceToken:</li>
 <li>handleNotificationRegistrationFailure:</li>
 <li>handleNotification:withApplicationState: (Except inside <i>application:didFinishLaunchingWithOptions:</i>) </li>
 <li>handleNotification:withActionIdentifier:withApplicationState</li><br>
 
 <pre>
 - (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions <br>
 { <br>
    // Turn on Deep Integration Mode <br>
    <b>
    [Kahuna setDeepIntegrationMode:true];
    </b>
 
    // Initializing the API <br>
    [Kahuna launchWithKey:@"<YourSecretKey>"];
 
     : <br>
     : <br>
     return YES; <br>
 } <br>
 </pre>
 
 @param setting                True/False to turn on/off deep integration mode.
 */
+ (void) setDeepIntegrationMode : (Boolean) setting;

/*!
 @method
 
 @abstract
 This API is used to enable location services with Kahuna.
 
 @discussion
 This API will enable Region monitoring.
 Call this API when the host app wants to ask the user permissions to use their location. This API will prompt the user to give permissions
 and show the reason the app is asking for location permissions. The permissions are asked only once. To ask the user for permissions again use
 the API "clearLocationServicesUserPermissions". The OS also remembers the user's decision for granting permissions. 'clearLocationServicesUserPermissions' only clears the settings from Kahuna SDK not the OS.
 <br><br>
 In iOS 8 the reason for asking location permissions needs to be defined using a key <i>NSLocationAlwaysUsageDescription</i> in the application plist. You can pass in a nil for the reason parameter in iOS 8 since you will be setting the reason in your application plist.
 
 */
+ (void) enableLocationServices:(KAHLocationServicesFeatures)features withReason:(NSString*) reason;

/*!
 @method
 
 @abstract
 This API clears the user permissions settings stored by kahuna.
 
 @discussion
 By clearing the settings, the host app indicates to the KahunaSDK
 that it can ask for permissions again when "enableLocationServices" is called. Since prompting the user for location permissions is controlled by the OS, clearing the user permissions might still not prompt the user for location permissions. It will only clear Kahuna's internal settings, but eventually the user will be prompted for permissions again.
 */
+ (void) clearLocationServicesUserPermissions;

/*!
 @method
 
 @abstract
 This API disables any of the location monitoring services turned on.
 
 @discussion
Since the Kahuna SDK monitors geo-fences in the background, you should not call disableLocationServices when the app suspends or a view is closed as this will turn off the feature completely. A typical usage of this API would be to show the user a settings view where the user can switch ON and OFF the feature.
 */
+ (void) disableLocationServices:(KAHLocationServicesFeatures)features;


@end
