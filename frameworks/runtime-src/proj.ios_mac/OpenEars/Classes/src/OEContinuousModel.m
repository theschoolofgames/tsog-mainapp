//  OpenEars 
//  http://www.politepix.com/openears
//
//  OEContinuousModel.m
//  OpenEars
//
//  OEContinuousModel is a class which consists of the continuous listening loop used by Pocketsphinx.
//
//  This is a Pocketsphinx continuous listening loop based on modifications to the Pocketsphinx file continuous.c.
//
//  Copyright Politepix UG (hatfungsbeschränkt) 2014 excepting that which falls under the copyright of Carnegie Mellon University as part
//  of their file continuous.c.
//  http://www.politepix.com
//  Contact at http://www.politepix.com/contact
//
//  this file is licensed under the Politepix Shared Source license found 
//  found in the root of the source distribution. Please see the file "Version.txt" in the root of 
//  the source distribution for the version number of this OpenEars package.
//  Removed the references to the CMU code because this source doesn't have any overlap with it anymore.

#import "OEContinuousModel.h"
#import "unistd.h"
#import "fsg_search_internal.h"
#import "OERuntimeVerbosity.h"
#import "OECommandArray.h"
#import "OEPocketsphinxRunConfig.h"
#import "cmd_ln.h"
#import "OENotification.h"
#import "OEDynamicMethod.h"
#import "OEContinuousAudioUnit.h"
#import "pocketsphinx.h"

@interface OEContinuousModel ()
@property (nonatomic, readwrite) float lastCMNUsed;
@property (nonatomic, assign) BOOL processing;
@end

@implementation OEContinuousModel

extern int verbose_pocketsphinx;
extern int openears_logging;
extern int returner;

#pragma mark -
#pragma mark Memory Management
#pragma mark -

- (instancetype) init {
    if (self = [super init]) {
        
        _lastCMNUsed = 0.0;
        _speechFramesFound = FALSE;
        _speechAlreadyInProgress = FALSE;
        _pocketSphinxDecoder = NULL; // The Pocketsphinx decoder which will perform the actual speech recognition on recorded speech.
        _audioDriver = [[OEContinuousAudioUnit alloc] init];
        _shouldUseSmartCMN = TRUE;
        _returnNbest = FALSE;
        _smartCMN = [[OESmartCMN alloc] init];
        _bufferAccumulator = [[NSMutableData alloc] init];
        _nBestNumber = 5;
        _returnNullHypotheses = FALSE;
        _isListening = FALSE;
        _utteranceState = kUtteranceStateUnstarted;
        _stuckUtterance = 0.0;
        _stopping = FALSE;
        _isSuspended = FALSE;
        _safeToCallStart = TRUE;
        _safeToCallStop = FALSE;
        _requestToResume = FALSE;
        _utteranceID = 0;
        _frameRate = 100;
        _processing = FALSE;
        _legacy3rdPassMode = FALSE;
    }
    return self;
}

- (void)dealloc {
    
}

#pragma mark -
#pragma mark Timing
#pragma mark -

- (void) heartBeat {
    
    if(self.bufferAccumulator.length > 0) {
        
        NSData *buffer = [NSData dataWithBytes:[self.bufferAccumulator bytes] length:[self.bufferAccumulator length]];
        @synchronized(self) {
            [self.bufferAccumulator setLength:0];
        }
        [self processBuffer:buffer];
    } 
}

#pragma mark -
#pragma mark Resume/Suspend
#pragma mark -

- (BOOL) openEarsLoggingIsOn {
    if(openears_logging == 1) return TRUE;
    return FALSE;
}

- (BOOL) verbosePocketsphinxIsOn {
    if(verbose_pocketsphinx == 1) return TRUE;
    return FALSE;
}

- (void) resumeRecognition {
    [self.audioDriver resumeRecognition];
    self.isSuspended = FALSE;
    self.requestToResume = TRUE; 
}

- (void) suspendRecognition {
    [self.audioDriver suspendRecognition];  
    self.isSuspended = TRUE;
    self.requestToResume = FALSE;    
}

#pragma mark -
#pragma mark Respond to buffer availability
#pragma mark -

- (void) performSingularStopForDecoder:(ps_decoder_t *)pocketSphinxDecoder {
    if(self.utteranceState != kUtteranceStateEnded && (self.pocketSphinxDecoder->acmod->state == ACMOD_STARTED || self.pocketSphinxDecoder->acmod->state == ACMOD_PROCESSING)) { // We never want to call two end utterances in a row.
        [self endUtterance]; // End utterance if it was started.
        self.utteranceState = kUtteranceStateEnded;
    }
}

- (void) resetForNewUtteranceWithContextString:(NSString *)contextString {
    self.languageModelFileToChangeTo = nil;
    self.dictionaryFileToChangeTo = nil;
    self.thereIsALanguageModelChangeRequest = FALSE;
    self.utteranceState = kUtteranceStateUnstarted;
    self.speechFramesFound = FALSE;
    self.speechAlreadyInProgress = FALSE;
    
    if(self.utteranceState != kUtteranceStateStarted) { // // We never want to call two start utterances in a row.
        if ([self startUtterance] < 0) { // Start utterance if it was stopped.
            [self announceSetupFailureForReason:[NSString stringWithFormat:@"Starting a new utterance in the context %@ failed.",contextString]];
            return;
        } else {
            self.utteranceState = kUtteranceStateStarted;
        }
    }
}

