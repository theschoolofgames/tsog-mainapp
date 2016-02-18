//
//  OEGrammarGenerator.m
//  OpenEars
//
//  Created by Halle on 9/30/13.
//  Copyright (c) 2013 Politepix. All rights reserved.
//

#import "OELanguageModelGenerator.h"
#import "OEGrammarGenerator.h"
#import "OECMUCLMTKModel.h"
#import "OERuntimeVerbosity.h"

#import "jsgf.h"

#define kVerboseRuleAnalysis 0

@implementation OEGrammarGenerator
extern int openears_logging;

- (NSString *)plistPath {
    return [NSTemporaryDirectory() stringByAppendingPathComponent:@"openears_grammar.plist"];
}

- (void) addWorkingString:(NSString *)workingString toRuleArray:(NSMutableArray *)arrayToAdd withRuleType:(NSString *)ruleType isPublic:(BOOL)isPublic {
    
    NSCharacterSet *whitespaceOnlyCharacterSet = [NSCharacterSet whitespaceAndNewlineCharacterSet];
    
    [arrayToAdd addObjectsFromArray:[[workingString stringByReplacingOccurrencesOfString:@"###RULENAMEEND###" withString:@"###SEPARATORTOKEN###"] componentsSeparatedByString:@"###SEPARATORTOKEN###"]];
    if(isPublic) {
        [arrayToAdd insertObject:[NSString stringWithFormat:@"PublicRule%@",ruleType] atIndex:0];
    } else {
        [arrayToAdd insertObject:ruleType atIndex:0];
    }
    
    NSMutableArray *indicesToRemove = [[NSMutableArray alloc] init];
    int index = 0;
    
    for(NSString *string in arrayToAdd) { // Note which entries are empty
        if(([string isEqualToString:@""]) || ([[string stringByTrimmingCharactersInSet:whitespaceOnlyCharacterSet] length] == 0)) {
            [indicesToRemove addObject:@(index)];
        }
        index++;
    }
    
    NSSortDescriptor *descendingNumericSort = [NSSortDescriptor sortDescriptorWithKey:@"self" ascending:NO]; // order them high to low
    [indicesToRemove sortUsingDescriptors:@[descendingNumericSort]];
    
    for(NSNumber *indexNumber in indicesToRemove) { // remove them in descending order to keep the earlier indices correct
        [arrayToAdd removeObjectAtIndex:[indexNumber intValue]];
    }
    
    
    index = 0;
    
    NSMutableArray *indicesToConvertIntoNumbers = [[NSMutableArray alloc] init];
    
    for(NSString *string in arrayToAdd) { // Note which entries are rules
        if([string rangeOfString:@"###RULENAMEBEGIN###rule_"].location != NSNotFound) { // This is a rule
            [indicesToConvertIntoNumbers addObject:@(index)];
        }
        index++;
    }
    
    [indicesToConvertIntoNumbers sortUsingDescriptors:@[descendingNumericSort]];
        
    for(NSNumber *indexNumber in indicesToConvertIntoNumbers) { // remove them in descending order to keep the earlier indices correct
        NSString *ruleNumberAsString = [arrayToAdd[[indexNumber intValue]] stringByReplacingOccurrencesOfString:@"###RULENAMEBEGIN###rule_" withString:@""];
        NSNumber *ruleNumberFromString = @([ruleNumberAsString integerValue]);
        arrayToAdd[[indexNumber intValue]] = ruleNumberFromString;
    }
}

