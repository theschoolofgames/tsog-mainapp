//
//  OENotification.m
//  OpenEars
//
//  Created by Halle on 1/27/13.
//  Copyright (c) 2014 Politepix. All rights reserved.
//

#import "OENotification.h"

@implementation OENotification

+ (void) performOpenEarsNotificationOnMainThread:(NSString *)notificationNameAsString withOptionalObjects:(NSArray *)objects andKeys:(NSArray *)keys {

    NSMutableArray *objectsArray = [[NSMutableArray alloc] init];
    NSMutableArray *keysArray = [[NSMutableArray alloc] init];
    
    if(objects || keys) {
        if ([objects count] != [keys count]) {
            NSLog(@"Error in performOpenEarsNotificationOnMainThread: there are optional objects and keys but not the same amount of both, so there will probably be a crash now.");
        }
        
        [objectsArray addObjectsFromArray:objects];
        [keysArray addObjectsFromArray:keys];
        
    }
    
    [objectsArray insertObject:notificationNameAsString atIndex:0];
    [keysArray insertObject:@"OpenEarsNotificationType" atIndex:0];
    
    NSDictionary *userInfoDictionary = [NSDictionary dictionaryWithObjects:objectsArray forKeys:keysArray];
    NSNotification *notification = [NSNotification notificationWithName:@"OpenEarsNotification" object:nil userInfo:userInfoDictionary];
    [[NSNotificationCenter defaultCenter] performSelectorOnMainThread:@selector(postNotification:) withObject:notification waitUntilDone:NO];

}

@end