- (void) processBuffer:(NSData *)buffer {
    
    if(self.pocketSphinxDecoder == NULL || _stopping) return; // If we ever get here without a started pocketSphinxDecoder we have nothing to do here. We're going to be extremely careful not to do stuff with a pocketsphinx we've released.
    
    if(!_stopping && self.thereIsALanguageModelChangeRequest)[self validateAndPerformLanguageModelChange]; // If there is a request to change models, go away and do that first.
    
    if(self.requestToResume) { // If we're returning from a suspension, flush everything and reset so we don't get hypotheses which began before the suspension after it is over.
        self.requestToResume = FALSE;
        [self performSingularStopForDecoder:self.pocketSphinxDecoder];
        [self resetForNewUtteranceWithContextString:@"of resuming after an interruption"];
    }
    
    if(!_stopping && self.utteranceState == kUtteranceStateUnstarted) { // We only start the utterance if this is the first opportunity to do so.
        
        if ([self startUtterance] < 0) {
            [self announceSetupFailureForReason:@"Initial start of utterance failed."];
            return;
        } else {
            self.utteranceState = kUtteranceStateStarted;
        }
    }
    
    if(!_stopping) {
        [self processRaw:buffer];               
        self.speechFramesFound = [self getInSpeech];
    }
    
    if (!_stopping && self.speechFramesFound && !self.speechAlreadyInProgress) { // Possibility 1: we have just found the beginning of speech.
        self.speechAlreadyInProgress = TRUE;
        self.stuckUtterance = [NSDate timeIntervalSinceReferenceDate];
        [self announceSpeechDetection]; // We have speech if we get here.
    }
    
    BOOL exitEarly = FALSE;
    
    if(!_stopping && self.speechFramesFound && self.speechAlreadyInProgress) { // Possibility 2: this is more of ongoing speech.
        if(([NSDate timeIntervalSinceReferenceDate] - self.stuckUtterance) > 25.0) { // If this is a stuck recognition, provide the possibility to end the utterance.
            if([self openEarsLoggingIsOn] || [self verbosePocketsphinxIsOn])NSLog(@"An utterance appears to be stuck in listening mode. Exiting stuck utterance.");
            self.stuckUtterance = [NSDate timeIntervalSinceReferenceDate];
            self.speechFramesFound = FALSE;
            
            exitEarly = TRUE;
        }
    }
    
    if (!_stopping && ((!self.speechFramesFound && self.speechAlreadyInProgress) || (exitEarly))) { // Possibility 3: has completed.
        
        self.speechAlreadyInProgress = FALSE;
        [self announceSpeechCompleted];
        [self endUtterance];
        
        self.utteranceState = kUtteranceStateEnded;
        if(!exitEarly)[self getAndReturnHypothesisForDecoder:self.pocketSphinxDecoder]; // Get hyp but not if the utterance is stuck
        
        if(!_stopping) {
            if ([self startUtterance] < 0) { // We know that kUtteranceState is ended here, we don't have to check.
                [self announceSetupFailureForReason:@"Resumption of starting utterance after a previous successful start failed."];
                return;
            }
        }
        
        self.utteranceState = kUtteranceStateStarted;
        self.stuckUtterance = [NSDate timeIntervalSinceReferenceDate];
    }
}

- (void) availableBuffer:(id)sender {
    NSDictionary *userInfo = (NSDictionary *)[sender userInfo];
    NSData *buffer = userInfo[@"Buffer"];
    
    if(buffer && ([buffer length] > 0)) {
        
        @synchronized(self) {
            [self.bufferAccumulator appendBytes:[buffer bytes] length:[buffer length]];
        }
    }
}

#pragma mark -
#pragma mark Metering
#pragma mark -

- (float) getMeteringLevel {
    return [self.audioDriver getInputDecibels];
}

#pragma mark -
#pragma mark Model type identification
#pragma mark -

- (BOOL) dictionaryAtPath:(NSString *)dictionaryPath containsToken:(NSString *)tokenString {
    NSError *error = nil;
    NSString *fileString = [NSString stringWithContentsOfFile:dictionaryPath usedEncoding:nil error:&error];
    if(error || [fileString rangeOfString:tokenString].location == NSNotFound) return FALSE;
    return TRUE;
}

- (BOOL) dictionaryAtPathIsFromRuleORama:(NSString *)dictionaryPath {
    return [self dictionaryAtPath:dictionaryPath containsToken:@"#^#"];   
}

- (BOOL) dictionaryAtPathIsFromRejecto:(NSString *)dictionaryPath {
    return [self dictionaryAtPath:dictionaryPath containsToken:@"___REJ_"];   
}

#pragma mark -
#pragma mark Language Model Management Methods
#pragma mark -

- (void) validateAndPerformLanguageModelChange {
    if([self.languageModelFileToChangeTo rangeOfString:@".arpa"].location != NSNotFound || 
       [self.languageModelFileToChangeTo rangeOfString:@".ARPA"].location != NSNotFound || 
       [self.languageModelFileToChangeTo rangeOfString:@".lm"].location != NSNotFound || 
       [self.languageModelFileToChangeTo rangeOfString:@".LM"].location != NSNotFound || 
       [self.languageModelFileToChangeTo rangeOfString:@".dmp"].location != NSNotFound || 
       [self.languageModelFileToChangeTo rangeOfString:@".DMP"].location != NSNotFound || 
       [self.languageModelFileToChangeTo rangeOfString:@".languagemodel"].location != NSNotFound || 
       [self.languageModelFileToChangeTo rangeOfString:@".LANGUAGEMODEL"].location != NSNotFound ||
       [self.languageModelFileToChangeTo rangeOfString:@".dmp32"].location != NSNotFound || 
       [self.languageModelFileToChangeTo rangeOfString:@".DMP32"].location != NSNotFound) {
        
        [self changeLanguageModelForDecoder:self.pocketSphinxDecoder languageModelIsJSGF:FALSE];
        
    } else if ([self.languageModelFileToChangeTo rangeOfString:@".gram"].location != NSNotFound
               || [self.languageModelFileToChangeTo rangeOfString:@".GRAM"].location != NSNotFound
               || [self.languageModelFileToChangeTo rangeOfString:@".jsgf"].location != NSNotFound
               || [self.languageModelFileToChangeTo rangeOfString:@".JSGF"].location != NSNotFound
               || [self.languageModelFileToChangeTo rangeOfString:@".grammar"].location != NSNotFound
               || [self.languageModelFileToChangeTo rangeOfString:@".GRAMMAR"].location != NSNotFound) {
        
        [self changeLanguageModelForDecoder:self.pocketSphinxDecoder languageModelIsJSGF:TRUE];
        
    } else {
        
        NSLog(@"Error: there has been a request to change the language model, however the files that were requested do not have one of the file endings OpenEars recognizes (.arpa, .lm, .languagemodel., .DMP, .gram, or .jsgf) so it isn't possible to switch to this model or grammar.");
        
    }
}

- (NSString *) compileKnownWordsFromFileAtPath:(NSString *)filePath {
    NSArray *dictionaryArray = [[NSString stringWithContentsOfFile:filePath encoding:NSUTF8StringEncoding error:nil] componentsSeparatedByCharactersInSet:[NSCharacterSet newlineCharacterSet]];
    NSMutableString *allWords = [[NSMutableString alloc] init];
    int cutoff = 0;
    for(NSString *string in dictionaryArray) {
        if(cutoff > 30) {
            [allWords appendString:[NSString stringWithFormat:@"...and %lu more.\n",(unsigned long)[dictionaryArray count]-30]];          
            break;
        } else {
            NSArray *lineArray = [string componentsSeparatedByString:@"\t"];
            [allWords appendString:[NSString stringWithFormat:@"%@\n",[lineArray[0]stringByReplacingOccurrencesOfString:@"#^#" withString:@" "]]];
            cutoff++;
        }
    }
    return allWords;
}

