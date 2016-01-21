////////////////////////////////////////////////////////////////////////////////
///
/// SoundStretch main routine.
///
/// Author        : Copyright (c) Olli Parviainen
/// Author e-mail : oparviai 'at' iki.fi
/// SoundTouch WWW: http://www.surina.net/soundtouch
///
////////////////////////////////////////////////////////////////////////////////
//
// Last changed  : $Date: 2011-07-16 11:55:23 +0300 (Sat, 16 Jul 2011) $
// File revision : $Revision: 4 $
//
// $Id: main.cpp 121 2011-07-16 08:55:23Z oparviai $
//
////////////////////////////////////////////////////////////////////////////////
//
// License :
//
//  SoundTouch audio processing library
//  Copyright (c) Olli Parviainen
//
//  This library is free software; you can redistribute it and/or
//  modify it under the terms of the GNU Lesser General Public
//  License as published by the Free Software Foundation; either
//  version 2.1 of the License, or (at your option) any later version.
//
//  This library is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
//  Lesser General Public License for more details.
//
//  You should have received a copy of the GNU Lesser General Public
//  License along with this library; if not, write to the Free Software
//  Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
//
////////////////////////////////////////////////////////////////////////////////

#include <stdexcept>
#include <stdio.h>
#include <string.h>
#include "RunParameters.h"
#include "WavFile.h"
#include "SoundTouch.h"
#include "BPMDetect.h"
#include "SoundStretch.h"

#include "cocos2d.h"

using namespace soundtouch;
using namespace std;

// Processing chunk size
#define BUFF_SIZE           2048

#if WIN32
    #include <io.h>
    #include <fcntl.h>

    // Macro for Win32 standard input/output stream support: Sets a file stream into binary mode
    #define SET_STREAM_TO_BIN_MODE(f) (_setmode(_fileno(f), _O_BINARY))
#else
    // Not needed for GNU environment... 
    #define SET_STREAM_TO_BIN_MODE(f) {}
#endif


static const char _helloText[] = 
    "\n"
    "   SoundStretch v%s -  Written by Olli Parviainen 2001 - 2011\n"
    "==================================================================\n"
    "author e-mail: <oparviai"
    "@"
    "iki.fi> - WWW: http://www.surina.net/soundtouch\n"
    "\n"
    "This program is subject to (L)GPL license. Run \"soundstretch -license\" for\n"
    "more information.\n"
    "\n";

static void openFiles(WavInFile **inFile, WavOutFile **outFile, const RunParameters *params)
{
    int bits, samplerate, channels;

    if (strcmp(params->inFileName, "stdin") == 0)
    {
        // used 'stdin' as input file
        SET_STREAM_TO_BIN_MODE(stdin);
        *inFile = new WavInFile(stdin);
    }
    else
    {
        // open input file...
        *inFile = new WavInFile(params->inFileName);
    }

    // ... open output file with same sound parameters
    bits = (int)(*inFile)->getNumBits();
    samplerate = (int)(*inFile)->getSampleRate();
    channels = (int)(*inFile)->getNumChannels();

    if (params->outFileName)
    {
        if (strcmp(params->outFileName, "stdout") == 0)
        {
            SET_STREAM_TO_BIN_MODE(stdout);
            *outFile = new WavOutFile(stdout, samplerate, bits, channels);
        }
        else
        {
            *outFile = new WavOutFile(params->outFileName, samplerate, bits, channels);
        }
    }
    else
    {
        *outFile = NULL;
    }
}



// Sets the 'SoundTouch' object up according to input file sound format & 
// command line parameters
static void setup(SoundTouch *pSoundTouch, const WavInFile *inFile, const RunParameters *params)
{
    int sampleRate;
    int channels;

    sampleRate = (int)inFile->getSampleRate();
    channels = (int)inFile->getNumChannels();
    pSoundTouch->setSampleRate(sampleRate);
    pSoundTouch->setChannels(channels);

    pSoundTouch->setTempoChange(params->tempoDelta);
    pSoundTouch->setPitchSemiTones(params->pitchDelta);
    pSoundTouch->setRateChange(params->rateDelta);

    pSoundTouch->setSetting(SETTING_USE_QUICKSEEK, params->quick);
    pSoundTouch->setSetting(SETTING_USE_AA_FILTER, !(params->noAntiAlias));

    if (params->speech)
    {
        // use settings for speech processing
        pSoundTouch->setSetting(SETTING_SEQUENCE_MS, 40);
        pSoundTouch->setSetting(SETTING_SEEKWINDOW_MS, 15);
        pSoundTouch->setSetting(SETTING_OVERLAP_MS, 8);
        CCLOG("Tune processing parameters for speech processing.\n");
    }

    // print processing information
    if (params->outFileName)
    {
#ifdef SOUNDTOUCH_INTEGER_SAMPLES
        CCLOG("Uses 16bit integer sample type in processing.\n\n");
#else
    #ifndef SOUNDTOUCH_FLOAT_SAMPLES
        #error "Sampletype not defined"
    #endif
        CCLOG("Uses 32bit floating point sample type in processing.\n\n");
#endif
        // print processing information only if outFileName given i.e. some processing will happen
        CCLOG("Processing the file with the following changes:\n");
        CCLOG("  tempo change = %+g %%\n", params->tempoDelta);
        CCLOG("  pitch change = %+g semitones\n", params->pitchDelta);
        CCLOG("  rate change  = %+g %%\n\n", params->rateDelta);
        CCLOG("Working...");
    }
    else
    {
        // outFileName not given
        CCLOG("Warning: output file name missing, won't output anything.\n\n");
    }

    
}




