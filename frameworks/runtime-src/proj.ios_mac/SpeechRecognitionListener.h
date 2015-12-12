//
//  SpeechRecognitionListener.h
//  tsog
//
//  Created by Thuy Dong Xuan on 12/11/15.
//
//

#import <Foundation/Foundation.h>

#import <OpenEars/OEEventsObserver.h>

@interface SpeechRecognitionListener : NSObject <OEEventsObserverDelegate>

+ (SpeechRecognitionListener *)sharedEngine;

- (BOOL)setLanguageData:(NSArray *)array;
- (void)start;
- (void)stop;

- (BOOL)isListening;

@end
