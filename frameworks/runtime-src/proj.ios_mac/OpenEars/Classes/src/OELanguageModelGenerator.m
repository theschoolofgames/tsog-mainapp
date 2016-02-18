//  OpenEars 
//  http://www.politepix.com/openears
//
//  OELanguageModelGenerator.m
//  OpenEars
//
//  OELanguageModelGenerator is a class which creates new grammars
//
//  Copyright Politepix UG (haftungsbeschränkt) 2014. All rights reserved.
//  http://www.politepix.com
//  Contact at http://www.politepix.com/contact
//
//  this file is licensed under the Politepix Shared Source license found 
//  found in the root of the source distribution. Please see the file "Version.txt" in the root of 
//  the source distribution for the version number of this OpenEars package.


#import "OELanguageModelGenerator.h"
#import "OEGrammarGenerator.h"
#import "OEGraphemeGenerator.h"
#import "OECMUCLMTKModel.h"

#import "OERuntimeVerbosity.h"
#import "OEAcousticModel.h"
#import "OESScribe.h"

@interface OELanguageModelGenerator ()

@end

@implementation OELanguageModelGenerator

extern int verbose_cmuclmtk;

extern int openears_logging;

static NSString * const kIntrawordCharactersString  = @"-'";                        // Characters that we leave in place if they are intraword, otherwise automatically remove.
static NSString * const kIgnoredCharactersString    = @"!?.,:; ";                    // Characters which we do not automatically remove, instead automatically leaving them in place.

- (instancetype) init {
    if (self = [super init]) {
        _useFallbackMethod = TRUE;
        _iterationStorageArray = [[NSMutableArray alloc] init];
        _graphemeGenerator = [[OEGraphemeGenerator alloc] init];
    }
    return self;
}

- (NSString *)pathToCachesDirectory {
    return [NSString stringWithFormat:@"%@",NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES)[0]];
}

- (NSArray *) compactWhitespaceAndFixCharactersOfArrayEntries:(NSArray *)array {
    
    NSMutableArray *storageArray = [NSMutableArray new];
    
    for(NSString *string in array) {
        NSString *text = string;

        NSCharacterSet *whitespaceAndNewlineCharacterSet = [NSCharacterSet whitespaceAndNewlineCharacterSet];
        text = [text stringByTrimmingCharactersInSet:whitespaceAndNewlineCharacterSet]; 
        NSArray *componentArray = [text componentsSeparatedByCharactersInSet:whitespaceAndNewlineCharacterSet];
        componentArray = [componentArray filteredArrayUsingPredicate:[NSPredicate predicateWithFormat:@"self <> ''"]];
        
        text = [componentArray componentsJoinedByString:@" "];
                        
        text = [[text stringByReplacingOccurrencesOfString:@"‘" withString:@"'"]stringByReplacingOccurrencesOfString:@"’" withString:@"'"]; // Make any smart quotes into straight quotes automatically before handling apostrophes.
        text = [text stringByReplacingOccurrencesOfString:@"--" withString:@"–"]; // Make fake m-dashes into real m-dashes before handling hyphens.
        
        NSMutableCharacterSet *lettersNumbersAndIgnoredSymbols = [NSMutableCharacterSet alphanumericCharacterSet];
        
        [lettersNumbersAndIgnoredSymbols addCharactersInString:[NSString stringWithFormat:@"%@%@",kIntrawordCharactersString,kIgnoredCharactersString]]; // A character set comprising letters, numbers, intraword characters we remove in a special way, and characters we can leave in place.
        
        text = [[text componentsSeparatedByCharactersInSet:[lettersNumbersAndIgnoredSymbols invertedSet]] componentsJoinedByString:@" "]; // Remove all symbols which aren't in the character set above.
        
        text = [self removeAllButIntrawordOccurrencesOfCharacter:@"-" inText:text]; // Remove dashes/hyphens, unless they are found between two letters.
        
        text = [self removeAllButIntrawordOccurrencesOfCharacter:@"'" inText:text]; // Remove apostrophes, unless they are found between two letters, which we now know will only be in the form of straight quotes.
        
        text = [text stringByReplacingOccurrencesOfString:@" ." withString:@"."]; // Remove space-prepended punctuation, yuck.
        text = [text stringByReplacingOccurrencesOfString:@" ?" withString:@"."]; 
        text = [text stringByReplacingOccurrencesOfString:@" !" withString:@"."]; 
        text = [text stringByReplacingOccurrencesOfString:@" ," withString:@"."]; 
        text = [text stringByReplacingOccurrencesOfString:@" :" withString:@"."]; 
        text = [text stringByReplacingOccurrencesOfString:@" ;" withString:@"."]; 
        
        text = [text stringByTrimmingCharactersInSet:whitespaceAndNewlineCharacterSet]; // Recompress whitespace.
        componentArray = [text componentsSeparatedByCharactersInSet:whitespaceAndNewlineCharacterSet];
        componentArray = [componentArray filteredArrayUsingPredicate:[NSPredicate predicateWithFormat:@"self <> ''"]];
        
        if([[componentArray componentsJoinedByString:@" "] rangeOfCharacterFromSet:[NSCharacterSet alphanumericCharacterSet]].location != NSNotFound) { // If this array contains any letters or numbers, add it back in, otherwise don't – it's blank or just has characters.
            [storageArray addObject:[componentArray componentsJoinedByString:@" "]];
        }
    }
    
    return storageArray;
}

