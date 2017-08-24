//
//  ViewController.m
//  TSOG CoreML
//
//  Created by Van Nguyen on 7/25/17.
//  Copyright © 2017 TheSchoolOfGames. All rights reserved.
//

#import "DetectObjectViewController.h"
#import "Inceptionv3.h"
#import "CommonTools.h"
#import "Constants.h"
#import "IdentifiedObjectListViewController.h"
#import "SessionManager.h"

@import AVFoundation;
@import CoreML;
@import Vision;

@interface DetectObjectViewController () <AVCaptureVideoDataOutputSampleBufferDelegate> {
    AVCaptureSession *session;

    dispatch_queue_t captureQueue;

    AVCaptureVideoPreviewLayer *previewLayer;
    CAGradientLayer *gradientLayer;
    NSArray *visionRequests;

    UIView *finishAlertView;
    
    // Animation pointer
    UIView *backgroundView;
    UILabel *animatedLabel;
    NSTimer *showAnimatedStringTimer;
    NSTimer *hideAnimatedStringTimer;
    
    // Clock Timer
    NSTimer *countdownTimer;                  // Timer to do countdown
    
    __weak IBOutlet UILabel *lbResult;
    __weak IBOutlet UIView *previewView;
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
    
    BOOL foundingObj;
    BOOL stopFindning;
    BOOL didInitCamera;
}

@end

@implementation DetectObjectViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view, typically from a nib.
    
    // Set need to init camera
    didInitCamera = NO;
    
    // Setup View
    [self setupView];
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    
    // Setup observer
    [self setupObserver];
    
    // Init camera if needed
    if (!didInitCamera) {
        didInitCamera = YES;
        
        // Setup Camera
        [self setupCamera];
        
        // Setup CoreML and Vision
        [self setupVisionAndCoreML];
    }
}

- (void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:animated];
    
    // Update preview layer and gradient layer size
    previewLayer.frame = previewView.bounds;
    gradientLayer.frame = previewView.bounds;
    
    [self deviceOrientationDidChange:nil];
    
    if (![session isRunning]) {
        [session startRunning];
    }
    
    [self startCountDown];
}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];
    
    if ([session isRunning]) {
        [session stopRunning];
    }
}

