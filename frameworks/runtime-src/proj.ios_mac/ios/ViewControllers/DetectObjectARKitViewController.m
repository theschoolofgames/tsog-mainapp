//
//  ViewController.m
//  TSOG CoreML
//
//  Created by Van Nguyen on 7/25/17.
//  Copyright © 2017 TheSchoolOfGames. All rights reserved.
//

#import "DetectObjectARKitViewController.h"
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

@interface DetectObjectARKitViewController () <ARSCNViewDelegate, AVSpeechSynthesizerDelegate> {
    UIView *finishAlertView;
    
    // Clock Timer
    NSTimer *countdownTimer;                  // Timer to do countdown
    NSTimer *generateAnimalTimer;
    
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
        
    // ARKit
    CGFloat textDepth;
    
    // Data
    NSMutableDictionary *sessionIdentifiedObj;
    
    // DEbug
    NSTimeInterval lastTime;
    
    // Animal life time
    NSInteger animalLifeTime;
    
    // CurentObject
    NSMutableArray *virtualObjects;
    NSMutableDictionary *objectNameNodes;
    NSMutableArray *virtualObjNames;
    
    // Counter
//    NSUInteger countObject;
    
    // Speaking
    AVSpeechSynthesizer *synthesizer;
    
    // animation flag
    BOOL diamondFlyAnimation;
    
    CGFloat scale;
    NSInteger maxObject;
    
    // Tutorial finger
    SCNNode *tutorialFinger;
    
    // First session
    BOOL isFirstSession;
}

@end

@implementation DetectObjectARKitViewController

const NSInteger GENERATION_TIME = 15;
const CGFloat GENERATE_DISTANCE = 1.0;
const NSUInteger INDEX_NOTFOUND = 999;
const NSUInteger LIVED_ANIMAL_MAX = 5;
const CGFloat THRESHOLD_POSITION = 0.2;

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view, typically from a nib.
    
    // Setup View
    [self setupView];
    
    // Setup ARKit
    [self setupARKitScene];
    
    // Setup SpeechSynthesizer
    [self setupSpeechSynthesizer];
    
    // Setup touch gesture
    [self setupTouchGesture];
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    
    // Setup observer
    [self setupObserver];
    
}

- (void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:animated];
    
    // Init ARSession
    [self setupARSession];
    
    [self startCountDown];
}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];
    
    // Pause session
    [arSceneView.session pause];
    
    // Stop countdown
    [self stopCountDown];
}

- (void)viewDidDisappear:(BOOL)animated {
    [super viewDidDisappear:animated];
    
    // Remove observer
    [[NSNotificationCenter defaultCenter] removeObserver:self];
    [self removeObserver:self forKeyPath:@"currentState"];
}

- (void)viewDidLayoutSubviews {
    [super viewDidLayoutSubviews];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)observeValueForKeyPath:(NSString *)keyPath ofObject:(id)object change:(NSDictionary<NSKeyValueChangeKey,id> *)change context:(void *)context {
    if([keyPath isEqualToString:@"currentState"])
    {
        [self updateState];
    }
}

