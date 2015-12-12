//
//  SpeechRecognitionListener.m
//  tsog
//
//  Created by Thuy Dong Xuan on 12/11/15.
//
//

#import "SpeechRecognitionListener.h"

#import <OpenEars/OEAcousticModel.h>
#import <OpenEars/OEPocketsphinxController.h>
#import <OpenEars/OEFliteController.h>
#import <OpenEars/OELanguageModelGenerator.h>
#import <OpenEars/OELogging.h>

#import "ScriptingCore.h"

//#define kGetNbest // Uncomment this if you want to try out nbest

static SpeechRecognitionListener *sharedEngine = nil;

@interface SpeechRecognitionListener()

@property (nonatomic, strong) OEEventsObserver *openEarsEventsObserver;
@property (nonatomic, strong) OEPocketsphinxController *pocketsphinxController;

@property (nonatomic, assign) int restartAttemptsDueToPermissionRequests;
@property (nonatomic, assign) BOOL startupFailedDueToLackOfPermissions;

@property (nonatomic, copy) NSString *pathToDynamicallyGeneratedLanguageModel;
@property (nonatomic, copy) NSString *pathToDynamicallyGeneratedDictionary;

@end

@implementation SpeechRecognitionListener

+ (SpeechRecognitionListener *)sharedEngine
{
  @synchronized(self)
  {
    if (!sharedEngine)
      sharedEngine = [[SpeechRecognitionListener alloc] init];
  }
  return sharedEngine;
}

- (instancetype)init {
  self.openEarsEventsObserver = [[OEEventsObserver alloc] init];
  self.openEarsEventsObserver.delegate = self;
  
  self.restartAttemptsDueToPermissionRequests = 0;
  self.startupFailedDueToLackOfPermissions = FALSE;
  
  [self.openEarsEventsObserver setDelegate:self];
//  [OELogging startOpenEarsLogging];
  
  return self;
}

- (BOOL)setLanguageData:(NSArray *)array {
  OELanguageModelGenerator *languageModelGenerator = [[OELanguageModelGenerator alloc] init];
  
  NSError *error = [languageModelGenerator generateLanguageModelFromArray:array withFilesNamed:@"DynamicLanguageModel" forAcousticModelAtPath:[OEAcousticModel pathToModel:@"AcousticModelEnglish"]];
  
  if(error) {
    NSLog(@"Dynamic language generator reported error %@", [error description]);
    return NO;
  } else {
    self.pathToDynamicallyGeneratedLanguageModel = [languageModelGenerator pathToSuccessfullyGeneratedLanguageModelWithRequestedName:@"DynamicLanguageModel"];
    self.pathToDynamicallyGeneratedDictionary = [languageModelGenerator pathToSuccessfullyGeneratedDictionaryWithRequestedName:@"DynamicLanguageModel"];
  }
  
  return YES;
}

- (void)start {
  [[OEPocketsphinxController sharedInstance] setActive:TRUE error:nil];
//  [OEPocketsphinxController sharedInstance].returnNullHypotheses = true;
//  [OEPocketsphinxController sharedInstance].returnNbest = TRUE;
  if(![OEPocketsphinxController sharedInstance].isListening) {
    [[OEPocketsphinxController sharedInstance] startListeningWithLanguageModelAtPath:self.pathToDynamicallyGeneratedLanguageModel dictionaryAtPath:self.pathToDynamicallyGeneratedDictionary acousticModelAtPath:[OEAcousticModel pathToModel:@"AcousticModelEnglish"] languageModelIsJSGF:FALSE]; // Start speech recognition if we aren't already listening.
  }
}

- (void)stop {
  [[OEPocketsphinxController sharedInstance] setActive:FALSE error:nil];
  [[OEPocketsphinxController sharedInstance] stopListening];
}

- (BOOL)isListening {
  return [OEPocketsphinxController sharedInstance].isListening;
}

// This is an optional delegate method of OEEventsObserver which delivers the text of speech that Pocketsphinx heard and analyzed, along with its accuracy score and utterance ID.
- (void) pocketsphinxDidReceiveHypothesis:(NSString *)hypothesis recognitionScore:(NSString *)recognitionScore utteranceID:(NSString *)utteranceID {
  
  NSLog(@"Local callback: The received hypothesis is %@ with a score of %@ and an ID of %@", hypothesis, recognitionScore, utteranceID); // Log it.
  
  NSArray* hypothesisArray = [hypothesis componentsSeparatedByCharactersInSet:[NSCharacterSet whitespaceCharacterSet]];
  if ([hypothesisArray count] > 0 && ![[hypothesisArray objectAtIndex:0] isEqualToString:@""]) {
    NSString* command = [NSString stringWithFormat:@"SpeechRecognitionListener.getInstance().onResult('%@')", [hypothesisArray objectAtIndex:0]];
    ScriptingCore::getInstance()->evalString([command UTF8String], NULL);
  }
  
  [self stop];
}

