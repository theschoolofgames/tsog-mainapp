
//  OpenEars 
//  http://www.politepix.com/openears
//
//  OEPocketsphinxController.mm
//  OpenEars
//
//  OEPocketsphinxController is a class which controls the creation and management of
//  a continuous speech recognition loop.
//
//  Copyright Politepix UG (haftungsbeschränkt) 2014. All rights reserved.
//  http://www.politepix.com
//  Contact at http://www.politepix.com/contact
//
//  this file is licensed under the Politepix Shared Source license found 
//  found in the root of the source distribution. Please see the file "Version.txt" in the root of 
//  the source distribution for the version number of this OpenEars package.

#import <AVFoundation/AVFoundation.h>
#import <AudioToolbox/AudioToolbox.h>
#import "OEPocketsphinxController.h"
#import "OERuntimeVerbosity.h"

@interface OEPocketsphinxController()
@property(strong) NSLock *startLock;
@property(nonatomic,assign) BOOL safeToCallStart;   
@property(nonatomic,assign) BOOL safeToCallStop;  

@end

@implementation OEPocketsphinxController

extern int openears_logging;
extern int verbose_pocketsphinx;

#if TARGET_IPHONE_SIMULATOR
NSString * const OEDeviceOrSimulator = @"Simulator";
#else
NSString * const OEDeviceOrSimulator = @"Device";
#endif

#define kDefaultVadThresholdValue 2.0
#pragma mark -
#pragma mark Initialization and Memory Management

- (void)dealloc {

    _openEarsEventsObserver.delegate = nil;
    [_pocketsphinxControllerQueue cancelAllOperations];
}

- (instancetype) init {
    if ( self = [super init] ) {

        _returnNbest = FALSE;
        _nBestNumber = 4;
        _returnNullHypotheses = FALSE;
        _useSmartCMNWithTestFiles = FALSE;
        _isSuspended = FALSE;
        _doNotWarnAboutPermissions = FALSE;
        _pocketsphinxControllerQueue = [[NSOperationQueue alloc] init];
        _pocketsphinxControllerQueue.maxConcurrentOperationCount = 1;
        _continuousModel = [[OEContinuousModel alloc] init];
        _openEarsEventsObserver = [[OEEventsObserver alloc] init];
        _openEarsEventsObserver.delegate = self;
        _starting = FALSE;
        _startLock = [[NSLock alloc] init];
        _defaultSecondsOfSilenceInUse = FALSE;
        _removingNoise = TRUE;
        _legacy3rdPassMode = FALSE;
        _removingSilence = TRUE;    
        _disableBluetooth = FALSE;
        _disableMixing = FALSE;        
        _vadThreshold = kDefaultVadThresholdValue;
    }
    return self;
}

- (void)setPathToTestFile:(NSString *)pathToTestFile_ { // Custom setter so we can set dynamically in continuous.
    if (_pathToTestFile == pathToTestFile_) return; // Don't do anything
    _pathToTestFile = [pathToTestFile_ copy];
    [self.continuousModel testFileChange];
}

- (void) setVerbosePocketSphinx:(BOOL)pocketSphinxShouldBeVerbose_ {

    if(_verbosePocketSphinx == pocketSphinxShouldBeVerbose_) return;
    if (pocketSphinxShouldBeVerbose_) {
        verbose_pocketsphinx = 1;
    } else {
        verbose_pocketsphinx = 0;        
    }
}

- (void) setLegacy3rdPassMode:(BOOL)thirdPassModeShouldBeLegacy_ {
    
    if(_legacy3rdPassMode == thirdPassModeShouldBeLegacy_) return;
    if (thirdPassModeShouldBeLegacy_) {
        _legacy3rdPassMode = TRUE;
    } else {
        _legacy3rdPassMode = FALSE;               
    }
}

- (void) setRemovingNoise:(BOOL)noiseShouldBeRemoved_ {
    
    if(_removingNoise == noiseShouldBeRemoved_) return;
    if (noiseShouldBeRemoved_) {
        _removingNoise = TRUE;
    } else {
        _removingNoise = FALSE;               
    }
}

