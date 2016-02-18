
 //  OEAudioUtilities
 //  Copyright Politepix UG (haftungsbeschränkt) 2014. All rights reserved.
 //  http://www.politepix.com
 //  Contact at http://www.politepix.com/contact
 //
 //  this file is licensed under the Politepix Shared Source license found 
 //  found in the root of the source distribution. Please see the file "Version.txt" in the root of 
 //  the source distribution for the version number of this OpenEars package.
 
#import "OEAudioUtilities.h"
#import "OERuntimeVerbosity.h"

extern int openears_logging;

void reportAudioUnitError(OSStatus error) {
    
    switch (error) {
        case kAudioUnitErr_InvalidProperty:
            if(openears_logging == 1) NSLog(@"Audio Unit render error: kAudioUnitErr_InvalidProperty");
            break;
        case kAudioUnitErr_InvalidParameter:
            if(openears_logging == 1) NSLog(@"Audio Unit render error: kAudioUnitErr_InvalidParameter");
            break;
        case kAudioUnitErr_InvalidElement:
            if(openears_logging == 1) NSLog(@"Audio Unit render error: kAudioUnitErr_InvalidElement");
            break;
        case kAudioUnitErr_NoConnection:
            if(openears_logging == 1) NSLog(@"Audio Unit render error: kAudioUnitErr_NoConnection");
            break;
        case kAudioUnitErr_FailedInitialization:
            if(openears_logging == 1) NSLog(@"Audio Unit render error: kAudioUnitErr_FailedInitialization");
            break;
        case kAudioUnitErr_TooManyFramesToProcess:
            if(openears_logging == 1) NSLog(@"Audio Unit render error: kAudioUnitErr_TooManyFramesToProcess");
            break;
        case kAudioUnitErr_InvalidFile:
            if(openears_logging == 1) NSLog(@"Audio Unit render error: kAudioUnitErr_InvalidFile");
            break;
        case kAudioUnitErr_FormatNotSupported:
            if(openears_logging == 1) NSLog(@"Audio Unit render error: kAudioUnitErr_FormatNotSupported");
            break;
        case kAudioUnitErr_Uninitialized:
            if(openears_logging == 1) NSLog(@"Audio Unit render error: kAudioUnitErr_Uninitialized");
            break;
        case kAudioUnitErr_InvalidScope:
            if(openears_logging == 1) NSLog(@"Audio Unit render error: kAudioUnitErr_InvalidScope");
            break;
        case kAudioUnitErr_PropertyNotWritable:
            if(openears_logging == 1) NSLog(@"Audio Unit render error: kAudioUnitErr_PropertyNotWritable");
            break;
        case kAudioUnitErr_CannotDoInCurrentContext:
            if(openears_logging == 1) NSLog(@"Audio Unit render error: kAudioUnitErr_CannotDoInCurrentContext");
            break;
        case kAudioUnitErr_InvalidPropertyValue:
            if(openears_logging == 1) NSLog(@"Audio Unit render error: kAudioUnitErr_InvalidPropertyValue");
            break;
        case kAudioUnitErr_PropertyNotInUse:
            if(openears_logging == 1) NSLog(@"Audio Unit render error: kAudioUnitErr_PropertyNotInUse");
            break;
        case kAudioUnitErr_InvalidOfflineRender:
            if(openears_logging == 1) NSLog(@"Audio Unit render error: kAudioUnitErr_InvalidOfflineRender");
            break;
        case kAudioUnitErr_Unauthorized:
            if(openears_logging == 1) NSLog(@"Audio Unit render error: kAudioUnitErr_Unauthorized");
            break;
        case -50:
            if(openears_logging == 1) NSLog(@"Audio Unit render error: error in user parameter list (-50)");
            break;														
        default:
            if(openears_logging == 1) ReportError(error, @"Error in render callback");
            break;
    }
    
}

