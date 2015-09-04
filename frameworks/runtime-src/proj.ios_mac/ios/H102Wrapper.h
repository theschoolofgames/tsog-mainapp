//
//  H102Wrapper.h
//  tsog
//
//  Created by Stefan Nguyen on 9/4/15.
//
//
#import <Foundation/Foundation.h>

#ifndef tsog_H102Wrapper_h
#define tsog_H102Wrapper_h

@interface H102Wrapper : NSObject
+ (void)countlyStart:(NSString *)appKey withUrl:(NSString *)hostUrl;
+ (void)countlyRecordEvent:(NSString *)key count:(NSNumber *)count;
@end


#endif
