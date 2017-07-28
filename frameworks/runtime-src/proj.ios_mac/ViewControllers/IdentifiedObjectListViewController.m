//
//  IdentifiedObjectListViewController.m
//  TSOG CoreML
//
//  Created by Van Nguyen on 7/26/17.
//  Copyright © 2017 TheSchoolOfGames. All rights reserved.
//

#import "IdentifiedObjectListViewController.h"
#import "SessionManager.h"

@interface IdentifiedObjectListViewController () <UITableViewDelegate, UITableViewDataSource> {
    
    __weak IBOutlet UITableView *tvObjectList;
    NSArray *indexTitles;
    NSArray *sortedKeys;
    NSMutableDictionary *sortedObjectList;
}

@end

@implementation IdentifiedObjectListViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    
    [self setupView];
    
    NSLog(@"section count: %ld", [[SessionManager sharedInstance].identifiedObjects allKeys].count);
    NSLog(@"section: %@", [[SessionManager sharedInstance].identifiedObjects allKeys]);
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    
    // Show navigation bar
    [self.navigationController setNavigationBarHidden:NO animated:YES];
}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];
    
    // Hide navigation bar
    [self.navigationController setNavigationBarHidden:YES animated:YES];
}

- (void)viewDidDisappear:(BOOL)animated {
    [super viewDidDisappear:animated];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

#pragma mark - setup view
- (void)setupView {
    indexTitles = @[@"A", @"B", @"C", @"D", @"E", @"F", @"G", @"H", @"I", @"J", @"K", @"L", @"M", @"N", @"O", @"P", @"Q", @"R", @"S", @"T", @"U", @"V", @"W", @"X", @"Y", @"Z"];
    // sort all keys
    sortedKeys = [[[SessionManager sharedInstance].identifiedObjects allKeys] sortedArrayUsingSelector:@selector(localizedCaseInsensitiveCompare:)];
    
    sortedObjectList = [NSMutableDictionary dictionary];
    for (NSString *key in sortedKeys) {
        NSDictionary *collection = [[SessionManager sharedInstance].identifiedObjects objectForKey:key];
        NSArray*sortedCollection = [collection.allKeys sortedArrayUsingSelector:@selector(localizedCaseInsensitiveCompare:)];
        [sortedObjectList setObject:sortedCollection forKey:key];
    }
    
}

#pragma mark - Tableview Delegate and datasource
- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView {
    return [[SessionManager sharedInstance].identifiedObjects allKeys].count;
}

- (NSString *)tableView:(UITableView *)tableView titleForHeaderInSection:(NSInteger)section
{
    NSString *key = [sortedKeys objectAtIndex:section];
    NSArray *collection = [sortedObjectList objectForKey:key];
    return [NSString stringWithFormat:@"%@ (%ld)", key, collection.count];
}

- (NSArray<NSString *> *)sectionIndexTitlesForTableView:(UITableView *)tableView {
    return indexTitles;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    NSString *key = [sortedKeys objectAtIndex:section];
    return ((NSArray *)[sortedObjectList objectForKey:key]).count;
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath {
    return 40.0;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    static NSString *simpleTableIdentifier = @"SimpleTableItem";
    
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:simpleTableIdentifier];
    
    if (cell == nil) {
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:simpleTableIdentifier];
    }
    
    NSString *key = [sortedKeys objectAtIndex:indexPath.section];
    NSArray *collection = [sortedObjectList objectForKey:key];
    
    cell.textLabel.text = collection[indexPath.row];
    return cell;
}

@end
