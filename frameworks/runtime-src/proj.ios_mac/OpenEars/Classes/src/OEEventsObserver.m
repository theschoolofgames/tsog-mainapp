//  OpenEars 
//  http://www.politepix.com/openears
//
//  OEEventsObserver.m
//  OpenEars
// 
//  OEEventsObserver is a class which allows the return of delegate methods delivering the status of various functions of Flite, Pocketsphinx and OpenEars
//
//  Copyright Politepix UG (haftungsbeschränkt) 2014. All rights reserved.
//  http://www.politepix.com
//  Contact at http://www.politepix.com/contact
//
//  this file is licensed under the Politepix Shared Source license found 
//  found in the root of the source distribution. Please see the file "Version.txt" in the root of 
//  the source distribution for the version number of this OpenEars package.


#import "OEEventsObserver.h"


@implementation OEEventsObserver

- (void) createNotificationObserverOnMainThread { // We receive information via NSNotifications on the main thread
	[[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(openEarsNotifications:) name:@"OpenEarsNotification" object:nil];	
}

- (instancetype) init
{
    if ( self = [super init] )
    {
		// All NSNotifications are sent to the main thread so we want to make sure that that is where we're establishing our notification observer.
		[self performSelectorOnMainThread:@selector(createNotificationObserverOnMainThread) withObject:nil waitUntilDone:NO]; 
    }
    return self;
}

// An optional delegate method which delivers the text of speech that Pocketsphinx heard and analyzed, along with its accuracy score and utterance ID.
- (void) pocketsphinxDidReceiveHypothesis:(NSString *)hypothesis recognitionScore:(NSString *)recognitionScore utteranceID:(NSString *)utteranceID { 
}

// An optional delegate method which delivers a dictionary of n-best results of the hypothesis and their corresponding scores.
- (void) pocketsphinxDidReceiveNBestHypothesisArray:(NSArray *)hypothesisArray { // Pocketsphinx has an n-best hypothesis dictionary.

}

// An optional delegate method which informs that there was an interruption to the audio session (e.g. an incoming phone call).
- (void) audioSessionInterruptionDidBegin {
}

// An optional delegate method which informs that the interruption to the audio session ended.
- (void) audioSessionInterruptionDidEnd {
}

// An optional delegate method which informs that the audio input became unavailable.
- (void) audioInputDidBecomeUnavailable {
}

// An optional delegate method which informs that the unavailable audio input became available again.
- (void) audioInputDidBecomeAvailable {
}

// An optional delegate method which informs that there was a change to the audio route (e.g. headphones were plugged in or unplugged).
- (void) audioRouteDidChangeToRoute:(NSString *)newRoute {
}

// An optional delegate method which informs that the Pocketsphinx recognition loop has entered its actual loop.
// This might be useful in debugging a conflict between another sound class and Pocketsphinx.
- (void) pocketsphinxRecognitionLoopDidStart {
}

// An optional delegate method which informs that Pocketsphinx is now listening for speech.
- (void) pocketsphinxDidStartListening {
}

// An optional delegate method which informs that Pocketsphinx detected speech and is starting to process it.
- (void) pocketsphinxDidDetectSpeech {
}

// An optional delegate method which informs that Pocketsphinx detected a second of silence indicating the end of an utterance
- (void) pocketsphinxDidDetectFinishedSpeech {
}

// An optional delegate method which informs that Pocketsphinx has exited its recognition loop, most 
// likely in response to the OEPocketsphinxController being told to stop listening via the stopListening method.
- (void) pocketsphinxDidStopListening {
}

// An optional delegate method which informs that Pocketsphinx is still in its listening loop but it is not
// Going to react to speech until listening is resumed.  This can happen as a result of Flite speech being
// in progress on an audio route that doesn't support simultaneous Flite speech and Pocketsphinx recognition,
// or as a result of the OEPocketsphinxController being told to suspend recognition via the suspendRecognition method.
- (void) pocketsphinxDidSuspendRecognition {
}

// An optional delegate method which informs that Pocketsphinx is still in its listening loop and after recognition
// having been suspended it is now resuming.  This can happen as a result of Flite speech completing
// on an audio route that doesn't support simultaneous Flite speech and Pocketsphinx recognition,
// or as a result of the OEPocketsphinxController being told to resume recognition via the resumeRecognition method.
- (void) pocketsphinxDidResumeRecognition {
}

// An optional delegate method which informs that Pocketsphinx switched over to a new language model at the given URL in the course of
// recognition. This does not imply that it is a valid file or that recognition will be successful using the file.
- (void) pocketsphinxDidChangeLanguageModelToFile:(NSString *)newLanguageModelPathAsString andDictionary:(NSString *)newDictionaryPathAsString{
}

// Some aspect of setting up the continuous loop failed, turn on OELogging for more info.
- (void) pocketSphinxContinuousSetupDidFailWithReason:(NSString *)reasonForFailure {
}

// Some aspect of tearing down the continuous loop failed, turn on OELogging for more info.
- (void) pocketSphinxContinuousTeardownDidFailWithReason:(NSString *)reasonForFailure {
}

// An optional delegate method which informs that Flite is speaking, most likely to be useful if debugging a
// complex interaction between sound classes.
- (void) fliteDidStartSpeaking {
}

// An optional delegate method which informs that Flite is finished speaking, most likely to be useful if debugging a
// complex interaction between sound classes.
- (void) fliteDidFinishSpeaking {
}

// An optional delegate method which informs that a test recording that was submitted for raw recognition via the audio driver has completed.
- (void) pocketsphinxTestRecognitionCompleted {
}

- (void) pocketsphinxFailedNoMicPermissions {										
}  

- (void) micPermissionCheckCompleted:(BOOL)result {
}
        
#pragma mark -
#pragma mark PocketsphinxNotification Handling

- (void) openEarsNotifications:(NSNotification *)notificationDictionary {
	
	// Here, all of the notifications on the main thread which invoke the delegate methods above
	// are parsed and routed so that there only needs to be a single NSNotification Observer.
	
	// Each notification corresponds to a single method above and the notification name
	// in each case is identical to the method name, so the comments above apply here.
	
	NSDictionary *dictionary = [notificationDictionary userInfo];
	NSString *openEarsNotificationType = dictionary[@"OpenEarsNotificationType"];
    
	if([openEarsNotificationType isEqualToString:@"PocketsphinxDidReceiveHypothesis"]) { 
		if ( [self.delegate respondsToSelector:@selector(pocketsphinxDidReceiveHypothesis:recognitionScore:utteranceID:)] ) {
			[self.delegate pocketsphinxDidReceiveHypothesis:dictionary[@"Hypothesis"] recognitionScore:dictionary[@"RecognitionScore"] utteranceID:dictionary[@"UtteranceID"]];
		}
	} else if([openEarsNotificationType isEqualToString:@"PocketsphinxDidDetectSpeech"]) {
		if ( [self.delegate respondsToSelector:@selector(pocketsphinxDidDetectSpeech)] ) {				
			[self.delegate pocketsphinxDidDetectSpeech];
		}		
	} else if([openEarsNotificationType isEqualToString:@"PocketsphinxDidDetectFinishedSpeech"]) {
		if ( [self.delegate respondsToSelector:@selector(pocketsphinxDidDetectFinishedSpeech)] ) {				
			[self.delegate pocketsphinxDidDetectFinishedSpeech];
		}				
	} else if([openEarsNotificationType isEqualToString:@"AudioSessionInterruptionDidBegin"]) {
		if ( [self.delegate respondsToSelector:@selector(audioSessionInterruptionDidBegin)] ) {
			[self.delegate audioSessionInterruptionDidBegin];
		}
	} else if([openEarsNotificationType isEqualToString:@"AudioSessionInterruptionDidEnd"]) {
		if ( [self.delegate respondsToSelector:@selector(audioSessionInterruptionDidEnd)] ) {
			[self.delegate audioSessionInterruptionDidEnd];
		}
	} else if([openEarsNotificationType isEqualToString:@"AudioInputDidBecomeUnavailable"]) {
		if ( [self.delegate respondsToSelector:@selector(audioInputDidBecomeUnavailable)] ) {
			[self.delegate audioInputDidBecomeUnavailable];
		}
	} else if([openEarsNotificationType isEqualToString:@"AudioInputDidBecomeAvailable"]) {
		if ( [self.delegate respondsToSelector:@selector(audioInputDidBecomeAvailable)] ) {		
			[self.delegate audioInputDidBecomeAvailable];
		}
	} else if([openEarsNotificationType isEqualToString:@"AudioRouteDidChangeRoute"]) {
		if ( [self.delegate respondsToSelector:@selector(audioRouteDidChangeToRoute:)] ) {		
			[self.delegate audioRouteDidChangeToRoute:dictionary[@"AudioRoute"]];
		}
	} else if([openEarsNotificationType isEqualToString:@"PocketsphinxRecognitionLoopDidStart"]) {
		if ( [self.delegate respondsToSelector:@selector(pocketsphinxRecognitionLoopDidStart)] ) {
			[self.delegate pocketsphinxRecognitionLoopDidStart];
		}
	} else if([openEarsNotificationType isEqualToString:@"PocketsphinxDidStartListening"]) {	
		if ( [self.delegate respondsToSelector:@selector(pocketsphinxDidStartListening)] ) {		
			[self.delegate pocketsphinxDidStartListening];		
		}
	} else if([openEarsNotificationType isEqualToString:@"PocketsphinxDidStopListening"]) {
		if ( [self.delegate respondsToSelector:@selector(pocketsphinxDidStopListening)] ) {						
			[self.delegate pocketsphinxDidStopListening];
		}
	} else if([openEarsNotificationType isEqualToString:@"PocketsphinxDidSuspendRecognition"]) {
		if ( [self.delegate respondsToSelector:@selector(pocketsphinxDidSuspendRecognition)] ) {						
			[self.delegate pocketsphinxDidSuspendRecognition];
		}
	} else if([openEarsNotificationType isEqualToString:@"PocketsphinxDidResumeRecognition"]) {
		if ( [self.delegate respondsToSelector:@selector(pocketsphinxDidResumeRecognition)] ) {								
			[self.delegate pocketsphinxDidResumeRecognition];
		}
	} else if([openEarsNotificationType isEqualToString:@"PocketsphinxDidChangeLanguageModel"]) {
		if ( [self.delegate respondsToSelector:@selector(pocketsphinxDidChangeLanguageModelToFile:andDictionary:)] ) {								
			[self.delegate pocketsphinxDidChangeLanguageModelToFile:dictionary[@"LanguageModelFilePath"] andDictionary:dictionary[@"DictionaryFilePath"]];
		}		
	} else if([openEarsNotificationType isEqualToString:@"FliteDidStartSpeaking"]) {
		if ( [self.delegate respondsToSelector:@selector(fliteDidStartSpeaking)] ) {										
			[self.delegate fliteDidStartSpeaking];
		}
	} else if([openEarsNotificationType isEqualToString:@"FliteDidFinishSpeaking"]) {
		if ( [self.delegate respondsToSelector:@selector(fliteDidFinishSpeaking)] ) {										
			[self.delegate fliteDidFinishSpeaking];
		}
	} else if([openEarsNotificationType isEqualToString:@"PocketsphinxDidReceiveNbestHypothesisArray"]) {
		if ( [self.delegate respondsToSelector:@selector(pocketsphinxDidReceiveNBestHypothesisArray:)] ) {										
			[self.delegate pocketsphinxDidReceiveNBestHypothesisArray:dictionary[@"NbestHypothesisArray"]];
		}
	} else if([openEarsNotificationType isEqualToString:@"PocketsphinxContinuousSetupDidFail"]) {
        if ( [self.delegate respondsToSelector:@selector(pocketSphinxContinuousSetupDidFailWithReason:)] ) {										
            [self.delegate pocketSphinxContinuousSetupDidFailWithReason:dictionary[@"ReasonForFailure"]];
		}
    } else if([openEarsNotificationType isEqualToString:@"PocketsphinxContinuousTeardownDidFail"]) {
        if ( [self.delegate respondsToSelector:@selector(pocketSphinxContinuousTeardownDidFailWithReason:)] ) {										
            [self.delegate pocketSphinxContinuousTeardownDidFailWithReason:dictionary[@"ReasonForFailure"]];
        }        
	} else if([openEarsNotificationType isEqualToString:@"TestRecognitionCompleted"]) {
		if ( [self.delegate respondsToSelector:@selector(pocketsphinxTestRecognitionCompleted)] ) {										
			[self.delegate pocketsphinxTestRecognitionCompleted];
		}  
        
	} else if([openEarsNotificationType isEqualToString:@"PocketsphinxFailedNoMicPermissions"]) {
		if ( [self.delegate respondsToSelector:@selector(pocketsphinxFailedNoMicPermissions)] ) {										
			[self.delegate pocketsphinxFailedNoMicPermissions];
		}  
	} else if([openEarsNotificationType isEqualToString:@"MicPermissionCheckCompleted"]) {
		if ( [self.delegate respondsToSelector:@selector(micPermissionCheckCompleted:)] ) {	
            if([dictionary[@"Result"] isEqualToString:@"PermissionGranted"]) {
                [self.delegate micPermissionCheckCompleted:TRUE];
            } else {
                [self.delegate micPermissionCheckCompleted:FALSE];
            }
		}  
    } else {
        // Some room for expansion.
        @autoreleasepool {

            NSString *methodName = [NSString stringWithFormat:@"%@%@:",[[openEarsNotificationType substringToIndex:1] lowercaseString],[openEarsNotificationType substringFromIndex:1]];     // a string consisting of the value of the key openEarsNotificationType with the first letter lowercase and a colon appended.
            
            SEL method = NSSelectorFromString(methodName); // A selector derived from the string methodName.
            
            if ( [self respondsToSelector:method] ) { // Does the class respond to a selector with this name?           

                [self performSelectorOnMainThread:method withObject:dictionary waitUntilDone:YES];// Then pass the userInfo dictionary to that method on the main thread. If you don't wait until done, it isn't thread-safe.
		}
        }
    }

}


- (void)dealloc {
	
	// Remove the notification observer.
	[[NSNotificationCenter defaultCenter] removeObserver:self name:@"OpenEarsNotification" object:nil];
}

@end
