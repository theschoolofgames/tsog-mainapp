//
//  SScribe.m included here as OESScribe.m
//  Sílabas
//
//  Created by Cody Brimhall on 9/4/07.
//  Copyright 2007 Cody Brimhall. All rights reserved.
//

// SScribe.h and SScribe.m are licensed under the MIT License: http://opensource.org/licenses/MIT

/**\cond HIDDEN_SYMBOLS*/ 
#import "OESScribe.h"
/**\endcond*/

@implementation OESScribe
@synthesize spanishGrammar;

#pragma mark Initializers
- (instancetype)initWithGrammar:(NSDictionary*)grammar forText:(NSAttributedString*)text sender:(id)sender{
	if((self = [super init]) != nil) {
		_originalText = [[NSAttributedString alloc] initWithAttributedString:text];
		_grammar = @{ // Modified by HLW
                    @"SConsonants" : @"rsbkdfgxwklmnptʧʎɾʝɲ",
                    @"SDialect" : @"Western",
                    @"SLanguage" : @"Spanish",
                    @"SNonSyllabicVowels" : @"ĭŭ",
                    @"SOrthographicClusters" :     @[
                    @"pl",
                    @"bl",
                    @"tl",
                    @"gl",
                    @"fl",
                    @"pɾ",
                    @"bɾ",
                    @"tɾ",
                    @"dɾ",
                    @"gɾ",
                    @"fɾ"
                    ],
                    @"SPhonemicIdentities" :     @{
                    @"+r" : @" RR ",
                    @"+x" : @" S ",
                    @"a" : @" A ",
                    @"b" : @" B ",
                    @"c" : @" K ",
                    @"ce" : @" S E ",
                    @"ch" : @" CH ",
                    @"ci" : @" S I ",
                    @"cé" : @" S E ",
                    @"cí" : @" S I ",
                    @"d" : @" D ",
                    @"e" : @" E ",
                    @"f" : @" F ",
                    @"g" : @" G ",
                    @"ge" : @" J E ",
                    @"gi" : @" J I ",
                    @"gí" : @" J I ",
                    @"gü" : @" U ",
                    @"h" : @"",
                    @"i" : @" I ",
                    @"j" : @" J ",
                    @"k" : @" K ",
                    @"l" : @" L ",
                    @"ll" : @" LL ",
                    @"m" : @" M ",
                    @"n" : @" N ",
                    @"o" : @" O ",
                    @"p" : @" P ",
                    @"q" : @" K ",
                    @"qu" : @" K ",
                    @"r" : @" R ",
                    @"rr" : @" RR ",
                    @"s" : @" S ",
                    @"t" : @" T ",
                    @"u" : @" U ",
                    @"v" : @" V ",
                    @"w" : @" U ",
                    @"x" : @" X ",
                    @"y" : @" Y ",
                    @"y+" : @" I ",
                    @"z" : @" S ",
                    @"á" : @" A ",
                    @"é" : @" E ",
                    @"í" : @" I ",
                    @"ñ" : @" GN ",
                    @"ó" : @" O ",
                    @"ú" : @" U "
                    },
                    @"SVowels" : @"aeiouáéíóúäëïöüăĕĭŏŭ",
                    @"version" : @"1.0"
                    };
		_consonants = [NSCharacterSet characterSetWithCharactersInString:_grammar[@"SConsonants"]];
		_vowels = [NSCharacterSet characterSetWithCharactersInString:_grammar[@"SVowels"]];
		_nonSyllabicVowels = [NSCharacterSet characterSetWithCharactersInString:_grammar[@"SNonSyllabicVowels"]];
		_letters = [NSCharacterSet letterCharacterSet];
		_punctuation = [NSCharacterSet punctuationCharacterSet];
		_identities = _grammar[@"SPhonemicIdentities"];
		_orthographicClusters = _grammar[@"SOrthographicClusters"];
		
		[self processText];
	}
	
	return self;
}
 
