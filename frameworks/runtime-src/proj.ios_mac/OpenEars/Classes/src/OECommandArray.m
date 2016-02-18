//
//  OECommandArray.m
//  OpenEars
//
//
//  Copyright Politepix UG (haftungsbeschränkt) 2014. All rights reserved.
//  http://www.politepix.com
//  Contact at http://www.politepix.com/contact
//
//  this file is licensed under the Politepix Shared Source license found 
//  found in the root of the source distribution. Please see the file "Version.txt" in the root of 
//  the source distribution for the version number of this OpenEars package.

#import "OECommandArray.h"
#import "pocketsphinx.h"
#import "OEPocketsphinxRunConfig.h"
#import "OERuntimeVerbosity.h"

@implementation OECommandArray

extern int openears_logging;

- (NSArray *)commandArrayForlanguageModel:(NSString *)languageModelPath dictionaryPath:(NSString *)dictionaryPath acousticModelPath:(NSString *)acousticModelPath isJSGF:(BOOL)languageModelIsJSGF usesBestPath:(BOOL)usesBestPath removingNoise:(BOOL)removeNoise removingSilence:(BOOL)removeSilence vadThreshold:(float)vadThreshold secondsOfSilence:(float)secondsOfSilence secondsOfSpeech:(float)secondsOfSpeech {
    
    if(secondsOfSpeech < 0.05 || secondsOfSpeech > 0.5 || secondsOfSpeech != secondsOfSpeech) secondsOfSpeech = 0.1; // If seconds of speech is too high, too low, or irrational, set it to the default here.
    
    NSString *languageModelToUse = nil;
    
    NSString *removingNoise = nil;
    NSString *removingSilence = nil;
    
    if(removeNoise) {
        removingNoise = @"yes";
    } else {
        removingNoise = @"no";
    }

    if(removeSilence) {
        removingSilence = @"yes";
    } else {
        removingSilence = @"no";        
    }
    
    float languageWeight;
    if(languageModelIsJSGF) {
        languageModelToUse = @"-jsgf";
        languageWeight = kJSGFLanguageWeight; // I think that the language weight for JSGF was the source of a lot of issues
    } else {
        languageModelToUse = @"-lm";
        languageWeight = 6.5;
    }
    
    NSString *bestPathValueToUse = @"yes";
    
    if(!usesBestPath) bestPathValueToUse = @"no";
    
    NSArray *commandArray = [NSArray arrayWithObjects: // This is an array that is used to set up the run arguments for Pocketsphinx. 
                             // Never change any of the values here directly.  They can be changed using the file PocketsphinxRunConfig.h (although you shouldn't 
                             // change anything there unless you are absolutely 100% clear on why you'd want to and what the outcome will be).
                             // See PocketsphinxRunConfig.h for explanations of these constants and the run arguments they correspond to.
                             languageModelToUse, languageModelPath,		 
#ifdef kLOGSPEC
                             @"-logspec", kLOGSPEC, ,
#endif
#ifdef kSMOOTHSPEC
                             @"-smoothspec", kSMOOTHSPEC, ,
#endif
#ifdef kTRANSFORM
                             @"-transform", kTRANSFORM,
#endif
#ifdef kALPHA
                             @"-alpha", kALPHA,
#endif
#ifdef kSAMPRATE
                             @"-samprate", kSAMPRATE,
#endif
#ifdef kFRATE
                             @"-frate", kFRATE,
#endif
#ifdef kWLEN
                             @"-wlen", kWLEN,
#endif
#ifdef kNFFT
                             @"-nfft", kNFFT,
#endif
#ifdef kNFILT
                             @"-nfilt", kNFILT,
#endif
#ifdef kLOWERF
                             @"-lowerf", kLOWERF,
#endif
#ifdef kUPPERF
                             @"-upperf", kUPPERF,
#endif
#ifdef kUNIT_AREA
                             @"-unit_area", kUNIT_AREA,
#endif
#ifdef kROUND_FILTERS
                             @"-round_filters", kROUND_FILTERS,
#endif
#ifdef kNCEP
                             @"-ncep", kNCEP,
#endif
#ifdef kDOUBLEBW
                             @"-doublebw", kDOUBLEBW,
#endif
#ifdef kLIFTER
                             @"-lifter", kLIFTER,
#endif
//#ifdef kVAD_PRESPEECH
                             @"-vad_prespeech", [NSString stringWithFormat:@"%d",(int)(100.0 * secondsOfSpeech)], // It would be better to have this 100.0 be the real frame rate, but we don't know it at this point. Different frame rates here are liable to change these real-world durations expressed in OpenEars' API as floats. This case hasn't come up yet so the contortions needed to solve this are currently considered YAGNI, but can be reexamined in the future.
//#endif
//#ifdef kVAD_POSTSPEECH
                             @"-vad_postspeech", [NSString stringWithFormat:@"%d",(int)(100.0 * secondsOfSilence)],
//#endif
//#ifdef kVAD_THRESHOLD
                             @"-vad_threshold", [NSString stringWithFormat:@"%f",vadThreshold],
//#endif
#ifdef kINPUT_ENDIAN
                             @"-input_endian", kINPUT_ENDIAN,
#endif
#ifdef kWARP_TYPE
                             @"-warp_type", kWARP_TYPE,
#endif
#ifdef kWARP_PARAMS
                             @"-warp_params", kWARP_PARAMS,
#endif
#ifdef kDITHER
                             @"-dither", kDITHER,
#endif
#ifdef kSEED
                             @"-seed", kSEED,
#endif
#ifdef kREMOVE_DC
                             @"-remove_dc", kREMOVE_DC,
#endif
//#ifdef kREMOVE_NOISE
                             @"-remove_noise", removingNoise,
//#endif
//#ifdef kREMOVE_SILENCE
                             @"-remove_silence", removingSilence,
//#endif                             
#ifdef kFEAT
                             @"-feat", kFEAT,
#endif
#ifdef kCEPLEN
                             @"-ceplen", kCEPLEN,
#endif
#ifdef kCMN
                             @"-cmn", kCMN,
#endif
#ifdef kCMNINIT
                             @"-cmninit", kCMNINIT,
#endif
#ifdef kVARNORM
                             @"-varnorm", kVARNORM,
#endif
#ifdef kAGC
                             @"-agc", kAGC,
#endif
#ifdef kAGCTHRESH
                             @"-agcthresh", kAGCTHRESH,
#endif
#ifdef kLDA
                             @"-lda", kLDA,
#endif
#ifdef kLDADIM
                             @"-ldadim", kLDADIM,
#endif
#ifdef kSVSPEC
                             @"-svspec", kSVSPEC,
#endif
#ifdef kBEAM
                             @"-beam", kBEAM,
#endif
#ifdef kWBEAM
                             @"-wbeam", kWBEAM,
#endif
#ifdef kPBEAM
                             @"-pbeam", kPBEAM,
#endif
#ifdef kLPBEAM
                             @"-lpbeam", kLPBEAM,
#endif
#ifdef kLPONLYBEAM
                             @"-lponlybeam", kLPONLYBEAM,
#endif
#ifdef kFWDFLATBEAM
                             @"-fwdflatbeam", kFWDFLATBEAM,
#endif
#ifdef kFWDFLATWBEAM
                             @"-fwdflatwbeam", kFWDFLATWBEAM,
#endif
#ifdef kPL_WINDOW
                             @"-pl_window", kPL_WINDOW,
#endif
#ifdef kPL_BEAM
                             @"-pl_beam", kPL_BEAM,
#endif
#ifdef kPL_PBEAM
                             @"-pl_pbeam", kPL_PBEAM,
#endif
#ifdef kCOMPALLSEN
                             @"-compallsen", kCOMPALLSEN,
#endif
#ifdef kFWDTREE
                             @"-fwdtree", kFWDTREE,
#endif
#ifdef kFWDFLAT
                             @"-fwdflat", kFWDFLAT,
#endif
//#ifdef kBESTPATH // Always pass a value to bestpath
                             @"-bestpath", bestPathValueToUse,
//#endif
#ifdef kBACKTRACE
                             @"-backtrace", kBACKTRACE,
#endif
#ifdef kLATSIZE
                             @"-latsize", kLATSIZE,
#endif
#ifdef kMAXWPF
                             @"-maxwpf", kMAXWPF,
#endif
#ifdef kMAXHMMPF
                             @"-maxhmmpf", kMAXHMMPF,
#endif
#ifdef kMIN_ENDFR
                             @"-min_endfr", kMIN_ENDFR ,
#endif
#ifdef kFWDFLATEFWID
                             @"-fwdflatefwid", kFWDFLATEFWID,
#endif
#ifdef kFWDFLATSFWIN
                             @"-fwdflatsfwin", kFWDFLATSFWIN,
#endif
#ifdef kKEYPHRASE
                             @"-keyphrase", kKEYPHRASE,
#endif
#ifdef kKWS
                             @"-kws", kKWS,
#endif
#ifdef kKWS_PLP
                             @"-kws_plp", kKWS_PLP,
#endif
#ifdef kKWS_THRESHOLD
                             @"-kws_threshold", kKWS_THRESHOLD,
#endif
#ifdef kFSG
                             @"-fsg", kFSG,
#endif

#ifdef kTOPRULE
                             @"-toprule", kTOPRULE,
#endif
#ifdef kFSGUSEALTPRON
                             @"-fsgusealtpron", kFSGUSEALTPRON,
#endif
#ifdef kFSGUSEFILLER
                             @"-fsgusefiller", kFSGUSEFILLER,
#endif
#ifdef kALLPHONE
                             @"-allphone", kALLPHONE,
#endif
#ifdef kALLPHONE_CI
                             @"-allphone_ci", kALLPHONE_CI,
#endif

#ifdef kLMCTL
                             @"-lmctl", kLMCTL,
#endif
#ifdef kLMNAME
                             @"-lmname", kLMNAME,
#endif

                             @"-lw",	[NSString stringWithFormat:@"%f", languageWeight],

#ifdef kFWDFLATLW
                             @"-fwdflatlw", kFWDFLATLW,
#endif
#ifdef kBESTPATHLW
                             @"-bestpathlw", kBESTPATHLW,
#endif
#ifdef kASCALE
                             @"-ascale", kASCALE,
#endif
#ifdef kWIP
                             @"-wip", kWIP,
#endif
#ifdef kNWPEN
                             @"-nwpen", kNWPEN,
#endif
#ifdef kPIP
                             @"-pip", kPIP,
#endif
#ifdef kUW
                             @"-uw", kUW,
#endif
#ifdef kSILPROB
                             @"-silprob", kSILPROB,
#endif
#ifdef kFILLPROB
                             @"-fillprob", kFILLPROB,
#endif
#ifdef kBGHIST
                             @"-bghist", kBGHIST,
#endif
#ifdef kLEXTREEDUMP
                             @"-lextreedump", kLEXTREEDUMP,
#endif

                             @"-dict", dictionaryPath,

#ifdef kFDICT
                             @"-fdict",  kFDICT,
#endif                             
#ifdef kDICTCASE
                             @"-dictcase", kDICTCASE,
#endif
#ifdef kMAXNEWOOV
                             @"-maxnewoov", kMAXNEWOOV,
#endif
#ifdef kUSEWDPHONES
                             @"-usewdphones", kUSEWDPHONES,
#endif

                             @"-hmm", acousticModelPath,

#ifdef kFEATPARAMS
                             @"-featparams", kFEATPARAMS,
#endif
#ifdef kMDEF
                             @"-mdef", kMDEF,
#endif
#ifdef kSENMGAU
                             @"-senmgau", kSENMGAU,
#endif
#ifdef kTMAT
                             @"-tmat", kTMAT,
#endif
#ifdef kTMATFLOOR
                             @"-tmatfloor", kTMATFLOOR,
#endif
#ifdef kMEAN
                             @"-mean", kMEAN,
#endif
#ifdef kVAR
                             @"-var", kVAR,
#endif
#ifdef kVARFLOOR
                             @"-varfloor", kVARFLOOR,
#endif
#ifdef kMIXW
                             @"-mixw", kMIXW,
#endif
#ifdef kMIXWFLOOR
                             @"-mixwfloor", kMIXWFLOOR,
#endif
#ifdef kAW
                             @"-aw", kAW,
#endif
#ifdef kSENDUMP
                             @"-sendump", kSENDUMP,
#endif
#ifdef kMLLR
                             @"-mllr", kMLLR,
#endif
#ifdef kMMAP
                             @"-mmap", kMMAP,
#endif
#ifdef kDS
                             @"-ds", kDS,
#endif
#ifdef kTOPN
                             @"-topn", kTOPN,
#endif
#ifdef kTOPN_BEAM
                             @"-topn_beam", kTOPN_BEAM,
#endif
#ifdef kKDTREE
                             @"-kdtree", kKDTREE,
#endif
#ifdef kKDMAXDEPTH
                             @"-kdmaxdepth", kKDMAXDEPTH,
#endif
#ifdef kKDMAXBBI
                             @"-kdmaxbbi", kKDMAXBBI,
#endif
#ifdef kLOGBASE
                             @"-logbase", kLOGBASE,
#endif
                             nil];
	
    
	return commandArray;
}

@end