#pragma mark - Update state
- (void)updateState {
    dispatch_async(dispatch_get_main_queue(), ^{
        switch (self.currentState) {
            case SceneStateInitialization:
//                [self setCalibrationText];
                break;
            case SceneStateCalibration:
//                [self setCalibratingText];
                break;
            case SceneStateGenerating:
                // Start generate object
                // Bottom text
                lbResult.text = kFindObject;
                [self startGenerateAnimalNode];
                break;
            case SceneStateEnd:
                // Remove all timer
                if (countdownTimer) {
                    [countdownTimer invalidate];
                    countdownTimer = nil;
                }
                
                if (generateAnimalTimer) {
                    [generateAnimalTimer invalidate];
                    generateAnimalTimer = nil;
                }
                
                // Show Welldone alert
                [self showWelldoneAlert];
                break;
            default:
                break;
        }
    });
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
//    NSLog(@"persistGameProgress: %@", str);
    
    NSString *evalStr = [NSString stringWithFormat:@"NativeHelper.saveIdentifiedObjects('%@')", str, NULL];
//    NSLog(@"Eval str: %@", evalStr);
    [Cocos2dxHelper evalString:evalStr];
    
    evalStr = [NSString stringWithFormat:@"User.getCurrentChild().setDiamond(%ld);", [[SessionManager sharedInstance] diamondCount], NULL];
//    NSLog(@"Eval str: %@", evalStr);
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
    if (@available(iOS 11.0, *)) {
//        arSceneView.debugOptions = ARSCNDebugOptionShowWorldOrigin | ARSCNDebugOptionShowFeaturePoints;
    } else {
        // Fallback on earlier versions
    }
    
    // Show statistics
    arSceneView.showsStatistics = NO;
    
    // Make things look pretty :)
    arSceneView.antialiasingMode = SCNAntialiasingModeMultisampling4X;
    
    // Create new scene
    SCNScene *scene = [[SCNScene alloc] init];
    
    // Set scene to arview
    arSceneView.scene = scene;
    
    // Enable Default Lighting - makes the 3D text a bit poppier.
    arSceneView.autoenablesDefaultLighting = YES;
    arSceneView.automaticallyUpdatesLighting = YES;
    
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
        
        // Disable plane detection
        configuration.planeDetection = ARPlaneDetectionNone;
        
        // Run the view's session
        [arSceneView.session runWithConfiguration:configuration];
        
        // Start game
        if ([SessionManager sharedInstance].elapsedTime > 0) {
            self.currentState = SceneStateGenerating;
        } else {
            self.currentState = SceneStateEnd;
        }
    }
}

- (void)setupTouchGesture {
    UITapGestureRecognizer *tapGesture = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(handleTap:)];
    [arSceneView addGestureRecognizer:tapGesture];
}

#pragma mark - Tap gesture
-(void)handleTap:(UITapGestureRecognizer *)recognize {
    if (diamondFlyAnimation) {
        return;
    }
    
    if (recognize.state == UIGestureRecognizerStateEnded) {
        CGPoint location = [recognize locationInView:arSceneView];
        NSArray *hits = [arSceneView hitTest:location options:@{SCNHitTestBoundingBoxOnlyKey: @YES}];
        if (hits.count) {
            for (SCNHitTestResult *result in hits) {
                NSInteger foundIndex = [self matchObject:result.node];
                if (foundIndex != INDEX_NOTFOUND) {
                    // Handle found object
                    diamondFlyAnimation = YES;
                    [self handleFoundObject:foundIndex atLocation:location];
                } else {
                    // Not found object
                    NSLog(@"NOTFOUND!!!");
                }
            }
        } else {
            NSLog(@"NO hit");
        }
    }
}

- (NSUInteger)matchObject:(SCNNode *)tappedNode {
    __block NSUInteger index = INDEX_NOTFOUND; // Not found
    [virtualObjects enumerateObjectsUsingBlock:^(SCNNode *obj, NSUInteger idx, BOOL * _Nonnull stop) {
        if (@available(iOS 11.0, *)) {
            if (tappedNode.worldPosition.x == obj.worldPosition.x && tappedNode.worldPosition.y == obj.worldPosition.y && tappedNode.worldPosition.z == obj.worldPosition.z) {
                stop = YES;
                index = idx;
            } else {
            }
        } else {
            // Fallback on earlier versions
        }
    }];
    return index;
}

#pragma mark - setup SpeechSynthesizer
- (void)setupSpeechSynthesizer {
    synthesizer = [[AVSpeechSynthesizer alloc] init];
    synthesizer.delegate = self;
}

- (void)textToSpeech:(NSString *)text {
    if (!text.length) {
        return;
    }
    
    AVSpeechUtterance *utterance = [AVSpeechUtterance speechUtteranceWithString:text];
    utterance.voice = [AVSpeechSynthesisVoice voiceWithLanguage:@"en-US"];
    utterance.volume = 1.0;
    [utterance setRate:0.5f];
    
    if ([synthesizer isSpeaking]) {
        [synthesizer stopSpeakingAtBoundary:AVSpeechBoundaryImmediate];
    }
    [synthesizer speakUtterance:utterance];
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
        [SessionManager sharedInstance].elapsedTime = 30;  // Default value should be 120
    }
    
    // Update UI
    lbCountdown.text = [NSString stringWithFormat:@"%ld", [SessionManager sharedInstance].elapsedTime];
    lbDiamond.text = [NSString stringWithFormat:@"%ld", [SessionManager sharedInstance].diamondCount];
    
    // Debug label
    if (DEBUG_MODE) {
        lbDebug.hidden = NO;
    } else {
        lbDebug.hidden = YES;
    }
    
    virtualObjects = [NSMutableArray array];
    virtualObjNames = [NSMutableArray array];
    objectNameNodes = [NSMutableDictionary dictionary];
    scale = 0.3;
    maxObject = 5;
    [[SessionManager sharedInstance] resetAllList];
    
    // Set first session
    isFirstSession = YES;
}

