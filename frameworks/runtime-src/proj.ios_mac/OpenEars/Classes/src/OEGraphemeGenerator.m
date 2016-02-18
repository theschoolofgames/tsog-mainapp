//  OpenEars 
//  http://www.politepix.com/openears
//
//  OEGraphemeGenerator.m
//  OpenEars
// 
//  OEGraphemeGenerator is a class which creates pronunciations for words which aren't in the dictionary
//
//  Copyright Politepix UG (haftungsbeschränkt) 2014. All rights reserved.
//  http://www.politepix.com
//  Contact at http://www.politepix.com/contact
//
//  this file is licensed under the Politepix Shared Source license found 
//  found in the root of the source distribution. Please see the file "Version.txt" in the root of 
//  the source distribution for the version number of this OpenEars package.


#import "OEGraphemeGenerator.h"
#import "flite.h"

#import "OERuntimeVerbosity.h"
extern int openears_logging;

cst_voice *graphemeGenerationVoice;
@implementation OEGraphemeGenerator

void unregister_cmu_us_kal_phon(cst_voice *vox);
cst_voice *register_cmu_us_kal_phon(const char *voxdir);

- (void)dealloc {
	unregister_cmu_us_kal_phon(graphemeGenerationVoice);
}

- (instancetype) init 
{
    self = [super init];
    if (self) {
		flite_init();
		cst_features *extra_feats = new_features();
		feat_set_string(extra_feats,"print_info_relation","Segment");
		graphemeGenerationVoice = register_cmu_us_kal_phon(NULL);
        feat_copy_into(extra_feats,graphemeGenerationVoice->features);
		delete_features(extra_feats);
    }
    return self;
}


- (NSString *) convertGraphemes:(NSString *)phrase {
	
	if(openears_logging == 1) NSLog(@"Using convertGraphemes for the word or phrase %@ which doesn't appear in the dictionary", phrase);
    
    cst_utterance *utterance = flite_synth_text((char *)[phrase UTF8String],graphemeGenerationVoice);
    
	NSMutableString *phonesMutableString = [[NSMutableString alloc] init];
    
	cst_item *item;
	
    const char *relname = utt_feat_string(utterance,"print_info_relation");
    
    for (item = relation_head(utt_relation(utterance,relname)); item; item = item_next(item)) {
        
		NSString *bufferString = [NSString stringWithFormat:@"%s", item_feat_string(item,"name")];
        
		[phonesMutableString appendString:[NSString stringWithFormat:@"%@ ",bufferString]];
    }
	
    const char *destinationString = [(NSString *)phonesMutableString UTF8String];
	
    
    delete_utterance(utterance);
	
    NSString *stringToReturn = [NSString stringWithFormat:@"%s", destinationString];
	
    return stringToReturn;
}

@end