- (void) changeLanguageModelToFile:(NSString *)languageModelPathAsString withDictionary:(NSString *)dictionaryPathAsString {
    
    if(self.pocketSphinxDecoder == NULL || self.utteranceState == kUtteranceStateUnstarted) return; // Ignore this if we aren't listening.
    self.languageModelFileToChangeTo = languageModelPathAsString;
    self.dictionaryFileToChangeTo = dictionaryPathAsString;
    self.thereIsALanguageModelChangeRequest = TRUE;
}

- (void) changeLanguageModelForDecoder:(ps_decoder_t *)pocketsphinxDecoder languageModelIsJSGF:(BOOL)languageModelIsJSGF {
    
    [self performSingularStopForDecoder:self.pocketSphinxDecoder];
    
    time_t current_time;
    
    /* Obtain current time as seconds elapsed since the Epoch. */
    current_time = time(NULL);
    
    int fatalErrors = 0;
    int loadSuccess = 0;
    
    NSString *modelType = @"language model";
    
    if(languageModelIsJSGF)modelType = @"grammar";
    
    if([self openEarsLoggingIsOn]) NSLog(@"there is a request to change to the %@ file %@", modelType, self.languageModelFileToChangeTo);
    
    NSString *modelIDRepresentation = [NSString stringWithFormat:@"%lu",current_time];
    
    if([self openEarsLoggingIsOn]) NSLog(@"The %@ ID is %s",modelType, [modelIDRepresentation UTF8String]);   
    
    int loadingDictionaryResult = ps_load_dict(pocketsphinxDecoder, [self.dictionaryFileToChangeTo UTF8String],NULL, NULL);
    
    if(loadingDictionaryResult == -1) {
        if([self openEarsLoggingIsOn]) NSLog(@"Error: could not load the specified dictionary file %@.",self.dictionaryFileToChangeTo);
        fatalErrors++;
    } else {
        if([self openEarsLoggingIsOn]) NSLog(@"Success loading the specified dictionary file %@.",self.dictionaryFileToChangeTo);
    }
    
    if(languageModelIsJSGF) {
        loadSuccess = ps_set_jsgf_file(pocketsphinxDecoder, [modelIDRepresentation UTF8String], [self.languageModelFileToChangeTo UTF8String]);
    } else {
        loadSuccess = ps_set_lm_file(pocketsphinxDecoder,[modelIDRepresentation UTF8String],[self.languageModelFileToChangeTo UTF8String]);        
    }
    
    if(loadSuccess == -1) {
        if([self openEarsLoggingIsOn]) NSLog(@"Error: could not load the specified %@ file %@.", modelType,self.languageModelFileToChangeTo);
        fatalErrors++;
    } else {
        if([self openEarsLoggingIsOn]) NSLog(@"Success loading the specified %@ file %@.", modelType,self.languageModelFileToChangeTo);
    }
    
    ps_set_search(pocketsphinxDecoder,[modelIDRepresentation UTF8String]);
    
    
    if(fatalErrors > 0) { // Language model or grammar switch wasn't successful, report the failure and reset the variables.
        
        if([self openEarsLoggingIsOn]) NSLog(@"There were too many errors to switch the language model or grammar, please search the console for the word 'error' to investigate the issues.");
        
    } else { // Language model or grammar switch appears to have been successful.
        
        
        [OENotification performOpenEarsNotificationOnMainThread:@"PocketsphinxDidChangeLanguageModel" withOptionalObjects:@[self.languageModelFileToChangeTo, self.dictionaryFileToChangeTo] andKeys:@[@"LanguageModelFilePath",@"DictionaryFilePath"]];
        
        if([self openEarsLoggingIsOn]) NSLog(@"Changed %@. Project has these words or phrases in its dictionary:\n%@", modelType,[self compileKnownWordsFromFileAtPath:self.dictionaryFileToChangeTo]);
    }
    
    [self resetForNewUtteranceWithContextString:@"of changing language models"];
}

- (void) checkValidityOfDictionaryAtPath:(NSString *)dictionaryPath {
    
    if(![dictionaryPath hasSuffix:@".dic"] && ![dictionaryPath hasSuffix:@".dict"] && ![dictionaryPath hasSuffix:@".DIC"] && ![dictionaryPath hasSuffix:@".DICT"]) {
        if([self openEarsLoggingIsOn]) NSLog(@"The dictionaryPath filename (%@) that was submitted to listeningLoopWithLanguageModelAtPath: doesn't have a suffix that is usually seen on a phonetic dictionary file. This can happen as a result of unintentionally using [OELanguageModelGenerator pathToSuccessfullyGeneratedGrammarWithRequestedName:] or [OELanguageModelGenerator pathToSuccessfullyGeneratedLanguageModelWithRequestedName:] to get the dictionary path when you intended to use [OELanguageModelGenerator pathToSuccessfullyGeneratedDictionaryWithRequestedName:].",dictionaryPath);
    }
}

- (void) checkWhetherJSGFSettingOf:(BOOL)languageModelIsJSGF LooksCorrectForThisFilename:(NSString *)languageModelPath {
    
    if([languageModelPath hasSuffix:@".gram"] || [languageModelPath hasSuffix:@".GRAM"] || [languageModelPath hasSuffix:@".grammar"] || [languageModelPath hasSuffix:@".GRAMMAR"] || [languageModelPath hasSuffix:@".jsgf"] || [languageModelPath hasSuffix:@".JSGF"]) {
        
        // This is probably a JSGF file. Let's see if the languageModelIsJSGF seems correct for that case.
        if(!languageModelIsJSGF) { // Probable JSGF file with the ARPA bit set
            if([self openEarsLoggingIsOn]) NSLog(@"The file you've sent to the decoder appears to be a JSGF grammar based on its naming, but you have not set languageModelIsJSGF: to TRUE. If you are experiencing recognition issues, there is a good chance that this is the reason for it. This can also happen if you meant to use the method [OELanguageModelGenerator pathToSuccessfullyGeneratedLanguageModelWithRequestedName:] to obtain a language model path but unintentionally used the method [OELanguageModelGenerator pathToSuccessfullyGeneratedGrammarWithRequestedName:] instead.");
        }
        
    } else if([languageModelPath hasSuffix:@".lm"] || [languageModelPath hasSuffix:@".LM"] || [languageModelPath hasSuffix:@".languagemodel"] || [languageModelPath hasSuffix:@".LANGUAGEMODEL"] || [languageModelPath hasSuffix:@".arpa"] || [languageModelPath hasSuffix:@".ARPA"] || [languageModelPath hasSuffix:@".dmp"] || [languageModelPath hasSuffix:@".DMP"]) {
        
        // This is probably an ARPA file. Let's see if the languageModelIsJSGF seems correct for that case.        
        if(languageModelIsJSGF) { // Probable ARPA file with the JSGF bit set
            if([self openEarsLoggingIsOn]) NSLog(@"The file you've sent to the decoder appears to be an ARPA-style language model based on its naming, but you have set languageModelIsJSGF: to TRUE. If you are experiencing recognition issues, there is a good chance that this is the reason for it. If this is a RuleORama grammar, set languageModelIsJSGF: to FALSE. This can also happen if you meant to use the method [OELanguageModelGenerator pathToSuccessfullyGeneratedGrammarWithRequestedName:] to obtain a grammar path but unintentionally used the method [OELanguageModelGenerator pathToSuccessfullyGeneratedLanguageModelWithRequestedName:] instead.");
        }
        
    } else { // It isn't clear from the suffix what kind of file this is, which could easily be a bad sign so let's mention it.
        if([self openEarsLoggingIsOn]) NSLog(@"The LanguageModelAtPath filename that was submitted to listeningLoopWithLanguageModelAtPath: doesn't have a suffix that is usually seen on an ARPA model or a JSGF model, which are the only two kinds of models that OpenEars supports. If you are having difficulty with your project, you should probably take a look at the language model or grammar file you are trying to submit to the decoder and/or its naming.");
    }
}

