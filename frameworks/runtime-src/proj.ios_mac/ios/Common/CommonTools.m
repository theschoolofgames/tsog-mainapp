//
//  CommonTools.m
//  TSOG CoreML
//
//  Created by Van Nguyen on 7/26/17.
//  Copyright © 2017 TheSchoolOfGames. All rights reserved.
//

#import "CommonTools.h"
#import <sys/utsname.h>

@implementation CommonTools

+ (NSString *)capitalizeFirstLetterOnlyOfString:(NSString *) sourceString {
    NSMutableString *result = [sourceString lowercaseString].mutableCopy;
    [result replaceCharactersInRange:NSMakeRange(0, 1) withString:[[result substringToIndex:1] capitalizedString]];
    
    return result;
}

+ (BOOL)isCompatibleARKit {
    struct utsname systemInfo;
    uname(&systemInfo);
    
    NSString *deviceModel = [NSString stringWithCString:systemInfo.machine
                                               encoding:NSUTF8StringEncoding];
    
    NSArray *nameArray = [deviceModel componentsSeparatedByString:@","];
    if (!nameArray.count) {
        return NO;
    }
    
    NSString *majorDeviceModel = nameArray[0];
    if (!majorDeviceModel.length) {
        return NO;
    }
    
    NSRange iPhoneRange = [majorDeviceModel rangeOfString:@"iPhone"];
    if (iPhoneRange.location != NSNotFound) {
        NSString *majorNumberString = [majorDeviceModel substringFromIndex:iPhoneRange.location + 6];
        NSInteger majorNumber = [majorNumberString integerValue];
        if (majorNumber >=8) {
            return YES;
        }
    }
    
    NSRange iPadRange = [majorDeviceModel rangeOfString:@"iPad"];
    if (iPadRange.location != NSNotFound) {
        NSString *majorNumberString = [majorDeviceModel substringFromIndex:iPadRange.location + 4];
        NSInteger majorNumber = [majorNumberString integerValue];
        if (majorNumber >=6) {
            return YES;
        }
    }
    
    return NO;
}

@end
