//
//  ViewController.m
//  TSOG CoreML
//
//  Created by Van Nguyen on 7/25/17.
//  Copyright © 2017 TheSchoolOfGames. All rights reserved.
//

#import "DetectObjectARKitViewController.h"
#import "Inceptionv3.h"
#import "CommonTools.h"
#import "Constants.h"
#import "IdentifiedObjectListViewController.h"
#import "SessionManager.h"
#import "Cocos2dxHelper.h"
#import "FirebaseWrapper.h"
#import <AudioToolbox/AudioServices.h>
#import <AudioToolbox/AudioToolbox.h>

@import AVFoundation;
@import CoreML;
@import Vision;
@import ARKit;

@interface DetectObjectARKitViewController () <ARSCNViewDelegate> {
    // CoreML
    NSArray *visionRequests;
    dispatch_queue_t dispatchQueueML;
    
    UIView *finishAlertView;
    
    // Clock Timer
    NSTimer *countdownTimer;                  // Timer to do countdown
    
    __weak IBOutlet UILabel *lbResult;
    __weak IBOutlet UIImageView *coinImage;
    __weak IBOutlet UIButton *btnShoppingCart;
    __weak IBOutlet UILabel *lbCount;
    __weak IBOutlet NSLayoutConstraint *constraintTopCoinImage;
    __weak IBOutlet UIView *countdownView;
    __weak IBOutlet UILabel *lbCountdown;
    __weak IBOutlet UIView *diamondView;
    __weak IBOutlet UILabel *lbDiamond;
    __weak IBOutlet UIImageView *ivDiamondHUD;
    __weak IBOutlet UIImageView *ivClockHUD;
    __weak IBOutlet UILabel *lbDebug;
    
    IBOutlet ARSCNView *arSceneView;
    
    BOOL FoundedObj;
    BOOL stopFindning;
    BOOL didInitCamera;
    
    // ARKit
    CGFloat textDepth;
    
    // Data
    NSMutableDictionary *sessionIdentifiedObj;
    
    // DEbug
    NSTimeInterval lastTime;
}

@end

@implementation DetectObjectARKitViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view, typically from a nib.
    
    // Set need to init camera
    didInitCamera = NO;
    
    // Setup View
    [self setupView];
    
    // Setup ARKit
    [self setupARKitScene];
    
    // Setup CoreML and Vision
    [self setupVisionAndCoreML];
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    
    // Setup observer
    [self setupObserver];
    
}

- (void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:animated];
    
    // Init camera if needed
    if (!didInitCamera) {
        didInitCamera = YES;

        // Just start process core ml
        [self startProcessCoreML];
    } else {
        [self startARKitAgain];
    }
    
    [self startCountDown];
}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];
    
    // Pause session
    [arSceneView.session pause];
    
    // Stop countdown
    [self stopCountDown];
    
    // Stop process CoreML
    stopFindning = YES;
}

