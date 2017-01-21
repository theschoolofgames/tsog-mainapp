//
//  FirebaseDelegate.m
//  tsog
//
//  Created by Nick Dong on 1/21/17.
//
//

#import "FirebaseDelegate.h"
#import "Cocos2dxHelper.h"

@implementation FirebaseDelegate

- (void)authUI:(FUIAuth *)authUI didSignInWithUser:(FIRUser *)user error:(NSError *)error {
    if (user)
        [Cocos2dxHelper evalString:[NSString stringWithFormat:@"NativeHelper.onReceive('Firebase', 'onLoggedIn',[true, null])"]];
    else {
        [Cocos2dxHelper evalString:[NSString stringWithFormat:@"NativeHelper.onReceive('Firebase', 'onLoggedIn',[false, %@])", error.localizedDescription]];
    }
}

@end
