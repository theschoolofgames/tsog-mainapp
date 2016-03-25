//
//  Dialog.m
//  tsog
//
//  Created by Thuy Dong Xuan on 3/25/16.
//
//

#import "Dialog.h"

@implementation Dialog

-(id)initWithTitle:title message:msg cancelButtonTitle: cancelTitle otherButtonTitles:otherTitles, ... {
  return [self initWithTitle:title message:msg delegate:self cancelButtonTitle:cancelTitle otherButtonTitles:otherTitles, nil];
}

- (void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex
{
  if (buttonIndex == 0) {
    NSURL *appUrl = [NSURL URLWithString:_appStoreURL];
    if ([[UIApplication sharedApplication] canOpenURL:appUrl]) {
      [[UIApplication sharedApplication] openURL:appUrl];
    } else {
      UIAlertView *cantOpenUrlAlert = [[UIAlertView alloc] initWithTitle:@"Not Available" message:@"Could not open the AppStore, please try again later." delegate:nil cancelButtonTitle:@"OK" otherButtonTitles:nil];
      [cantOpenUrlAlert show];
    }
  }
}

@end