- (NSError *) prepareGrammarForGenerationUsingDictionary:(NSDictionary *)grammarDictionary withRequestedName:(NSString *)fileName creatingPhoneticDictionaryArray:(NSMutableArray *)phoneticDictionaryArray  withRuleArray:(NSMutableArray *)ruleArray andRuleNumberArray:(NSMutableArray *)ruleNumberArray{
    
    // OneOfTheseWillBeSaidOnce // One of these NSStrings or subrules is required to be said
    // OneOfTheseCanBeSaidOnce // One of these NSStrings or subrules can be optionally said
    // OneOfTheseWillBeSaidWithOptionalRepetitions // One of these NSStrings or subrules is required to be said and can also be repeated
    // OneOfTheseCanBeSaidWithOptionalRepetitions // One of these NSStrings or subrules can optionally be said and can also be repeated
    
    // ThisWillBeSaidOnce // The items in the NSArray of this NSDictionary (NSStrings or subrules) will be interpreted in order and the whole thing is required and will be said once        
    // ThisCanBeSaidOnce // The items in the NSArray of this NSDictionary (NSStrings or subrules) will be interpreted in order and the whole thing is optional and can be said once 
    // ThisWillBeSaidWithOptionalRepetitions // The items in the NSArray of this NSDictionary (NSStrings or subrules) will be interpreted in order and the whole thing is required and will be said once but can also be repeated many times        
    // ThisCanBeSaidWithOptionalRepetitions // The items in the NSArray of this NSDictionary (NSStrings or subrules) will be interpreted in order and the whole thing is optional and can be said once but can also be repeated many times    
    
    // Interpreting this dictionary:
    
    // 1. The delivered dictionary has the composed public rulesset in it. It probably contains other dictionaries. Error check to make sure this is the case and then iterate through them.
    // 2. For each rule, read it through, create a rule name and an equal sign and do the following:
    
    // a. Every ThisWillBeSaidOnce is enclosed in parentheses.
    // b. Every ThisCanBeSaidOnce is enclosed in square brackets
    // c. Every ThisWillBeSaidWithOptionalRepetitions is enclosed in parentheses with an asterisk afterwards
    // d. Every ThisCanBeSaidWithOptionalRepetitions is enclosed in square brackets with an asterisk afterwards
    // e. Every OneOfTheseWillBeSaidOnce is enclosed in parentheses separated by pipes
    // f. Every OneOfTheseCanBeSaidOnce is enclosed in square brackets separated by pipes
    // g. Every OneOfTheseWillBeSaidWithOptionalRepetitions is enclosed in parentheses separated by pipes with an asterisk afterwards
    // h. Every OneOfTheseCanBeSaidWithOptionalRepetitions is enclosed in square brackets separated by pipes with an asterisk afterwards  
    
    // For each rule, the deepest-nested NSStrings have to be found and resolved before working backwards through to the top level.
        
    [grammarDictionary writeToFile:self.plistPath atomically:FALSE];
    NSError *createStringError = nil;
    NSString *plistString = [[NSString alloc] initWithContentsOfFile:self.plistPath encoding:NSUTF8StringEncoding error:&createStringError];
        
    if(!createStringError) {
        
        int ruleRound = 0; // This ruleset is zero-indexed in case it needs to be mentioned. I feel like "a set of rules" has a "first rule" which should be rule number one, but that's just going to create confusion forever and ever when stepping through its related arrays, so I'm doing the obvious thing.
        
        while( // Recur until we've cleared out all the rule entries
              [plistString rangeOfString:ThisWillBeSaidOnce].location != NSNotFound
              |
              [plistString rangeOfString:ThisCanBeSaidOnce].location != NSNotFound
              |
              [plistString rangeOfString:ThisWillBeSaidWithOptionalRepetitions].location != NSNotFound
              |
              [plistString rangeOfString:ThisCanBeSaidWithOptionalRepetitions].location != NSNotFound
              |
              [plistString rangeOfString:OneOfTheseWillBeSaidOnce].location != NSNotFound
              |
              [plistString rangeOfString:OneOfTheseCanBeSaidOnce].location != NSNotFound
              |
              [plistString rangeOfString:ThisWillBeSaidOnce].location != NSNotFound
              |
              [plistString rangeOfString:OneOfTheseWillBeSaidWithOptionalRepetitions].location != NSNotFound
              |
              [plistString rangeOfString:OneOfTheseCanBeSaidWithOptionalRepetitions].location != NSNotFound
              ) {
            
            NSString *stringToProcess = [self analyzeRuleString:plistString];
            if(!stringToProcess) {
                NSLog(@"Error: Grammar string to process was nil: %@", stringToProcess);
                
            } else {
                
                NSString *workingString = stringToProcess;
                NSMutableArray *arrayToAdd = [[NSMutableArray alloc] init];
                NSString *ruleType = nil;
                
                [ruleNumberArray addObject:@(ruleRound)];
                
                BOOL publicRule = FALSE;
                
                if([stringToProcess rangeOfString:@"PublicRule"].location != NSNotFound) {
                    publicRule = TRUE;
                }
                
                if([stringToProcess rangeOfString:ThisWillBeSaidOnce].location != NSNotFound) ruleType = ThisWillBeSaidOnce;
                else if([stringToProcess rangeOfString:ThisCanBeSaidOnce].location != NSNotFound) ruleType = ThisCanBeSaidOnce;
                else if([stringToProcess rangeOfString:ThisWillBeSaidWithOptionalRepetitions].location != NSNotFound) ruleType = ThisWillBeSaidWithOptionalRepetitions;
                else if([stringToProcess rangeOfString:ThisCanBeSaidWithOptionalRepetitions].location != NSNotFound) ruleType = ThisCanBeSaidWithOptionalRepetitions;
                else if([stringToProcess rangeOfString:OneOfTheseWillBeSaidOnce].location != NSNotFound) ruleType = OneOfTheseWillBeSaidOnce;
                else if([stringToProcess rangeOfString:OneOfTheseCanBeSaidOnce].location != NSNotFound) ruleType = OneOfTheseCanBeSaidOnce;
                else if([stringToProcess rangeOfString:OneOfTheseWillBeSaidWithOptionalRepetitions].location != NSNotFound) ruleType = OneOfTheseWillBeSaidWithOptionalRepetitions;
                else if([stringToProcess rangeOfString:OneOfTheseCanBeSaidWithOptionalRepetitions].location != NSNotFound) ruleType = OneOfTheseCanBeSaidWithOptionalRepetitions;
                else {
                    if(openears_logging==1) NSLog(@"This rule string cannot be processed:%@",workingString);
                }
                
                workingString = [self deriveRuleString:workingString withRuleType:ruleType addingWordsToMutableArray:phoneticDictionaryArray];
                
                [self addWorkingString:workingString toRuleArray:arrayToAdd withRuleType:ruleType isPublic:publicRule];
                
                [ruleArray addObject:arrayToAdd];
                
                
                NSString *ruleName = [NSString stringWithFormat:@"rule_%d", ruleRound];
                ruleRound++;
                
                NSString *processedPlistString = [plistString stringByReplacingOccurrencesOfString:stringToProcess withString:[NSString stringWithFormat:@"###RULENAMEBEGIN###%@###RULENAMEEND###", ruleName]];
                
                plistString = processedPlistString;
                
            }
        }
    } else {
        return createStringError;   
    }
    return nil;
}

