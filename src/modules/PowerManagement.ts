import { NativeModules } from "react-native";

interface PowerManagementInterface {
	preventSleep(): Promise<boolean>;
	allowSleep(minutes: number): Promise<boolean>;
	getCurrentState(): Promise<boolean>;
}

const { PowerManagement } = NativeModules;

export default PowerManagement as PowerManagementInterface;
