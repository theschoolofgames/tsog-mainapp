//
//  Cocos2dxHelper.m
//  tsog
//
//  Created by Nick Dong on 1/21/17.
//
//

#import "Cocos2dxHelper.h"

#import "ScriptingCore.h"

@implementation Cocos2dxHelper

+ (void)evalString:(NSString *)string {
    ScriptingCore::getInstance()->evalString([string UTF8String]);
}

@end