float getInputDecibels(SInt16 * samples, UInt32 inNumberFrames) {
    
    Float32 decibels = kDBOffset; // When we have no signal we'll leave this on the lowest setting
    Float32 currentFilteredValueOfSampleAmplitude; 
    Float32 previousFilteredValueOfSampleAmplitude = 0.0; // We'll need these in the low-pass filter
    Float32 peakValue = kDBOffset; // We'll end up storing the peak value here
    
    for (int i=0; i < inNumberFrames; i=i+10) { // We're incrementing this by 10 because there's actually too much info here for us for a conventional UI timeslice and it's a cheap way to save CPU
        
        Float32 absoluteValueOfSampleAmplitude = abs(samples[i]); //Step 2: for each sample, get its amplitude's absolute value.
        
        // Step 3: for each sample's absolute value, run it through a simple low-pass filter
        // Begin low-pass filter
        currentFilteredValueOfSampleAmplitude = kLowPassFilterTimeSlice * absoluteValueOfSampleAmplitude + (1.0 - kLowPassFilterTimeSlice) * previousFilteredValueOfSampleAmplitude;
        previousFilteredValueOfSampleAmplitude = currentFilteredValueOfSampleAmplitude;
        Float32 amplitudeToConvertToDB = currentFilteredValueOfSampleAmplitude;
        // End low-pass filter
        
        Float32 sampleDB = 20.0*log10(amplitudeToConvertToDB) + kDBOffset;
        // Step 4: for each sample's filtered absolute value, convert it into decibels
        // Step 5: for each sample's filtered absolute value in decibels, add an offset value that normalizes the clipping point of the device to zero.
        
        if((sampleDB == sampleDB) && (sampleDB <= DBL_MAX && sampleDB >= -DBL_MAX)) { // if it's a rational number and isn't infinite
            
            if(sampleDB > peakValue) peakValue = sampleDB; // Step 6: keep the highest value you find.
            decibels = peakValue; // final value
        }
    }

    return decibels;
}

static char *FormatOSStatusError(char *stringToReturn, OSStatus statuserror) {
    
    *(UInt32 *)(stringToReturn + 1) = CFSwapInt32HostToBig(statuserror);    
    
    char *fiveLetters = (char *)malloc(5); // Displeasing workaround to false-positive static analysis warning.
    memcpy(fiveLetters,stringToReturn,5);
    
    if (isprint(fiveLetters[1]) && isprint(fiveLetters[2]) && isprint(fiveLetters[3]) && isprint(fiveLetters[4])) { 
      
        stringToReturn[0] = stringToReturn[5] = '\'';
        stringToReturn[6] = '\0';
    } else {
        sprintf(stringToReturn, "%d", (int)statuserror);
        NSError *localerror = [NSError errorWithDomain:NSOSStatusErrorDomain code:statuserror userInfo:nil];
        NSLog(@"Error: %@", localerror);
    }
    free(fiveLetters);
    return stringToReturn;
}

void ReportError(OSStatus error, NSString *description) {
    char *errorString = (char *) malloc(100);
    errorString[2] = 0;
    FormatOSStatusError(errorString,error);
    NSLog(@"%@: %s\n", description, errorString);
    free(errorString);
}

