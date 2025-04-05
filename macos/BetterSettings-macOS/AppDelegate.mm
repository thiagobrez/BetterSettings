#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTBridge.h>
#import <React/RCTRootView.h>

@interface AppDelegate () <RCTBridgeDelegate>
@end

@implementation AppDelegate

- (void)awakeFromNib {
  [super awakeFromNib];

  _bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:nil];
}

NSImage *image = [NSImage imageWithSystemSymbolName:@"bolt.batteryblock" accessibilityDescription:nil];
NSImage *alternateImage = [NSImage imageWithSystemSymbolName:@"bolt.batteryblock.fill" accessibilityDescription:nil];

- (void)applicationDidFinishLaunching:(NSNotification *)notification
{
  statusItem = [[NSStatusBar systemStatusBar] statusItemWithLength:NSSquareStatusItemLength];
  
  NSButton *button = [statusItem button];
  [button setImage:image];
  [button setTarget:self];
  [button setAction:@selector(togglePopover:)];

  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:_bridge moduleName:@"BetterSettings" initialProperties:@{}];
  NSViewController *rootViewController = [[NSViewController alloc] init];
  rootViewController.view = rootView;

  popover = [[NSPopover alloc] init];
  popover.contentSize = NSMakeSize(380, 450);
  popover.contentViewController = rootViewController;
  popover.behavior = NSPopoverBehaviorTransient;
  
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(handleSleepPreventionStateChanged:)
                                               name:@"SleepPreventionStateChanged"
                                             object:nil];
}

- (void)openPopover {
  [popover showRelativeToRect:statusItem.button.bounds ofView:statusItem.button preferredEdge:NSMinYEdge];
  [popover.contentViewController.view.window makeKeyWindow];
}

- (void)closePopover {
  [popover close];
}

- (void)togglePopover:(id)sender {
  if (popover.isShown) {
    [self closePopover];
  } else {
    [self openPopover];
  }
}

- (void)handleSleepPreventionStateChanged:(NSNotification *)notification {
    BOOL isPreventingSleep = [notification.userInfo[@"isPreventingSleep"] boolValue];
    if (isPreventingSleep) {
      dispatch_async(dispatch_get_main_queue(), ^{
        [self->statusItem.button setImage:alternateImage];
      });
    } else {
      dispatch_async(dispatch_get_main_queue(), ^{
        [self->statusItem.button setImage:image];
      });
    }
}

// Called when the user tries to reopen the app from the Dock or Spotlight
- (BOOL)applicationShouldHandleReopen:(NSApplication *)sender hasVisibleWindows:(BOOL)visibleWindows {
    if (!visibleWindows) {
      [self openPopover];
    }

    return YES;
}

- (void)dealloc {
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

// MARK: React Native init configuration

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

/// This method controls whether the `concurrentRoot`feature of React18 is turned on or off.
///
/// @see: https://reactjs.org/blog/2022/03/29/react-v18.html
/// @note: This requires to be rendering on Fabric (i.e. on the New Architecture).
/// @return: `true` if the `concurrentRoot` feature is enabled. Otherwise, it returns `false`.
- (BOOL)concurrentRootEnabled
{
#ifdef RN_FABRIC_ENABLED
  return true;
#else
  return false;
#endif
}

@end