- (void) cleanUpAfterGeneration {
    
    NSError *removalError = nil;
    
    BOOL removalSuccess = [[NSFileManager defaultManager] removeItemAtPath:self.plistPath error:&removalError];
    
    if(!removalSuccess) {
        if(openears_logging == 1) {
            NSLog(@"Error: %@ (it wasn't possible to remove the grammar.plist)",removalError);   
        }
    }
    
    

}

- (NSError *) createGrammarFromDictionary:(NSDictionary *)grammarDictionary withRequestedName:(NSString *)fileName creatingPhoneticDictionaryArray:(NSMutableArray *)phoneticDictionaryArray {
    
    NSMutableArray *ruleArray = [[NSMutableArray alloc] init];
    NSMutableArray *ruleNumberArray = [[NSMutableArray alloc] init];

    NSError *grammarError = [self prepareGrammarForGenerationUsingDictionary:grammarDictionary withRequestedName:fileName creatingPhoneticDictionaryArray:phoneticDictionaryArray withRuleArray:ruleArray andRuleNumberArray:ruleNumberArray];
    
    if(!grammarError) {
    
        grammarError = [self outputJSGFFromRuleArray:ruleArray usingRuleNumberArray:ruleNumberArray withRequestedName:fileName];

    } else {
      grammarError = [NSError errorWithDomain:@"com.politepix.openears" code:6001 userInfo:@{NSLocalizedDescriptionKey: @"It wasn't possible to create this grammar."}];   
    }
    [self cleanUpAfterGeneration];
    
    return grammarError;
}

- (void) processMutableString:(NSMutableString *)mutableString fromRuleArray:(NSArray *)ruleArray atIndex:(int)arrayIndex withSeparator:(NSString *)separator bracket:(BOOL)bracket endCharacter:(NSString *)endCharacter {
    
    if(bracket) {
        [mutableString appendString:@"[ "];
    } else {
        [mutableString appendString:@"( "];
    }
    
    for(int j = 1; j < [ruleArray[arrayIndex]count];j++) {
        
        if(j == ([ruleArray[arrayIndex]count]-1)) {
            separator = @"";  
        } else {
            if([separator isEqualToString:@"|"]) {
                separator = @"| ";
            }
        }
        
        if([ruleArray[arrayIndex][j] isKindOfClass:[NSNumber class]]) {
            [mutableString appendString:[NSString stringWithFormat:@"<rule_%@> %@",ruleArray[arrayIndex][j],separator]];
        } else {
            [mutableString appendString:[NSString stringWithFormat:@"%@ %@",[ruleArray[arrayIndex][j] stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]],separator]];
        }
    }
    
    if(bracket) {
        [mutableString appendString:[NSString stringWithFormat:@"]%@;\n", endCharacter]];
    } else {
        [mutableString appendString:[NSString stringWithFormat:@")%@;\n", endCharacter]];
    }
}