- (void)viewDidDisappear:(BOOL)animated {
    [super viewDidDisappear:animated];
    
    // Remove observer
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)viewDidLayoutSubviews {
    [super viewDidLayoutSubviews];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

#pragma mark - Button Handler
- (IBAction)btnGotoListClicked:(id)sender {
    UIStoryboard *sb = [UIStoryboard storyboardWithName:@"CoreMLDemo" bundle:nil];
    IdentifiedObjectListViewController *iOLVC = [sb instantiateViewControllerWithIdentifier:@"IdentifiedObjectListViewController"];
    [self.navigationController pushViewController:iOLVC animated:YES];
}

- (void)persistGameProgress {
    NSArray *identifiedObjects = [[SessionManager sharedInstance] getIdentifiedObjectsArray];
    NSString *str = [identifiedObjects componentsJoinedByString:@"-@-"];
    NSLog(@"persistGameProgress: %@", str);
    
    NSString *evalStr = [NSString stringWithFormat:@"NativeHelper.saveIdentifiedObjects('%@')", str, NULL];
    NSLog(@"Eval str: %@", evalStr);
    [Cocos2dxHelper evalString:evalStr];
    
    evalStr = [NSString stringWithFormat:@"User.getCurrentChild().setDiamond(%ld);", [[SessionManager sharedInstance] diamondCount], NULL];
    NSLog(@"Eval str: %@", evalStr);
    [Cocos2dxHelper evalString:evalStr];

}

- (IBAction)btnBackClicked:(id)sender {
    [self persistGameProgress];

    dispatch_async(dispatch_get_main_queue(), ^{
        [self dismissViewControllerAnimated:YES completion:nil];
    });
}

- (IBAction)btnFinishClicked:(id)sender {
    [self persistGameProgress];

    dispatch_async(dispatch_get_main_queue(), ^{
        if (finishAlertView) {
            [finishAlertView removeFromSuperview];
            finishAlertView = nil;
        }
        [self dismissViewControllerAnimated:YES completion:nil];
    });
    
}

#pragma mark - Update preview layer when orientation changed
- (void)deviceOrientationDidChange:(NSNotification *)notification {
    
}

#pragma mark - Setup ARKit
- (void)setupARKitScene {
    // Set delegate for arscene
    arSceneView.delegate = self;
    
    // Debug
//    arSceneView.debugOptions = ARSCNDebugOptionShowWorldOrigin | ARSCNDebugOptionShowFeaturePoints;
    
    // Show statistics
    arSceneView.showsStatistics = NO;
    
    // Create new scene
    SCNScene *scene = [[SCNScene alloc] init];
    
    // Set scene to arview
    arSceneView.scene = scene;
    
    // Enable Default Lighting - makes the 3D text a bit poppier.
    arSceneView.autoenablesDefaultLighting = YES;
    
    [self setupARSession];
    
    // Set text depth
    textDepth = 0.1;
}

- (void)setupARSession {
    if (@available(iOS 11.0, *)) {
        // Clear previous node
        for (SCNNode *childNode in arSceneView.scene.rootNode.childNodes) {
            [childNode removeFromParentNode];
        }
        
        // Create a session configuration
        ARWorldTrackingConfiguration *configuration = [[ARWorldTrackingConfiguration alloc] init];
        
        // Enable plane detection
        configuration.planeDetection = ARPlaneDetectionHorizontal;
        
        // Run the view's session
        [arSceneView.session runWithConfiguration:configuration];
    }
}

- (void)startARKitAgain {
    [self setupARSession];
    
    // Feed core ML
    if ([SessionManager sharedInstance].elapsedTime > 0) {
        FoundedObj = NO;
        stopFindning = NO;
        [self startProcessCoreML];
    }
}

#pragma mark - Setup Vision and CoreML
- (void)setupVisionAndCoreML {
    if (@available(iOS 11.0, *)) {
    
        // Reset session list
        sessionIdentifiedObj = [NSMutableDictionary dictionary];
        
        // Read MLModel
        NSError *error;
        VNCoreMLModel *inceptionv3Model = [VNCoreMLModel modelForMLModel:[[[Inceptionv3 alloc] init] model] error:&error];
        if (error) {
            NSLog(@"--->ERROR: %@", error.description);
            return;
        }
        
        // Create request to classify object
        VNCoreMLRequest *classificationRequest = [[VNCoreMLRequest alloc] initWithModel:inceptionv3Model completionHandler:^(VNRequest * _Nonnull request, NSError * _Nullable error) {
            // Handle the response
            
            // Check found object
            if (FoundedObj || stopFindning) {
                return;
            }
            
            // Check error
            if (error) {
                NSLog(@"--->ERROR: %@", error.description);
                
                // Don't find out any object, should check it again
                [self startProcessCoreML];
                return;
            }
            
            if (!request.results) {
                NSLog(@"--->ERROR: No Results");
                
                // Don't find out any object, should check it again
                [self startProcessCoreML];
                return;
            }
            
            // Debug - UPDATE LABEL
            NSTimeInterval currentTime = [[NSDate date] timeIntervalSince1970];
            if (currentTime - lastTime > 1) {
                lastTime = currentTime;
                NSMutableString *objArrayStr = [NSMutableString stringWithString:@""];
                
                [request.results enumerateObjectsUsingBlock:^(VNClassificationObservation *obj, NSUInteger idx, BOOL * _Nonnull stop) {
                    if (idx > 2) {
                        stop = YES;
                        return;
                    }
                    [objArrayStr appendString:[NSString stringWithFormat:@"%@(%f)\n", obj.identifier, obj.confidence]];
                }];
                
                dispatch_async(dispatch_get_main_queue(), ^{
                    lbDebug.text = objArrayStr;
                    [lbDebug sizeToFit];
                });
            }
            // End debug part
            
            // Just get first object
            VNClassificationObservation *firstObj = [request.results firstObject];
            if (firstObj.confidence > kRecognitionThreshold) {
                // Found object
                [self handleFoundObject:firstObj];
            } else {
                // Don't find out any object, should check it again
                NSLog(@"--->Cannot find out CoreML object, find again");
                [self startProcessCoreML];
            }
        }];
        
        classificationRequest.imageCropAndScaleOption = VNImageCropAndScaleOptionCenterCrop;
        visionRequests = @[classificationRequest];
        
        dispatchQueueML = dispatch_queue_create([@"DispatchQueueML" UTF8String], DISPATCH_QUEUE_SERIAL);
        
    }
}

- (void)startProcessCoreML {
    if (@available(iOS 11.0, *)) {
        // Stop CoreML process if found obj or stop finding
        if (FoundedObj || stopFindning) {
            return;
        }
        
        dispatch_async(dispatchQueueML, ^{
            CVPixelBufferRef pixBuff = arSceneView.session.currentFrame.capturedImage;
            if (!pixBuff) {
                NSLog(@"--->ERROR: Non pixel buffer");
                return;
            }
            VNImageRequestHandler *imageRequestHandler = [[VNImageRequestHandler alloc] initWithCVPixelBuffer:pixBuff orientation:kCGImagePropertyOrientationUpMirrored options:[NSDictionary dictionary]];
            NSError *error;
            [imageRequestHandler performRequests:visionRequests error:&error];
            if (error) {
                NSLog(@"--->ERROR: %@", error.description);
                return;
            }
        });
    }
}

#pragma mark - Setup view
- (void)setupView {
    if (@available(iOS 11.0, *)) {
        if (!arSceneView) {
            arSceneView = [[ARSCNView alloc] init];
            [self.view addSubview:arSceneView];
            [arSceneView setTranslatesAutoresizingMaskIntoConstraints:NO];
            [self.view addConstraints:[NSLayoutConstraint constraintsWithVisualFormat:@"H:|[arSceneView]|"
                                                                              options:0
                                                                              metrics:nil
                                                                                views:NSDictionaryOfVariableBindings(arSceneView)]];
            [self.view addConstraints:[NSLayoutConstraint constraintsWithVisualFormat:@"V:|[arSceneView]|"
                                                                              options:0
                                                                              metrics:nil
                                                                                views:NSDictionaryOfVariableBindings(arSceneView)]];
            [self.view layoutIfNeeded];
            [self.view sendSubviewToBack:arSceneView];
        }
    }
    // Bottom text
    lbResult.text = kShowMeAnObject;
    
    // Objects count
    lbCount.text = [NSString stringWithFormat:@"%ld", [[SessionManager sharedInstance] getIdentifiedObjsCount]];
    
    // Countdown clock
    countdownView.layer.cornerRadius = countdownView.bounds.size.height/2.0;
    countdownView.layer.masksToBounds = YES;
    
    // Diamond HUD
    diamondView.layer.cornerRadius = diamondView.bounds.size.height/2.0;
    diamondView.layer.masksToBounds = YES;
    
    // Reset counter
    if ([SessionManager sharedInstance].elapsedTime < 0) {
        [SessionManager sharedInstance].elapsedTime = 120;  // Default value should be 120
    }
    
    // Update UI
    lbCountdown.text = [NSString stringWithFormat:@"%ld", [SessionManager sharedInstance].elapsedTime];
    lbDiamond.text = [NSString stringWithFormat:@"%ld", [SessionManager sharedInstance].diamondCount];
}

#pragma mark - Setup Observer
- (void)setupObserver {
    [[UIDevice currentDevice] beginGeneratingDeviceOrientationNotifications];
    [[NSNotificationCenter defaultCenter] addObserver:self
                           selector:@selector(deviceOrientationDidChange:)
                               name:UIDeviceOrientationDidChangeNotification object:nil];
}

#pragma mark - Handle found object
- (void)handleFoundObject:(VNClassificationObservation *)obj {
    if (@available(iOS 11.0, *)) {
        // analyze string
        NSString *fullName = obj.identifier;
        NSArray *nameArray = [fullName componentsSeparatedByString:@", "];
        
        if (nameArray.count == 0) {
            // No name -> Stop
            
            // Don't find out any object, should check it again
            [self startProcessCoreML];
            return;
        }
        // just get first name
        NSString *identifiedObj = [CommonTools capitalizeFirstLetterOnlyOfString:nameArray[0]];
        
        // Check current session
        if ([sessionIdentifiedObj objectForKey:identifiedObj]) {
            // same object, should check it again
            [self startProcessCoreML];
            return;
        }
        
        // Get center point
        CGPoint screenCentre = CGPointMake(CGRectGetMidX(arSceneView.bounds), CGRectGetMidY(arSceneView.bounds));
        
        // Check ARKit to find the object
        NSArray *arHitTestResults = [arSceneView hitTest:screenCentre types:ARHitTestResultTypeFeaturePoint];
        ARHitTestResult *closestResult = arHitTestResults.firstObject;
        if (closestResult) {
            // Find out via ARKit
            FoundedObj = YES;
            
            // Play sound and vibrate
            [[SessionManager sharedInstance] playSoundAndVibrateFoundObj];
            
            // Add to session list
            [sessionIdentifiedObj setObject:identifiedObj forKey:identifiedObj];
            
            // Remove exceeding node
            if (arSceneView.scene.rootNode.childNodes.count > 5) {
                NSMutableArray *shouldRemoveObjs = [NSMutableArray array];
                for (int i=0; i<arSceneView.scene.rootNode.childNodes.count-5; i++) {
                    [shouldRemoveObjs addObject:arSceneView.scene.rootNode.childNodes[i]];
                }
                
                if (shouldRemoveObjs.count) {
                    for (SCNNode *childNode in shouldRemoveObjs) {
                        [childNode removeFromParentNode];
                    }
                }
            }
            
            // Add object to the Identified Object List
            if ([[SessionManager sharedInstance] addIdentifiedObject:identifiedObj]) {
                dispatch_async(dispatch_get_main_queue(), ^{
                    // Update bottom text
                    lbResult.text = kYouFoundIt;
                    
                    // Increase diamond
                    [SessionManager sharedInstance].diamondCount+=5;
                    
                    // Animation
                    for (NSInteger i=0; i<5; i++) {
                        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.15 * i * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                            [self animateShowDiamondInSerial:YES];
                        });
                    }
                });
            } else {
                dispatch_async(dispatch_get_main_queue(), ^{
                    // Update bottom text
                    lbResult.text = kYouFoundIt;
                    
                    // Increase diamond
                    [SessionManager sharedInstance].diamondCount+=1;
                    [self animateShowDiamondInSerial:NO];
                });
            }
            
            // Analytic
            [FirebaseWrapper logEventSelectContentWithContentType:@"CollectObject" andItemId:identifiedObj];
            
            // Speak
            dispatch_async(dispatch_get_main_queue(), ^{
                [[SessionManager sharedInstance] textToSpeech:identifiedObj];
            });
            
            // Get Coordinates of HitTest
            matrix_float4x4 transform = closestResult.worldTransform;
            SCNVector3 worldCoord = SCNVector3Make(transform.columns[3][0] , transform.columns[3][1], transform.columns[3][2]);
            
            // Create 3D text
            SCNNode *newNode = [self createNewBubleParentNode:identifiedObj withConfident:obj.confidence];
            [arSceneView.scene.rootNode addChildNode:newNode];
            newNode.position = worldCoord;
            
            [newNode lookAt:SCNVector3Make(arSceneView.session.currentFrame.camera.transform.columns[3][0], arSceneView.session.currentFrame.camera.transform.columns[3][1], arSceneView.session.currentFrame.camera.transform.columns[3][2])];
            
            // Increase counter
            dispatch_async(dispatch_get_main_queue(), ^{
                lbCount.text = [NSString stringWithFormat:@"%ld", [[SessionManager sharedInstance] getIdentifiedObjsCount]];
            });
            
            dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(2.0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                // Reset bottom text
                lbResult.text = kShowMeAnObject;
                
                // Let the app check object again
                FoundedObj = NO;
                [self startProcessCoreML];
            });
        } else {
            // Cannot find out ARKit object
            NSLog(@"--->Cannot find out ARKit object, find again");
            [self startProcessCoreML];
        }
    }
}

