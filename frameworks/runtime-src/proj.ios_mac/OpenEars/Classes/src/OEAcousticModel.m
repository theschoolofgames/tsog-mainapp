//
//  OEAcousticModel.m
//  OpenEars
//
//  Created by Halle on 8/14/13.
//  Copyright (c) 2013 Politepix. All rights reserved.
//

#import "OEAcousticModel.h"

@implementation OEAcousticModel

+ (NSString *) pathToModel:(NSString *) acousticModelBundleName {
    
    NSString *pathToAcousticModel = [[[NSBundle mainBundle] URLForResource:acousticModelBundleName withExtension:@"bundle"] path];

    if(![[NSFileManager defaultManager] fileExistsAtPath:pathToAcousticModel]) {
        NSLog(@"*****************************************************\rWhile trying to reference the requested acoustic model bundle which is expected to be at the path %@, no bundle was found. This means that when the listening loop begins, it will crash due to the missing required resources. The problem finding the acoustic model bundle could be because the name of the bundle was not given to this method in a way it can use; for instance, if you are trying to use the English acoustic model and you have added that bundle to your app project, you would invoke this method by passing [OEAcousticModel pathToAcousticModel:@\"AcousticModelEnglish\"] (or [OEAcousticModel pathToAcousticModel:@\"AcousticModelSpanish\"] for the Spanish bundle), without appending \".bundle\" to the end, and making sure that the bundle name is spelled exactly as it appears in the actual bundle name (the bundle can be seen in this distribution's folder \"Framework\". \r\rIf this doesn't fix the problem, it is very likely to be due to the fact that the acoustic model bundle wasn't imported successfully into the root level of your app project and its mainBundle. This usually happens either because the acoustic model bundle was never dragged into your app project when the \"Framework\" folder was originally supposed to be dragged in, or because it was dragged in but instead of using the setting \"Create groups for any added folders\" in Xcode's \"Add Files\" dialog, the option \"Create folder references for any added folders\" was unintentionally chosen. To fix this, just remove the acoustic model bundle or the \"Framework\" folder from your app and add it again to your app project with the correct setting of \"Create groups for any added folders\" in Xcode's \"Add Files\" dialog.\r*****************************************************",pathToAcousticModel);   
    }
    
    return pathToAcousticModel;
}

@end