- (NSError *) outputJSGFFromRuleArray:(NSArray *)ruleArray usingRuleNumberArray:(NSArray *)ruleNumberArray withRequestedName:(NSString *)fileName {
    
    NSMutableSet *jsgfDictionarySet = [[NSMutableSet alloc] init];
    
    for(NSArray *entry in ruleArray) {
        for(id object in entry) {
            if ([entry indexOfObject:object] != 0 && [object isKindOfClass:[NSString class]]) {
                NSArray *temporaryExplosionArray = [object componentsSeparatedByCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];  
                for(NSString *string in temporaryExplosionArray) {
                    [jsgfDictionarySet addObject:string]; // Add any real and unique word strings to the dictionary
                }
            }
        }
    }
    
    NSMutableArray *dictionaryResultsArray = [[NSMutableArray alloc] initWithArray:[jsgfDictionarySet allObjects]];
    
    [dictionaryResultsArray sortUsingSelector:@selector(localizedCompare:)];
    
    NSMutableArray *dictionaryArray = [[NSMutableArray alloc] init];
    NSError *error = nil;
    
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES); 
    NSString *cachesDirectory = [NSString stringWithFormat:@"%@/",paths[0]]; // Get caches directory
    
    error = [self.delegate createDictionaryFromWordArray:dictionaryResultsArray intoDictionaryArray:dictionaryArray usingAcousticModelAtPath:self.acousticModelPath]; // Fill the formatted pronunciation array
    NSString *filePathForDictionaryWriteout = [NSString stringWithFormat:@"%@/%@.dic",cachesDirectory,fileName];
    
    BOOL writeOutSuccess = [[dictionaryArray componentsJoinedByString:@"\n"] writeToFile:filePathForDictionaryWriteout atomically:YES encoding:NSUTF8StringEncoding error:&error];
    if (!writeOutSuccess){ // If this fails, return an error.
        if(openears_logging == 1) NSLog(@"Error writing out dictionary: %@", error);	
        
        return error;
    } 
    
    NSMutableString *workingString = [[NSMutableString alloc] init];
    
    int i = 0;
    
    for(i = 0; i < [ruleArray count]; i++) {
        
        NSString *stringToProcess = ruleArray[i][0];
        
        
        if([stringToProcess rangeOfString:@"PublicRule"].location != NSNotFound) {
            [workingString appendString:[NSString stringWithFormat:@"public <rule_%@> = ", ruleNumberArray[i]]];
        } else {
            [workingString appendString:[NSString stringWithFormat:@"<rule_%@> = ", ruleNumberArray[i]]];
        }
        
        if([stringToProcess rangeOfString:ThisWillBeSaidOnce].location != NSNotFound) { // ThisWillBeSaidOnce should go inside of parentheses and have separators replaced with space
            [self processMutableString:workingString fromRuleArray:ruleArray atIndex:i withSeparator:@"" bracket:FALSE endCharacter:@""];
            
        } else if([stringToProcess rangeOfString:ThisCanBeSaidOnce].location != NSNotFound) { // ThisCanBeSaidOnce should go inside of square brackets and should have separators replaced with space
            
            [self processMutableString:workingString fromRuleArray:ruleArray atIndex:i withSeparator:@"" bracket:TRUE endCharacter:@""];
            
        } else if([stringToProcess rangeOfString:ThisWillBeSaidWithOptionalRepetitions].location != NSNotFound) { // ThisWillBeSaidWithOptionalRepetitions should go inside of parentheses and have separators replaced with a space and a plus after parens (or maybe an asterisk, not clear at this time)
            
            [self processMutableString:workingString fromRuleArray:ruleArray atIndex:i withSeparator:@"" bracket:FALSE endCharacter:@"+"];
            
        } else if([stringToProcess rangeOfString:ThisCanBeSaidWithOptionalRepetitions].location != NSNotFound) { // ThisCanBeSaidWithOptionalRepetitions should go inside of square brackets and have separators replaced with a space and a star after the brackets
            
            [self processMutableString:workingString fromRuleArray:ruleArray atIndex:i withSeparator:@"" bracket:TRUE endCharacter:@"*"];
            
        } else if([stringToProcess rangeOfString:OneOfTheseWillBeSaidOnce].location != NSNotFound) { // OneOfTheseWillBeSaidOnce should go inside of parentheses and have separators replaced with pipe
            
            [self processMutableString:workingString fromRuleArray:ruleArray atIndex:i withSeparator:@"|" bracket:FALSE endCharacter:@""];
            
        } else if([stringToProcess rangeOfString:OneOfTheseCanBeSaidOnce].location != NSNotFound) { // OneOfTheseCanBeSaidOnce should go inside of square brackets and should have separators replaced with pipe
            
            [self processMutableString:workingString fromRuleArray:ruleArray atIndex:i withSeparator:@"|" bracket:TRUE endCharacter:@""];
            
        } else if([stringToProcess rangeOfString:OneOfTheseWillBeSaidWithOptionalRepetitions].location != NSNotFound) { // OneOfTheseWillBeSaidWithOptionalRepetitions should go inside of parentheses and have separators replaced with a pipe and a plus after parens (or possible an asterisk, isn't clear at this time)
            
            [self processMutableString:workingString fromRuleArray:ruleArray atIndex:i withSeparator:@"|" bracket:FALSE endCharacter:@"+"];
            
        } else if([stringToProcess rangeOfString:OneOfTheseCanBeSaidWithOptionalRepetitions].location != NSNotFound) {// OneOfTheseCanBeSaidWithOptionalRepetitions should go inside of square brackets and have separators replaced with a pipe and a star after the brackets
            
            [self processMutableString:workingString fromRuleArray:ruleArray atIndex:i withSeparator:@"|" bracket:TRUE endCharacter:@"*"];
            
        } else {
            if(openears_logging == 1) {
                NSLog(@"There was an issue with the content of this rule:%@",stringToProcess);
            }
        }
    }
    [workingString insertString:[NSString stringWithFormat:@"#JSGF V1.0;\ngrammar %@;\n",fileName] atIndex:0];
    
    writeOutSuccess = [workingString writeToFile:[cachesDirectory stringByAppendingPathComponent:[NSString stringWithFormat:@"%@.gram",fileName]] atomically:YES encoding:NSUTF8StringEncoding error:&error];
    
    if(!writeOutSuccess) {
        if(openears_logging == 1) {
            NSLog(@"Error while writing out JSGF:%@", error);
        }
        
        
        return [NSError errorWithDomain:@"com.politepix.openears" code:6000 userInfo:@{NSLocalizedDescriptionKey: @"It wasn't possible to write out this JSGF."}];
        
    } 
    
    return nil;
}