- (NSString *) removeAllButIntrawordOccurrencesOfCharacter:(NSString *)character inText:(NSString *)text {
    
    NSArray *textArray = [text componentsSeparatedByCharactersInSet:[NSCharacterSet characterSetWithCharactersInString:character]]; // Separate segments around this character
    
    NSMutableArray *mutableTextArray = [NSMutableArray new]; // Store processed segments
    
    for(NSString *segment in textArray) {
        
        NSString *nextSegment = nil;
        
        if(([textArray indexOfObject:segment] + 1) < [textArray count]) { // If there is a next segment, store it, otherwise fake next segment.
            nextSegment = [textArray objectAtIndex:[textArray indexOfObject:segment] + 1];
        } else {
            nextSegment = @"";
        }
        
        if( // If there's a character at the end of this segment and a character at the start of the next segment and they're both letters we found an intraword character.
           [segment length] > 0 
           && 
           [nextSegment length] > 0
           &&
           ![segment isEqual:[textArray lastObject]] 
           && 
           [[segment substringFromIndex:[segment length] - 1] rangeOfCharacterFromSet:[NSCharacterSet letterCharacterSet]].location != NSNotFound 
           && 
           [[nextSegment substringFromIndex:0] rangeOfCharacterFromSet:[NSCharacterSet letterCharacterSet]].location != NSNotFound
           ) {
            [mutableTextArray addObject:[NSString stringWithFormat:@"%@%@",segment,character]]; // This is an intraword character, so add it to the end of the segment so it remains when we reassemble.
        } else {
            [mutableTextArray addObject:segment]; // If there isn't a word with a letter in front and in back, it isn't intraword, just add it back with the special character still absent.
        }
    }
    
    return [mutableTextArray componentsJoinedByString:@""]; // Rejoin everything without the special character (other than the ones we added when they were intraword).
}

