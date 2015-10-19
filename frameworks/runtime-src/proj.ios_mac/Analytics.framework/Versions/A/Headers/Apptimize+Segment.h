//
//  Apptimize+Variables.h
//  Apptimize (v2.11.0, "Shadowfax, Lord of Horses")
//
//  Copyright (c) 2015 Apptimize, Inc. All rights reserved.
//

#ifndef Apptimize_Apptimize_Segment_h
#define Apptimize_Apptimize_Segment_h

@interface Apptimize (SEGIntegration)
+ (void)SEG_ensureLibraryHasBeenInitialized;
+ (void)SEG_resetUserData;
+ (void)SEG_track:(NSString *)eventName attributes:(NSDictionary *)attributes;
+ (void)SEG_setUserAttributesFromDictionary:(NSDictionary *)dictionary;
@end

#endif
