import type React from "react";
import { useEffect, useState } from "react";
import {
	Button,
	Pressable,
	SafeAreaView,
	StyleSheet,
	Switch,
	Text,
	TextInput,
	View,
} from "react-native";
import PowerManagement, {
	TIMER_ENDED_EVENT,
} from "./src/modules/PowerManagement";
import { theme } from "./src/theme";

function App(): React.JSX.Element {
	const [isEnabled, setIsEnabled] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [sleepMinutes, setSleepMinutes] = useState("5");

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
					<Text style={styles.headerText}>Prevent display sleep</Text>
				</View>
				<View style={styles.counter}>
					<Pressable
						style={({ pressed }) => [
							styles.counterButton,
							pressed && { opacity: 0.5 },
						]}
						onPress={onReduceMinutes}
					>
						<Text>-</Text>
					</Pressable>
					<TextInput
						style={styles.counterInput}
						placeholder="5"
						placeholderTextColor={"#aaa"}
						keyboardType="numeric"
						value={sleepMinutes.toString()}
						onChangeText={setSleepMinutes}
					/>
					<Pressable
						style={({ pressed }) => [
							styles.counterButton,
							pressed && { opacity: 0.5 },
						]}
						onPress={onAddMinutes}
					>
						<Text>+</Text>
					</Pressable>
					<Text style={{ position: "absolute", right: 20 }}>
						{!sleepMinutes || Number(sleepMinutes) > 1 ? "minutes" : "minute"}
					</Text>
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

			<View style={styles.separator} />

			<View style={styles.verticalBlock}>
				<Text style={styles.headerText}>Active rules</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	verticalBlock: {
		flex: 1,
		padding: 20,
	},
	headerText: {
		fontWeight: "bold",
		color: theme.colors.secondary,
	},
	counter: {
		flex: 1,
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
		height: 40,
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
});

export default App;