- (NSArray *) performDictionaryLookup:(NSArray *)array inString:(NSString *)stringInput forAcousticModelAtPath:(NSString *)acousticModelPath {
    
    NSMutableArray *mutableArrayOfWordsToMatch = [[NSMutableArray alloc] initWithArray:array];
    
    NSUInteger position = 0;
    NSInteger preSearchBuffer = 0;
    
    NSMutableArray *matches = [NSMutableArray array];
    
    NSString *lastFoundFirstCharacter = @"";
    
    while (position != stringInput.length) {
        
        if([mutableArrayOfWordsToMatch count] <= 0) { // If we're at the top of the loop without any more words, stop.
            break;
        }  

        preSearchBuffer = 200;
        
        if(preSearchBuffer > position) preSearchBuffer = position; // We want to be able to re-search a range if we have multiple words which should find the same entry.        
        
        NSString *stringToSearch = [[mutableArrayOfWordsToMatch[0] stringByTrimmingCharactersInSet:[[NSCharacterSet alphanumericCharacterSet]invertedSet]]uppercaseString];
        
        NSInteger lengthOfSearch = 0;
        
        NSInteger spanOfOneLetterInLargeLookupDictionary = 350000;
        
        if([stringToSearch hasPrefix:lastFoundFirstCharacter] && stringInput.length - position > spanOfOneLetterInLargeLookupDictionary) { // If we're still looking up the same first letter as the last word, we don't need to search the entire string forward – 350000 is enough characters until that first letter changes.
            lengthOfSearch = spanOfOneLetterInLargeLookupDictionary;
        } else {
            lengthOfSearch = stringInput.length - position; // However, if there are fewer than 350000 characters remaining in the string, we'll just search through to the end of the string.
        }
        
        NSRange remaining = NSMakeRange(position - preSearchBuffer, lengthOfSearch);
        NSRange rangeOfCurrentSearch = [stringInput
                                        rangeOfString:[NSString stringWithFormat:@"\n%@\t",stringToSearch]
                                        options:NSLiteralSearch
                                        range:remaining
                                        ]; // Just search for the first pronunciation.
        if (rangeOfCurrentSearch.location != NSNotFound) {
            
            lastFoundFirstCharacter = [stringToSearch substringToIndex:1]; // Set the last found character to this character
            
            NSRange lineRange = [stringInput lineRangeForRange:NSMakeRange(rangeOfCurrentSearch.location + 1, rangeOfCurrentSearch.length)];
            
            NSString *matchingLine = [stringInput substringWithRange:NSMakeRange(lineRange.location, lineRange.length - 1)];
            
            NSArray *matchingLineHalves = [matchingLine componentsSeparatedByString:@"\t"];
            
            NSString *matchingLineFixed = [NSString stringWithFormat:@"%@\t%@",mutableArrayOfWordsToMatch[0],matchingLineHalves[1]];
            
            [matches addObject:matchingLineFixed]; // Grab the whole line of the hit but with the original entry replaced by the original request.
            
            NSInteger rangeLocation = rangeOfCurrentSearch.location;
            NSInteger rangeLength = 200;
            
            if(stringInput.length - rangeOfCurrentSearch.location < rangeLength) { // Only use the searchPadding if there is that much room left in the string.
                rangeLength = stringInput.length - rangeOfCurrentSearch.location;
            } 

            NSInteger newlocation = rangeLocation;
            NSInteger lastlocation = newlocation;
            
            for(int pronunciationAlternativeNumber = 2; pronunciationAlternativeNumber < 6; pronunciationAlternativeNumber++) { // We really only need to do this from 2-5.
                NSRange morematches = [stringInput
                                       rangeOfString:[NSString stringWithFormat:@"\n%@(%d",stringToSearch,pronunciationAlternativeNumber]
                                       options:NSLiteralSearch
                                       range:NSMakeRange(newlocation, (rangeLength - (newlocation-lastlocation)))
                                       ];
                if(morematches.location != NSNotFound) {
                    NSRange moreMatchesLineRange = [stringInput lineRangeForRange:NSMakeRange(morematches.location + 1, morematches.length)]; // Plus one because I don't actually want the line break at the beginning.
                    
                    NSString *moreMatchesLine = [stringInput substringWithRange:NSMakeRange(moreMatchesLineRange.location, moreMatchesLineRange.length - 1)];
                    
                    NSArray *moreMatchesLineHalves = [moreMatchesLine componentsSeparatedByString:@"("];
                    
                    NSString *moreMatchesLineFixed = [NSString stringWithFormat:@"%@(%@",mutableArrayOfWordsToMatch[0],moreMatchesLineHalves[1]];
                    
                    [matches addObject:moreMatchesLineFixed]; // Grab the whole line of the hit.
                    lastlocation = newlocation;
                    newlocation = morematches.location;
                    
                } else {
                    break;   
                }
            }
            
            rangeOfCurrentSearch.length = rangeOfCurrentSearch.location - position;
            rangeOfCurrentSearch.location = position;
            [mutableArrayOfWordsToMatch removeObjectAtIndex:0]; // Remove the word.
            position += (rangeOfCurrentSearch.length + 1);
            
        } else { // No hits.
            
            NSString *unmatchedWord = mutableArrayOfWordsToMatch[0];
            
            if(openears_logging == 1) NSLog(@"The word %@ was not found in the dictionary %@/LanguageModelGeneratorLookupList.text.",unmatchedWord,acousticModelPath);

            if(self.useFallbackMethod) { // If the user hasn't overridden the use of the fall back method
   
                if(openears_logging == 1)NSLog(@"Now using the fallback method to look up the word %@",unmatchedWord);
                NSString *formattedString = nil;
                if([acousticModelPath rangeOfString:@"AcousticModelEnglish"].location != NSNotFound) { // if they are using the english or spanish dictionary 
                    if(openears_logging == 1)NSLog(@"If this is happening more frequently than you would expect, the most likely cause for it is since you are using the English phonetic lookup dictionary is that your words are not in English or aren't dictionary words.");
                    
                    NSString *graphemes = [self.graphemeGenerator convertGraphemes:unmatchedWord];
                    NSString *correctedString = [[graphemes stringByReplacingOccurrencesOfString:@"ax" withString:@"ah"]stringByReplacingOccurrencesOfString:@"pau " withString:@""];
                    
                    NSString *uppercasedCorrectedString = [correctedString uppercaseString];
                    formattedString = [NSString stringWithFormat:@"%@\t%@",unmatchedWord,uppercasedCorrectedString]; // output needs to be capitalized if this is for the default phonetic dictionary.
                    
                } else if ([acousticModelPath rangeOfString:@"AcousticModelSpanish"].location != NSNotFound) {
                    
                    if(openears_logging == 1)NSLog(@"If this is happening more frequently than you would expect, the most likely cause for it is since you are using the Spanish phonetic lookup dictionary is that your words are not in Spanish or aren't dictionary words.");
                    
                    NSAttributedString *attributedString = [[NSAttributedString alloc] initWithString:unmatchedWord];
                    /**\cond HIDDEN_SYMBOLS*/
                    OESScribe *_scribe = [[OESScribe alloc] initWithGrammar:nil forText:attributedString sender:self];
                    
                    /**\endcond */
                    
                    NSString *graphemes = [[_scribe renderedText]string];
                    
                    NSString *uppercasedCorrectedString = [graphemes uppercaseString];
                    formattedString = [NSString stringWithFormat:@"%@\t%@",unmatchedWord,uppercasedCorrectedString]; // output needs to be capitalized if this is for the default phonetic dictionary.
                    
                } else { // if they aren't using the english phonetic dictionary
                    if(openears_logging == 1)NSLog(@"If this is happening more frequently than you would expect, the most likely cause for it is since you are not using the English or Spanish phonetic lookup dictionary is that there is an issue with the phonetic dictionary you are using (for instance, it is not in alphabetical order or it doesn't use the correct formatting).");
                    NSString *graphemes = [self.graphemeGenerator convertGraphemes:unmatchedWord];
                    NSString *correctedString = [[graphemes stringByReplacingOccurrencesOfString:@"ax" withString:@"ah"]stringByReplacingOccurrencesOfString:@"pau " withString:@""];
                    
                    formattedString = [NSString stringWithFormat:@"%@\t%@",unmatchedWord,correctedString];  // Don't capitalize if not using english dictionary.
                }
                
                NSString *finalizedString = [formattedString stringByReplacingOccurrencesOfString:@" \n" withString:@"\n"];                     
                
                [matches addObject:finalizedString];
                
            } else {
                
                if(openears_logging == 1)NSLog(@"Since the fallback method has been turned off and the word wasn't found in the phonetic dictionary, we are dropping the word %@ from the dynamically-created phonetic dictionary.",unmatchedWord);
                
                if([acousticModelPath rangeOfString:@"AcousticModelEnglish"].location != NSNotFound || [acousticModelPath rangeOfString:@"AcousticModelSpanish"].location != NSNotFound) { // if they are using the english or spanish phonetic dictionary
                    if(openears_logging == 1)NSLog(@"If this is happening more frequently than you would expect, the most likely cause for it is since you are using the English or the Spanish phonetic lookup dictionary is that your words are not in English/Spanish or aren't dictionary words.");
                } else { // if they aren't using the english phonetic dictionary
                    if(openears_logging == 1)NSLog(@"If this is happening more frequently than you would expect, the most likely cause for it is since you are not using the English or the Spanish phonetic lookup dictionary is that there is an issue with the phonetic dictionary you are using (for instance, it is not in alphabetical order or it doesn't use the correct formatting).");
                }
            }
            
            [mutableArrayOfWordsToMatch removeObjectAtIndex:0]; // Remove from the word list.
        }
    }    
    
    return matches;
}

 
- (void) createLanguageModelFromFilename:(NSString *)fileName {
    if(openears_logging == 1) NSLog(@"Starting dynamic language model generation"); 
    
    NSTimeInterval start = 0.0;
    
    if(openears_logging == 1) {
        start = [NSDate timeIntervalSinceReferenceDate]; // If logging is on, let's time the language model processing time so the developer can profile it.
    }
    
    OECMUCLMTKModel *cmuCLMTKModel = [[OECMUCLMTKModel alloc] init]; // First, use the CMUCLMTK port to create a language model
    // -linear | -absolute | -good_turing | -witten_bell
    cmuCLMTKModel.algorithmType = @"-witten_bell";
    
    if(self.ngrams) {
        cmuCLMTKModel.ngrams = self.ngrams;
    }
    
	[cmuCLMTKModel runCMUCLMTKOnCorpusFile:[self.pathToCachesDirectory stringByAppendingPathComponent:[NSString stringWithFormat:@"%@.corpus",fileName]] withDMP:TRUE];
    self.ngrams = nil;

#ifdef KEEPFILES
#else    
	NSError *deleteCorpusError = nil;
	NSFileManager *fileManager = [NSFileManager defaultManager]; // Let's make a best effort to erase the corpus now that we're done with it, but we'll carry on if it gives an error.
	[fileManager removeItemAtPath:[self.pathToCachesDirectory stringByAppendingPathComponent:[NSString stringWithFormat:@"%@.corpus",fileName]] error:&deleteCorpusError];
	if(deleteCorpusError != 0) {
		if(openears_logging == 1) NSLog(@"Error while deleting language model corpus: %@", deleteCorpusError);
	}

#endif
    
    if(openears_logging == 1) {
        NSLog(@"Done creating language model with CMUCLMTK in %f seconds.",[NSDate timeIntervalSinceReferenceDate]-start);
    }
}

