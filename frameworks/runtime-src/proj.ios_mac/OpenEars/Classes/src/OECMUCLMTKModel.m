
//
//  OECMUCLMTKModel.m
//  OpenEars 
//  http://www.politepix.com/openears
//
//  OECMUCLMTKModel is a class which abstracts the conversion of vocabulary into language models
//  OpenEars
//
//  Copyright Politepix UG (haftungsbeschränkt) 2014. All rights reserved.
//  http://www.politepix.com
//  Contact at http://www.politepix.com/contact
//
//  this file is licensed under the Politepix Shared Source license found 
//  found in the root of the source distribution. Please see the file "Version.txt" in the root of 
//  the source distribution for the version number of this OpenEars package.



#import "OECMUCLMTKModel.h"
#import "OERuntimeVerbosity.h"

#include "ac_lmfunc_impl.h"
#include "text2wfreq.h"
#include "text2idngram.h"
#include "idngram2lm.h"
#include <sphinxbase/logmath.h>
#include <sphinxbase/ngram_model.h>
#include <sphinxbase/cmd_ln.h>
#include <sphinxbase/ckd_alloc.h>
#include <sphinxbase/err.h>
#include <sphinxbase/pio.h>
#include <sphinxbase/strfuncs.h>
#include <stdio.h>
#include <string.h>
#include <math.h>

#ifdef KEEPFILES
#warning KEEPFILES is a debug setting
#define IDNGRAMASCII // Use to check the idngram output
#endif

@interface OECMUCLMTKModel() 

@property (nonatomic, copy) NSString *pathToCachesDirectory;

@end    

@implementation OECMUCLMTKModel

extern int openears_logging;
extern int verbose_cmuclmtk;

- (NSString *)pathToCachesDirectory {
    return [NSString stringWithFormat:@"%@",NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES)[0]];
}

