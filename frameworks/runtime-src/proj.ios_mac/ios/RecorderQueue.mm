//
//  RecorderQueue.m
//  tsog
//
//  Created by Thuy Dong Xuan on 12/29/15.
//
//

#import "RecorderQueue.h"

@implementation RecorderQueue

- (instancetype)init {
  if ([super init]) {
    self.maxCapacity = -1;
    self.currentCapacity = 0;
    self.queue = [[NSMutableArray alloc] init];
    return self;
  }
  
  return NULL;
}

- (NSDictionary*) dequeue {
  // if ([self count] == 0) return nil; // to avoid raising exception (Quinn)
  NSDictionary* dict = nil;
  
  if (self.queue.count > 0) {
    dict = [[self.queue objectAtIndex:0] retain];
    
    [self.queue removeObjectAtIndex:0];
    
    self.currentCapacity -= [[dict objectForKey:@"length"] intValue];
  }
  
  return dict;
}

// Add to the tail of the queue (no one likes it when people cut in line!)
- (void) enqueue:(NSData *)buffer maxPeak:(float)maxPeak length:(UInt32)length {
  
  self.currentCapacity += length;
  
  [self.queue addObject:@{
                          @"data": buffer,
                          @"length": @(length),
                          @"maxPeak": @(maxPeak)
                          }];
  NSLog(@"%f", maxPeak);
  
  if (self.maxCapacity > 0 && self.currentCapacity > self.maxCapacity)
    while (self.currentCapacity > self.maxCapacity) {
      [[self dequeue] release];
    }
}

- (float)getMaxPeak {
  float maxPeak = 0;
  
  for (int i = 0; i < self.queue.count; i++) {
    NSDictionary* dict = [self.queue objectAtIndex:i];
    
    float peak = [[dict objectForKey:@"maxPeak"] floatValue];
    if (peak > maxPeak)
      maxPeak = peak;
  }
  return maxPeak;
}

@end