- (NSError *) checkModelForContent:(NSArray *)normalizedLanguageModelArray {
    if([normalizedLanguageModelArray count] < 1 || [[normalizedLanguageModelArray componentsJoinedByString:@""]length] < 1) {

		return [NSError errorWithDomain:@"com.politepix.openears" code:6000 userInfo:@{NSLocalizedDescriptionKey: @"Language model has no content."}];
	} 
    return nil;
}

- (NSError *) writeOutCorpusForArray:(NSArray *)normalizedLanguageModelArray toFilename:(NSString *)fileName {
    NSMutableString *mutableCorpusString = [[NSMutableString alloc] initWithString:[normalizedLanguageModelArray componentsJoinedByString:@" </s>\n<s> "]];
    
    [mutableCorpusString appendString:@" </s>\n"];
    [mutableCorpusString insertString:@"<s> " atIndex:0];
    NSString *corpusString = (NSString *)mutableCorpusString;
    NSError *error = nil;
    [corpusString writeToFile:[self.pathToCachesDirectory stringByAppendingPathComponent:[NSString stringWithFormat:@"%@.corpus",fileName]] atomically:YES encoding:NSUTF8StringEncoding error:&error];
    if (error){
        // Handle error here
        if(openears_logging == 1) NSLog(@"Error: file was not written out due to error %@", error);

        return error;
    }
    
    return nil;
}