- (void) setDisableBluetooth:(BOOL)bluetoothShouldBeDisabled_ {
        
    if(_disableBluetooth == bluetoothShouldBeDisabled_) return;
    if (bluetoothShouldBeDisabled_) {
        _disableBluetooth = TRUE;
    } else {
        _disableBluetooth = FALSE;               
    }
}

- (void) setDisableMixing:(BOOL)mixingShouldBeDisabled_ {
    
    if(_disableMixing == mixingShouldBeDisabled_) return;
    if (mixingShouldBeDisabled_) {
        _disableMixing = TRUE;
    } else {
        _disableMixing = FALSE;               
    }
}

- (void) setRemovingSilence:(BOOL)silenceShouldBeRemoved_ {
    
    if(_removingSilence == silenceShouldBeRemoved_) return;
    if (silenceShouldBeRemoved_) {
        _removingSilence = TRUE;
    } else {
        _removingSilence = FALSE;              
    }
}

- (void) setVadThreshold:(float)newThresholdToUse_ {
    
    if(_vadThreshold == newThresholdToUse_) return;
    if((newThresholdToUse_ == newThresholdToUse_) && (newThresholdToUse_ < 5.01) && (newThresholdToUse_ > 0.1)) {
        _vadThreshold = newThresholdToUse_;
    } else {
        _vadThreshold = kDefaultVadThresholdValue;   
    }
}

- (void)setUseSmartCMNWithTestFiles:(BOOL)useSmartCMNWithTestFiles_ { // Custom setter so we can set dynamically in continuous.
    if (_useSmartCMNWithTestFiles == useSmartCMNWithTestFiles_) return; // Don't do anything
    _useSmartCMNWithTestFiles = useSmartCMNWithTestFiles_;
    [self.continuousModel setUseSmartCMNWithTestFiles:_useSmartCMNWithTestFiles];
}

- (BOOL) safeToCallStart { // Custom getter so we can get from continuous dynamically
    if(self.continuousModel) {    
        return self.continuousModel.safeToCallStart;
    } else {
        return FALSE;
    }
}

- (BOOL) safeToCallStop { // Custom getter so we can get from continuous dynamically
    if(self.continuousModel) {
        return self.continuousModel.safeToCallStop;
    } else {
        return FALSE;
    }
}

- (BOOL) isListening { // Custom getter so we can get from continuous dynamically
    if(self.continuousModel) {
        return self.continuousModel.isListening;
    } else {
        return FALSE;
    }
}

- (BOOL) isSuspended { // Custom getter so we can get from continuous dynamically
    if(self.continuousModel) {
        return self.continuousModel.isSuspended;
    } else {
        return FALSE;
    }
}

- (BOOL)setActive:(BOOL)active error:(NSError **)outError { 
    
    if(active) {
        outError = nil;
        return TRUE;
    } else {
        outError = nil;        
        return TRUE;        
    }
}


+ (OEPocketsphinxController *)sharedInstance {
    static dispatch_once_t once = 0;
    static id _sharedInstance = nil;
    dispatch_once(&once, ^{
        if(openears_logging == 1) NSLog(@"Creating shared instance of OEPocketsphinxController");
        _sharedInstance = [[self alloc] init];
    });
    return _sharedInstance;
}

#pragma mark -
#pragma mark OEEventsObserver Delegate Methods

- (BOOL) thereIsOnlyAHeadset {

    NSArray *outputs = [[AVAudioSession sharedInstance] currentRoute].outputs;
    AVAudioSessionPortDescription *portDescription = (AVAudioSessionPortDescription *)outputs[0];
    if ([outputs count] == 1 && [portDescription.portType isEqualToString:AVAudioSessionPortHeadphones]) {
        return YES;
    }
    
    return NO;
}

// We're just asking for a few delegate methods from OEEventsObserver so we can react to some specific situations.