#ifdef kGetNbest
- (void) pocketsphinxDidReceiveNBestHypothesisArray:(NSArray *)hypothesisArray { // Pocketsphinx has an n-best hypothesis dictionary.
  NSLog(@"Local callback:  hypothesisArray is %@",hypothesisArray);
}
#endif
// An optional delegate method of OEEventsObserver which informs that there was an interruption to the audio session (e.g. an incoming phone call).
- (void) audioSessionInterruptionDidBegin {
  NSLog(@"Local callback:  AudioSession interruption began."); // Log it.
  NSError *error = nil;
  if([OEPocketsphinxController sharedInstance].isListening) {
    error = [[OEPocketsphinxController sharedInstance] stopListening]; // React to it by telling Pocketsphinx to stop listening (if it is listening) since it will need to restart its loop after an interruption.
    if(error) NSLog(@"Error while stopping listening in audioSessionInterruptionDidBegin: %@", error);
  }
}

// An optional delegate method of OEEventsObserver which informs that the interruption to the audio session ended.
- (void) audioSessionInterruptionDidEnd {
  NSLog(@"Local callback:  AudioSession interruption ended."); // Log it.

  // We're restarting the previously-stopped listening loop.
  if(![OEPocketsphinxController sharedInstance].isListening){
    [[OEPocketsphinxController sharedInstance] startListeningWithLanguageModelAtPath:self.pathToDynamicallyGeneratedLanguageModel dictionaryAtPath:self.pathToDynamicallyGeneratedDictionary acousticModelAtPath:[OEAcousticModel pathToModel:@"AcousticModelEnglish"] languageModelIsJSGF:FALSE]; // Start speech recognition if we aren't currently listening.
  }
}

// An optional delegate method of OEEventsObserver which informs that the audio input became unavailable.
- (void) audioInputDidBecomeUnavailable {
  NSLog(@"Local callback:  The audio input has become unavailable"); // Log it.
  NSError *error = nil;
  if([OEPocketsphinxController sharedInstance].isListening){
    error = [[OEPocketsphinxController sharedInstance] stopListening]; // React to it by telling Pocketsphinx to stop listening since there is no available input (but only if we are listening).
    if(error) NSLog(@"Error while stopping listening in audioInputDidBecomeUnavailable: %@", error);
  }
}

// An optional delegate method of OEEventsObserver which informs that the unavailable audio input became available again.
- (void) audioInputDidBecomeAvailable {
  NSLog(@"Local callback: The audio input is available"); // Log it.
  if(![OEPocketsphinxController sharedInstance].isListening) {
    [[OEPocketsphinxController sharedInstance] startListeningWithLanguageModelAtPath:self.pathToDynamicallyGeneratedLanguageModel dictionaryAtPath:self.pathToDynamicallyGeneratedDictionary acousticModelAtPath:[OEAcousticModel pathToModel:@"AcousticModelEnglish"] languageModelIsJSGF:FALSE]; // Start speech recognition, but only if we aren't already listening.
  }
}
// An optional delegate method of OEEventsObserver which informs that there was a change to the audio route (e.g. headphones were plugged in or unplugged).
- (void) audioRouteDidChangeToRoute:(NSString *)newRoute {
  NSLog(@"Local callback: Audio route change. The new audio route is %@", newRoute); // Log it.
  
  NSError *error = [[OEPocketsphinxController sharedInstance] stopListening]; // React to it by telling the Pocketsphinx loop to shut down and then start listening again on the new route
  
  if(error)NSLog(@"Local callback: error while stopping listening in audioRouteDidChangeToRoute: %@",error);
  
  if(![OEPocketsphinxController sharedInstance].isListening) {
    [[OEPocketsphinxController sharedInstance] startListeningWithLanguageModelAtPath:self.pathToDynamicallyGeneratedLanguageModel dictionaryAtPath:self.pathToDynamicallyGeneratedDictionary acousticModelAtPath:[OEAcousticModel pathToModel:@"AcousticModelEnglish"] languageModelIsJSGF:FALSE]; // Start speech recognition if we aren't already listening.
  }
}

// An optional delegate method of OEEventsObserver which informs that the Pocketsphinx recognition loop has entered its actual loop.
// This might be useful in debugging a conflict between another sound class and Pocketsphinx.
- (void) pocketsphinxRecognitionLoopDidStart {
  
  NSLog(@"Local callback: Pocketsphinx started."); // Log it.
}

// An optional delegate method of OEEventsObserver which informs that Pocketsphinx is now listening for speech.
- (void) pocketsphinxDidStartListening {
  
  NSLog(@"Local callback: Pocketsphinx is now listening."); // Log it.
}

// An optional delegate method of OEEventsObserver which informs that Pocketsphinx detected speech and is starting to process it.
- (void) pocketsphinxDidDetectSpeech {
  NSLog(@"Local callback: Pocketsphinx has detected speech."); // Log it.
}