- (char const *) searchHyp:(ps_decoder_t *)ps bestScore:(int *)out_best_score final:(int *)final {
    return ps_search_hyp(ps->search, (int *)out_best_score, (int *)final);   
}

#pragma mark -
#pragma mark Command Array
#pragma mark -



- (NSDictionary *) setUpCommandArray:(id)commandArrayModel secondItemIsEmpty:(BOOL)secondItemIsEmpty forlanguageModel:(NSString *)languageModelPath dictionaryPath:(NSString *)dictionaryPath acousticModelPath:(NSString *)acousticModelPath isJSGF:(BOOL)isJSGF usingBestPath:(NSNumber *)usingBestpath {
    
    // Note: usingBestPath is an optional value, but setting it to nil doesn't mean we aren't using bestPath, it means we're letting the logic decide whether it's appropriate or not. Setting it to true or false will propagate that exact value through to the engine regardless of whether it is a case in which OpenEars usually thinks bestpath is a good/bad idea. It is a general design goal to not force bestpath settings using this method, but the possibility is being left there because it has come close to being needed on so many occasions and the need to alter it appears in testing frequently. But here is my warning: if you are altering this to force bestpath on when it is being automatically set to off, you are most likely going to discover a mysterious endless search bug later on and not necessarily tie it back to having earlier overridden OpenEars' logic on bestpath, so please be careful here and mention any changes when seeking support.
    
    BOOL useBestPath = TRUE;
    
    if(usingBestpath) { // If a usingBestpath value was passed, use it.
        useBestPath = [usingBestpath boolValue];
    } else if (self.legacy3rdPassMode) { // Or get it by stealth in legacy mode if needed.
        useBestPath = ![self dictionaryAtPathIsFromRejecto:dictionaryPath];
    } else { // Otherwise, use best path.
        useBestPath = TRUE;
    }
    
    NSArray *commandArray = [commandArrayModel commandArrayForlanguageModel:languageModelPath dictionaryPath:dictionaryPath acousticModelPath:acousticModelPath isJSGF:isJSGF usesBestPath:useBestPath removingNoise:self.removingNoise removingSilence:self.removingSilence vadThreshold:self.vadThreshold secondsOfSilence:self.secondsOfSilenceToDetect secondsOfSpeech:self.secondsOfSpeechToDetect];
    
    char* argv[[commandArray count]]; // We're simulating the command-line run arguments for Pocketsphinx.
    
    if(secondItemIsEmpty) {
        argv[1] = (char *)"";
    }
    
    for (int i = 0; i < [commandArray count]; i++ ) { // Grab all the set arguments.
        
        char *argument = (char *) ([commandArray[i]UTF8String]);
        argv[i] = argument;
    }
    
    arg_t cont_args_def[] = { // Grab any extra arguments.
        POCKETSPHINX_OPTIONS,
        { "-argfile", ARG_STRING, NULL, "Argument file giving extra arguments." },
        CMDLN_EMPTY_OPTION
    };
    
    if ([commandArray count] < 3) { // Fail if there aren't enough arguments.
        [self announceSetupFailureForReason:@"Initial Pocketsphinx command failed because there were too few arguments in the command, stopping."];
        return NULL;
    }
    return @{ 
             @"CommandArray" : commandArray,
             @"argv" : [NSData dataWithBytes:&argv length:sizeof(argv)], 
             @"cont_args_def" : [NSData dataWithBytes:&cont_args_def length:sizeof(cont_args_def)]
             };
}

- (ps_decoder_t *) initializeDecoderForLanguageModelAtPath:(NSString *)languageModelPath dictionaryAtPath:(NSString *)dictionaryPath acousticModelAtPath:(NSString *)acousticModelPath languageModelIsJSGF:(BOOL)languageModelIsJSGF usingBestpath:(NSNumber *)usingBestpath {
    
    ps_decoder_t * localPocketSphinxDecoder = NULL;
    
    [self checkWhetherJSGFSettingOf:languageModelIsJSGF LooksCorrectForThisFilename:languageModelPath];
    [self checkValidityOfDictionaryAtPath:dictionaryPath];
    
    if(verbose_pocketsphinx == 0) {
        err_set_logfp(NULL); // If verbose_pocketsphinx isn't defined, this will quiet the output from Pocketsphinx.
    }
    
    OECommandArray *commandArrayModel = [[OECommandArray alloc] init];
    
    NSDictionary *commandDictionary = [self setUpCommandArray:commandArrayModel secondItemIsEmpty:FALSE forlanguageModel:languageModelPath dictionaryPath:dictionaryPath acousticModelPath:acousticModelPath isJSGF:languageModelIsJSGF usingBestPath:usingBestpath];
    
    if(!commandDictionary) {
        if([self openEarsLoggingIsOn]) NSLog(@"Something was wrong with the commands for this OEPocketsphinxController session, returning.");
        return NULL;
    }
    // Since we got this far, set the OEPocketsphinxController run configuration to the selected arguments and values.
    cmd_ln_t *configuration = cmd_ln_parse_r(NULL, [commandDictionary[@"cont_args_def"]bytes], (int32)[commandDictionary[@"CommandArray"] count], (char **)[commandDictionary[@"argv"]bytes], FALSE);
    
    localPocketSphinxDecoder = ps_init(configuration); // Initialize the decoder.
    self.frameRate = cmd_ln_int32_r(configuration, "-frate");
    if((self.frameRate < 10) || (self.frameRate > 300)) self.frameRate = 100; // Weird values get set to the default
    cmd_ln_free_r(configuration); // Free the configuration
    
    return localPocketSphinxDecoder;
}