#pragma mark - Animation
- (void)animateShowDiamondInSerial:(BOOL)inSerial {
    CGSize windowSize = [UIScreen mainScreen].bounds.size;
    UIImage *diamondImg = [UIImage imageNamed:@"diamond-identified-object"];
    CGSize diamondSize = ivDiamondHUD.bounds.size;
    UIImageView *diamondImgView = [[UIImageView alloc] initWithFrame:CGRectZero];
    diamondImgView.image = diamondImg;
    CGRect originalFrame = CGRectMake((windowSize.width - diamondSize.width)/2.0, (windowSize.height - diamondSize.height)/2.0 + 40.0, diamondSize.width, diamondSize.height);
    CGRect destinationalFrame = ivDiamondHUD.frame;
    
    [self.view addSubview:diamondImgView];
    diamondImgView.frame = originalFrame;
    
    diamondImgView.transform = CGAffineTransformMakeScale(0.1, 0.1);
    
    [UIView animateWithDuration:0.05 animations:^{
        diamondImgView.alpha = 1.0;
    } completion:^(BOOL finished) {
        if (finished) {
            [UIView animateWithDuration:0.2 animations:^{
                diamondImgView.transform = CGAffineTransformMakeScale(1.05, 1.05);
            } completion:^(BOOL finished2) {
                if (finished2) {
                    [UIView animateWithDuration:0.135 animations:^{
                        diamondImgView.transform = CGAffineTransformMakeScale(0.95, 0.95);
                    } completion:^(BOOL finished3) {
                        if (finished3) {
                            [UIView animateWithDuration:0.05 animations:^{
                                diamondImgView.transform = CGAffineTransformMakeScale(1.0, 1.0);
                            } completion:^(BOOL finished4) {
                                if (finished4) {
                                    
                                    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)((inSerial)?0.0:0.15 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                                        diamondImgView.layer.anchorPoint = CGPointZero;
                                        
                                        [CATransaction begin];
                                        [CATransaction setCompletionBlock:^{
                                            [diamondImgView.layer removeAllAnimations];
                                            [diamondImgView removeFromSuperview];
                                            
                                            // Update text
                                            lbDiamond.text = [NSString stringWithFormat:@"%ld", [SessionManager sharedInstance].diamondCount];
                                            
                                            // HUD animation
                                            [UIView animateWithDuration:0.2/2 animations:^{
                                                diamondView.transform = CGAffineTransformMakeScale(0.95, 0.95);
                                                ivDiamondHUD.transform = CGAffineTransformMakeScale(0.95, 0.95);
                                            } completion:^(BOOL finished5) {
                                                if (finished5) {
                                                    [UIView animateWithDuration:0.135/2 animations:^{
                                                        diamondView.transform = CGAffineTransformMakeScale(1.05, 1.05);
                                                        ivDiamondHUD.transform = CGAffineTransformMakeScale(1.05, 1.05);
                                                    } completion:^(BOOL finished6) {
                                                        if (finished6) {
                                                            [UIView animateWithDuration:0.05/2 animations:^{
                                                                diamondView.transform = CGAffineTransformMakeScale(1.0, 1.0);
                                                                ivDiamondHUD.transform = CGAffineTransformMakeScale(1.0, 1.0);
                                                            } completion:^(BOOL finished7) {
                                                            }];
                                                        }
                                                    }];
                                                }
                                            }];
                                        }];
                                        
                                        // Set up path movement
                                        CAKeyframeAnimation *pathAnimation = [CAKeyframeAnimation animationWithKeyPath:@"position"];
                                        pathAnimation.calculationMode = kCAAnimationPaced;
                                        pathAnimation.fillMode = kCAFillModeForwards;
                                        pathAnimation.removedOnCompletion = NO;
                                        pathAnimation.duration = 0.5f;
                                        //Setting Endpoint of the animation
                                        CGPoint endPoint = CGPointMake(destinationalFrame.origin.x, destinationalFrame.origin.y);
                                        CGMutablePathRef curvedPath = CGPathCreateMutable();
                                        CGPathMoveToPoint(curvedPath, NULL, originalFrame.origin.x, originalFrame.origin.y);
                                        CGPathAddCurveToPoint(curvedPath, NULL, originalFrame.origin.x + 150.0, originalFrame.origin.y + 100.0, endPoint.x, originalFrame.origin.y - 100.0, endPoint.x, endPoint.y);
                                        pathAnimation.path = curvedPath;
                                        CGPathRelease(curvedPath);
                                        [diamondImgView.layer addAnimation:pathAnimation forKey:@"movingAnimation"];
                                        
                                        [CATransaction commit];
                                    });
                                }
                            }];
                        }
                    }];
                }
            }];
        }
    }];
}