// Processes the sound
static void process(SoundTouch *pSoundTouch, WavInFile *inFile, WavOutFile *outFile)
{
    int nSamples;
    int nChannels;
    int buffSizeSamples;
    SAMPLETYPE sampleBuffer[BUFF_SIZE];

    if ((inFile == NULL) || (outFile == NULL)) return;  // nothing to do.

    nChannels = (int)inFile->getNumChannels();
    assert(nChannels > 0);
    buffSizeSamples = BUFF_SIZE / nChannels;

    // Process samples read from the input file
    while (inFile->eof() == 0)
    {
        int num;

        // Read a chunk of samples from the input file
        num = inFile->read(sampleBuffer, BUFF_SIZE);
        nSamples = num / (int)inFile->getNumChannels();

        // Feed the samples into SoundTouch processor
        pSoundTouch->putSamples(sampleBuffer, nSamples);

        // Read ready samples from SoundTouch processor & write them output file.
        // NOTES:
        // - 'receiveSamples' doesn't necessarily return any samples at all
        //   during some rounds!
        // - On the other hand, during some round 'receiveSamples' may have more
        //   ready samples than would fit into 'sampleBuffer', and for this reason 
        //   the 'receiveSamples' call is iterated for as many times as it
        //   outputs samples.
        do 
        {
            nSamples = pSoundTouch->receiveSamples(sampleBuffer, buffSizeSamples);
            outFile->write(sampleBuffer, nSamples * nChannels);
        } while (nSamples != 0);
    }

    // Now the input file is processed, yet 'flush' few last samples that are
    // hiding in the SoundTouch's internal processing pipeline.
    pSoundTouch->flush();
    do 
    {
        nSamples = pSoundTouch->receiveSamples(sampleBuffer, buffSizeSamples);
        outFile->write(sampleBuffer, nSamples * nChannels);
    } while (nSamples != 0);
}



// Detect BPM rate of inFile and adjust tempo setting accordingly if necessary
static void detectBPM(WavInFile *inFile, RunParameters *params)
{
    float bpmValue;
    int nChannels;
    BPMDetect bpm(inFile->getNumChannels(), inFile->getSampleRate());
    SAMPLETYPE sampleBuffer[BUFF_SIZE];

    // detect bpm rate
    CCLOG("Detecting BPM rate...");
    

    nChannels = (int)inFile->getNumChannels();
    assert(BUFF_SIZE % nChannels == 0);

    // Process the 'inFile' in small blocks, repeat until whole file has 
    // been processed
    while (inFile->eof() == 0)
    {
        int num, samples;

        // Read sample data from input file
        num = inFile->read(sampleBuffer, BUFF_SIZE);

        // Enter the new samples to the bpm analyzer class
        samples = num / nChannels;
        bpm.inputSamples(sampleBuffer, samples);
    }

    // Now the whole song data has been analyzed. Read the resulting bpm.
    bpmValue = bpm.getBpm();
    CCLOG("Done!\n");

    // rewind the file after bpm detection
    inFile->rewind();

    if (bpmValue > 0)
    {
        CCLOG("Detected BPM rate %.1f\n\n", bpmValue);
    }
    else
    {
        CCLOG("Couldn't detect BPM rate.\n\n");
        return;
    }

    if (params->goalBPM > 0)
    {
        // adjust tempo to given bpm
        params->tempoDelta = (params->goalBPM / bpmValue - 1.0f) * 100.0f;
        CCLOG("The file will be converted to %.1f BPM\n\n", params->goalBPM);
    }
}



int run(RunParameters *params)
{
    WavInFile *inFile;
    WavOutFile *outFile;
    SoundTouch soundTouch;

    try 
    {
        // Open input & output files
        openFiles(&inFile, &outFile, params);

        if (params->detectBPM == true)
        {
            // detect sound BPM (and adjust processing parameters
            //  accordingly if necessary)
            detectBPM(inFile, params);
        }

        // Setup the 'SoundTouch' object for processing the sound
        setup(&soundTouch, inFile, params);

        // Process the sound
        process(&soundTouch, inFile, outFile);

        // Close WAV file handles & dispose of the objects
        delete inFile;
        delete outFile;
    } 
    catch (const runtime_error &e) 
    {
        // An exception occurred during processing, display an error message
        CCLOG("Error: %s", e.what());
        return -1;
    }

    return 0;
}


SoundStretch::SoundStretch() {
}

SoundStretch::~SoundStretch() {
}

void SoundStretch::process(
    std::string inFileName,
    std::string outFileName,
    float tempoDelta,
    float pitchDelta,
    float rateDelta
) {

    RunParameters *params = new RunParameters();

    params->inFileName = inFileName.c_str();
    params->outFileName = outFileName.c_str();
    params->tempoDelta = tempoDelta; //-95.0f, 5000.0f
    params->pitchDelta = pitchDelta; //-60.0f, 60.0f
    params->rateDelta = rateDelta; //-95.0f, 5000.0f
    params->detectBPM = false;
    params->quick = 0;
    params->noAntiAlias = 0;
    params->speech = true;
    params->goalBPM = 0;

    run(params);

    delete params;
}