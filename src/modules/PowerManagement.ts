import { NativeModules } from "react-native";

interface PowerManagementInterface {
	preventSleep(minutes: number): Promise<boolean>;
	allowSleep(): Promise<boolean>;
	getCurrentState(): Promise<boolean>;
}

const { PowerManagement } = NativeModules;

export default PowerManagement as PowerManagementInterface;