- (void) audioRouteDidChangeToRoute:(NSString *)newRoute { // We want to know if the audio route has changed because the ContinuousModel does something different while recording for the headphones route only.
    

}

- (void) fliteDidStartSpeaking { // We need to know when Flite is talking because under some circumstances we will suspend recognition at that time.
    if([OEDeviceOrSimulator isEqualToString:@"Simulator"]) {
        [self suspendRecognitionForFliteSpeech];
    } else {
        if(![self thereIsOnlyAHeadset] && [[AVAudioSession sharedInstance]currentRoute].outputs) { // Only suspend listening if we aren't using headphones, otherwise it's unnecessary
            [self suspendRecognitionForFliteSpeech];
        }		
    }
}

- (void) fliteDidFinishSpeaking { // We need to know when Flite is done talking because under some circumstances we will resume recognition at that time.
    if([OEDeviceOrSimulator isEqualToString:@"Simulator"]) {
        [self resumeRecognitionForFliteSpeech];
    } else {
        if(![self thereIsOnlyAHeadset]) {
            [self resumeRecognitionForFliteSpeech];
        }		
    }
}


#pragma mark -
#pragma mark Recognition Control Methods

- (void) validateNBestSettings {
    if(self.returnNbest) {
        self.continuousModel.returnNbest = TRUE;
        self.continuousModel.nBestNumber = self.nBestNumber;
    } else {
        self.continuousModel.returnNbest = FALSE;
    }
}

