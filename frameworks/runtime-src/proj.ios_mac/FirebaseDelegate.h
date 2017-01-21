//
//  FirebaseDelegate.h
//  tsog
//
//  Created by Nick Dong on 1/21/17.
//
//

#import <Foundation/Foundation.h>

@import FirebaseAuthUI;

@interface FirebaseDelegate : NSObject<FUIAuthDelegate>

- (void)authUI:(FUIAuth *)authUI didSignInWithUser:(nullable FIRUser *)user error:(nullable NSError *)error;

@end
