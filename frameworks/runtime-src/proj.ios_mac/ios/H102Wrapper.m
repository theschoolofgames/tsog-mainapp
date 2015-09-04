//
//  H102Wrapper.m
//  tsog
//
//  Created by Stefan Nguyen on 9/4/15.
//
//
#import "H102Wrapper.h"
#import "Countly.h"

@implementation H102Wrapper
+ (void)countlyStart:(NSString *)appKey withUrl:(NSString *)hostUrl {
    [[Countly sharedInstance] start:appKey withHost:hostUrl];
}

+ (void)countlyRecordEvent:(NSString *)key count:(NSNumber *)count {
    [[Countly sharedInstance] recordEvent:key count:[count intValue]];
}
@end
