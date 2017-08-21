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

@property (nonatomic, strong) AVSpeechSynthesizer *synthesizer;         // Speak
@property (nonatomic, assign) NSInteger elapsedTime;                    // Elapsed time

+ (SessionManager *)sharedInstance;                                     // Shared instance

- (NSInteger)getIdentifiedObjsCount;
- (NSMutableDictionary *)getIdentifiedObjects;
- (BOOL)addIdentifiedObject:(NSString *)objString;                      // Add object
- (void)textToSpeech:(NSString *)text;                                  // Speak a word

@end
