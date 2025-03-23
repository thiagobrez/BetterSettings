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
    private var timer: Timer?
    
    @objc
    func preventSleep(_ minutes: NSNumber, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        // Cancel any existing timer
        timer?.invalidate()
        
        // Release existing assertion if it exists
        if assertionID != 0 {
            IOPMAssertionRelease(assertionID)
            assertionID = 0
        }
        
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
            
            // Set timer to release the assertion after specified minutes
            let minutesDouble = minutes.doubleValue
            if minutesDouble > 0 {
                timer = Timer.scheduledTimer(withTimeInterval: minutesDouble * 60, repeats: false) { [weak self] _ in
                    self?.releaseAssertion()
                }
            }
            
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
    func allowSleep(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        timer?.invalidate()
        timer = nil
        
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
    
    private func releaseAssertion() {
        if assertionID != 0 {
            IOPMAssertionRelease(assertionID)
            assertionID = 0
        }
    }
    
    deinit {
        timer?.invalidate()
        if assertionID != 0 {
            IOPMAssertionRelease(assertionID)
        }
    }
}
