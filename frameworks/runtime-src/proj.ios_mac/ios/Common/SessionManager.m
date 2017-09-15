//
//  SessionManager.m
//  TSOG CoreML
//
//  Created by Van Nguyen on 7/26/17.
//  Copyright © 2017 TheSchoolOfGames. All rights reserved.
//

#import "SessionManager.h"

@interface SessionManager () {
    
}

@property (nonatomic, strong) NSMutableDictionary *identifiedObjects;   // Identified objects
@property (nonatomic, assign) NSInteger objCount;                       // Objects count
@property (nonatomic, strong) NSURL *soundPath;
@property (nonatomic, strong) AVAudioPlayer *player;

@end

@implementation SessionManager

+ (SessionManager *)sharedInstance {
    static SessionManager *_instance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        _instance = [[SessionManager alloc] init];
        _instance.identifiedObjects = [NSMutableDictionary dictionary];
        _instance.elapsedTime = 120;
        _instance.diamondCount = 0;
        _instance.objCount = 0;
    });
    
    return _instance;
}

- (NSInteger)getIdentifiedObjsCount {
    return self.objCount;
}

- (NSMutableDictionary *)getIdentifiedObjectsDict {
    return self.identifiedObjects;
}

- (NSArray *)getIdentifiedObjectsArray {
    NSArray *allKeys = self.identifiedObjects.allKeys;
    NSMutableArray *objects = [NSMutableArray array];
    for (NSString *key in allKeys) {
        NSDictionary *collection = [self.identifiedObjects objectForKey:key];
        for (NSString *item in collection.allKeys) {
            [objects addObject:item];
        }
    }
    return objects;
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

- (void)addArayOfIdentifiedObjects:(NSArray *)objArray {
    // Reset obj list
    self.identifiedObjects = [NSMutableDictionary dictionary];
    for (NSString *item in objArray) {
        [self addIdentifiedObject:item];
    }
}

- (void)vibrateFoundObj {
    // Vibrate
    AudioServicesPlaySystemSound(kSystemSoundID_Vibrate);
}



@end
