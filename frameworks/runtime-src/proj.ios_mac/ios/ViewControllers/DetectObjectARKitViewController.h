//
//  ViewController.h
//  TSOG CoreML
//
//  Created by Van Nguyen on 7/25/17.
//  Copyright © 2017 TheSchoolOfGames. All rights reserved.
//

#import <UIKit/UIKit.h>

typedef enum : NSUInteger {
    SceneStateInitialization = 0,
    SceneStateCalibration,
    SceneStateGenerating,
    SceneStateEnd,
} SceneState;

@interface DetectObjectARKitViewController : UIViewController

@property (nonatomic, assign) SceneState currentState;

@end