- (NSMutableString *) deriveRuleString:(NSString *)workingString withRuleType:(NSString *)ruleType addingWordsToMutableArray:(NSMutableArray *)phoneticDictionaryArray {
    
    workingString = (NSMutableString *)[workingString stringByReplacingOccurrencesOfString:@"\t" withString:@""];
    workingString = (NSMutableString *)[workingString stringByReplacingOccurrencesOfString:@"\n" withString:@""];
    workingString = (NSMutableString *)[workingString stringByReplacingOccurrencesOfString:@"\r" withString:@""];
    
    for(int i = 0; i < 3; i++) {
        workingString = (NSMutableString *)[workingString stringByReplacingOccurrencesOfString:@"  " withString:@" "];
    }
    
    workingString = (NSMutableString *)[workingString stringByReplacingOccurrencesOfString:@"</string><string>" withString:@"###SEPARATORTOKEN###"];
    workingString = (NSMutableString *)[workingString stringByReplacingOccurrencesOfString:[NSString stringWithFormat:@"<key>%@</key><array><string>",ruleType] withString:@""];
    workingString = (NSMutableString *)[workingString stringByReplacingOccurrencesOfString:[NSString stringWithFormat:@"<key>PublicRule%@</key><array><string>",ruleType] withString:@""];    
    workingString = (NSMutableString *)[workingString stringByReplacingOccurrencesOfString:@"</string></array>" withString:@""];
    workingString = (NSMutableString *)[workingString stringByReplacingOccurrencesOfString:@"</dict>" withString:@""];
    workingString = (NSMutableString *)[workingString stringByReplacingOccurrencesOfString:@"<dict>" withString:@""];
    if([workingString rangeOfString:@"<key>Weight</key><real>"].location != NSNotFound) {
        workingString = (NSMutableString *)[workingString stringByReplacingOccurrencesOfString:@"<key>Weight</key><real>" withString:@"###OVERALLRULEWEIGHTSTARTTOKEN###"];
        workingString = (NSMutableString *)[workingString stringByReplacingOccurrencesOfString:@"</real>" withString:@"###OVERALLRULEWEIGHTENDTOKEN###"];
    }
    
    workingString = (NSMutableString *)[workingString stringByReplacingOccurrencesOfString:[NSString stringWithFormat:@"<key>%@</key><array>",ruleType] withString:@""];
    workingString = (NSMutableString *)[workingString stringByReplacingOccurrencesOfString:[NSString stringWithFormat:@"<key>PublicRule%@</key><array>",ruleType] withString:@""];    
    workingString = (NSMutableString *)[workingString stringByReplacingOccurrencesOfString:@"</array>" withString:@""];
    
    NSArray *tempArray = [[[[workingString stringByReplacingOccurrencesOfString:@"###SEPARATORTOKEN###" withString:@" "]stringByReplacingOccurrencesOfString:@"###RULENAMEEND###" withString:@"> "]stringByReplacingOccurrencesOfString:@"###RULENAMEBEGIN###" withString:@"<"] componentsSeparatedByString:@" "];
    
    for(NSString *word in tempArray) {
        
        NSError *error = nil; // regex to check if this is a rule
        NSUInteger matchCount = NSNotFound;
        NSRegularExpression *regex = [NSRegularExpression regularExpressionWithPattern:@"<rule_[0-9]+>" options:0 error:&error];
        if (regex && !error){
            matchCount = [regex numberOfMatchesInString:word options:0 range:NSMakeRange(0, word.length)];
        }
        if(matchCount == 0 && ([word length] > 0) && ![word isEqualToString:@" "]) { //  we only add it if it isn't a rule and has something useful in it.
            [phoneticDictionaryArray addObject:word];
        }
    }
    
    return (NSMutableString *)workingString;
}