#pragma mark -
#pragma mark CMN
#pragma mark -

- (void) setDecoder:(ps_decoder_t *)pocketSphinxDecoder toCmnValue:(float)previouscmn forAcousticModelAtPath:(NSString *)pathToAcousticModel {
    
    if (self.pocketSphinxDecoder->acmod->fcb->cmn_struct != NULL) {
        
        const char *floatAsChar = [[@(previouscmn)stringValue] UTF8String]; // literal of float as char
        char *c, *cc, *vallist;
        SInt32 nvals;
        
        vallist = ckd_salloc(floatAsChar);
        c = vallist;
        nvals = 0;
        while (nvals < self.pocketSphinxDecoder->acmod->fcb->cmn_struct->veclen
               && (cc = strchr(c, ',')) != NULL) {
            *cc = '\0';
            self.pocketSphinxDecoder->acmod->fcb->cmn_struct->cmn_mean[nvals] = FLOAT2MFCC(atof(c));     
            c = cc + 1;
            ++nvals;
        }
        if (nvals < self.pocketSphinxDecoder->acmod->fcb->cmn_struct->veclen && *c != '\0') {
            self.pocketSphinxDecoder->acmod->fcb->cmn_struct->cmn_mean[nvals] = FLOAT2MFCC(atof(c));
        }
        ckd_free(vallist);
    }
    
    if(self.pocketSphinxDecoder->acmod->fcb->cmn_struct != NULL) {
        self.lastCMNUsed = MFCC2FLOAT(self.pocketSphinxDecoder->acmod->fcb->cmn_struct->cmn_mean[0]);
    } else {
        self.lastCMNUsed = [self.smartCMN defaultCMNForAcousticModelAtPath:pathToAcousticModel];
    }
}

- (void) removeCmnPlist {
    [self.smartCMN removeCmnPlist];
}

-(void)setUseSmartCMNWithTestFiles:(BOOL)useSmartCMNWithTestFiles_ {
    if (_useSmartCMNWithTestFiles == useSmartCMNWithTestFiles_) return; // Don't do anything
    _useSmartCMNWithTestFiles = useSmartCMNWithTestFiles_;    
}

#pragma mark -
#pragma mark Communication
#pragma mark -

- (void) announceLoopHasStartedWithDictionaryAtPath:(NSString *)dictionaryPath {    
    if([self openEarsLoggingIsOn]) NSLog(@"Project has these words or phrases in its dictionary:\n%@", [self compileKnownWordsFromFileAtPath:dictionaryPath]);
    [OENotification performOpenEarsNotificationOnMainThread:@"PocketsphinxRecognitionLoopDidStart" withOptionalObjects:nil andKeys:nil];
    if([self openEarsLoggingIsOn]) NSLog(@"Recognition loop has started");
}

- (void) announceLoopHasEnded {
    if([self openEarsLoggingIsOn]) NSLog(@"No longer listening.");	
    [OENotification performOpenEarsNotificationOnMainThread:@"PocketsphinxDidStopListening" withOptionalObjects:nil andKeys:nil];
}

- (void) announceListening {
    if([self openEarsLoggingIsOn]) NSLog(@"Listening.");
    [OENotification performOpenEarsNotificationOnMainThread:@"PocketsphinxDidStartListening" withOptionalObjects:nil andKeys:nil];
}

- (void) announceSpeechDetection {
    if([self openEarsLoggingIsOn]) NSLog(@"Speech detected...");
    [OENotification performOpenEarsNotificationOnMainThread:@"PocketsphinxDidDetectSpeech" withOptionalObjects:nil andKeys:nil];
}

- (void) announceSpeechCompleted {
    if([self openEarsLoggingIsOn]) NSLog(@"End of speech detected...");
    [OENotification performOpenEarsNotificationOnMainThread:@"PocketsphinxDidDetectFinishedSpeech" withOptionalObjects:nil andKeys:nil];
}

- (void) announceSetupFailureForReason:(NSString *)reasonForFailure {
    if(openears_logging==1)NSLog(@"%@", reasonForFailure);
    [OENotification performOpenEarsNotificationOnMainThread:@"PocketsphinxContinuousSetupDidFail" withOptionalObjects:@[[NSString stringWithFormat:@"%@ Please turn on OELogging in order to troubleshoot this. If you need support with this issue, please turn on both OELogging and verbosePocketsphinx in order to get assistance.",reasonForFailure]] andKeys:@[@"ReasonForFailure"]];
}

- (void) announceTeardownFailureForReason:(NSString *)reasonForFailure {
    if(openears_logging==1)NSLog(@"%@", reasonForFailure);
    [OENotification performOpenEarsNotificationOnMainThread:@"PocketsphinxContinuousTeardownDidFail" withOptionalObjects:@[[NSString stringWithFormat:@"%@ Please turn on OELogging in order to troubleshoot this. If you need support with this issue, please turn on both OELogging and verbosePocketsphinx in order to get assistance.",reasonForFailure]] andKeys:@[@"ReasonForFailure"]];
}

#pragma mark -
#pragma mark Test file
#pragma mark -

- (void) testFileChange {
    if(self.audioDriver)[self.audioDriver testFileChange];    
}

#pragma mark -
#pragma mark Hypotheses
#pragma mark -

- (NSInteger) startUtterance {
    if(self.pocketSphinxDecoder->acmod->state != ACMOD_PROCESSING && self.pocketSphinxDecoder->acmod->state != ACMOD_STARTED) {
        return ps_start_utt(self.pocketSphinxDecoder);
    } else {
        if(openears_logging == 1) NSLog(@"Error: an attempt was made to start an utterance while it was already started.");
        return -1;   
    }
}

- (void) processRaw:(NSData *)buffer {
    _processing = TRUE;
    
    [self processRaw:buffer withMaximumSampleSize:kMaximumSampleSize];
    
    _processing = FALSE;    
}

- (NSInteger) getInSpeech {
    return ps_get_in_speech(self.pocketSphinxDecoder);   
}

- (void) endUtterance {
    ps_end_utt(self.pocketSphinxDecoder);
}

- (char const *) getHypothesisFromDecoder:(ps_decoder_t *)pocketSphinxDecoder withScore:(SInt32 *)recognitionScore {
    return ps_get_hyp(pocketSphinxDecoder, (int32 *)recognitionScore);
}

