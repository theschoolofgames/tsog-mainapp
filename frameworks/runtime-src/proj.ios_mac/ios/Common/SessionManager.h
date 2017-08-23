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
@property (nonatomic, assign) NSInteger diamondCount;                   // Diamond count

+ (SessionManager *)sharedInstance;                                     // Shared instance

- (NSInteger)getIdentifiedObjsCount;                                    // Get identified objects count
- (NSMutableDictionary *)getIdentifiedObjects;                          // Get identified objects list
- (BOOL)addIdentifiedObject:(NSString *)objString;                      // Add object
- (void)textToSpeech:(NSString *)text;                                  // Speak a word

@end