#pragma mark - Countdown timer
- (void)startCountDown {
    dispatch_async(dispatch_get_main_queue(), ^{
        if (countdownTimer) {
            [countdownTimer invalidate];
            countdownTimer = nil;
        }
        
        countdownTimer = [NSTimer scheduledTimerWithTimeInterval:1.0 target:self selector:@selector(checkCurrentTime) userInfo:nil repeats:YES];
    });
    
}

- (void)stopCountDown {
    if (countdownTimer) {
        [countdownTimer invalidate];
        countdownTimer = nil;
    }
}

- (void)checkCurrentTime {
    dispatch_async(dispatch_get_main_queue(), ^{
        if ([SessionManager sharedInstance].elapsedTime > 0) {
            [SessionManager sharedInstance].elapsedTime--;
            
            // Update UI
            lbCountdown.text = [NSString stringWithFormat:@"%ld", [SessionManager sharedInstance].elapsedTime];
        } else {
            // release timer
            [countdownTimer invalidate];
            countdownTimer = nil;
            
            // Update countdown UI
            lbCountdown.text = [NSString stringWithFormat:@"%ld", [SessionManager sharedInstance].elapsedTime];
            
            // Stop identifying
            stopFindning = YES;
            
            // Show Welldone alert
            [self showWelldoneAlert];
        }
    });
}