- (void) startListeningWithLanguageModelAtPath:(NSString *)languageModelPath dictionaryAtPath:(NSString *)dictionaryPath acousticModelAtPath:(NSString *)acousticModelPath languageModelIsJSGF:(BOOL)languageModelIsJSGF { // This is an externally-called method that tells this class to detach a new thread and eventually start up the listening loop.
    
    BOOL locked = [_startLock tryLock];

    if(!locked || _starting || !self.continuousModel.safeToCallStart || self.isListening) {
        NSLog(@"A request has been made to start a listening session using startListeningWithLanguageModelAtPath:dictionaryAtPath:acousticModelAtPath:languageModelIsJSGF:, however, there is already a listening session in progress which has not been stopped. Please stop this listening session first with [[OEPocketsphinxController sharedInstance] stopListening]; and wait to receive the OEEventsObserver callback pocketsphinxDidStopListening before starting a new session. You can still change models in the existing session by using OEPocketsphinxController's method changeLanguageModelToFile:withDictionary:");
        return;
    }
        
    _starting = TRUE;    

    if(locked)[_startLock unlock];
    
    if(openears_logging == 1)NSLog(@"Attempting to start listening session from startListeningWithLanguageModelAtPath:");
    
    NSFileManager *fileManager = [NSFileManager defaultManager];
    if (![fileManager fileExistsAtPath:languageModelPath] || ![fileManager fileExistsAtPath:dictionaryPath]) {
        if(![fileManager fileExistsAtPath:languageModelPath] ) {
            if(languageModelIsJSGF) { // There is a missing grammar:
                
                _starting = FALSE; 
                
                NSLog(@"Error: you have invoked the method:\n\nstartListeningWithLanguageModelAtPath:(NSString *)languageModelPath dictionaryAtPath:(NSString *)dictionaryPath acousticModelAtPath:(NSString *)acousticModelPath languageModelIsJSGF:(BOOL)languageModelIsJSGF\n\nwith a languageModelPath which is nil. If your call to OELanguageModelGenerator did not return an error when you generated this grammar, that means the correct path to your grammar that you should pass to this method's languageModelPath argument is as follows:\n\nNSString *correctPathToMyLanguageModelFile = [NSString stringWithFormat:@\"%%@/TheNameIChoseForMyLanguageModelAndDictionaryFile.%%@\",[NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES) objectAtIndex:0],@\"gram\"];\n\nFeel free to copy and paste this code for your path to your grammar, but remember to replace the part that says \"TheNameIChoseForMyLanguageModelAndDictionaryFile\" with the name you actually chose for your grammar and dictionary file or you will get this error again.");      
                return;
            } else if(![self.continuousModel dictionaryAtPathIsFromRejecto:dictionaryPath] && ![self.continuousModel dictionaryAtPathIsFromRuleORama:dictionaryPath]){ // We're only going to flag this as a missing language model if it isn't from Rejecto or RuleORama.
                
                _starting = FALSE; 
                
                NSLog(@"Error: you have invoked the method:\n\nstartListeningWithLanguageModelAtPath:(NSString *)languageModelPath dictionaryAtPath:(NSString *)dictionaryPath acousticModelAtPath:(NSString *)acousticModelPath languageModelIsJSGF:(BOOL)languageModelIsJSGF\n\nwith a languageModelPath which is nil. If your call to OELanguageModelGenerator did not return an error when you generated this language model, that means the correct path to your language model that you should pass to this method's languageModelPath argument is as follows:\n\nNSString *correctPathToMyLanguageModelFile = [NSString stringWithFormat:@\"%%@/TheNameIChoseForMyLanguageModelAndDictionaryFile.%%@\",[NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES) objectAtIndex:0],@\"DMP\"];\n\nFeel free to copy and paste this code for your path to your language model, but remember to replace the part that says \"TheNameIChoseForMyLanguageModelAndDictionaryFile\" with the name you actually chose for your language model and dictionary file or you will get this error again.");
                return;
            }
        }
        if(![fileManager fileExistsAtPath:dictionaryPath] ) { // We will also flag cases in which only the dictionary is missing since that is always a sign of a problem.
            
            _starting = FALSE; 
                
            NSLog(@"Error: you have invoked the method:\n\nstartListeningWithLanguageModelAtPath:(NSString *)languageModelPath dictionaryAtPath:(NSString *)dictionaryPath acousticModelAtPath:(NSString *)acousticModelPath languageModelIsJSGF:(BOOL)languageModelIsJSGF\n\nwith a dictionaryPath which is nil. If your call to OELanguageModelGenerator did not return an error when you generated this language model or grammar, that means the correct path to your phonetic dictionary that you should pass to this method's dictionaryPath argument is as follows:\n\nNSString *correctPathToMyPhoneticDictionaryFile = [NSString stringWithFormat:@\"%%@/TheNameIChoseForMyLanguageModelAndDictionaryFile.%%@\",[NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES) objectAtIndex:0],@\"dic\"];\n\nFeel free to copy and paste this code for your path to your phonetic dictionary, but remember to replace the part that says \"TheNameIChoseForMyLanguageModelAndDictionaryFile\" with the name you actually chose for your language model/grammar and dictionary file or you will get this error again.");
                return;
        }
        
    }
    
    if(SYSTEM_VERSION_GREATER_THAN_OR_EQUAL_TO(@"7.0") && !self.micPermissionIsGranted) {
        
        _starting = FALSE; 
        
        if(!self.doNotWarnAboutPermissions) {
            NSLog(@"User has not granted mic permission so recognition won't be possible, stopping. To receive this information as a callback add the OEEventsObserver delegate method -(void)pocketsphinxFailedNoMicPermissions; to your app. To obtain mic permissions before attempting recognition for the first time, call Pocketsphinx's method -(void) requestMicPermission; and wait for a result callback in the OEEventsObserver delegate method - (void) micPermissionCheckCompleted:(BOOL)result to decide on what to do next. To programmatically check the mic permission status any time after you have first obtained permission or had permission denied, call OEPocketsphinxController's method micPermissionIsGranted which will return TRUE or FALSE. OEPocketsphinxController will be able to start the listening loop the first time you call its listening method after the user has been asked for and granted mic permission, or if the user grants permission as a result of the dialog that will appear when this method is first attempted to be run. This will behave differently on the Simulator and a real device because the Simulator does not protect mic permissions, so Simulator behavior shouldn't be reported as a bug. You can silence this warning by setting self.pocketsphinxController.doNotWarnAboutPermissions = TRUE. None of this applies to iOS versions previous to iOS7, which will not perform a permissions check.");
        }
        [OENotification performOpenEarsNotificationOnMainThread:@"PocketsphinxFailedNoMicPermissions" withOptionalObjects:nil andKeys:nil];   
        return;
    }
     
    self.openEarsEventsObserver.delegate = self; // Before we start we need to sign up for the delegate methods of OEEventsObserver so we can receive important information about the other OpenEars classes.

    if(self.outputAudio) {
        self.continuousModel.outputAudio = TRUE;
    } else {
        self.continuousModel.outputAudio = FALSE;
    }
    
    if(self.returnNullHypotheses) {
        self.continuousModel.returnNullHypotheses = TRUE;
    } else {
        self.continuousModel.returnNullHypotheses = FALSE;
    }

    if(self.legacy3rdPassMode) {
        self.continuousModel.legacy3rdPassMode = TRUE;
    } else {
        self.continuousModel.legacy3rdPassMode = FALSE;
    }
    
    if(self.removingNoise) {
        self.continuousModel.removingNoise = TRUE;
    } else {
        self.continuousModel.removingNoise = FALSE;
    }

    if(self.removingSilence) {
        self.continuousModel.removingSilence = TRUE;
    } else {
        self.continuousModel.removingSilence = FALSE;
    }

    if(self.disableBluetooth) {
        self.continuousModel.disableBluetooth = TRUE;
        if(self.continuousModel.audioDriver) self.continuousModel.audioDriver.disableBluetooth = TRUE;
    } else {
        self.continuousModel.disableBluetooth = FALSE;
        if(self.continuousModel.audioDriver) self.continuousModel.audioDriver.disableBluetooth = FALSE;        
    }
    
    if(self.disableMixing) {
        self.continuousModel.disableMixing = TRUE;
        if(self.continuousModel.audioDriver) self.continuousModel.audioDriver.disableMixing = TRUE;        
    } else {
        self.continuousModel.disableMixing = FALSE;
        if(self.continuousModel.audioDriver) self.continuousModel.audioDriver.disableMixing = FALSE;     
    }
    
    self.continuousModel.vadThreshold = self.vadThreshold;
        
    if(self.audioMode && [self.audioMode length] > 4) {
        self.continuousModel.audioMode = self.audioMode;
    }
    
    [self validateNBestSettings];
        
    if(self.pathToTestFile) {
        if(![[NSFileManager defaultManager] fileExistsAtPath:self.pathToTestFile]) {        
            NSLog(@"Error: the following file was passed to the speech recognition controller as the WAV file to run automated recognition on, but no WAV file was found at that path, which should be expected to result in a unspecified behavior:\n%@",self.pathToTestFile);
        }
    }
    
    [self setSecondsOfSilence]; // Set seconds of silence to whatever the user has requested, if they have
    
    if(self.pathToTestFile && [self.pathToTestFile length]>10) { // If there is a request to run the engine over a wav file, set it up here.
        self.continuousModel.pathToTestFile = self.pathToTestFile;
        if(self.useSmartCMNWithTestFiles) {
            self.continuousModel.useSmartCMNWithTestFiles = self.useSmartCMNWithTestFiles;
        }
    }
    
    [self.pocketsphinxControllerQueue addOperationWithBlock:^{
        [self.continuousModel listeningSessionWithLanguageModelAtPath:languageModelPath dictionaryAtPath:dictionaryPath acousticModelAtPath:acousticModelPath languageModelIsJSGF:languageModelIsJSGF];
    }];
    
    if(openears_logging == 1)NSLog(@"Successfully started listening session from startListeningWithLanguageModelAtPath:");
    
    [self.pocketsphinxControllerQueue waitUntilAllOperationsAreFinished];
    _starting = FALSE;
}

