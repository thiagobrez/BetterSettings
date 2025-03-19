//
//  PowerManagement.swift
//  BetterSettings-macOS
//
//  Created by Thiago Brezinski on 18/03/2025.
//

import Foundation
import IOKit
import IOKit.pwr_mgt

@objc(PowerManagement)
class PowerManagement: NSObject {
    private var assertionID: IOPMAssertionID = 0
    
    @objc
    func preventSleep(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        var assertionID: IOPMAssertionID = 0
        let reason = "User requested to prevent display sleep" as CFString
        let result = IOPMAssertionCreateWithName(
            kIOPMAssertionTypePreventUserIdleDisplaySleep as CFString,
            IOPMAssertionLevel(kIOPMAssertionLevelOn),
            reason,
            &assertionID
        )
        
        if result == kIOReturnSuccess {
            self.assertionID = assertionID
            resolve(true)
        } else {
            reject(
                "ERROR",
                "Failed to prevent sleep. Error code: \(result)",
                NSError(domain: "PowerManagement", code: Int(result))
            )
        }
    }
    
    @objc
    func allowSleep(_ minutes: NSNumber, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        if assertionID != 0 {
            let result = IOPMAssertionRelease(assertionID)
            if result == kIOReturnSuccess {
                assertionID = 0
                resolve(true)
            } else {
                reject(
                    "ERROR",
                    "Failed to allow sleep. Error code: \(result)",
                    NSError(domain: "PowerManagement", code: Int(result))
                )
            }
        } else {
            resolve(true) // Already in allow sleep state
        }
    }
    
    @objc
    func getCurrentState(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        resolve(assertionID != 0)
    }
    
    deinit {
        if assertionID != 0 {
            IOPMAssertionRelease(assertionID)
        }
    }
}
