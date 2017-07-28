//
//  SessionManager.m
//  TSOG CoreML
//
//  Created by Van Nguyen on 7/26/17.
//  Copyright © 2017 TheSchoolOfGames. All rights reserved.
//

#import "SessionManager.h"

@implementation SessionManager

+ (SessionManager *)sharedInstance {
    static SessionManager *_instance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        _instance = [[SessionManager alloc] init];
        _instance.identifiedObjects = [NSMutableDictionary dictionary];
    });
    
    return _instance;
}

- (BOOL)addIdentifiedObject:(NSString *)objString {
    // Get first character
    NSString *firstCharacter = [objString substringToIndex:1];
    
    NSMutableDictionary *collection = [self.identifiedObjects objectForKey:firstCharacter];
    if (collection) {
        if ([collection objectForKey:objString]) {
            return NO;
        } else {
            [collection setObject:objString forKey:objString];
            [self.identifiedObjects setObject:collection forKey:firstCharacter];
            self.objCount++;
            return YES;
        }
    } else {
        collection = [NSMutableDictionary dictionaryWithObjectsAndKeys:objString, objString, nil];
        [self.identifiedObjects setObject:collection forKey:firstCharacter];
        self.objCount++;
        return YES;
    }
}

@end
