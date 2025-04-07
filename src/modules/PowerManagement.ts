import {
	type EmitterSubscription,
	NativeEventEmitter,
	NativeModules,
} from "react-native";

type PowerManagementEvent = Record<string, never>;
interface PowerManagementInterface {
	preventSleep(minutes: number): Promise<boolean>;
	allowSleep(): Promise<boolean>;
	addListener(
		eventName: string,
		listener: (event: PowerManagementEvent) => void,
	): EmitterSubscription;
	removeListeners(): void;
}

const { PowerManagement } = NativeModules;

export const TIMER_ENDED_EVENT = "PowerManagementTimerEnded";

const powerManagementEmitter = new NativeEventEmitter(PowerManagement);

const PowerManagementWithEvents = {
	...PowerManagement,
	addListener: (
		eventName: string,
		listener: (event: PowerManagementEvent) => void,
	): EmitterSubscription => {
		return powerManagementEmitter.addListener(eventName, listener);
	},
	removeAllListeners: (): void => {
		powerManagementEmitter.removeAllListeners(TIMER_ENDED_EVENT);
	},
} as PowerManagementInterface;

export default PowerManagementWithEvents;