- (void)viewDidDisappear:(BOOL)animated {
    [super viewDidDisappear:animated];
    
    // Remove observer
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)viewDidLayoutSubviews {
    [super viewDidLayoutSubviews];
    
    // Update preview layer and gradient layer size
    previewLayer.frame = previewView.bounds;
    gradientLayer.frame = previewView.bounds;
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

- (IBAction)btnBackClicked:(id)sender {
    // Stop session
    if (session.isRunning) {
        [session stopRunning];
    }

    dispatch_async(dispatch_get_main_queue(), ^{
        [self dismissViewControllerAnimated:YES completion:nil];
    });
}

- (IBAction)btnFinishClicked:(id)sender {
    // Stop session
    if (session.isRunning) {
        [session stopRunning];
    }
    
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
    UIDeviceOrientation deviceOrientation = [[UIDevice currentDevice] orientation];
    AVCaptureVideoOrientation newOrientation;
//    if (deviceOrientation == UIDeviceOrientationPortrait) {
//        newOrientation = AVCaptureVideoOrientationPortrait;
//    } else if (deviceOrientation == UIDeviceOrientationLandscapeLeft) {
    if (deviceOrientation == UIDeviceOrientationLandscapeLeft){
        newOrientation = AVCaptureVideoOrientationLandscapeRight;
    } else if (deviceOrientation == UIDeviceOrientationLandscapeRight) {
        newOrientation = AVCaptureVideoOrientationLandscapeLeft;
    } else {
        // Do nothing
        return;
    }
    
    AVCaptureConnection *previewLayerConnection = previewLayer.connection;
    if ([previewLayerConnection isVideoOrientationSupported])
    {
        [previewLayerConnection setVideoOrientation:newOrientation];
    }
    
    if (backgroundView) {
        backgroundView.frame = [UIScreen mainScreen].bounds;
    }
}

#pragma mark - Setup Camera
- (void)setupCamera {
    // Init session
    session = [[AVCaptureSession alloc] init];
    
    // Init Input device
    AVCaptureDevice *inputDevice = [AVCaptureDevice defaultDeviceWithMediaType:AVMediaTypeVideo];
    
    if (!inputDevice) {
        NSLog(@"No video camera available");
        return;
    }
    
    // Create capture queue
    captureQueue = dispatch_queue_create( "captureQueue", DISPATCH_QUEUE_SERIAL );
    
    // add the preview layer
    previewLayer = [[AVCaptureVideoPreviewLayer alloc] initWithSession:session];
    [previewView.layer addSublayer:previewLayer];
    
    // add a slight gradient overlay so we can read the results easily
    gradientLayer = [[CAGradientLayer alloc] init];
    gradientLayer.colors = @[(id)[UIColor colorWithWhite:0 alpha:0.0].CGColor, (id)[UIColor colorWithWhite:0 alpha:0.7].CGColor];
    gradientLayer.locations = @[@(0.85), @(1.0)];
    [previewView.layer addSublayer:gradientLayer];
    
    // Update preview layer and gradient layer size
    previewLayer.frame = previewView.bounds;
    gradientLayer.frame = previewView.bounds;
    
    // create the capture input and the video output
    NSError *error;
    AVCaptureDeviceInput *cameraInput = [[AVCaptureDeviceInput alloc] initWithDevice:inputDevice error:&error];
    if (error) {
        NSLog(@"--->ERROR: %@", error.description);
        return;
    }
    AVCaptureVideoDataOutput *videoOutput = [[AVCaptureVideoDataOutput alloc] init];
    [videoOutput setSampleBufferDelegate:self queue:captureQueue];
    videoOutput.alwaysDiscardsLateVideoFrames = YES;
    videoOutput.videoSettings = [NSDictionary dictionaryWithObject:[NSNumber numberWithInt:kCVPixelFormatType_32BGRA] forKey:(id)kCVPixelBufferPixelFormatTypeKey];
    session.sessionPreset = AVCaptureSessionPresetHigh;
    
    // wire up the session
    [session addInput:cameraInput];
    [session addOutput:videoOutput];
    
    AVCaptureConnection *connection = [videoOutput connectionWithMediaType:AVMediaTypeVideo];
    if ([connection isVideoOrientationSupported])
    {
        UIDeviceOrientation deviceOrientation = [[UIDevice currentDevice] orientation];
        AVCaptureVideoOrientation newOrientation = AVCaptureVideoOrientationLandscapeRight;
        if (deviceOrientation == UIDeviceOrientationLandscapeLeft){
            newOrientation = AVCaptureVideoOrientationLandscapeRight;
        } else if (deviceOrientation == UIDeviceOrientationLandscapeRight) {
            newOrientation = AVCaptureVideoOrientationLandscapeLeft;
        }
        [connection setVideoOrientation:newOrientation];
    } else {
        [connection setVideoOrientation:AVCaptureVideoOrientationLandscapeRight];
    }
    
    // Start the session
    [session startRunning];
}

#pragma mark - Setup Camera
- (void)setupVisionAndCoreML {
    // Read MLModel
    NSError *error;
    VNCoreMLModel *inceptionv3Model = [VNCoreMLModel modelForMLModel:[[[Inceptionv3 alloc] init] model] error:&error];
    if (error) {
//        NSLog(@"--->ERROR: %@", error.description);
        return;
    }
    
    // Create request to classify object
    VNCoreMLRequest *classificationRequest = [[VNCoreMLRequest alloc] initWithModel:inceptionv3Model completionHandler:^(VNRequest * _Nonnull request, NSError * _Nullable error) {
        // Handle the response
        
        // Check found object
        if (foundingObj || stopFindning) {
            return;
        }
        
        // Check error
        if (error) {
            NSLog(@"--->ERROR: %@", error.description);
            return;
        }
        
        if (!request.results) {
            NSLog(@"--->ERROR: No Results");
            return;
        }
        
        // Just get first object
        VNClassificationObservation *firstObj = [request.results firstObject];
        if (firstObj.confidence > kRecognitionThreshold) {
            // Found object
            [self handleFoundObject:firstObj];
        }
    }];
    
    classificationRequest.imageCropAndScaleOption = VNImageCropAndScaleOptionCenterCrop;
    visionRequests = @[classificationRequest];
}

#pragma mark - Setup view
- (void)setupView {
    lbResult.text = kShowMeAnObject;
    
    // Countdown clock
    countdownView.layer.cornerRadius = countdownView.bounds.size.height/2.0;
    countdownView.layer.masksToBounds = YES;
    
    // Diamond HUD
    diamondView.layer.cornerRadius = diamondView.bounds.size.height/2.0;
    diamondView.layer.masksToBounds = YES;
    
    // Reset counter
    [SessionManager sharedInstance].elapsedTime = 120;
    
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

#pragma mark - AVCaptureVideoDataOutputSampleBufferDelegate
- (void)captureOutput:(AVCaptureOutput *)output didOutputSampleBuffer:(CMSampleBufferRef)sampleBuffer fromConnection:(AVCaptureConnection *)connection {
    
    if (stopFindning) {
        return;
    }
    
    CVImageBufferRef pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer);
    
    NSDictionary *requestOptions = [NSDictionary dictionaryWithObjectsAndKeys:CMGetAttachment(sampleBuffer, kCMSampleBufferAttachmentKey_CameraIntrinsicMatrix, nil), VNImageOptionCameraIntrinsics, nil];
    VNImageRequestHandler *imageRequestHandler = [[VNImageRequestHandler alloc] initWithCVPixelBuffer:pixelBuffer orientation:kCGImagePropertyOrientationUpMirrored options:requestOptions];
    NSError *error;
    [imageRequestHandler performRequests:visionRequests error:&error];
    if (error) {
        NSLog(@"--->ERROR: %@", error.description);
        return;
    }
}

#pragma mark - Handle found object
- (void)handleFoundObject:(VNClassificationObservation *)obj {
    // Found object
    foundingObj = YES;
    
    // analyze string
    NSString *fullName = obj.identifier;
    NSArray *nameArray = [fullName componentsSeparatedByString:@", "];
    
    if (nameArray.count == 0) {
        // No name -> Stop
        return;
    }
    // just get first name
    NSString *identifiedObj = [CommonTools capitalizeFirstLetterOnlyOfString:nameArray[0]];
    
    // Add object to the Identified Object List
    if ([[SessionManager sharedInstance] addIdentifiedObject:identifiedObj]) {
        // Show text on screen
        dispatch_async(dispatch_get_main_queue(), ^{
            // Update bottom text
            lbResult.text = kYouFoundIt;
            
            // Increase diamond
            [SessionManager sharedInstance].diamondCount++;
            
            // Show word
            [self showAnimatedString:identifiedObj];
        });
    } else {
        foundingObj = NO;
    }
}

#pragma mark - Animation
- (void)showAnimatedString:(NSString *)animatedString {
    // Current Window
    CGSize windowSize = [UIScreen mainScreen].bounds.size;
//    UIWindow *window = [UIApplication sharedApplication].keyWindow;
    
    // Create dimmed background
    backgroundView = [[UIView alloc] initWithFrame:CGRectMake(0, 0, windowSize.width, windowSize.height)];
    // Create animated label
    animatedLabel = [[UILabel alloc] initWithFrame:CGRectZero];
    
    // Attributed string (different colors)
    NSMutableAttributedString *attributedString = [[NSMutableAttributedString alloc] initWithString:animatedString];
    [attributedString addAttribute:NSForegroundColorAttributeName value:[UIColor colorWithWhite:1.0 alpha:1.0] range:NSMakeRange(0,1)];
    [attributedString addAttribute:NSForegroundColorAttributeName value:[UIColor colorWithWhite:1.0 alpha:0.6] range:NSMakeRange(1,animatedString.length - 1)];
    animatedLabel.attributedText = attributedString;
    [animatedLabel setFont:[UIFont fontWithName:@"HelveticaNeue-Bold" size:kAnimatedFontSize]];
    [animatedLabel setMinimumScaleFactor:0.1];
    animatedLabel.textAlignment = NSTextAlignmentCenter;
    animatedLabel.adjustsFontSizeToFitWidth = YES;
    [backgroundView addSubview:animatedLabel];
    [self.view addSubview:backgroundView];
    
    // Bring HUD to front
    [self.view bringSubviewToFront:countdownView];
    [self.view bringSubviewToFront:ivClockHUD];
    [self.view bringSubviewToFront:diamondView];
    [self.view bringSubviewToFront:ivDiamondHUD];
    
    // animation
    backgroundView.backgroundColor = [[UIColor blackColor] colorWithAlphaComponent:0.0];
    CGFloat minWidth = 50.0;
    CGFloat maxWidth = 400.0;
    CGFloat textHeight = 80.0;
    
    animatedLabel.frame = CGRectMake((windowSize.width - maxWidth)/2, (windowSize.height - textHeight)/2, maxWidth, textHeight);
    animatedLabel.transform = CGAffineTransformMakeScale(0.1, 0.1);
    animatedLabel.alpha = 0.1;
    
    [UIView animateWithDuration:0.5 animations:^{
        backgroundView.backgroundColor = [[UIColor blackColor] colorWithAlphaComponent:0.5];
        animatedLabel.transform = CGAffineTransformMakeScale(1, 1);
        animatedLabel.alpha = 1.0;
    } completion:^(BOOL finished) {
        if (finished) {
            // Keep the text on the screen
            dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(2.0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                [self hideAnimatedString];
            });
            
            // Aniamtion increase diamond
            [self animateShowDiamond];
            
            // Speak
            [[SessionManager sharedInstance] textToSpeech:animatedString];
        }
    }];
}