- (NSDictionary *)spanishGrammar { // Modified by HLW
    if (!spanishGrammar) {
        spanishGrammar = @{
                           @"SConsonants" : @"rsbkdfgxwklmnptʧʎɾʝɲ",
                           @"SDialect" : @"Western",
                           @"SLanguage" : @"Spanish",
                           @"SNonSyllabicVowels" : @"ĭŭ",
                           @"SOrthographicClusters" :     @[
                                         @"pl",
                                         @"bl",
                                         @"tl",
                                         @"gl",
                                         @"fl",
                                         @"pɾ",
                                         @"bɾ",
                                         @"tɾ",
                                         @"dɾ",
                                         @"gɾ",
                                         @"fɾ"
                                         ],
                           @"SPhonemicIdentities" :     @{
                               @"+r" : @"r",
                               @"+x" : @"s",
                               @"a" : @"a",
                               @"á" : @"á",
                               @"b" : @"b",
                               @"c" : @"k",
                               @"ce" : @"se",
                               @"cé" : @"sé",
                               @"ch" : @"ʧ",
                               @"ci" : @"sĭ",
                               @"cí" : @"sí",
                               @"d" : @"d",
                               @"e" : @"e",
                               @"é" : @"é",
                               @"f" : @"f",
                               @"g" : @"g",
                               @"ge" : @"xe",
                               @"gi" : @"xĭ",
                               @"gí" : @"xí",
                               @"gü" : @"w",
                               @"h" : @"",
                               @"i" : @"ĭ",
                               @"í" : @"í",
                               @"j" : @"x",
                               @"k" : @"k",
                               @"l" : @"l",
                               @"ll" : @"ʎ",
                               @"m" : @"m",
                               @"n" : @"n",
                               @"ñ" : @"ɲ",
                               @"o" : @"o",
                               @"ó" : @"ó",
                               @"p" : @"p",
                               @"q" : @"k",
                               @"qu" : @"k",
                               @"r" : @"ɾ",
                               @"rr" : @"r",
                               @"s" : @"s",
                               @"t" : @"t",
                               @"u" : @"ŭ",
                               @"ú" : @"ú",
                               @"v" : @"b",
                               @"w" : @"w",
                               @"x" : @"ks",
                               @"y" : @"ʝ",
                               @"y+" : @"ĭ",
                               @"z" : @"s"
            },
                           @"SVowels" : @"aeiouáéíóúäëïöüăĕĭŏŭ",
                           @"version" : @"1.0"
        };
        
      
        
    }
    return spanishGrammar;
}

#pragma mark Accessors
- (NSMutableAttributedString*)renderedText {
	return _renderedText;
}

#pragma mark Utility Methods
- (void)processText {
    
	NSArray *words = [self wordsInText];
	NSEnumerator *wordsEnumerator = [words objectEnumerator];
	NSMutableString *word;
	
	while(word = [wordsEnumerator nextObject]) {
		[self transcribe:word];
		[self syllabify:word];
	}
	
	[self renderText:words];
}

- (NSArray*)wordsInText {
	NSMutableArray *wordArray = [NSMutableArray array];
	NSMutableString *wordBuffer = nil;
	BOOL inWord = NO;
	int stringIndex = 0;
	unichar currentCharacter;
	
	for(stringIndex = 0; stringIndex < [_originalText length]; stringIndex++) {
		currentCharacter = [[_originalText string] characterAtIndex:stringIndex];
		
		if([_letters characterIsMember:currentCharacter]) {
			if(![_punctuation characterIsMember:currentCharacter]) {
				if(!inWord) {
					inWord = YES;
					wordBuffer = [NSMutableString stringWithCapacity:10];
					[wordBuffer appendString:@"+"];
				}
				
				[wordBuffer appendString:[NSString stringWithCharacters:&currentCharacter length:1]];
			}
		}
		else {
			if(inWord) {
				[wordBuffer appendString:@"+"];
				[wordArray addObject:wordBuffer];
				
				inWord = NO;
				wordBuffer = nil;
			}
		}
	}
	
	if(wordBuffer != nil) {
		[wordBuffer appendString:@"+"];
		[wordArray addObject:wordBuffer];
	}
	
	return wordArray;
}

- (void)transcribe:(NSMutableString*)wordBuffer {
	NSString *phoneme;
	int wordIndex;
	NSRange firstCharRange;
	NSRange lastCharRange;
	
	_identities = _grammar[@"SPhonemicIdentities"];
	
	if(!_identities) {
		[self setRenderedTextToErrorMessage:@"Could not find a phonemic identities dictionary!"];
	}
	else {
		[wordBuffer replaceCharactersInRange:NSMakeRange(0, [wordBuffer length]) withString:[wordBuffer lowercaseString]];
		wordIndex = 0;
		
		while(wordIndex < ([wordBuffer length] - 1)) {
			if((phoneme = _identities[[wordBuffer substringWithRange:NSMakeRange(wordIndex, 2)]]) != nil) {
				[wordBuffer replaceCharactersInRange:NSMakeRange(wordIndex, 2) withString:phoneme];
				wordIndex += [phoneme length];
			}
			else if((phoneme = _identities[[wordBuffer substringWithRange:NSMakeRange(wordIndex, 1)]]) != nil) {
				[wordBuffer replaceCharactersInRange:NSMakeRange(wordIndex, 1) withString:phoneme];
				wordIndex += [phoneme length];
			}
			else {
				wordIndex++;
			}
		}

		firstCharRange = NSMakeRange(0, 1);
		if([[wordBuffer substringWithRange:firstCharRange] isEqualToString:@"+"])
			[wordBuffer deleteCharactersInRange:firstCharRange];
		
		lastCharRange = NSMakeRange([wordBuffer length]-1, 1);
		if([[wordBuffer substringWithRange:lastCharRange] isEqualToString:@"+"])
			[wordBuffer deleteCharactersInRange:lastCharRange];
	}
}

