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

+ (void)openScheme:(NSString *)bundleId withData:(NSString *)data;

+ (void)showMessage:(NSString *)title message:(NSString *)message;
@end


#endif