NSString* stringFromAudioStreamBasicDescription (AudioStreamBasicDescription audioFormat) {
    
    NSMutableString *audioStreamBasicDescription = [[NSMutableString alloc] init];
    
    // From https://developer.apple.com/library/ios/documentation/MusicAudio/Conceptual/AudioUnitHostingGuide_iOS/ConstructingAudioUnitApps/ConstructingAudioUnitApps.html (Listing 2-8)
    char formatIDString[5];
    UInt32 formatID = CFSwapInt32HostToBig (audioFormat.mFormatID);
    bcopy (&formatID, formatIDString, 4);
    formatIDString[4] = '\0';
    
    [audioStreamBasicDescription appendFormat:@"Sample Rate:         %10.0f \n",  audioFormat.mSampleRate];
    [audioStreamBasicDescription appendFormat:@"Format ID:           %10s \n",    formatIDString];
    [audioStreamBasicDescription appendFormat:@"Format Flags:        %10d \n",    (unsigned int)audioFormat.mFormatFlags];
    [audioStreamBasicDescription appendFormat:@"Bytes per Packet:    %10d \n",    (unsigned int)audioFormat.mBytesPerPacket];
    [audioStreamBasicDescription appendFormat:@"Frames per Packet:   %10d \n",    (unsigned int)audioFormat.mFramesPerPacket];
    [audioStreamBasicDescription appendFormat:@"Bytes per Frame:     %10d \n",    (unsigned int)audioFormat.mBytesPerFrame];
    [audioStreamBasicDescription appendFormat:@"Channels per Frame:  %10d \n",    (unsigned int)audioFormat.mChannelsPerFrame];
    [audioStreamBasicDescription appendFormat:@"Bits per Channel:    %10d \n",    (unsigned int)audioFormat.mBitsPerChannel];
    
    if((audioFormat.mFormatFlags & kLinearPCMFormatFlagIsFloat) ||
       (audioFormat.mFormatFlags & kLinearPCMFormatFlagIsBigEndian) ||
       (audioFormat.mFormatFlags & kLinearPCMFormatFlagIsSignedInteger) ||
       (audioFormat.mFormatFlags & kLinearPCMFormatFlagIsPacked) ||
       (audioFormat.mFormatFlags & kLinearPCMFormatFlagIsAlignedHigh) ||
       (audioFormat.mFormatFlags & kLinearPCMFormatFlagIsNonInterleaved) ||
       (audioFormat.mFormatFlags & kLinearPCMFormatFlagIsNonMixable) ||
       (audioFormat.mFormatFlags == kLinearPCMFormatFlagsSampleFractionShift) ||
       (audioFormat.mFormatFlags & kLinearPCMFormatFlagsSampleFractionMask) ||
       (audioFormat.mFormatFlags & kLinearPCMFormatFlagsAreAllClear)) { // If this is a PCM format
        
        if (audioFormat.mFormatFlags & kLinearPCMFormatFlagIsFloat)[audioStreamBasicDescription appendString:@"kLinearPCMFormatFlagIsFloat | "];
        if (audioFormat.mFormatFlags & kLinearPCMFormatFlagIsBigEndian)[audioStreamBasicDescription appendString:@"kLinearPCMFormatFlagIsBigEndian | "];
        if (audioFormat.mFormatFlags & kLinearPCMFormatFlagIsSignedInteger)[audioStreamBasicDescription appendString:@"kLinearPCMFormatFlagIsSignedInteger | "];
        if (audioFormat.mFormatFlags & kLinearPCMFormatFlagIsPacked)[audioStreamBasicDescription appendString:@"kLinearPCMFormatFlagIsPacked | "];
        if (audioFormat.mFormatFlags & kLinearPCMFormatFlagIsAlignedHigh)[audioStreamBasicDescription appendString:@"kLinearPCMFormatFlagIsAlignedHigh | "];
        if (audioFormat.mFormatFlags & kLinearPCMFormatFlagIsNonInterleaved)[audioStreamBasicDescription appendString:@"kLinearPCMFormatFlagIsNonInterleaved | "];
        if (audioFormat.mFormatFlags & kLinearPCMFormatFlagIsNonMixable)[audioStreamBasicDescription appendString:@"kLinearPCMFormatFlagIsNonMixable | "];
        if (audioFormat.mFormatFlags == kLinearPCMFormatFlagsSampleFractionShift)[audioStreamBasicDescription appendString:@"kLinearPCMFormatFlagsSampleFractionShift | "];
        if (audioFormat.mFormatFlags & kLinearPCMFormatFlagsSampleFractionMask)[audioStreamBasicDescription appendString:@"kLinearPCMFormatFlagsSampleFractionMask | "];
        if (audioFormat.mFormatFlags & kLinearPCMFormatFlagsAreAllClear)[audioStreamBasicDescription appendString:@"kLinearPCMFormatFlagsAreAllClear | "];
                
    } else { // If this isn't a PCM format
        
        if (audioFormat.mFormatFlags & kAudioFormatFlagIsFloat) [audioStreamBasicDescription appendString:@"kAudioFormatFlagIsFloat | "];
        if (audioFormat.mFormatFlags & kAudioFormatFlagIsBigEndian) [audioStreamBasicDescription appendString:@"kAudioFormatFlagIsBigEndian | "];
        if (audioFormat.mFormatFlags & kAudioFormatFlagIsSignedInteger)[audioStreamBasicDescription appendString:@"kAudioFormatFlagIsSignedInteger | "];
        if (audioFormat.mFormatFlags & kAudioFormatFlagIsPacked)[audioStreamBasicDescription appendString:@"kAudioFormatFlagIsPacked | "];
        if (audioFormat.mFormatFlags & kAudioFormatFlagIsAlignedHigh)[audioStreamBasicDescription appendString:@"kAudioFormatFlagIsAlignedHigh | "];
        if (audioFormat.mFormatFlags & kAudioFormatFlagIsNonInterleaved)[audioStreamBasicDescription appendString:@"kAudioFormatFlagIsNonInterleaved | "];
        if (audioFormat.mFormatFlags & kAudioFormatFlagIsNonMixable)[audioStreamBasicDescription appendString:@"kAudioFormatFlagIsNonMixable | "];
        if (audioFormat.mFormatFlags & kAudioFormatFlagsAreAllClear)[audioStreamBasicDescription appendString:@"kAudioFormatFlagsAreAllClear | "];
        if (audioFormat.mFormatFlags == kAppleLosslessFormatFlag_16BitSourceData)[audioStreamBasicDescription appendString:@"kAppleLosslessFormatFlag_16BitSourceData | "];
        if (audioFormat.mFormatFlags == kAppleLosslessFormatFlag_20BitSourceData)[audioStreamBasicDescription appendString:@"kAppleLosslessFormatFlag_20BitSourceData | "];
        if (audioFormat.mFormatFlags == kAppleLosslessFormatFlag_24BitSourceData)[audioStreamBasicDescription appendString:@"kAppleLosslessFormatFlag_24BitSourceData | "];
        if (audioFormat.mFormatFlags == kAppleLosslessFormatFlag_32BitSourceData) [audioStreamBasicDescription appendString:@"kAppleLosslessFormatFlag_32BitSourceData | "];
        
    }    
    
    NSRange lastThreeCharacters = {[audioStreamBasicDescription length]-3,2};
    if([audioStreamBasicDescription rangeOfString:@" | "].location != NSNotFound) [audioStreamBasicDescription deleteCharactersInRange:lastThreeCharacters];
    
    return [NSString stringWithString:audioStreamBasicDescription];
}