- (void) checkPhoneticDictionaryAtAcousticModelPath:(NSString *)acousticModelPath {

    if(![[NSFileManager defaultManager] isReadableFileAtPath:acousticModelPath]) {
        NSLog(@"Error: the default phonetic dictionary %@ can't be found in the app bundle but the app is attempting to access it, most likely there will be a crash now.",acousticModelPath);
    }
}

- (NSError *) generateLanguageModelFromTextFile:(NSString *)pathToTextFile withFilesNamed:(NSString *)fileName  forAcousticModelAtPath:(NSString *)acousticModelPath{
    
    NSString *textFile = nil;
    
    // Return an error if we can't read a file at that location at all.
    
    if(![[NSFileManager defaultManager] isReadableFileAtPath:pathToTextFile]) {
        if(openears_logging == 1)NSLog(@"Error: you are trying to generate a language model from a text file at the path %@ but there is no file at that location which can be opened.", pathToTextFile);
    
        return [NSError errorWithDomain:@"com.politepix.openears" code:10020 userInfo:@{NSLocalizedDescriptionKey: [NSString stringWithFormat:@"Error: you are trying to generate a language model from a text file at the path %@ but there is no file at that location which can be opened.",pathToTextFile]}];
    } else { // Try to read in the file
        NSError *error = nil;
        textFile = [NSString stringWithContentsOfFile:pathToTextFile encoding:NSUTF8StringEncoding error:&error];
        if(error) return error; // Die if we can't read in this particular file as a string.

    }
    
    NSMutableArray *mutableArrayToReturn = [[NSMutableArray alloc] init];
        
    NSArray *corpusArray = [textFile componentsSeparatedByCharactersInSet:
                            [NSCharacterSet newlineCharacterSet]]; // Create an array from the corpus that is separated by any variety of newlines.
    
    for(NSString *string in corpusArray) { // Fast enumerate through this array
        if ([[string stringByTrimmingCharactersInSet: [NSCharacterSet whitespaceAndNewlineCharacterSet]] length] != 0) { // Only keep strings which consist of more than whitespace or newlines only
            // This string has something in it besides whitespace or newlines
            NSString *trimmedString = [string stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]]; // If we find a string that possesses content, remove whitespace and newlines from its very beginning and very end.

            [mutableArrayToReturn addObject:trimmedString]; // Add it to the array
        } 
    }
    
    
    
    NSArray *arrayToReturn = [NSArray arrayWithArray:mutableArrayToReturn]; // Set this to an immutable object to return
    
    return [self generateLanguageModelFromArray:arrayToReturn withFilesNamed:fileName forAcousticModelAtPath:acousticModelPath]; // hand off this string to the real method.

}