- (SInt32) getProbabilityFromDecoder:(ps_decoder_t *)pocketSphinxDecoder {
    return ps_get_prob(pocketSphinxDecoder);
}

- (void) getAndReturnHypothesisForDecoder:(ps_decoder_t *)pocketSphinxDecoder {
    
    SInt32 recognitionScore = 0;
    
    char const *hypothesis = [self getHypothesisFromDecoder:self.pocketSphinxDecoder withScore:&recognitionScore];
    
    SInt32 probability = [self getProbabilityFromDecoder:self.pocketSphinxDecoder];
    
    if(hypothesis == NULL) { // We don't pass a truly null hyp through here because we can't use it to initialize an NSString from a UTF8 string. If we have received a null hyp we convert it to a zero-length string.
        hypothesis = "";
    }
    
    NSString *hypothesisString = nil;
    
    if(returner == 0) {
        
        NSMutableString *builtUpHypString = [[NSMutableString alloc] init];
        
        NSArray *array = [[NSString stringWithCString:hypothesis encoding:NSUTF8StringEncoding] componentsSeparatedByString:@" "];
        
        for(NSString *string in array) {
            if([string rangeOfString:@"___"].location == NSNotFound) {
                [builtUpHypString appendString:[NSString stringWithFormat:@"%@ ",string]];
            }
        }
        
        if([builtUpHypString length] >= 1) {
            
            NSString *finalString = [builtUpHypString stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
            
            if([finalString length] > 0) {
                hypothesisString = finalString;
                
            } else {
                hypothesisString = @" ";  
            }
            
        } else {
            hypothesisString = @" "; 
        }
        
    } else {
        hypothesisString = [NSString stringWithCString:hypothesis encoding:NSUTF8StringEncoding];
    }
    
    NSString *detokenizedHypothesisString = [hypothesisString stringByReplacingOccurrencesOfString:@"#^#" withString:@" "];
    NSString *probabilityString = [NSString stringWithFormat:@"%ld",(long)probability];
    NSString *uttidString = [NSString stringWithFormat:@"%lu",(long)self.utteranceID++];
    NSArray *hypothesisObjectsArray = @[detokenizedHypothesisString,probabilityString,uttidString];
    NSArray *hypothesisKeysArray = @[@"Hypothesis",@"RecognitionScore",@"UtteranceID"];
    
    if([self openEarsLoggingIsOn]) NSLog(@"Pocketsphinx heard \"%@\" with a score of (%@) and an utterance ID of %@.", detokenizedHypothesisString, probabilityString, uttidString);
    
    if(self.returnNullHypotheses) { // We have been asked to return all null hyps
        [OENotification performOpenEarsNotificationOnMainThread:@"PocketsphinxDidReceiveHypothesis" withOptionalObjects:hypothesisObjectsArray andKeys:hypothesisKeysArray]; 
        
    } else if(([detokenizedHypothesisString length] > 0) && ![detokenizedHypothesisString isEqualToString:@" "]) { // We haven't been asked to return all null hyps but this hyp isn't null
        
        [OENotification performOpenEarsNotificationOnMainThread:@"PocketsphinxDidReceiveHypothesis" withOptionalObjects:hypothesisObjectsArray andKeys:hypothesisKeysArray]; 
        
    } else {
        if([self openEarsLoggingIsOn]) NSLog(@"Hypothesis was null so we aren't returning it. If you want null hypotheses to also be returned, set OEPocketsphinxController's property returnNullHypotheses to TRUE before starting OEPocketsphinxController."); // Hyp is null, don't return.
    }
    
    if(self.returnNbest) { // Let's get n-best if needed
        [self getNbestForDecoder:self.pocketSphinxDecoder withHypothesis:hypothesis andRecognitionScore:recognitionScore];
    }
}

- (ps_nbest_t *) nBest {
    return ps_nbest(self.pocketSphinxDecoder, 0, -1, NULL, NULL);
}

- (ps_nbest_t *)nBestNext:(ps_nbest_t *)nbest {
    return ps_nbest_next(nbest);
}

- (char const *)nBestHypothesis:(ps_nbest_t *)nbest withScore:(int32 *)recognitionScore {
    return ps_nbest_hyp(nbest, recognitionScore);
}

- (void) nBestFree:(ps_nbest_t *)nbest {
    ps_nbest_free(nbest);   
}

- (void) getNbestForDecoder:(ps_decoder_t *)pocketSphinxDecoder withHypothesis:(char const *)hypothesis andRecognitionScore:(int32)recognitionScore {
    
    NSMutableArray *nbestMutableArray = [[NSMutableArray alloc] init];
    
    ps_nbest_t *nbest = [self nBest];
        
    ps_nbest_t *next = NULL;
    
    for (int i = 0; i < self.nBestNumber; i++) {
        next = [self nBestNext:nbest];
        if (next) {
            
            hypothesis = [self nBestHypothesis:nbest withScore:&recognitionScore];

            if(hypothesis == NULL) {
                hypothesis = "";
            }
            
            NSString *hypothesisString = nil;
            
            if(returner == 0) {
                
                NSMutableString *builtUpHypString = [[NSMutableString alloc] init];
                
                NSArray *array = [[NSString stringWithCString:hypothesis encoding:NSUTF8StringEncoding] componentsSeparatedByString:@" "];
                
                for(NSString *string in array) {
                    if([string rangeOfString:@"___"].location == NSNotFound) {
                        [builtUpHypString appendString:[NSString stringWithFormat:@"%@ ",string]];
                    }
                }
                
                if([builtUpHypString length] >= 1) {
                    
                    NSString *finalString = [builtUpHypString stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
                    
                    if([finalString length] > 0) {
                        hypothesisString = finalString;
                        
                    } else {
                        hypothesisString = @" ";  
                    }
                    
                } else {
                    hypothesisString = @" "; 
                }
                
            } else {
                hypothesisString = [NSString stringWithCString:hypothesis encoding:NSUTF8StringEncoding];
            }
            
            NSString *detokenizedHypothesisString = [hypothesisString stringByReplacingOccurrencesOfString:@"#^#" withString:@" "];
            [nbestMutableArray addObject:@{@"Hypothesis": detokenizedHypothesisString,@"Score": @(recognitionScore)}];
            
        } else {
            break;
        }
    }
    
    if (next) {
        [self nBestFree:nbest];
    }
    
    NSArray *nBesthypothesisObjectsArray = @[nbestMutableArray];
    NSArray *nBesthypothesisKeysArray = @[@"NbestHypothesisArray"];
    
    [OENotification performOpenEarsNotificationOnMainThread:@"PocketsphinxDidReceiveNbestHypothesisArray" withOptionalObjects:(NSArray *)nBesthypothesisObjectsArray andKeys:(NSArray *)nBesthypothesisKeysArray];
    
}

- (void) processRaw:(NSData *)buffer withMaximumSampleSize:(NSInteger)maximumSampleSize { // Limit any one pass of process_raw to the preferred maximum of 2048 samples.
    
    NSInteger numberOfBytes = [buffer length];
    NSInteger maximumBytes = maximumSampleSize * 2;
    
    if(numberOfBytes > maximumBytes) {
        NSInteger numberOfByteSegments = (NSInteger)numberOfBytes/maximumBytes;
        NSInteger lastByteSet = numberOfBytes % maximumBytes;
        
        for (int i = 0; i < numberOfByteSegments; i++) {
            ps_process_raw(self.pocketSphinxDecoder, (SInt16 *)[[buffer subdataWithRange:NSMakeRange(i * maximumBytes, maximumBytes)]bytes], maximumSampleSize, FALSE, FALSE);
        }
        
        if(lastByteSet > 0) {
            ps_process_raw(self.pocketSphinxDecoder, (SInt16 *)[[buffer subdataWithRange:NSMakeRange([buffer length] - lastByteSet, lastByteSet)]bytes], lastByteSet/2, FALSE, FALSE);            
        }
        
    } else {
        ps_process_raw(self.pocketSphinxDecoder, (SInt16 *)[buffer bytes], [buffer length]/2, FALSE, FALSE);
        
    }
}


- (void) runRecognitionOnWavFileAtPath:(NSString *)wavPath usingLanguageModelAtPath:(NSString *)languageModelPath dictionaryAtPath:(NSString *)dictionaryPath acousticModelAtPath:(NSString *)acousticModelPath languageModelIsJSGF:(BOOL)languageModelIsJSGF { // Listen to a single recording which already exists.
    
    if((self.pocketSphinxDecoder = [self initializeDecoderForLanguageModelAtPath:languageModelPath dictionaryAtPath:dictionaryPath acousticModelAtPath:acousticModelPath languageModelIsJSGF:languageModelIsJSGF usingBestpath:nil]) == NULL) return; // Init and return if null.
    
    [self startUtterance];
    
    NSData *wavData = [NSData dataWithContentsOfFile:wavPath]; // WAV to data, we'll process it below without its header.
    
    NSData *buffer = [wavData subdataWithRange:NSMakeRange(44, ([wavData length] - 44))];
    
    [self processRaw:buffer withMaximumSampleSize:kMaximumSampleSize];   
    
    [self endUtterance];
    
    [self getAndReturnHypothesisForDecoder:self.pocketSphinxDecoder]; // Get the hypothesis
    
    ps_free(self.pocketSphinxDecoder); // Free the decoder.
}

#pragma mark -
#pragma mark Engine control
#pragma mark -

- (void) listeningSessionWithLanguageModelAtPath:(NSString *)languageModelPath dictionaryAtPath:(NSString *)dictionaryPath acousticModelAtPath:(NSString *)acousticModelPath languageModelIsJSGF:(BOOL)languageModelIsJSGF { // The big recognition loop.
    
    _stopping = FALSE;
    self.safeToCallStart = FALSE; // This should always be the first setting in here.
    
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(availableBuffer:) name:@"AvailableUnsuspendedBuffer" object:nil];
    
    if([self openEarsLoggingIsOn]) NSLog(@"Starting listening.");
    
    dispatch_source_t heartbeatTimerSource = dispatch_source_create(DISPATCH_SOURCE_TYPE_TIMER, 0, 0, dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0));
    dispatch_source_set_timer(heartbeatTimerSource, dispatch_time(DISPATCH_TIME_NOW, 0), kBufferLength * NSEC_PER_SEC, kBufferLengthDelta * NSEC_PER_SEC);
    dispatch_source_set_event_handler(heartbeatTimerSource, ^{
        [self heartBeat];
    });
    dispatch_resume(heartbeatTimerSource);
    _heartbeatTimer = heartbeatTimerSource;
    
    self.pocketSphinxDecoder = NULL; // The Pocketsphinx decoder which will perform the actual speech recognition on recorded speech.
    self.audioDriver.audioMode = self.audioMode;
    self.acousticModelPath = acousticModelPath;
    self.utteranceState = kUtteranceStateUnstarted;
    self.requestToResume = FALSE;
    
    if([self openEarsLoggingIsOn])NSLog(@"about to set up audio session");
    
    self.audioDriver.disableBluetooth = self.disableBluetooth;
    self.audioDriver.disableMixing = self.disableMixing;
    
    NSError *error = [self.audioDriver setupAudioSession];
    if(error){
        [self announceSetupFailureForReason:[NSString stringWithFormat:@"Error setting up audio session: %@", error]];
        return;
    }
    error = nil;
    error = [self.audioDriver setupAudioUnit];
    if(error) {
        [self announceSetupFailureForReason:[NSString stringWithFormat:@"error setting up io unit: %@", error]];
        return;
    }
    error = nil;
    
    if(self.pathToTestFile) self.audioDriver.pathToTestFile = self.pathToTestFile;
    
    if(self.audioDriver.audioUnitState == kAudioUnitIsStopped) {
        error =  [self.audioDriver startAudioUnit];
        if(error) {
            [self announceSetupFailureForReason:[NSString stringWithFormat:@"Error starting io unit: %@", error]];
            return;
        }
        if([self openEarsLoggingIsOn])NSLog(@"done starting audio unit");
    }
    if((self.pocketSphinxDecoder = [self initializeDecoderForLanguageModelAtPath:languageModelPath dictionaryAtPath:dictionaryPath acousticModelAtPath:acousticModelPath languageModelIsJSGF:languageModelIsJSGF usingBestpath:nil]) == NULL) {
        [self announceSetupFailureForReason:@"Error: it wasn't possible to initialize the pocketsphinx decoder."];
        return;
    }
    
    self.shouldUseSmartCMN = TRUE;
    if(self.pathToTestFile && !self.useSmartCMNWithTestFiles) self.shouldUseSmartCMN = FALSE;
    if(self.shouldUseSmartCMN) { // If we're testing we don't use SmartCMN unless specifically asked to.
        [self setDecoder:self.pocketSphinxDecoder toCmnValue:[self.smartCMN smartCmnValuesForRoute:[self.audioDriver getCurrentRoute] forAcousticModelAtPath:acousticModelPath withModelName:NSStringFromClass([self class])] forAcousticModelAtPath:acousticModelPath]; // If we have previous cmn init values for this app, device, route and acoustic model, let's use them since they generally have to be more accurate than a naive init value
    }    
    [self announceListening];
    
    self.safeToCallStop = TRUE;
    
    self.isListening = TRUE;
    
    [self announceLoopHasStartedWithDictionaryAtPath:dictionaryPath];
}

