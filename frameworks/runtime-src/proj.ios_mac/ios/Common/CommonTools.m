//
//  CommonTools.m
//  TSOG CoreML
//
//  Created by Van Nguyen on 7/26/17.
//  Copyright © 2017 TheSchoolOfGames. All rights reserved.
//

#import "CommonTools.h"

@implementation CommonTools

+ (NSString *)capitalizeFirstLetterOnlyOfString:(NSString *) sourceString {
    NSMutableString *result = [sourceString lowercaseString].mutableCopy;
    [result replaceCharactersInRange:NSMakeRange(0, 1) withString:[[result substringToIndex:1] capitalizedString]];
    
    return result;
}

@end