- (void) runCMUCLMTKOnCorpusFile:(NSString *)fileName withDMP:(BOOL)withDMP {
    
    BOOL ofp_text2wfreqIsOpen = FALSE;
    BOOL ifp_text2wfreqIsOpen = FALSE;
    BOOL ifp_wfreq2vocabIsOpen = FALSE;
    BOOL ofp_wfreq2vocabIsOpen = FALSE;
    
    NSUInteger number_of_lines_in_corpus = 0;
    
    if(verbose_cmuclmtk == 1) {
        self.verbosity = 1;
    } else {
        self.verbosity = -1;
    }
    
    NSRange rangeOfSubstring = [fileName rangeOfString:@".corpus"];
    NSString *modelName = [fileName substringToIndex:rangeOfSubstring.location];
    NSString *corpusfileName = fileName;
    NSString *alternativeCorpusfileName = [NSString stringWithFormat:@"%@.alternative.corpus",corpusfileName];
    NSError *fileStringError = nil;
    NSString *corpusFileAsString = [[NSString alloc] initWithContentsOfFile:corpusfileName encoding:NSUTF8StringEncoding error:&fileStringError];
    
    number_of_lines_in_corpus = [[corpusFileAsString componentsSeparatedByString:@"\n"]count];
    
    if(fileStringError) {
        NSLog(@"Error: %@",fileStringError);
    }
    
    NSString *alternativeCorpusFileAsString = [NSString stringWithFormat:@"%@<s> _____REPLACEMENTTOKEN </s>",corpusFileAsString];
    NSError *writeoutError = nil;
    
    [alternativeCorpusFileAsString writeToFile:alternativeCorpusfileName atomically:YES encoding:NSUTF8StringEncoding error:&writeoutError];
    
    if(writeoutError) {
        NSLog(@"Error: %@",writeoutError);    
    }
    
    NSString *textfileNameToPipe = [NSString stringWithFormat:@"%@_pipe.txt",modelName];
    NSString *vocabFileName = [NSString stringWithFormat:@"%@.vocab",modelName];
    NSString *idngramFileName = [NSString stringWithFormat:@"%@.idngram",modelName];
    NSString *arpaFileName = [NSString stringWithFormat:@"%@.arpa",modelName];
    NSString *dmpFileName = [NSString stringWithFormat:@"%@.DMP",modelName];
    NSString *contextCuesFileName = [NSString stringWithFormat:@"%@.ccs",modelName];
    
    FILE *ifp_text2wfreq;
    FILE *ofp_text2wfreq;
    
    if ((ifp_text2wfreq = fopen([corpusfileName UTF8String], "r")) == NULL) { // Get the input file for getting word freq (corpus)
        if(openears_logging == 1) NSLog(@"Error: unable to open %s for reading, error:", [corpusfileName UTF8String]);
        if(openears_logging == 1) perror("fopen");
    } else {
        ifp_text2wfreqIsOpen = TRUE;   
    }
    
    if ((ofp_text2wfreq = fopen([textfileNameToPipe UTF8String], "wrb")) == 0) { // get the output file for getting word freq (textfileNameToPipe)
        if(openears_logging == 1) NSLog(@"Error: unable to open %s for writing, error:", [textfileNameToPipe UTF8String]);
        if(openears_logging == 1) perror("fopen");
    } else {
        ofp_text2wfreqIsOpen = TRUE;
    }
    
    int text2wfreq_impl_result = text2wfreq_impl(ifp_text2wfreq,ofp_text2wfreq,7500,self.verbosity); // Get word freq from corpus, output to textfileNameToPipe
    //7500 is the hash size to use instead of default hash
    
    if(text2wfreq_impl_result == 0) {
        ofp_text2wfreqIsOpen = FALSE;
    }
    
    int vocab_size;
    int cutoff;
    int num_recs;
    FILE *ifp_wfreq2vocab, *ofp_wfreq2vocab;
    
    // Process command line 
    
    cutoff = -1;
    vocab_size = -1;
    num_recs = 64000;
    
    if ((ifp_wfreq2vocab=fopen([textfileNameToPipe UTF8String], "rb")) == NULL) { // get input file for ordered vocab (textfileNameToPipe)
        if(openears_logging == 1) NSLog(@"Error: unable to open %s for reading. error:", [textfileNameToPipe UTF8String]);
        if(openears_logging == 1) perror("fopen");
    } else {
        ifp_wfreq2vocabIsOpen = TRUE;
    }
    
    if ((ofp_wfreq2vocab=fopen([vocabFileName UTF8String], "wrb")) == NULL) { // get output file for ordered vocab (vocabFileName)
        if(openears_logging == 1) NSLog(@"Error: unable to open %s for writing error:", [vocabFileName UTF8String]);
        if(openears_logging == 1) perror("fopen");
    } else {
        ofp_wfreq2vocabIsOpen = TRUE;
    }
    
    int wfreq2vocab_impl_result = wfreq2vocab_impl(ifp_wfreq2vocab,ofp_wfreq2vocab,cutoff, vocab_size,num_recs,self.verbosity); // Get ordered vocab and write out to vocabFileName
    if(wfreq2vocab_impl_result == 0) {
        ofp_wfreq2vocabIsOpen = FALSE;
    }
    
    //     fprintf(stderr,"text2idngram - Convert a text stream to an id n-gram stream.\n");
    //     fprintf(stderr,"Usage : text2idngram  -vocab .vocab \n");
    //     fprintf(stderr,"                      -idngram .idngram\n");
    //     fprintf(stderr,"                    [ -buffer 100 ]\n");
    //     fprintf(stderr,"                    [ -hash %d ]\n",DEFAULT_HASH_SIZE);
    //     fprintf(stderr,"                    [ -files %d ]\n",DEFAULT_MAX_FILES);
    //     fprintf(stderr,"                    [ -gzip | -compress ]\n");
    //     fprintf(stderr,"                    [ -verbosity %d ]\n",DEFAULT_VERBOSITY);
    //     fprintf(stderr,"                    [ -n 3 ]\n");
    //     fprintf(stderr,"                    [ -write_ascii ]\n");
    //     fprintf(stderr,"                    [ -fof_size 10 ]\n");
    //     fprintf(stderr,"                    [ -version ]\n");
    //     fprintf(stderr,"                    [ -help ]\n");
    
    NSMutableArray *commandArray_text2idngram = [[NSMutableArray alloc] init]; // This is an array that is used to set up the run arguments
    
    [commandArray_text2idngram addObject: @"-vocab" ]; // the vocab file is the input for the idngram
    [commandArray_text2idngram addObject: vocabFileName];
    [commandArray_text2idngram addObject:@"-idngram" ]; // idngramFileName is its output
    
    [commandArray_text2idngram addObject: idngramFileName];
    [commandArray_text2idngram addObject: @"-textfile" ];
    [commandArray_text2idngram addObject:alternativeCorpusfileName]; // the corpus
    
    [commandArray_text2idngram addObject: @"-temp_directory" ]; // The work is done in the temp file specified.
    [commandArray_text2idngram addObject:[self.pathToCachesDirectory stringByAppendingPathComponent:@"cmuclmtk-XXXXXX"]];   
    
    if(self.ngrams) {
        [commandArray_text2idngram addObject: @"-n" ];
        [commandArray_text2idngram addObject:[self.ngrams stringValue]];
    }    
    
#ifdef IDNGRAMASCII    
    [commandArray_text2idngram addObject: @"-write_ascii" ];    // Use to check the idngram output
#endif    
    [commandArray_text2idngram insertObject:@"text2idngram" atIndex:0]; // This gets everything at the expected index
    
    char* argv[[commandArray_text2idngram count]]; // 
    
    for (int i = 0; i < [commandArray_text2idngram count]; i++ ) { // Grab all the set arguments.
        char *argument = (char *) ([commandArray_text2idngram[i]UTF8String]);
        argv[i] = argument;
    }
    
    text2idngram_main((int)[commandArray_text2idngram count],argv); // create the idngram
    
    NSString *corpusString = @"<s>\n</s>";
    
    NSError *error;
    BOOL successfulWrite = [corpusString writeToFile:contextCuesFileName atomically:YES encoding:NSUTF8StringEncoding error:&error];
    if (!successfulWrite){
        // Handle error here
        if(openears_logging == 1) NSLog(@"Error: context cues file was not written out, %@", [error description]);
    }
    
    //    fprintf(stderr,"idngram2lm : Convert an idngram file to a language model file.\n");
    //    fprintf(stderr,"Usage : \n");
    //    fprintf(stderr,"idngram2lm -idngram .idngram\n");
    //    fprintf(stderr,"           -vocab .vocab\n");
    //    fprintf(stderr,"           -arpa .arpa | -binary .binlm\n");
    //    fprintf(stderr,"         [ -context .ccs ]\n");
    //    fprintf(stderr,"         [ -calc_mem | -buffer 100 | -spec_num y ... z ]\n");
    //    fprintf(stderr,"         [ -vocab_type 1 ]\n");
    //    fprintf(stderr,"         [ -oov_fraction 0.5 ]\n");
    //    fprintf(stderr,"         [ -two_byte_bo_weights   \n              [ -min_bo_weight nnnnn] [ -max_bo_weight nnnnn] [ -out_of_range_bo_weights] ]\n");
    //    fprintf(stderr,"         [ -four_byte_counts ]\n");
    //    fprintf(stderr,"         [ -linear | -absolute | -good_turing | -witten_bell ]\n");
    //    fprintf(stderr,"         [ -disc_ranges 1 7 7 ]\n");
    //    fprintf(stderr,"         [ -cutoffs 0 ... 0 ]\n");
    //    fprintf(stderr,"         [ -min_unicount 0 ]\n");
    //    fprintf(stderr,"         [ -zeroton_fraction ]\n");
    //    fprintf(stderr,"         [ -ascii_input | -bin_input ]\n");
    //    fprintf(stderr,"         [ -n 3 ]  \n");
    //    fprintf(stderr,"         [ -verbosity %d ]\n",DEFAULT_VERBOSITY);
    
    NSMutableArray *commandArray_idngram2lm = [[NSMutableArray alloc] init]; // This is an array that is used to set up the run arguments
    
    [commandArray_idngram2lm addObject: @"-vocab_type" ];
    [commandArray_idngram2lm addObject: @"0"];
    [commandArray_idngram2lm addObject:@"-idngram" ];
    
    [commandArray_idngram2lm addObject: idngramFileName];
    [commandArray_idngram2lm addObject: @"-vocab" ];
    [commandArray_idngram2lm addObject:vocabFileName]; 
    [commandArray_idngram2lm addObject: @"-arpa" ];
    [commandArray_idngram2lm addObject:arpaFileName];     
    [commandArray_idngram2lm addObject: @"-context" ];
    [commandArray_idngram2lm addObject:contextCuesFileName];
    if(!self.algorithmType)self.algorithmType = @"-witten_bell"; // Witten-Bell seems to be the method that is the most flexible across large and small vocabs
    [commandArray_idngram2lm addObject:self.algorithmType];
    
    if(self.ngrams) {
        [commandArray_idngram2lm addObject: @"-n" ];
        [commandArray_idngram2lm addObject:[self.ngrams stringValue]];
    }
    
    [commandArray_idngram2lm addObject:@"-verbosity"];
    [commandArray_idngram2lm addObject:[NSString stringWithFormat:@"%d",self.verbosity]];
#ifdef IDNGRAMASCII    
    [commandArray_idngram2lm addObject: @"-ascii_input" ];    // Use to check the idngram output
#endif    
    [commandArray_idngram2lm insertObject:@"idngram2lm" atIndex:0]; // This gets everything at the expected index
    
    char* argv2[[commandArray_idngram2lm count]]; // 
    
    for (int i = 0; i < [commandArray_idngram2lm count]; i++ ) { // Grab all the set arguments.
        char *argument = (char *) ([commandArray_idngram2lm[i]UTF8String]);
        argv2[i] = argument;
    }
    
    int sih_max_occupancy_size = 1000;
    
    if(number_of_lines_in_corpus > 333) {
        sih_max_occupancy_size = (int)(number_of_lines_in_corpus * 3);
    }
    
    idngram2lm_main((int)[commandArray_idngram2lm count],argv2,sih_max_occupancy_size); // I have added sih_max_occupancy_size because the realloc method in sih_add isn't quite working for me yet so for big vocabs it just needs to be avoided by making the max occupancy size large enough to accomodate the entire vocab without reallocation of the hash.    
    
    if(withDMP)[self convertARPAAtPath:arpaFileName toDMPAtPath:dmpFileName];
    
    // Remove the working files
#ifndef KEEPFILES
    if (remove([textfileNameToPipe UTF8String]) == -1) { 
        NSLog(@"couldn't delete the file %@\n", textfileNameToPipe);
    }
    if (remove([vocabFileName UTF8String]) == -1) { 
        NSLog(@"couldn't delete the file %@\n", vocabFileName);
    }
    if (remove([idngramFileName UTF8String]) == -1) { 
        NSLog(@"couldn't delete the file %@\n", idngramFileName);
    }
    if (remove([contextCuesFileName UTF8String]) == -1) {
        NSLog(@"couldn't delete the file %@\n", contextCuesFileName);
    }
    if (remove([alternativeCorpusfileName UTF8String]) == -1) {
        NSLog(@"couldn't delete the file %@\n", contextCuesFileName);
    }    
#endif
    
    if(ofp_text2wfreqIsOpen) fclose(ofp_text2wfreq);
    if(ifp_text2wfreqIsOpen) fclose(ifp_text2wfreq);
    if(ifp_wfreq2vocabIsOpen) fclose(ifp_wfreq2vocab);
    if(ofp_wfreq2vocabIsOpen) fclose(ofp_wfreq2vocab);   
}

