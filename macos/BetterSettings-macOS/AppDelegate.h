#import <Cocoa/Cocoa.h>

@class RCTBridge;

@interface AppDelegate : NSObject <NSApplicationDelegate, NSUserNotificationCenterDelegate>
{
  NSStatusItem *statusItem;
  NSPopover *popover;
}

@property(nonatomic, readonly) RCTBridge *bridge;
@property(nonatomic, strong, readonly) NSPopover *popover;
- (void)openPopover;
- (void)closePopover;
@end
