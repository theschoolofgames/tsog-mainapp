//
//  OELogging.m
//  OpenEars
//
//
//  Copyright Politepix UG (haftungsbeschränkt) 2014. All rights reserved.
//  http://www.politepix.com
//  Contact at http://www.politepix.com/contact
//
//  this file is licensed under the Politepix Shared Source license found 
//  found in the root of the source distribution. Please see the file "Version.txt" in the root of 
//  the source distribution for the version number of this OpenEars package.
#import <UIKit/UIDevice.h>

#import "OELogging.h"
#import "OERuntimeVerbosity.h"
#import "OEVersion.h"

extern int openears_logging;

@implementation OELogging

+ (id)startOpenEarsLogging {
    static dispatch_once_t once;
    static id startOpenEarsLogging;
    dispatch_once(&once, ^{
        startOpenEarsLogging = [[self alloc] init];
    });
    openears_logging = 1;

    NSLog(@"Starting OpenEars logging for OpenEars version %@ on %@-bit device (or build): %@ running iOS version: %f",kCurrentVersion, [NSNumber numberWithInt:sizeof(NSInteger) * 8],[[UIDevice currentDevice]model ], [[[UIDevice currentDevice] systemVersion] floatValue]);
    return startOpenEarsLogging;
}

@end
