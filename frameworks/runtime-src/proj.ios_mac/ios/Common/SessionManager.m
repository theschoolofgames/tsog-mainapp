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
@property (nonatomic, assign) NSInteger diamondCount;

@end

@implementation SessionManager

+ (SessionManager *)sharedInstance {
    static SessionManager *_instance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        _instance = [[SessionManager alloc] init];
        _instance.identifiedObjects = [NSMutableDictionary dictionary];
        _instance.synthesizer = [[AVSpeechSynthesizer alloc] init];
        _instance.elapsedTime = 120;
    });
    
    return _instance;
}

- (NSInteger)getIdentifiedObjsCount {
    return self.objCount;
}

- (NSMutableDictionary *)getIdentifiedObjects {
    return self.identifiedObjects;
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

- (void)textToSpeech:(NSString *)text {
    if (!text.length) {
        return;
    }
    
    AVSpeechUtterance *utterance = [AVSpeechUtterance speechUtteranceWithString:text];
    utterance.voice = [AVSpeechSynthesisVoice voiceWithLanguage:@"en-US"];
    
    [utterance setRate:0.2f];
    [self.synthesizer speakUtterance:utterance];
}

- (void)setDiamondCount:(NSInteger)diamondCount {
    self.diamondCount = diamondCount;
}

- (NSInteger)getDiamondCount {
    return self.diamondCount;
}

@end