- (NSError *) stopListening {
    
    if(_stopping || !self.isListening) {
        NSString *failureReason = @"Error: stopListening was called while a listening session was already in the process of being stopped, or at a time when no listening session was in progress. Please only call stopListening once and for a listening session which is known to be in progress.";
        [self announceTeardownFailureForReason:failureReason];  
        return [NSError errorWithDomain:@"com.politepix.openears" code:-1 userInfo:@{NSLocalizedDescriptionKey: failureReason}];
    }
    
    _stopping = TRUE;
    
    self.safeToCallStop = FALSE;
    
    dispatch_source_cancel(_heartbeatTimer);
    
    if([self openEarsLoggingIsOn]) NSLog(@"Stopping listening.");
    
    [OEDynamicMethod callDynamicMethodFromName:@"continuousCleanUp" onObject:self];
    
    NSError *error = nil;
    
    if(self.audioDriver.audioUnitState == kAudioUnitIsStarted) { // If this returns an error, we want to basically return an unstopped state and say try again.
        error = [self.audioDriver stopAudioUnit];
        if(error) {
            [self announceTeardownFailureForReason:[NSString stringWithFormat:@"Error: there was a problem stopping the audio unit: %@. One reason this could have happened is because stop was called on a session that was already in the process of being stopped. Please try again once this session is known to be in progress.", error]];
            return error;
        }
    }
    
    error = [self.audioDriver teardownAudioUnit];
    
    if(error) { // If this happens we can't really stop and return because either way, we'll have an inconsistent state that we can't easily query (either a stopped but unreleased audio unit or an audio unit of ??? started status if we try to restart it here and back away quietly). Better to just keep going and try to let go of everything else in a normal way; at least then we know that only one Core Audio thing is in an inconsistent state and we know which thing it is and which state.
        error = [self.audioDriver startAudioUnit];
        [self announceTeardownFailureForReason:[NSString stringWithFormat:@"Error: there was a problem tearing down the audio unit: %@.", error]];
    }
    
    if(self.pocketSphinxDecoder != NULL && [self shouldUseSmartCMN]) { // I check null for semantic reasons – this is a C struct, not an Objective-C object. We don't do smart cmn when testing unless specifically asked to.
        [self.smartCMN finalizeCmn:MFCC2FLOAT(self.pocketSphinxDecoder->acmod->fcb->cmn_struct->cmn_mean[0]) atRoute:[self.audioDriver getCurrentRoute] forAcousticModelAtPath:self.acousticModelPath withModelName:NSStringFromClass([self class])]; // If we have a cmn value here at the end, it is always going to be a better value for this particular device, user and route than the naive init value, so we will save it for the next session run with this route and acoustic model and use it as the init value
    } // This must, must, must be done before resigning the audio session or it will never have relevant routing values in it so it won't do anything.
    
    error = [self.audioDriver teardownAudioSession];    
    if(error) [self announceTeardownFailureForReason:[NSString stringWithFormat:@"Error: there was a problem tearing down the audio session: %@.", error]]; // Not a stopping error since a leftover audio session isn't really an issue.
    
    @synchronized(self) {
        [self.bufferAccumulator setLength:0];
    }
    
    [[NSNotificationCenter defaultCenter] removeObserver:self name:@"AvailableUnsuspendedBuffer" object:nil];
    
    self.isListening = FALSE;
    
    BOOL utteranceStopAlreadyPerformed = FALSE;
    BOOL safeToFreeDecoder = TRUE;
    
    // Carefully check to see if the decoder is done doing things so we don't free it while it's busy.
    
    if(self.pocketSphinxDecoder != NULL) {
        
        NSTimeInterval stuckEndingTimer = [NSDate timeIntervalSinceReferenceDate];
        
        while((_processing || // While raw processing is happening, or
               (!self.pocketSphinxDecoder->search->done && self.utteranceState != kUtteranceStateEnded) || // an utterance is in progress, or
               self.pocketSphinxDecoder->search->inprogress) // a search is underway, and also
              && self.utteranceState != kUtteranceStateUnstarted) { // this isn't just an unstarted utterance from a very early stop.

            if(_processing && openears_logging == 1)NSLog(@"Unable to stop listening because because raw audio processing is still in progress; trying again."); // Explain what's going on,
            if(!self.pocketSphinxDecoder->search->done && openears_logging == 1)NSLog(@"Unable to stop listening because because an utterance is still in progress; trying again.");
            if(self.pocketSphinxDecoder->search->inprogress && openears_logging == 1)NSLog(@"Unable to stop listening because a search is still in progress; trying again.");
            
            [NSThread sleepForTimeInterval:.05]; // wait briefly before next try,
            
            if(!_processing && !self.pocketSphinxDecoder->search->inprogress && !self.pocketSphinxDecoder->search->done && !utteranceStopAlreadyPerformed) { // make one single attempt to end an utterance if that is the hangup,
                
                if(openears_logging == 1)NSLog(@"Attempting to stop an unstopped utterance so listening can stop.");
                
                [self performSingularStopForDecoder:self.pocketSphinxDecoder];
                
                utteranceStopAlreadyPerformed = TRUE;
            }
            
            if([NSDate timeIntervalSinceReferenceDate] - stuckEndingTimer > 10.0) { // See if we've been in here longer than 10 seconds and if so prepare to exit non-optimally because this could be a stuck search.
                
                safeToFreeDecoder = FALSE;
                if(openears_logging == 1)NSLog(@"Because the utterance couldn't be stopped in a reasonable timeframe, we will break but prefer to let the decoder leak than force an exception by freeing it when it's unsafe. If you see this message regularly, it is a bug, so please report the specific circumstances under which you are regularly seeing it.");
                break; // If this has turned into an unnatural timeframe, take our chances and break.
            }
            
            // Otherwise loop back and try again.
        }  
        
        if(safeToFreeDecoder) { // If for some reason the utterance/search/processing couldn't be stopped in 10 seconds, it isn't safe to free the decoder so we will stop audio without freeing the decoder, as the lesser of two evils.
            
            ps_free(self.pocketSphinxDecoder);
            self.pocketSphinxDecoder = NULL;
            
        }
    }
    
    self.speechFramesFound = FALSE;
    self.speechAlreadyInProgress = FALSE;
    self.utteranceState = kUtteranceStateUnstarted;
    self.requestToResume = FALSE;
    
    [self announceLoopHasEnded];
    
    self.safeToCallStart = TRUE;
    
    return error;
}

@end