- (NSError *) generateLanguageModelFromArray:(NSArray *)languageModelArray withFilesNamed:(NSString *)fileName forAcousticModelAtPath:(NSString *)acousticModelPath {

    NSTimeInterval start = [NSDate timeIntervalSinceReferenceDate];
    
    NSString *completePathToPhoneticDictionary  = [NSString stringWithFormat:@"%@/%@",acousticModelPath,@"LanguageModelGeneratorLookupList.text"];
    acousticModelPath = completePathToPhoneticDictionary;
        
    if(self.verboseLanguageModelGenerator) {
        verbose_cmuclmtk = 1; 
    } else {
        verbose_cmuclmtk = 0;
    }
    
    NSArray *normalizedLanguageModelArray = [self compactWhitespaceAndFixCharactersOfArrayEntries:languageModelArray]; // We are normalizing the array first to get rid of any whitespace other than one single space between two words.
    
    NSError *error = nil; // Used throughout the method

    error = [self checkModelForContent:normalizedLanguageModelArray]; // Make sure this language model has something in it.
    if(error) {

        return error;   
    }

    error = [self writeOutCorpusForArray:normalizedLanguageModelArray toFilename:fileName]; // Write the corpus out to the filesystem.
    
    if(error) {
        return error;   
    }

    [self createLanguageModelFromFilename:fileName]; // Generate the language model using CMUCLMTK.
	
    NSMutableArray *dictionaryResultsArray = [[NSMutableArray alloc] init];
    
    error = [self createDictionaryFromWordArray:normalizedLanguageModelArray intoDictionaryArray:dictionaryResultsArray usingAcousticModelAtPath:acousticModelPath];
    
    if(!error) {
        // Write out the results array as a dictionary file in the caches directory
        BOOL writeOutSuccess = [[NSString stringWithFormat:@"%@\n",[dictionaryResultsArray componentsJoinedByString:@"\n"]] writeToFile:[self.pathToCachesDirectory stringByAppendingPathComponent:[NSString stringWithFormat:@"%@.dic",fileName]] atomically:YES encoding:NSUTF8StringEncoding error:&error];
        
        if (!writeOutSuccess){ // If this fails, return an error.
            if(openears_logging == 1) NSLog(@"Error writing out dictionary: %@", error);		
            return error;
        } 
        
    } else {
        return [NSError errorWithDomain:@"com.politepix.openears" code:6001 userInfo:@{NSLocalizedDescriptionKey: @"Not possible to create a dictionary for this wordset."}];    
    }
    
    if(openears_logging == 1) NSLog(@"I'm done running dynamic language model generation and it took %f seconds", [NSDate timeIntervalSinceReferenceDate] - start); // Deliver the timing info if logging is on.
    
    return nil;
}

- (NSDictionary *) renameKey:(id)originalKey to:(id)newKey inDictionary:(NSDictionary *)dictionary {
    
    NSMutableDictionary *tempMutableDictionary = [[NSMutableDictionary alloc] initWithDictionary:dictionary];
    
    id value = tempMutableDictionary[originalKey];
    [tempMutableDictionary removeObjectForKey:originalKey];
    tempMutableDictionary[newKey] = value;
    
    return (NSDictionary *)tempMutableDictionary;
}

- (NSString *) pathToSuccessfullyGeneratedDictionaryWithRequestedName:(NSString *)name {
    return [NSString stringWithFormat:@"%@/%@.%@",self.pathToCachesDirectory,name,@"dic"];
}