// Run one recognition round on a recording and return the hypothesis and score. Synchronous.

- (void) runRecognitionOnWavFileAtPath:(NSString *)wavPath usingLanguageModelAtPath:(NSString *)languageModelPath dictionaryAtPath:(NSString *)dictionaryPath acousticModelAtPath:(NSString *)acousticModelPath languageModelIsJSGF:(BOOL)languageModelIsJSGF { 
    
    [self validateNBestSettings];
    
    [self.continuousModel runRecognitionOnWavFileAtPath:wavPath usingLanguageModelAtPath:languageModelPath dictionaryAtPath:dictionaryPath acousticModelAtPath:acousticModelPath languageModelIsJSGF:languageModelIsJSGF];
    
}


- (NSError *) stopListening { // This is an externally-called method that tells this class to exit the voice recognition loop and eventually close up the voice recognition thread.
        
    if(!self.safeToCallStop || !self.isListening) {
        NSString *errorString = @"[[OEPocketsphinxController sharedInstance] stopListening] was called while listening was not in progress. This is not necessarily an exception, just a notification that that a request to stop a listening session was ignored because there was no active listening session to stop.";
        if(openears_logging == 1) NSLog(@"%@",errorString);
        return [NSError errorWithDomain:@"com.politepix.openears" code:-1000 userInfo:@{ NSLocalizedDescriptionKey : errorString }];
    }
        
    NSError *error = nil;
        
    [self.continuousModel stopListening];

    return error;
}