// An optional delegate method of OEEventsObserver which informs that Pocketsphinx detected a second of silence, indicating the end of an utterance.
// This was added because developers requested being able to time the recognition speed without the speech time. The processing time is the time between
// this method being called and the hypothesis being returned.
- (void) pocketsphinxDidDetectFinishedSpeech {
  NSLog(@"Local callback: Pocketsphinx has detected a second of silence, concluding an utterance."); // Log it.
}


// An optional delegate method of OEEventsObserver which informs that Pocketsphinx has exited its recognition loop, most
// likely in response to the OEPocketsphinxController being told to stop listening via the stopListening method.
- (void) pocketsphinxDidStopListening {
  NSLog(@"Local callback: Pocketsphinx has stopped listening."); // Log it.
}

// An optional delegate method of OEEventsObserver which informs that Pocketsphinx is still in its listening loop but it is not
// Going to react to speech until listening is resumed.  This can happen as a result of Flite speech being
// in progress on an audio route that doesn't support simultaneous Flite speech and Pocketsphinx recognition,
// or as a result of the OEPocketsphinxController being told to suspend recognition via the suspendRecognition method.
- (void) pocketsphinxDidSuspendRecognition {
  NSLog(@"Local callback: Pocketsphinx has suspended recognition."); // Log it.
}

// An optional delegate method of OEEventsObserver which informs that Pocketsphinx is still in its listening loop and after recognition
// having been suspended it is now resuming.  This can happen as a result of Flite speech completing
// on an audio route that doesn't support simultaneous Flite speech and Pocketsphinx recognition,
// or as a result of the OEPocketsphinxController being told to resume recognition via the resumeRecognition method.
- (void) pocketsphinxDidResumeRecognition {
  NSLog(@"Local callback: Pocketsphinx has resumed recognition."); // Log it.
}

// An optional delegate method which informs that Pocketsphinx switched over to a new language model at the given URL in the course of
// recognition. This does not imply that it is a valid file or that recognition will be successful using the file.
- (void) pocketsphinxDidChangeLanguageModelToFile:(NSString *)newLanguageModelPathAsString andDictionary:(NSString *)newDictionaryPathAsString {
  NSLog(@"Local callback: Pocketsphinx is now using the following language model: \n%@ and the following dictionary: %@",newLanguageModelPathAsString,newDictionaryPathAsString);
}

- (void) pocketSphinxContinuousSetupDidFailWithReason:(NSString *)reasonForFailure { // This can let you know that something went wrong with the recognition loop startup. Turn on [OELogging startOpenEarsLogging] to learn why.
  NSLog(@"Local callback: Setting up the continuous recognition loop has failed for the reason %@, please turn on [OELogging startOpenEarsLogging] to learn more.", reasonForFailure); // Log it.
}

- (void) pocketSphinxContinuousTeardownDidFailWithReason:(NSString *)reasonForFailure { // This can let you know that something went wrong with the recognition loop startup. Turn on [OELogging startOpenEarsLogging] to learn why.
  NSLog(@"Local callback: Tearing down the continuous recognition loop has failed for the reason %@, please turn on [OELogging startOpenEarsLogging] to learn more.", reasonForFailure); // Log it.
}

/** Pocketsphinx couldn't start because it has no mic permissions (will only be returned on iOS7 or later).*/
- (void) pocketsphinxFailedNoMicPermissions {
  NSLog(@"Local callback: The user has never set mic permissions or denied permission to this app's mic, so listening will not start.");
  self.startupFailedDueToLackOfPermissions = TRUE;
  if([OEPocketsphinxController sharedInstance].isListening){
    NSError *error = [[OEPocketsphinxController sharedInstance] stopListening]; // Stop listening if we are listening.
    if(error) NSLog(@"Error while stopping listening in micPermissionCheckCompleted: %@", error);
  }
}

/** The user prompt to get mic permissions, or a check of the mic permissions, has completed with a TRUE or a FALSE result  (will only be returned on iOS7 or later).*/
- (void) micPermissionCheckCompleted:(BOOL)result {
  if(result) {
    self.restartAttemptsDueToPermissionRequests++;
    if(self.restartAttemptsDueToPermissionRequests == 1 && self.startupFailedDueToLackOfPermissions) { // If we get here because there was an attempt to start which failed due to lack of permissions, and now permissions have been requested and they returned true, we restart exactly once with the new permissions.
      
      if(![OEPocketsphinxController sharedInstance].isListening) { // If there was no error and we aren't listening, start listening.
        [[OEPocketsphinxController sharedInstance]
         startListeningWithLanguageModelAtPath:self.pathToDynamicallyGeneratedLanguageModel
         dictionaryAtPath:self.pathToDynamicallyGeneratedDictionary
         acousticModelAtPath:[OEAcousticModel pathToModel:@"AcousticModelEnglish"]
         languageModelIsJSGF:FALSE]; // Start speech recognition.
        
        self.startupFailedDueToLackOfPermissions = FALSE;
      }
    }
  }
}


@end
