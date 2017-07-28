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

    // Animation pointer
    UIView *backgroundView;
    UILabel *animatedLabel;
    NSTimer *showAnimatedStringTimer;
    NSTimer *hideAnimatedStringTimer;
    
    __weak IBOutlet UILabel *lbResult;
    __weak IBOutlet UIView *previewView;
    __weak IBOutlet UIImageView *coinImage;
    __weak IBOutlet UIButton *btnShoppingCart;
    __weak IBOutlet UILabel *lbCount;
    __weak IBOutlet NSLayoutConstraint *constraintTopCoinImage;
    
    BOOL foundingObj;
}

@end

@implementation DetectObjectViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view, typically from a nib.
    
    // Setup Camera
    [self setupCamera];
    
    // Setup CoreML and Vision
    [self setupVisionAndCoreML];
    
    // Setup View
    [self setupView];
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    
    // Setup observer
    [self setupObserver];
}

- (void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:animated];
    
    [self deviceOrientationDidChange:nil];
    
    if (![session isRunning]) {
        [session startRunning];
    }
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
    
    // create the capture input and the video output
    NSError *error;
    AVCaptureDeviceInput *cameraInput = [[AVCaptureDeviceInput alloc] initWithDevice:inputDevice error:&error];
    if (error) {
        [CommonTools showAlertInViewController:self withTitle:@"ERROR" message:@"Cannot connect to the camera"];
        NSLog(@"--->ERROR: %@", error);
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
        [self deviceOrientationDidChange:nil];
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
        [CommonTools showAlertInViewController:self withTitle:@"ERROR" message:@"Cannot access to MLModel"];
        NSLog(@"--->ERROR: %@", error);
        return;
    }
    
    // Create request to classify object
    VNCoreMLRequest *classificationRequest = [[VNCoreMLRequest alloc] initWithModel:inceptionv3Model completionHandler:^(VNRequest * _Nonnull request, NSError * _Nullable error) {
        // Handle the response
        
        // Check found object
        if (foundingObj) {
            return;
        }
        
        // Check error
        if (error) {
            NSLog(@"--->ERROR: %@", error);
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
    CVImageBufferRef pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer);
    
    NSDictionary *requestOptions = [NSDictionary dictionaryWithObjectsAndKeys:CMGetAttachment(sampleBuffer, kCMSampleBufferAttachmentKey_CameraIntrinsicMatrix, nil), VNImageOptionCameraIntrinsics, nil];
    VNImageRequestHandler *imageRequestHandler = [[VNImageRequestHandler alloc] initWithCVPixelBuffer:pixelBuffer orientation:kCGImagePropertyOrientationUpMirrored options:requestOptions];
    NSError *error;
    [imageRequestHandler performRequests:visionRequests error:&error];
    if (error) {
        [CommonTools showAlertInViewController:self withTitle:@"ERROR" message:@"imageRequestHandler error"];
        NSLog(@"--->ERROR: %@", error);
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
            lbResult.text = kYouFoundIt;
            [self showAnimatedString:identifiedObj];
        });
    } else {
        foundingObj = NO;
    }
}

- (void)showAnimatedString:(NSString *)animatedString {
    // Current Window
    CGSize windowSize = [UIScreen mainScreen].bounds.size;
    UIWindow *window = [UIApplication sharedApplication].keyWindow;
    
    // Create dimmed background
    backgroundView = [[UIView alloc] initWithFrame:CGRectMake(0, 0, windowSize.width, windowSize.height)];
    // Create animated label
    animatedLabel = [[UILabel alloc] initWithFrame:CGRectZero];
    
    // Attributed string (different colors)
    NSMutableAttributedString *attributedString = [[NSMutableAttributedString alloc] initWithString:animatedString];
    [attributedString addAttribute:NSForegroundColorAttributeName value:[UIColor colorWithWhite:1.0 alpha:1.0] range:NSMakeRange(0,1)];
    [attributedString addAttribute:NSForegroundColorAttributeName value:[UIColor colorWithWhite:1.0 alpha:0.6] range:NSMakeRange(1,animatedString.length - 1)];
    animatedLabel.attributedText = attributedString;
//    [animatedLabel setFont:[UIFont boldSystemFontOfSize:kAnimatedFontSize]];
    [animatedLabel setFont:[UIFont fontWithName:@"HelveticaNeue-Bold" size:kAnimatedFontSize]];
    [animatedLabel setMinimumScaleFactor:0.1];
    animatedLabel.textAlignment = NSTextAlignmentCenter;
    animatedLabel.adjustsFontSizeToFitWidth = YES;
    [backgroundView addSubview:animatedLabel];
    [window addSubview:backgroundView];
    
    // animation
    backgroundView.backgroundColor = [[UIColor blackColor] colorWithAlphaComponent:0.0];
    CGFloat minWidth = 50.0;
    CGFloat maxWidth = 400.0;
    CGFloat textHeight = 80.0;
//    animatedLabel.frame = CGRectMake((windowSize.width - minWidth)/2, (windowSize.height - textHeight)/2, minWidth, textHeight);
    
    animatedLabel.frame = CGRectMake((windowSize.width - maxWidth)/2, (windowSize.height - textHeight)/2, maxWidth, textHeight);
    animatedLabel.transform = CGAffineTransformMakeScale(0.1, 0.1);
    
    [UIView animateWithDuration:0.5 animations:^{
        backgroundView.backgroundColor = [[UIColor blackColor] colorWithAlphaComponent:0.5];
//        animatedLabel.frame = CGRectMake((windowSize.width - maxWidth)/2, (windowSize.height - textHeight)/2, maxWidth, textHeight);
        
        animatedLabel.transform = CGAffineTransformMakeScale(1, 1);
        
    } completion:^(BOOL finished) {
        if (finished) {
            // Keep the text on the screen
            dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(2.0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                [self hideAnimatedString];
            });
        }
    }];
}

- (void)hideAnimatedString {
    if (backgroundView && animatedLabel) {
        [UIView animateWithDuration:0.5 animations:^{
            backgroundView.backgroundColor = [[UIColor blackColor] colorWithAlphaComponent:0.1];
            animatedLabel.frame = CGRectMake(btnShoppingCart.frame.origin.x - (animatedLabel.frame.size.width)/2.0 + 20.0, btnShoppingCart.frame.origin.y - (animatedLabel.frame.size.height)/2.0, animatedLabel.frame.size.width, animatedLabel.frame.size.height);    // 20.0 is a gap space
            animatedLabel.transform = CGAffineTransformMakeScale(0.1, 0.1);
        } completion:^(BOOL finished) {
            if (finished) {
                // Hide the text
                [backgroundView removeFromSuperview];
                
                // Increase counter
                lbCount.text = [NSString stringWithFormat:@"%ld", [SessionManager sharedInstance].objCount];
                
                [self animateShoppingCart];
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

@end