- (void)showWelldoneAlert {
    CGSize windowSize = [UIScreen mainScreen].bounds.size;
    finishAlertView = [[UIView alloc] initWithFrame:CGRectMake(0, 0, windowSize.width, windowSize.height)];
    finishAlertView.backgroundColor = [[UIColor blackColor] colorWithAlphaComponent:0.5];

    CGSize popUpSize = CGSizeMake(286.0, 240.0);
    UIImageView *bgImgView = [[UIImageView alloc] initWithFrame:CGRectMake((windowSize.width-popUpSize.width)/2.0, (windowSize.height-popUpSize.height)/2.0, popUpSize.width, popUpSize.height)];
    bgImgView.image = [UIImage imageNamed:@"dialog-bg-countdown"];
    [finishAlertView addSubview:bgImgView];
    
    CGSize ribbonSize = CGSizeMake(194.0, 44.0);
    UIImageView *ribbonImgView = [[UIImageView alloc] initWithFrame:CGRectMake((popUpSize.width-ribbonSize.width)/2.0, -17.0, ribbonSize.width, ribbonSize.height)];
    ribbonImgView.image = [UIImage imageNamed:@"ribbon-countdown"];
    [bgImgView addSubview:ribbonImgView];
    
    UILabel *lbTitle = [[UILabel alloc] initWithFrame:CGRectMake(0, -15.0, bgImgView.bounds.size.width, 20.0)];
    lbTitle.textAlignment = NSTextAlignmentCenter;
    lbTitle.text = @"Result";
    lbTitle.font = [UIFont boldSystemFontOfSize:18.0];
    lbTitle.textColor = UIColorFromRGB(0xfec309);
    [bgImgView addSubview:lbTitle];
    
    UILabel *lbContent = [[UILabel alloc] initWithFrame:CGRectMake(0.0, 0.0, bgImgView.bounds.size.width, bgImgView.bounds.size.height)];
    lbContent.textAlignment = NSTextAlignmentCenter;
    lbContent.text = @"Well done!";
    lbContent.font = [UIFont boldSystemFontOfSize:16.0];
    lbContent.textColor = UIColorFromRGB(0xfec309);
    [bgImgView addSubview:lbContent];
    
    CGSize btnSize = CGSizeMake(124.0, 34.0);
    UIButton *btnFinish = [[UIButton alloc] initWithFrame:CGRectMake((popUpSize.width-btnSize.width)/2.0, (popUpSize.height - btnSize.height - 23.0), btnSize.width, btnSize.height)];
    [btnFinish addTarget:self action:@selector(btnFinishClicked:) forControlEvents:UIControlEventTouchUpInside];
    [btnFinish setTitle:@"Finish" forState:UIControlStateNormal];
    btnFinish.titleLabel.textColor = [UIColor whiteColor];
    btnFinish.titleLabel.font = [UIFont boldSystemFontOfSize:14.0];
    [btnFinish setBackgroundImage:[UIImage imageNamed:@"button-finish"] forState:UIControlStateNormal];
    [btnFinish setBackgroundImage:[UIImage imageNamed:@"button-finish-pressed"] forState:UIControlStateHighlighted];
    [bgImgView addSubview:btnFinish];
    [bgImgView setUserInteractionEnabled:YES]; // to enable touch on button

    
    finishAlertView.alpha = 0.0;
    [self.view addSubview:finishAlertView];
    
    // Show alert
    [UIView animateWithDuration:0.25 animations:^{
        finishAlertView.alpha = 1.0;
    } completion:^(BOOL finished) {
        if (finished) {
            [UIView animateWithDuration:0.2 animations:^{
                bgImgView.transform = CGAffineTransformMakeScale(1.05, 1.05);
            } completion:^(BOOL finished2) {
                if (finished2) {
                    [UIView animateWithDuration:0.135 animations:^{
                        bgImgView.transform = CGAffineTransformMakeScale(0.95, 0.95);
                    } completion:^(BOOL finished3) {
                        if (finished3) {
                            [UIView animateWithDuration:0.05 animations:^{
                                bgImgView.transform = CGAffineTransformMakeScale(1.0, 1.0);
                            } completion:^(BOOL finished4) {
                            }];
                        }
                    }];
                }
            }];
        }
    }];
}