#pragma mark - Setup Observer
- (void)setupObserver {
    [[UIDevice currentDevice] beginGeneratingDeviceOrientationNotifications];
    [[NSNotificationCenter defaultCenter] addObserver:self
                           selector:@selector(deviceOrientationDidChange:)
                               name:UIDeviceOrientationDidChangeNotification object:nil];
    
    // Add observer
    [self addObserver:self forKeyPath:@"currentState" options:NSKeyValueObservingOptionNew | NSKeyValueObservingOptionOld context:nil];
}

#pragma mark - Handle found object
- (void)handleFoundObject:(NSUInteger)index atLocation:(CGPoint) location {
    dispatch_async(dispatch_get_main_queue(), ^{
        // Play sound and vibrate
        [[SessionManager sharedInstance] vibrateFoundObj];
        
        NSString *currentObjName = virtualObjNames[index];
        SCNNode *currentObject = virtualObjects[index];
        
        // Update bottom text
        lbResult.text = [NSString stringWithFormat:@"You found %@", currentObjName];
        
        // Speak
        [self textToSpeech:currentObjName];
        
        // Increase diamond
        [SessionManager sharedInstance].diamondCount+=5;
        
        // Animation
        for (NSInteger i=0; i<5; i++) {
            dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.15 * i * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                [self animateShowDiamondInSerial:YES fromPosition:location];
            });
        }
        
        // Create 3D text
        SCNNode *textNode = [self createNewBubleParentNode:currentObjName];
        [arSceneView.scene.rootNode addChildNode:textNode];
        [objectNameNodes setObject:textNode forKey:virtualObjNames[index]];
        
        SCNVector3 boundingBoxMin;
        SCNVector3 boundingBoxMax;
        [currentObject getBoundingBoxMin:&boundingBoxMin max:&boundingBoxMax];
        CGFloat textPositionY = currentObject.position.y + (boundingBoxMax.y - boundingBoxMin.y)/2.0;
        textNode.position = SCNVector3Make(currentObject.position.x, textPositionY, currentObject.position.z);
        
        if (@available(iOS 11.0, *)) {
            [textNode lookAt:SCNVector3Make(arSceneView.session.currentFrame.camera.transform.columns[3][0], arSceneView.session.currentFrame.camera.transform.columns[3][1], arSceneView.session.currentFrame.camera.transform.columns[3][2])];
        } else {
            // Fallback on earlier versions
        }
        
        // Continue generate object
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
            [textNode removeFromParentNode];
            [currentObject removeFromParentNode];
            diamondFlyAnimation = NO;
        });
        
        // Remove finger if needed
        if (tutorialFinger) {
            [tutorialFinger removeFromParentNode];
            tutorialFinger = nil;
        }
        
        // Analytic
        [FirebaseWrapper logEventSelectContentWithContentType:@"CollectObject" andItemId:currentObjName];
    });
}