- (void)syllabify:(NSMutableString*)wordBuffer {
	int index = 0;
	int offset = 0;
	int insertionPoint = 0;
	int consonantCount;
	unichar charBuffer;
	
	// Let's make a state machine, shall we?  Please, O God, have mercy on this coder's soul!
	// Syllabification rules (possibly simplified, but I don't know):
	// VCV		: V-CV
	// VCCV		: V-CCV when CC == {'pl', 'bl', 'tl' (LAm), 'gl', 'fl', 'pr', 'br', 'tr', 'dr', 'gr', 'fr'}
	//			: VC-CV otherwise
	// VCCCV	: VC-CCV when CC == {see above}
	//			: VCC-CV otherwise
	// VCCCCV	: VCC-CCV
	// VV		: VV when V- or -V == {'i', 'u'} <-- unaccented
	//			: V-V otherwise
	//
	// So, without further ado...
 

start:
	consonantCount = 0;
	index += offset;
	offset = 0;

	if(!((index + offset) < [wordBuffer length]))
		goto die;
	
	charBuffer = [wordBuffer characterAtIndex:(index + offset++)];
	
	if([_vowels characterIsMember:charBuffer])
		goto v1;
	
	goto start;

v1:
	if(!((index + offset) < [wordBuffer length]))
		goto die;
	
	charBuffer = [wordBuffer characterAtIndex:(index + offset++)];
	
	if([_vowels characterIsMember:charBuffer])
		goto finish;
	else if([_consonants characterIsMember:charBuffer]) {
		if(consonantCount++ < 4)
			goto v1;
	}
	
	goto start;
	
finish:
	switch(offset) {
		case 2:	// VV
			if([_nonSyllabicVowels characterIsMember:[wordBuffer characterAtIndex:index]] || [_nonSyllabicVowels characterIsMember:[wordBuffer characterAtIndex:index+1]]) {
				insertionPoint = -1;
				index--;
			}
			else
				insertionPoint = (index + 1);
				
			break;
		case 3: // VCV
			insertionPoint = (index + 1);
			break;
		case 4: // VCCV
			if([_orthographicClusters containsObject:[wordBuffer substringWithRange:NSMakeRange(index+1, 2)]])
				insertionPoint = (index + 1);
			else
				insertionPoint = (index + 2);
			break;
		case 5: // VCCCV
			if([_orthographicClusters containsObject:[wordBuffer substringWithRange:NSMakeRange(index+2, 2)]])
				insertionPoint = (index + 2);
			else
				insertionPoint = (index + 3);
			break;
		case 6: // VCCCCV
			insertionPoint = (index + 3);
			break;
	}
	
	if(insertionPoint >= 0)
		[wordBuffer insertString:@"-" atIndex:insertionPoint];
	
//	index++; // Bump the index ahead because we added a character
	goto start;
	
die:
    while (false);// Pointless statement so that we can end the method by dying.
}


- (void)renderText:(NSArray*)words {
	NSMutableString *stringBuffer = [NSMutableString stringWithCapacity:255];	// Arbitrary figure
	NSEnumerator *wordEnumerator = [words objectEnumerator];
	NSString *word;
	
	[stringBuffer appendString:@" "];
	
	while(word = [wordEnumerator nextObject]) {
		[stringBuffer appendString:[word stringByAppendingString:@" "]];
	}
	
	// The above loop leaves a trailing space, which we want to replace with the closing "]"
	[stringBuffer replaceCharactersInRange:NSMakeRange([stringBuffer length]-1, 1) withString:@" "];
	
	_renderedText = [[NSMutableAttributedString alloc] initWithString:stringBuffer];
}

#pragma mark Deconstructor

#pragma mark Debugging Methods
- (void)setRenderedTextToErrorMessage:(NSString*)message {
	NSMutableString *messageBuffer = [NSMutableString stringWithCapacity:255];
	
	[messageBuffer appendString:@"*** "];
	[messageBuffer appendString:message];
	[messageBuffer appendString:@" ***"];
	
	_renderedText = [[NSMutableAttributedString alloc] initWithString:message];
}

@end