- (void) suspendRecognitionForFliteSpeech { // We will react a little differently to the situation in which Flite is asking for a suspend than when the developer is.
    [self suspendRecognition];
}

- (void) resumeRecognitionForFliteSpeech { // We will react a little differently to the situation in which Flite is asking for a resume than when the developer is.
    [self resumeRecognition];

}

- (void) suspendRecognition { // This is the externally-called method that tells the class to suspend recognition without exiting the recognition loop.
    
    if(!self.continuousModel || self.continuousModel.utteranceState == kUtteranceStateUnstarted) return; // Nothing to do here if we aren't listening.

    self.isSuspended = TRUE;
    [self.continuousModel suspendRecognition];
    NSDictionary *userInfoDictionary = @{@"OpenEarsNotificationType": @"PocketsphinxDidSuspendRecognition"}; // And tell OEEventsObserver we've suspended.
    NSNotification *notification = [NSNotification notificationWithName:@"OpenEarsNotification" object:nil userInfo:userInfoDictionary];
    [[NSNotificationCenter defaultCenter] performSelectorOnMainThread:@selector(postNotification:) withObject:notification waitUntilDone:NO];
}

- (void) resumeRecognition { // This is the externally-called method that tells the class to resume recognition after it was suspended without exiting the recognition loop.
    
    if(!self.continuousModel || self.continuousModel.utteranceState == kUtteranceStateUnstarted) return;  // Nothing to do here if we aren't listening.
    self.isSuspended = FALSE;
    [self setSecondsOfSilence]; // Set seconds of silence to whatever the user has requested, if they have
    [self.continuousModel resumeRecognition];
    NSDictionary *userInfoDictionary = @{@"OpenEarsNotificationType": @"PocketsphinxDidResumeRecognition"}; // And tell OEEventsObserver we've resumed.
    NSNotification *notification = [NSNotification notificationWithName:@"OpenEarsNotification" object:nil userInfo:userInfoDictionary];
    [[NSNotificationCenter defaultCenter] performSelectorOnMainThread:@selector(postNotification:) withObject:notification waitUntilDone:NO];
}

- (void) changeLanguageModelToFile:(NSString *)languageModelPathAsString withDictionary:(NSString *)dictionaryPathAsString { // If you have already started the recognition loop and you want to switch to a different language model, you can use this and the model will be changed at the earliest opportunity. Will not have any effect unless recognition is already in progress.
    [self.continuousModel changeLanguageModelToFile:languageModelPathAsString withDictionary:dictionaryPathAsString];
}

