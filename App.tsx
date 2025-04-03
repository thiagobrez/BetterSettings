import type React from "react";
import { useEffect, useState } from "react";
import {
	Pressable,
	SafeAreaView,
	StyleSheet,
	Switch,
	Text,
	TextInput,
	View,
} from "react-native";
import Button from "./src/components/Button";
import PowerManagement, {
	TIMER_ENDED_EVENT,
} from "./src/modules/PowerManagement";
import { theme } from "./src/theme";

const quickActions = [
	{
		label: "5 m",
		minutes: 5,
	},
	{
		label: "10 m",
		minutes: 10,
	},
	{
		label: "15 m",
		minutes: 15,
	},
	{
		label: "30 m",
		minutes: 30,
	},
	{
		label: "45 m",
		minutes: 45,
	},
	{
		label: "1 h",
		minutes: 60,
	},
	{
		label: "2 h",
		minutes: 120,
	},
	{
		label: "5 h",
		minutes: 300,
	},
	{
		label: "12 h",
		minutes: 720,
	},
	{
		label: "24 h",
		minutes: 1440,
	},
];

function App(): React.JSX.Element {
	const [isEnabled, setIsEnabled] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [sleepMinutes, setSleepMinutes] = useState("30");

	useEffect(() => {
		checkCurrentState();

		// Set up event listener for when timer ends
		const subscription = PowerManagement.addListener(TIMER_ENDED_EVENT, () => {
			// Timer has ended, update UI state
			setIsEnabled(false);
		});

		// Clean up the subscription on unmount
		return () => {
			subscription.remove();
		};
	}, []);

	const checkCurrentState = async () => {
		try {
			const state = await PowerManagement.getCurrentState();

			setIsEnabled(state);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unknown error");
		}
	};

	const toggleSwitch = async () => {
		try {
			if (!isEnabled) {
				await PowerManagement.preventSleep(Number(sleepMinutes));
			} else {
				await PowerManagement.allowSleep();
			}
			await checkCurrentState();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unknown error");
		}
	};

	const onReduceMinutes = () => {
		setSleepMinutes(String(Number(sleepMinutes) - 5));
	};

	const onAddMinutes = () => {
		setSleepMinutes(String(Number(sleepMinutes) + 5));
	};

	const onPreventSleep = () => {
		PowerManagement.preventSleep(Number(sleepMinutes));
	};

	return (
		<View style={styles.container}>
			<View style={styles.verticalBlock}>
				<View>
					<Text style={styles.headerText}>Quick actions</Text>
				</View>

				<View style={styles.quickActions}>
					{quickActions.map((action) => (
						<Button
							key={action.minutes}
							onPress={() => setSleepMinutes(String(action.minutes))}
						>
							<Text>{action.label}</Text>
						</Button>
					))}
				</View>
			</View>

			<View style={styles.verticalBlock}>
				<View>
					<Text style={styles.headerText}>Prevent display sleep</Text>
				</View>

				<View style={styles.counter}>
					<Button onPress={onReduceMinutes}>
						<Text>-</Text>
					</Button>

					<View style={styles.inputContainer}>
						<TextInput
							style={styles.counterInput}
							placeholder="5"
							placeholderTextColor={"#aaa"}
							keyboardType="numeric"
							value={sleepMinutes.toString()}
							onChangeText={setSleepMinutes}
						/>
					</View>

					<Button onPress={onAddMinutes}>
						<Text>+</Text>
					</Button>

					{/* <Text style={{ position: "absolute", right: 20 }}>
						{!sleepMinutes || Number(sleepMinutes) > 1 ? "minutes" : "minute"}
					</Text> */}
				</View>

				<Pressable
					style={({ pressed }) => [
						styles.startButton,
						pressed && { opacity: 0.5 },
					]}
					onPress={onPreventSleep}
				>
					<Text>START</Text>
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		gap: 20,
	},
	verticalBlock: {
		gap: 20,
	},
	headerText: {
		fontWeight: "bold",
		color: theme.colors.secondary,
	},
	counter: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 10,
	},
	counterButton: {
		width: 40,
		height: 40,
		borderWidth: 1,
		borderRadius: 5,
		borderColor: theme.colors.separator,
		alignItems: "center",
		justifyContent: "center",
	},
	counterInput: {
		width: 50,
		textAlign: "center",
	},
	inputContainer: {
		width: 50,
		height: 40,
		borderWidth: 1,
		borderColor: theme.colors.separator,
		borderRadius: 5,
		justifyContent: "center",
		alignItems: "center",
	},
	separator: {
		height: 1,
		backgroundColor: theme.colors.separator,
		marginHorizontal: 20,
	},
	startButton: {
		width: 150,
		height: 40,
		borderWidth: 1,
		borderRadius: 5,
		borderColor: theme.colors.separator,
		backgroundColor: theme.colors.success,
		alignItems: "center",
		justifyContent: "center",
		alignSelf: "center",
	},
	quickActions: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 10,
		justifyContent: "center",
		alignItems: "center",
	},
});

export default App;