- (void) convertARPAAtPath:(NSString *)arpaFileName toDMPAtPath:(NSString *)dmpFileName {
    NSMutableArray *commandArray_sphinx_lm_convert = [[NSMutableArray alloc] init]; // This is an array that is used to set up the run arguments
    
    [commandArray_sphinx_lm_convert addObject: @"-i" ];
    [commandArray_sphinx_lm_convert addObject: arpaFileName];
    [commandArray_sphinx_lm_convert addObject:@"-o" ];
    
    [commandArray_sphinx_lm_convert addObject: dmpFileName];
    if(verbose_cmuclmtk == 1) {
        [commandArray_sphinx_lm_convert addObject:@"-debug" ];
        [commandArray_sphinx_lm_convert addObject:@"10" ];
    }
    
    //dmpFileName
    //-i weather.arpa -o weather.lm.DMP
    
    [commandArray_sphinx_lm_convert insertObject:@"sphinx_lm_convert" atIndex:0]; // This gets everything at the expected index
    
    char* argv3[[commandArray_sphinx_lm_convert count]]; // 
    
    for (int i = 0; i < [commandArray_sphinx_lm_convert count]; i++ ) { // Grab all the set arguments.
        
        char *argument = (char *) ([commandArray_sphinx_lm_convert[i]UTF8String]);
        argv3[i] = argument;
    }
    
    sphinx_lm_convert_main((int)[commandArray_sphinx_lm_convert count],argv3);
}