- (Float32) pocketsphinxInputLevel { // This can only be run in a background thread that you create, otherwise it will block recognition.  It returns the metering level of the Pocketsphinx audio device at the moment it's called.
    return [self.continuousModel getMeteringLevel];
}

- (void) setSecondsOfSilence {
    // Set seconds of silence to detect if the user has set one and it is a realistic value. The first weird equality check is for NaN values.
    if((self.secondsOfSilenceToDetect == self.secondsOfSilenceToDetect) && (self.secondsOfSilenceToDetect > .09 && self.secondsOfSilenceToDetect < 10)) {
        self.continuousModel.secondsOfSilenceToDetect = self.secondsOfSilenceToDetect;
        self.defaultSecondsOfSilenceInUse = FALSE;
        if(openears_logging == 1) {
            NSLog(@"Valid setSecondsOfSilence value of %f will be used.", self.secondsOfSilenceToDetect);   
        }
    } else {
        float defaultSecondsOfSilence = .7;
        if(openears_logging == 1) {
            if(self.secondsOfSilenceToDetect == 0.0) {
                NSLog(@"setSecondsOfSilence wasn't set, using default of %f.",defaultSecondsOfSilence);                
            } else if(self.secondsOfSilenceToDetect <= .09) {
                NSLog(@"setSecondsOfSilence value of %f was too small, using default of %f.", self.secondsOfSilenceToDetect,defaultSecondsOfSilence);                
            } else if (self.secondsOfSilenceToDetect >= 10){
                NSLog(@"setSecondsOfSilence value of %f was too large, using default of %f.", self.secondsOfSilenceToDetect,defaultSecondsOfSilence);                
            } else {
                NSLog(@"There was some issue with the setSecondsOfSilence value of %f, using default of %f.", self.secondsOfSilenceToDetect,defaultSecondsOfSilence);                
            }
        }
        self.continuousModel.secondsOfSilenceToDetect = defaultSecondsOfSilence; // Otherwise set it to the default value
        self.defaultSecondsOfSilenceInUse = TRUE;
    }    
    self.continuousModel.defaultSecondsOfSilenceInUse = self.defaultSecondsOfSilenceInUse;
}

- (void) requestMicPermission {
    
    if(SYSTEM_VERSION_LESS_THAN(@"7.0")) {
        if(openears_logging==1) {
            NSLog(@"Sorry, OpenEars' mic permission request feature is only available when run with iOS7 or greater.");   
        }
        return;
    }
    
    if([[AVAudioSession sharedInstance] respondsToSelector:@selector(requestRecordPermission:)]){
        [[AVAudioSession sharedInstance] requestRecordPermission:^(BOOL permissionWasGranted){ 
            if(permissionWasGranted) {
                if(openears_logging == 1) {
                    NSLog(@"User gave mic permission for this app.");
                }  
                [OENotification performOpenEarsNotificationOnMainThread:@"MicPermissionCheckCompleted" withOptionalObjects:@[@"PermissionGranted"] andKeys:@[@"Result"]];
                self.micPermission = TRUE;
            } else {
                if(openears_logging == 1) {
                    NSLog(@"User declined mic permission for this app.");             
                }                
                [OENotification performOpenEarsNotificationOnMainThread:@"MicPermissionCheckCompleted" withOptionalObjects:@[@"PermissionDeclined"] andKeys:@[@"Result"]];                
                self.micPermission = FALSE;                       
            }
        }];
    }    
}



- (BOOL) micPermissionIsGranted {
    
    if(SYSTEM_VERSION_LESS_THAN(@"7.0")) {
        if(openears_logging == 1) {
            NSLog(@"Sorry, OpenEars' mic permission request feature is only available when run with iOS7 or greater, returning TRUE.");   
        }
        return TRUE;
    }
    
    self.micPermission = FALSE;
    [self requestMicPermission];
    return self.micPermission;
}

- (void) removeCmnPlist { // You can use this to remove the SmartCMN plist if you want to reset it.
    [self.continuousModel removeCmnPlist];
}

@end