- (NSString *) pathToSuccessfullyGeneratedLanguageModelWithRequestedName:(NSString *)name {
    return [NSString stringWithFormat:@"%@/%@.%@",self.pathToCachesDirectory,name,@"DMP"];    
}

- (NSString *) pathToSuccessfullyGeneratedGrammarWithRequestedName:(NSString *)name {
    return [NSString stringWithFormat:@"%@/%@.%@",self.pathToCachesDirectory,name,@"gram"];
}

- (NSError *) createDictionaryFromWordArray:(NSArray *)normalizedLanguageModelArray intoDictionaryArray:(NSMutableArray *)dictionaryResultsArray usingAcousticModelAtPath:(NSString *)acousticModelPath {
    
    NSError *error = nil; // Used throughout the method
        
    NSString *allWords = [normalizedLanguageModelArray componentsJoinedByString:@" "]; // Grab all the words in question
    
    NSArray *allEntries = [allWords componentsSeparatedByCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]]; // Make an array entry for anything separated by a whitespace symbol
    
    NSArray *arrayWithNoDuplicates = [[NSSet setWithArray:allEntries] allObjects]; // Remove duplicate words through the magic of NSSet
    
    NSArray *sortedArray = [arrayWithNoDuplicates sortedArrayUsingSelector:@selector(localizedCompare:)]; // Alphabetic sort
        
    [self checkPhoneticDictionaryAtAcousticModelPath:acousticModelPath]; // Give some helpful logging depending on the phonetic dictionary situation and assign the correct dictionary where needed.
    
    // load the dictionary file, whatever it is.
    NSString *pronunciationDictionary = [[NSString alloc] initWithContentsOfFile:acousticModelPath encoding:NSUTF8StringEncoding error:&error];
    
    if (error) { // If we can't load it, return an error immediately
        NSLog(@"Error while trying to load the pronunciation dictionary: %@", error);  
         // This uses a lot of memory and should be memory managed and released as early as possible.
        return error;
    }
    
    NSTimeInterval performDictionaryLookupTime = 0.0; // We'll time this operation since it's critical.
    
    if(openears_logging == 1) {
        performDictionaryLookupTime = [NSDate timeIntervalSinceReferenceDate];
    }
    
    [dictionaryResultsArray addObjectsFromArray:[self performDictionaryLookup:sortedArray inString:pronunciationDictionary forAcousticModelAtPath:acousticModelPath]];// Do the dictionary pronunciation lookup

    if(openears_logging == 1) NSLog(@"I'm done running performDictionaryLookup and it took %f seconds", [NSDate timeIntervalSinceReferenceDate] - performDictionaryLookupTime);
    
     // This uses a lot of memory and should be memory managed and released as early as possible.
    
    return nil;
    
}

- (NSError *) generateGrammarFromDictionary:(NSDictionary *)grammarDictionary withFilesNamed:(NSString *)fileName forAcousticModelAtPath:(NSString *)acousticModelPath {
    
    NSDictionary *fixedGrammarDictionary = [self renameKey:[[grammarDictionary allKeys] firstObject] to:[NSString stringWithFormat:@"PublicRule%@",[[grammarDictionary allKeys] firstObject]] inDictionary:grammarDictionary];
    
    NSMutableArray *phoneticDictionaryArray = [[NSMutableArray alloc] init];
    
    OEGrammarGenerator *grammarGenerator = [[OEGrammarGenerator alloc] init];
    
    NSString *completePathToPhoneticDictionary  = [NSString stringWithFormat:@"%@/%@",acousticModelPath,@"LanguageModelGeneratorLookupList.text"];
    acousticModelPath = completePathToPhoneticDictionary;
    
    grammarGenerator.delegate = self;
    grammarGenerator.acousticModelPath = acousticModelPath;
    
    NSError *error = [grammarGenerator createGrammarFromDictionary:fixedGrammarDictionary withRequestedName:fileName creatingPhoneticDictionaryArray:phoneticDictionaryArray];
    
    if(error) {
        NSLog(@"It wasn't possible to create this grammar: %@", grammarDictionary);
        error = [NSError errorWithDomain:@"com.politepix.openears" code:10040 userInfo:@{NSLocalizedDescriptionKey: @"It wasn't possible to generate a grammar for this dictionary, please turn on OELogging for more information"}];
    }
    
    return error;
}



@end
