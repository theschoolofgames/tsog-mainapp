//
//  RecorderQueue.h
//  tsog
//
//  Created by Thuy Dong Xuan on 12/29/15.
//
//

#import <Foundation/Foundation.h>
#import <CoreAudio/CoreAudioTypes.h>

@interface RecorderQueue : NSObject

@property(nonatomic, assign) NSInteger maxCapacity;
@property(nonatomic, assign) NSInteger currentCapacity;
@property(nonatomic, assign) NSMutableArray* queue;

- (NSDictionary *) dequeue;
- (void) enqueue:(NSData*)buffer maxPeak:(float)maxPeak length:(UInt32)length;

- (float)getMaxPeak;

@end