- (void)hideAnimatedString {
    if (backgroundView && animatedLabel) {
        [UIView animateWithDuration:0.5 animations:^{
            backgroundView.backgroundColor = [[UIColor blackColor] colorWithAlphaComponent:0.1];
            animatedLabel.transform = CGAffineTransformMakeScale(0.1, 0.1);
            animatedLabel.alpha = 0.1;
        } completion:^(BOOL finished) {
            if (finished) {
                // Hide the text
                [backgroundView removeFromSuperview];
                
                // Increase counter
                lbCount.text = [NSString stringWithFormat:@"%ld", [[SessionManager sharedInstance] getIdentifiedObjsCount]];
                
                // Reset bottom text
                lbResult.text = kShowMeAnObject;
                
                dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(2.0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                    // Let the app check object again
                    foundingObj = NO;
                });
            }
        }];
    } else {
        // Remove animated view
        [backgroundView removeFromSuperview];
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(2.0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
            foundingObj = NO;
        });
    }
}

- (void)animateShowDiamond {
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
                                    
                                    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.15 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
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

/*
 *  outdated animation
 */
- (void)animateShoppingCart {
    // Shake animation
    CABasicAnimation *translateAnimation =
    [CABasicAnimation animationWithKeyPath:@"position"];
    [translateAnimation setDuration:0.05];
    [translateAnimation setRepeatCount:4];
    [translateAnimation setAutoreverses:YES];
    [translateAnimation setFromValue:[NSValue valueWithCGPoint:
                                      CGPointMake(btnShoppingCart.center.x - 3.0f, btnShoppingCart.center.y)]];
    [translateAnimation setToValue:[NSValue valueWithCGPoint:
                                    CGPointMake(btnShoppingCart.center.x + 3.0f, btnShoppingCart.center.y)]];
    
    // Rotate animation
    CABasicAnimation *shakeAnimation = [CABasicAnimation animationWithKeyPath:@"transform.rotation.z"];
    shakeAnimation.duration = 0.05;
    shakeAnimation.additive = YES;
    shakeAnimation.fillMode = kCAFillModeForwards;
    [shakeAnimation setRepeatCount:4];
    [shakeAnimation setAutoreverses:YES];
    shakeAnimation.fromValue = [NSNumber numberWithFloat:degreesToRadians(-15)];
    shakeAnimation.toValue = [NSNumber numberWithFloat:degreesToRadians(15)];
    
    [CATransaction setCompletionBlock:^{
        // Shake back animation to original shape
        CABasicAnimation *shakeBackAnimation = [CABasicAnimation animationWithKeyPath:@"transform.rotation.z"];
        shakeBackAnimation.duration = 0.0125;
        shakeBackAnimation.fromValue = [NSNumber numberWithFloat:degreesToRadians(15)];
        shakeBackAnimation.toValue = [NSNumber numberWithFloat:degreesToRadians(0)];
        shakeBackAnimation.fillMode = kCAFillModeForwards;
        [btnShoppingCart.layer addAnimation:shakeBackAnimation forKey:@"90rotation2"];
        [CATransaction setCompletionBlock:^{
            
        }];
    }];
    
    // Customization for all animations:
    CAAnimationGroup *shakingGroup = [CAAnimationGroup animation];
    shakingGroup.animations = @[translateAnimation, shakeAnimation];
    [btnShoppingCart.layer addAnimation:shakingGroup forKey:@"shakingGroup"];
    
    [self showCoinThenHideIt];
}

- (void)showCoinThenHideIt {
    coinImage.alpha = 1.0;
    constraintTopCoinImage.constant = 0.0;
    [UIView animateWithDuration:0.3 animations:^{
        constraintTopCoinImage.constant = 40.0;
        [self.view layoutIfNeeded];
    } completion:^(BOOL finished) {
        if (finished) {
            dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                [UIView animateWithDuration:0.5 animations:^{
                    coinImage.alpha = 0.0;
                } completion:^(BOOL finished) {
                    if (finished) {
                        constraintTopCoinImage.constant = 0.0;
                        
                        // Reset bottom text
                        lbResult.text = kShowMeAnObject;
                        
                        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(2.0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                            // Let the app check object again
                            foundingObj = NO;
                        });
                    }
                }];
            });
        }
    }];
}

#pragma mark - Countdown timer
- (void)startCountDown {
    if (countdownTimer) {
        [countdownTimer invalidate];
        countdownTimer = nil;
    }
    
    countdownTimer = [NSTimer scheduledTimerWithTimeInterval:1.0 target:self selector:@selector(checkCurrentTime) userInfo:nil repeats:YES];
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

@end
