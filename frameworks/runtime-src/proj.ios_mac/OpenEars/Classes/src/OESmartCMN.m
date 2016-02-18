//
//  OESmartCMN.m
//  OpenEars
//
//  Created by Halle on 1/27/13.
//  Copyright (c) 2014 Politepix. All rights reserved.
//

#import "OESmartCMN.h"

@implementation OESmartCMN

extern int openears_logging;

#if TARGET_IPHONE_SIMULATOR
NSString * const DeviceOrSimulator = @"Simulator";
#else
NSString * const DeviceOrSimulator = @"Device";
#endif

#pragma mark -
#pragma mark Smart CMN Management
#pragma mark -

- (NSString *) pathToCmnPlistAsString {
    return [NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES)[0] stringByAppendingPathComponent:@"cmnvalues.plist"];
}

- (void) removeCmnPlist {
    
    NSError *fileRemovalError = nil;
    BOOL removalSuccess = [[NSFileManager defaultManager] removeItemAtPath:self.pathToCmnPlistAsString error:&fileRemovalError];
    if (!removalSuccess) {
        if(openears_logging==1) {
            NSLog(@"Error while removing cmn plist: %@", [fileRemovalError description]);    
        }
    }
}

- (BOOL) cmnInitPlistFileExists {
    if ( [[NSFileManager defaultManager] fileExistsAtPath:self.pathToCmnPlistAsString] ) {
        return TRUE;
    } else {
        return FALSE;
    }
}

- (NSMutableDictionary *) loadCmnPlistIntoDictionary {
    
    return [NSMutableDictionary dictionaryWithContentsOfFile:self.pathToCmnPlistAsString];
}

- (BOOL) writeOutCmnPlistFromDictionary:(NSMutableDictionary *)mutableDictionary {
    return [mutableDictionary writeToFile:self.pathToCmnPlistAsString atomically:YES];
}

- (BOOL) valuesLookReasonableforCmn:(float)cmn andRoute:(NSString *)route {
    
    if(cmn != cmn || !route) { // If there are no values here, stop before trying to read them at all.
        return FALSE;
    }
    
    if((cmn > 3 && cmn < 120) && (([route length] > 2) && ([route length] < 100))) {
        return TRUE;
    } else {
        return FALSE;
    }
}

- (void) finalizeCmn:(float)cmnFloat atRoute:(NSString *)routeString forAcousticModelAtPath:(NSString *)acousticModelPath withModelName:(NSString *)modelName {
    
    NSMutableDictionary *mutableCmnPlistDictionary = nil;
    
    if([self valuesLookReasonableforCmn:cmnFloat andRoute:routeString]) {
        
        NSNumber *cmnNumber = @(cmnFloat);
        
        NSString *addressToValue = [self addressToCMNValueForAcousticModelAtPath:acousticModelPath atRoute:routeString withModelName:modelName];
        
        if([self cmnInitPlistFileExists]) {
            mutableCmnPlistDictionary = [self loadCmnPlistIntoDictionary]; 
            mutableCmnPlistDictionary[addressToValue] = cmnNumber;   
        } else {
            mutableCmnPlistDictionary = [NSMutableDictionary dictionaryWithObjects:@[cmnNumber] forKeys:@[addressToValue]];
        }
    }
    
    BOOL writeOutSuccess = [self writeOutCmnPlistFromDictionary:mutableCmnPlistDictionary];
    
    if(!writeOutSuccess) {
        NSLog(@"Writing out cmn plist was not successful");
    }
}

- (float) defaultCMNForAcousticModelAtPath:(NSString *)path {
    
    float defaultEnglishValue = 42; // This is really the only place this should be changed. App logic as well as tests rely on this number being consistently available.
    float defaultSpanishValue = 9.5; // This is really the only place this should be changed. App logic as well as tests rely on this number being consistently available.

    if([path rangeOfString:@"AcousticModelSpanish"].location != NSNotFound) return defaultSpanishValue;
    else if([path rangeOfString:@"AcousticModelEnglish"].location != NSNotFound) return defaultEnglishValue;
    else return defaultEnglishValue;    
}

- (float) smartCmnValuesForRoute:(NSString *)routeString forAcousticModelAtPath:(NSString *)acousticModelPath withModelName:(NSString *)modelName {
    
    // if there is a plist and
    // if the plist has an entry for this route and acoustic model and device
    // set the cmninit value to that entry.
    if([self cmnInitPlistFileExists]) {
        
        NSDictionary *cmnPlistDictionary = (NSDictionary *)[self loadCmnPlistIntoDictionary];
        
        NSString *addressToValue = [self addressToCMNValueForAcousticModelAtPath:acousticModelPath atRoute:routeString withModelName:modelName];
        
        if(cmnPlistDictionary[addressToValue]) {
            float previouscmn = [cmnPlistDictionary[addressToValue]floatValue];
            
            if((previouscmn == previouscmn) && (previouscmn > 3) && (previouscmn < 100)) { // I fink you not freeky and I like you a lot.
                if(openears_logging == 1) {
                    NSLog(@"Restoring SmartCMN value of %f", previouscmn);   
                }
                return previouscmn;
                
            } else {
                if(openears_logging == 1) {
                    NSLog(@"SmartCMN didn't like the value %f so it is using the fresh CMN value %f.", previouscmn,[self defaultCMNForAcousticModelAtPath:acousticModelPath]);   
                }    
                return [self defaultCMNForAcousticModelAtPath:acousticModelPath];
            }
        } else {
            if(openears_logging == 1) {
                NSLog(@"There was no previous CMN value in the plist so we are using the fresh CMN value %f.",[self defaultCMNForAcousticModelAtPath:acousticModelPath]);
            }  
            return [self defaultCMNForAcousticModelAtPath:acousticModelPath];
        }
    } else {
        if(openears_logging == 1) {
            NSLog(@"There is no CMN plist so we are using the fresh CMN value %f.",[self defaultCMNForAcousticModelAtPath:acousticModelPath]);
        }  
        return [self defaultCMNForAcousticModelAtPath:acousticModelPath];        
    }
}

- (NSString *) addressToCMNValueForAcousticModelAtPath:(NSString *)acousticModelPath atRoute:(NSString *)routeString withModelName:(NSString *) modelName {
    
    return [NSString stringWithFormat:@"%@.%@.%@.%@",modelName,DeviceOrSimulator,[acousticModelPath lastPathComponent],(NSString *)routeString];
}




@end