- (NSString *) analyzeRuleString:(NSString *)ruleString {

    NSScanner *scannerOne = [[NSScanner alloc] initWithString:ruleString];
    NSString *ruleStringToReturn = nil;
    
    BOOL success = [scannerOne scanUpToString:@"<dict>" intoString:nil];
    if(success) {
        if(kVerboseRuleAnalysis==1)NSLog(@"I found the string <dict> so now I'll look for </dict>");
        NSUInteger startLocation = [scannerOne scanLocation];
        success = [scannerOne scanUpToString:@"</dict>" intoString:nil];
        if(success) {
            if(kVerboseRuleAnalysis==1)NSLog(@"I found the string </dict> so I'm now going to see if this is an isolated rule.");
            NSUInteger endLocation = [scannerOne scanLocation];
            NSRange rangeOfSubstringToExamine = {startLocation, endLocation-startLocation+[@"</dict>" length]};
            
            NSString *stringToExamine = [ruleString substringWithRange:rangeOfSubstringToExamine];
            
            NSRange rangeOfTrimmedSubstringToExamine = {[@"<dict>" length],[stringToExamine length]-([@"<dict>" length] + [@"</dict>" length])};
            
            NSString *trimmedExaminationString = [stringToExamine substringWithRange:rangeOfTrimmedSubstringToExamine];
            
            if(kVerboseRuleAnalysis==1)NSLog(@"I'm going to check if the string %@ has an isolated rule in it",trimmedExaminationString);
            
            if([trimmedExaminationString rangeOfString:@"<dict>"].location == NSNotFound) { // If there is no incidence of <dict> here it's an isolated rule.
                if(kVerboseRuleAnalysis==1)NSLog(@"I found an isolated rule in the string %@ so I'm returning it",stringToExamine);
                ruleStringToReturn = stringToExamine;                
            } else {
                // recur this method but with a substring omitting the first found <dict>
                NSRange reducedRange = {startLocation + [@"<dict>" length], ruleString.length - (startLocation + [@"<dict>" length])};
                ruleStringToReturn = [self analyzeRuleString:[ruleString substringWithRange:reducedRange]];
            }
        } 
    } 
    
    return ruleStringToReturn; // This could be nil if no acceptable rules were found in this ruleString, otherwise it is a rule to process.
    
}

@end
