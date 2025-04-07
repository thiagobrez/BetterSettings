//
//  PowerManagement.m
//  BetterSettings-macOS
//
//  Created by Thiago Brezinski on 18/03/2025.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(PowerManagement, RCTEventEmitter)

RCT_EXTERN_METHOD(preventSleep:(nonnull NSNumber *)minutes
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(allowSleep:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