#pragma mark - ARSCNViewDelegate
- (void)renderer:(id<SCNSceneRenderer>)renderer updateAtTime:(NSTimeInterval)time {
    // Do nothing
}

#pragma mark - Create text in ARKit
- (SCNNode *)createNewBubleParentNode:(NSString *)word withConfident:(CGFloat)confident {
    // Bubble text
//    NSString *displayString = [NSString stringWithFormat:@"%@(%.2f%%)", word, (confident*100)];
    SCNText *bubbleText = [SCNText textWithString:word extrusionDepth:textDepth];
    bubbleText.font = [UIFont fontWithName:@"HelveticaNeue-Bold" size:0.15];
    bubbleText.alignmentMode = kCAAlignmentCenter;
    bubbleText.firstMaterial.diffuse.contents = [UIColor whiteColor];
    bubbleText.firstMaterial.specular.contents = [UIColor blackColor];
    bubbleText.firstMaterial.doubleSided = YES;
//    bubbleText.flatness = 1.0;
    bubbleText.chamferRadius = textDepth;
    
    // Bubble node
    SCNVector3 boundingBoxMin;
    SCNVector3 boundingBoxMax;
    [bubbleText getBoundingBoxMin:&boundingBoxMin max:&boundingBoxMax];
    
    SCNNode *bubbleNode = [SCNNode nodeWithGeometry:bubbleText];
    // Centre node - to centre-bottom point
    bubbleNode.pivot = SCNMatrix4MakeTranslation((boundingBoxMax.x - boundingBoxMin.x)/2.0, boundingBoxMin.y, textDepth/2.0);
    bubbleNode.scale = SCNVector3Make(0.2, 0.2, 0.2);
    bubbleNode.eulerAngles = SCNVector3Make(0, M_PI, 0);    // Trick to have correct orientation
    
    // Percentage
    // Bubble text
    SCNText *percentageText = [SCNText textWithString:[NSString stringWithFormat:@"(%.2f%%)", (confident*100)] extrusionDepth:textDepth];
    percentageText.font = [UIFont fontWithName:@"HelveticaNeue-Bold" size:0.15];
    percentageText.alignmentMode = kCAAlignmentCenter;
    percentageText.firstMaterial.diffuse.contents = [UIColor whiteColor];
    percentageText.firstMaterial.specular.contents = [UIColor blackColor];
    percentageText.firstMaterial.doubleSided = YES;
    //    bubbleText.flatness = 1.0;
    percentageText.chamferRadius = textDepth;
    
    // Bubble node
    SCNVector3 boundingPercentageBoxMin;
    SCNVector3 boundingPercentageBoxMax;
    [percentageText getBoundingBoxMin:&boundingPercentageBoxMin max:&boundingPercentageBoxMax];
    
    SCNNode *percentageNode = [SCNNode nodeWithGeometry:percentageText];
    // Centre node - to centre-bottom point
    percentageNode.pivot = SCNMatrix4MakeTranslation((boundingPercentageBoxMax.x - boundingPercentageBoxMin.x)/2.0, boundingPercentageBoxMin.y + 0.14, textDepth/2.0);
    percentageNode.scale = SCNVector3Make(0.1, 0.1, 0.1);
    percentageNode.eulerAngles = SCNVector3Make(0, M_PI, 0);    // Trick to have correct orientation
    
    // Sphere
    // Centre point node
    SCNSphere *sphere = [SCNSphere sphereWithRadius:0.005];
    sphere.firstMaterial.diffuse.contents = [UIColor cyanColor];
    SCNNode *sphereNode = [SCNNode nodeWithGeometry:sphere];
    
    // Bubble parent node
    SCNNode *bubbleNodeParent = [[SCNNode alloc] init];
    [bubbleNodeParent addChildNode:bubbleNode];
    [bubbleNodeParent addChildNode:sphereNode];
    [bubbleNodeParent addChildNode:percentageNode];
    
    return bubbleNodeParent;
}

@end