AudioBufferList *AllocateABL(UInt32 channelsPerFrame, UInt32 bytesPerFrame, bool interleaved, UInt32 capacityFrames) {
    AudioBufferList *bufferList = NULL;
    
    UInt32 numBuffers = interleaved ? 1 : channelsPerFrame;
    UInt32 channelsPerBuffer = interleaved ? channelsPerFrame : 1;
    
    bufferList = (AudioBufferList *)(calloc(1, offsetof(AudioBufferList, mBuffers) + (sizeof(AudioBuffer) * numBuffers)));
    
    bufferList->mNumberBuffers = numBuffers;
    
    for(UInt32 bufferIndex = 0; bufferIndex < bufferList->mNumberBuffers; ++bufferIndex) {
        bufferList->mBuffers[bufferIndex].mData = (void *)(calloc(capacityFrames, bytesPerFrame));
        bufferList->mBuffers[bufferIndex].mDataByteSize = capacityFrames * bytesPerFrame;
        bufferList->mBuffers[bufferIndex].mNumberChannels = channelsPerBuffer;
    }
    
    return bufferList;
}

void DeallocateABL(AudioBufferList * bufferList) {
    
    NSInteger numBuffers = bufferList->mNumberBuffers;
    
    for(UInt32 bufferIndex = 0; bufferIndex < numBuffers; ++bufferIndex) {
        free(bufferList->mBuffers[bufferIndex].mData);
    }
    
    free(bufferList);

}