#pragma mark - Animation
- (void)animateShowDiamondInSerial:(BOOL)inSerial fromPosition:(CGPoint)location {
    UIImage *diamondImg = [UIImage imageNamed:@"diamond-identified-object"];
    CGSize diamondSize = ivDiamondHUD.bounds.size;
    UIImageView *diamondImgView = [[UIImageView alloc] initWithFrame:CGRectZero];
    diamondImgView.image = diamondImg;
    CGRect originalFrame = CGRectMake(location.x, location.y, diamondSize.width, diamondSize.height);
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
            self.currentState = SceneStateEnd;
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
- (SCNNode *)createNewBubleParentNode:(NSString *)word {
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
    
    // Sphere
    // Centre point node
    SCNSphere *sphere = [SCNSphere sphereWithRadius:0.005];
    sphere.firstMaterial.diffuse.contents = [UIColor cyanColor];
    SCNNode *sphereNode = [SCNNode nodeWithGeometry:sphere];
    
    // Bubble parent node
    SCNNode *bubbleNodeParent = [[SCNNode alloc] init];
    [bubbleNodeParent addChildNode:bubbleNode];
    [bubbleNodeParent addChildNode:sphereNode];

    return bubbleNodeParent;
}

#pragma mark - Objects
- (void)startGenerateAnimalNode {
    if (generateAnimalTimer) {
        [generateAnimalTimer invalidate];
        generateAnimalTimer = nil;
    }
    
    // Check state
    if (self.currentState != SceneStateGenerating) {
        return;
    }
    
    // Start timer
    generateAnimalTimer = [NSTimer scheduledTimerWithTimeInterval:1.0 target:self selector:@selector(addAnimalIfNeeded) userInfo:nil repeats:YES];
}

- (SCNNode *)makeNode:(UIImage *)image andWidth:(CGFloat)width andHeight:(CGFloat)height {
    SCNPlane *plane = [SCNPlane planeWithWidth:width height:height];
    plane.firstMaterial.diffuse.contents = image;
    SCNNode *node = [SCNNode nodeWithGeometry:plane];
    SCNBillboardConstraint *constraint = [SCNBillboardConstraint billboardConstraint];
    node.constraints = @[constraint];
    return node;
}

- (void)removeAllNodesInScene {
    if (arSceneView.scene.rootNode.childNodes.count > 0) {
        NSMutableArray *shouldRemoveObjs = [NSMutableArray array];
        for (int i=0; i<arSceneView.scene.rootNode.childNodes.count; i++) {
            [shouldRemoveObjs addObject:arSceneView.scene.rootNode.childNodes[i]];
        }
        
        if (shouldRemoveObjs.count) {
            for (SCNNode *childNode in shouldRemoveObjs) {
                [childNode removeFromParentNode];
            }
        }
    }
}

- (void)addAnimalIfNeeded {
    // Check if object is exist
    NSInteger count = 0;
    for (SCNNode *child in arSceneView.scene.rootNode.childNodes) {
        if ([child.name isEqualToString:@"AnimalNode"]) {
            count++;
        }
    }
    if (count >= maxObject) {
        return;
    }

    // Create animal node
    NSString *virtualObjName = [[SessionManager sharedInstance] randomAnObjectOrAnimal:virtualObjNames];
    UIImage *objImage = [UIImage imageNamed:virtualObjName];
    CGFloat scaleWidth = scale;
    CGFloat scaleHeight = scale;
    if (objImage.size.width > objImage.size.height) {
        scaleHeight = objImage.size.height/objImage.size.width * scaleWidth;
    } else if (objImage.size.width < objImage.size.height) {
        scaleWidth = objImage.size.width/objImage.size.height * scaleHeight;
    }
    SCNNode *animeNode = [self makeNode:objImage andWidth:scaleWidth andHeight:scaleHeight];
    animeNode.name = @"AnimalNode";
    if (@available(iOS 11.0, *)) {
        // Check if first object
        if (virtualObjects.count) {
            // Check position
            BOOL badPosition = YES;
            SCNVector3 newPosition;
            while(badPosition) {
                newPosition = [self generateAnimalPosition];
                
                BOOL falseOneNode = NO;
                
                for (SCNNode *oldNode in virtualObjects) {
                    BOOL badX = NO;
                    BOOL badZ = NO;
                    if (fabsf(oldNode.position.x - newPosition.x) < THRESHOLD_POSITION) {
                        badX = YES;
                    }
                    if (fabsf(oldNode.position.z - newPosition.z) < THRESHOLD_POSITION) {
                        badZ = YES;
                    }
                    if (badX && badZ) {
                        falseOneNode = YES;
                    } else {
                    }
                }
                
                if (!falseOneNode) {
                    badPosition = NO;
                }
                
            }
            animeNode.position = newPosition;
        } else {
            // First object
            SCNVector3 cameraPosition = SCNVector3Make(arSceneView.session.currentFrame.camera.transform.columns[3][0], arSceneView.session.currentFrame.camera.transform.columns[3][1], arSceneView.session.currentFrame.camera.transform.columns[3][2]);
            animeNode.position = SCNVector3Make(0.0, cameraPosition.y, -GENERATE_DISTANCE);
            
            if (isFirstSession) {
                isFirstSession = NO;
                
                UIImage *fingerImage = [UIImage imageNamed:@"finger"];
                CGFloat fingerWidth = 0.2;
                CGFloat fingerHeight = 0.2;
                if (fingerImage.size.width > fingerImage.size.height) {
                    fingerHeight = fingerImage.size.height/fingerImage.size.width * fingerWidth;
                } else if (fingerImage.size.width < fingerImage.size.height) {
                    fingerWidth = fingerImage.size.width/fingerImage.size.height * fingerWidth;
                }
                tutorialFinger = [self makeNode:fingerImage andWidth:fingerWidth andHeight:fingerHeight];
                tutorialFinger.name = @"TutorialFinger";
                tutorialFinger.scale = SCNVector3Make(1.0, 1.0, 1.0);
                
                SCNVector3 boundingBoxMin;
                SCNVector3 boundingBoxMax;
                [animeNode getBoundingBoxMin:&boundingBoxMin max:&boundingBoxMax];
                CGFloat fingerX = animeNode.position.x + (boundingBoxMax.x - boundingBoxMin.x)/2.0;
                CGFloat fingerY = animeNode.position.y;
                tutorialFinger.position = SCNVector3Make(fingerX, fingerY, -GENERATE_DISTANCE + 0.1);
                [arSceneView.scene.rootNode addChildNode:tutorialFinger];
            }
        }
    } else {
        // Fallback on earlier versions
    }
    animeNode.scale = SCNVector3Make(1.0, 1.0, 1.0);
    [arSceneView.scene.rootNode addChildNode:animeNode];
    
    [virtualObjects addObject:animeNode];
    [virtualObjNames addObject:virtualObjName];
    
    // Re count
    // Check if object is exist
    NSInteger reCount = 0;
    for (SCNNode *child in arSceneView.scene.rootNode.childNodes) {
        if ([child.name isEqualToString:@"AnimalNode"]) {
            reCount++;
        }
    }
    if (reCount < maxObject) {
        [self addAnimalIfNeeded];
    }
}

- (SCNVector3)generateAnimalPosition {
    // random position around user
    double ratioX = (double)arc4random()/UINT32_MAX;
    double ratioY = (double)arc4random()/UINT32_MAX;
    
    NSInteger signX = arc4random()%2;
    NSInteger signY = arc4random_uniform(3);
    NSInteger signZ = arc4random()%2;
    
    SCNVector3 cameraPosition = SCNVector3Make(arSceneView.session.currentFrame.camera.transform.columns[3][0], arSceneView.session.currentFrame.camera.transform.columns[3][1], arSceneView.session.currentFrame.camera.transform.columns[3][2]);
    
    CGFloat positionX = cameraPosition.x + (signX?1:-1) * ratioX * GENERATE_DISTANCE;
    
    CGFloat b = - 2 * cameraPosition.z;
    CGFloat c = cameraPosition.x * cameraPosition.x + cameraPosition.z * cameraPosition.z - GENERATE_DISTANCE * GENERATE_DISTANCE + positionX * positionX - 2 * cameraPosition.x * positionX;
    CGFloat delta = b * b - 4 * c;
    CGFloat positionZ = 0;
    if (signZ) {
        positionZ = (-b + sqrtf(delta))/2;
    } else {
        positionZ = (-b - sqrtf(delta))/2;
    }
    
    CGFloat translateY = 0;
    if (signY == 1) {
        translateY = ratioY * 0.1;
    } else if (signY == 2) {
        translateY = - (ratioY * 0.1);
    }
    CGFloat positionY = cameraPosition.y + translateY;
    
    return SCNVector3Make(positionX, positionY, positionZ);
}

#pragma mark - AVSpeechSynthesizerDelegate
- (void)speechSynthesizer:(AVSpeechSynthesizer *)synthesizer didFinishSpeechUtterance:(AVSpeechUtterance *)utterance {
}

#pragma mark - utils string
- (NSUInteger)occurrenceCountOfCharacter:(UniChar)character fromString:(NSString *)source {
    CFStringRef selfAsCFStr = (__bridge CFStringRef)source;
    
    CFStringInlineBuffer inlineBuffer;
    CFIndex length = CFStringGetLength(selfAsCFStr);
    CFStringInitInlineBuffer(selfAsCFStr, &inlineBuffer, CFRangeMake(0, length));
    
    NSUInteger counter = 0;
    
    for (CFIndex i = 0; i < length; i++) {
        UniChar c = CFStringGetCharacterFromInlineBuffer(&inlineBuffer, i);
        if (c == character) counter += 1;
    }
    
    return counter;
}

@end
