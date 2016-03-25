//
//  Dialog.h
//  tsog
//
//  Created by Thuy Dong Xuan on 3/25/16.
//
//

#import <Foundation/Foundation.h>

@interface Dialog : UIAlertView

@property (nonatomic, retain) NSString *appStoreURL;

-(id)initWithTitle:title message:msg cancelButtonTitle: cancelTitle otherButtonTitles:otherTitles, ...;

@end
