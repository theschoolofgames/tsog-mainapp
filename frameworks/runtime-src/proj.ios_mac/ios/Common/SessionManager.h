//
//  SessionManager.h
//  TSOG CoreML
//
//  Created by Van Nguyen on 7/26/17.
//  Copyright © 2017 TheSchoolOfGames. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <AVFoundation/AVFoundation.h>

@interface SessionManager : NSObject

@property (nonatomic, strong) NSMutableDictionary *identifiedObjects;
@property (nonatomic, assign) NSInteger objCount;
@property (nonatomic, strong) AVSpeechSynthesizer *synthesizer;

+ (SessionManager *)sharedInstance;

- (BOOL)addIdentifiedObject:(NSString *)objString;
- (void)textToSpeech:(NSString *)text;

@end