AudioStreamBasicDescription setupPCMAudioStreamBasicDescription(float sampleRate, int channels, int pcmFormat, BOOL interleaved) {
 
    AudioStreamBasicDescription audioStreamBasicDescription;
    audioStreamBasicDescription.mSampleRate = sampleRate;
    audioStreamBasicDescription.mFormatID = kAudioFormatLinearPCM;
    
    int wordsPerType = 2;
    
    switch (pcmFormat) {
        case kOEPCMFormatOther:
            // TODO: Unknown format, needs to be handled specially.
            break;
        case kOEPCMFormatFloat32:
            if(!interleaved) {
                audioStreamBasicDescription.mFormatFlags = kAudioFormatFlagsNativeEndian | kAudioFormatFlagIsPacked | kAudioFormatFlagIsFloat | kAudioFormatFlagIsNonInterleaved;
            } else { 
                audioStreamBasicDescription.mFormatFlags = kAudioFormatFlagsNativeEndian | kAudioFormatFlagIsPacked | kAudioFormatFlagIsFloat;
            }
            wordsPerType = 4;
            break;
        case kOEPCMFormatInt16:
            if(!interleaved) {
                audioStreamBasicDescription.mFormatFlags = kAudioFormatFlagsNativeEndian | kAudioFormatFlagIsPacked | kAudioFormatFlagIsSignedInteger | kAudioFormatFlagIsNonInterleaved;
            } else {
                audioStreamBasicDescription.mFormatFlags = kAudioFormatFlagsNativeEndian | kAudioFormatFlagIsPacked | kAudioFormatFlagIsSignedInteger;
            }
            wordsPerType = 2;
            break;
        case kOEPCMFormatFixed824:   
            if(!interleaved) {
                audioStreamBasicDescription.mFormatFlags = kAudioFormatFlagsNativeEndian | kAudioFormatFlagIsPacked | kAudioFormatFlagIsSignedInteger | (24 << kLinearPCMFormatFlagsSampleFractionShift) | kAudioFormatFlagIsNonInterleaved;
            } else {
                audioStreamBasicDescription.mFormatFlags = kAudioFormatFlagsNativeEndian | kAudioFormatFlagIsPacked | kAudioFormatFlagIsSignedInteger | (24 << kLinearPCMFormatFlagsSampleFractionShift);
            }
            wordsPerType = 4;
            break;
        default:
            // TODO: Unknown format, needs to be handled specially.
            break;
    }
    
    int interleaveMultiplier = 1;
    if(interleaved && channels == 2) {
        interleaveMultiplier = 2;   
    }

    audioStreamBasicDescription.mBytesPerPacket = wordsPerType * interleaveMultiplier;
    audioStreamBasicDescription.mFramesPerPacket = 1; // This is PCM
    audioStreamBasicDescription.mBytesPerFrame = audioStreamBasicDescription.mBytesPerPacket * audioStreamBasicDescription.mFramesPerPacket;
    audioStreamBasicDescription.mChannelsPerFrame = channels;
    audioStreamBasicDescription.mBitsPerChannel = wordsPerType * 8;
    audioStreamBasicDescription.mReserved = 0; // To the best of my knowledge, reserved is always zero for these formats.
    
    return audioStreamBasicDescription;
}