#pragma mark -
#pragma mark Sphinx program
#pragma mark -

int
sphinx_lm_convert_main(int argc, char *argv[]);

int
sphinx_lm_convert_main(int argc, char *argv[]) {

    cmd_ln_t *config;
    ngram_model_t *lm = NULL;
    logmath_t *lmath;
    int itype, otype;
    char const *kase;
    
    if ((config = cmd_ln_parse_r(NULL, defn, argc, argv, TRUE)) == NULL)
        return 1;
    
    err_set_debug_level(cmd_ln_int32_r(config, "-debug"));
    
    /* Create log math object. */
    if ((lmath = logmath_init
         (cmd_ln_float64_r(config, "-logbase"), 0, 0)) == NULL) {
        E_FATAL("Failed to initialize log math\n");
    }
    
    if (cmd_ln_str_r(config, "-i") == NULL || cmd_ln_str_r(config, "-i") == NULL) {
        E_ERROR("Please specify both input and output models\n");
        goto error_out;
    }
    
    /* Load the input language model. */
    if (cmd_ln_str_r(config, "-ifmt")) {
        if ((itype = ngram_str_to_type(cmd_ln_str_r(config, "-ifmt")))
            == NGRAM_INVALID) {
            E_ERROR("Invalid input type %s\n", cmd_ln_str_r(config, "-ifmt"));
            goto error_out;
        }
        lm = ngram_model_read(config, cmd_ln_str_r(config, "-i"),
                              itype, lmath);
    }
    else {
        lm = ngram_model_read(config, cmd_ln_str_r(config, "-i"),
                              NGRAM_AUTO, lmath);
    }
    
    if (lm == NULL) {
        E_FATAL("Failed to read the model from the file '%s'", cmd_ln_str_r(config, "-i"));
    }
    
    /* Guess or set the output language model type. */
    if (cmd_ln_str_r(config, "-ofmt")) {
        if ((otype = ngram_str_to_type(cmd_ln_str_r(config, "-ofmt")))
            == NGRAM_INVALID) {
            E_ERROR("Invalid output type %s\n", cmd_ln_str_r(config, "-ofmt"));
            goto error_out;
        }
    }
    else {
        otype = ngram_file_name_to_type(cmd_ln_str_r(config, "-o"));
    }
    
    /* Case fold if requested. */
    if ((kase = cmd_ln_str_r(config, "-case"))) {
        if (0 == strcmp(kase, "lower")) {
            ngram_model_casefold(lm, NGRAM_LOWER);
        }
        else if (0 == strcmp(kase, "upper")) {
            ngram_model_casefold(lm, NGRAM_UPPER);
        }
        else {
            E_ERROR("Unknown value for -case: %s\n", kase);
            goto error_out;
        }
    }
    
    /* Write the output language model. */
    if (ngram_model_write(lm, cmd_ln_str_r(config, "-o"), otype) != 0) {
        E_ERROR("Failed to write language model in format %s to %s\n",
                ngram_type_to_str(otype), cmd_ln_str_r(config, "-o"));
        goto error_out;
    }
    
    /* That's all folks! */
    ngram_model_free(lm);
    cmd_ln_free_r(config); // HLW
    free(lmath); // HLW
    return 0;
    
error_out:
    ngram_model_free(lm);
    return 1;
}

static const arg_t defn[] = {
    { "-help",
        ARG_BOOLEAN,
        "no",
        "Shows the usage of the tool"},
    
    { "-logbase",
        ARG_FLOAT64,
        "1.0001",
        "Base in which all log-likelihoods calculated" },
    
    { "-i",
        REQARG_STRING,
        NULL,
        "Input language model file (required)"},
    
    { "-o",
        REQARG_STRING,
        NULL,
        "Output language model file (required)"},
    
    { "-ifmt",
        ARG_STRING,
        NULL,
        "Input language model format (will guess if not specified)"},
    
    { "-ofmt",
        ARG_STRING,
        NULL,
        "Output language model file (will guess if not specified)"},
    
    { "-case",
        ARG_STRING,
        NULL,
        "Ether 'lower' or 'upper' - case fold to lower/upper case (NOT UNICODE AWARE)" },
    
    { "-mmap",
        ARG_BOOLEAN,
        "no",
        "Use memory-mapped I/O for reading binary LM files"},
    
    { "-debug",
        ARG_INT32,
        NULL,
        "Verbosity level for debugging messages"
    },
    
    { NULL, 0, NULL, NULL }
};

@end
