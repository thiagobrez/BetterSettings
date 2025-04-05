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
class PowerManagement: RCTEventEmitter {
    private var assertionID: IOPMAssertionID = 0
    private var timer: Timer?
    private var hasListeners = false
    
    @objc
    func preventSleep(_ minutes: NSNumber, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        // Cancel any existing timer
        timer?.invalidate()
        
        // Release existing assertion, if it exists
        releaseAssertion()
        
        // Create assertion
        var assertionID: IOPMAssertionID = 0
        let reason = "User requested to prevent display sleep" as CFString
        let result = IOPMAssertionCreateWithName(
            kIOPMAssertionTypePreventUserIdleDisplaySleep as CFString,
            IOPMAssertionLevel(kIOPMAssertionLevelOn),
            reason,
            &assertionID
        )
      
        if result == kIOReturnSuccess {
            notifySleepPreventionStateChanged(isPreventingSleep: true)
          
            self.assertionID = assertionID
            
            // If assertion is created successfully, set timer to release the assertion after specified minutes
            let minutesDouble = minutes.doubleValue
          
            if minutesDouble > 0 {
              // Timer needs to be scheduled in the main queue
              DispatchQueue.main.async {
                self.timer = Timer.scheduledTimer(withTimeInterval: minutesDouble * 60, repeats: false) { [weak self] _ in
                  self?.releaseAssertion()
                  self?.sendTimerEndedEvent()
                }
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
        // Cancel any existing timer
        timer?.invalidate()
        
        // Release existing assertion, if it exists
        let result = releaseAssertion()
      
        if result == kIOReturnSuccess {
            resolve(true)
        } else if result == kIOReturnError {
            reject(
                "ERROR",
                "Failed to allow sleep. Error code: \(result)",
                NSError(domain: "PowerManagement", code: Int(result))
            )
        } else {
            // No assertionID, already allowed to sleep
            resolve(true)
        }
    }
    
    @objc
    func getCurrentState(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        resolve(assertionID != 0)
    }
    
    private func releaseAssertion() -> IOReturn {
        notifySleepPreventionStateChanged(isPreventingSleep: false)
      
        if assertionID != 0 {
            let result = IOPMAssertionRelease(assertionID)
            assertionID = 0
            return result
        }
      
        return -1
    }
    
    private func sendTimerEndedEvent() {
        if hasListeners {
            self.sendEvent(withName: "PowerManagementTimerEnded", body: nil)
        }
    }
    
    private func notifySleepPreventionStateChanged(isPreventingSleep: Bool) {
        NotificationCenter.default.post(
            name: Notification.Name("SleepPreventionStateChanged"),
            object: nil,
            userInfo: ["isPreventingSleep": isPreventingSleep]
        )
    }
    
    deinit {
        timer?.invalidate()
        releaseAssertion()
    }
  
    // MARK: RCTEventEmitter setup
    
    override func supportedEvents() -> [String] {
        return ["PowerManagementTimerEnded"]
    }
    
    override func startObserving() {
        hasListeners = true
    }
    
    override func stopObserving() {
        hasListeners = false
    }
    
    override static func requiresMainQueueSetup() -> Bool {
        return false
    }
}
