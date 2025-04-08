import type React from "react";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import Button from "./src/components/Button";
import StartButton from "./src/components/StartButton";
import PowerManagement, {
	TIMER_ENDED_EVENT,
	POPOVER_SHOW_EVENT,
	POPOVER_CLOSE_EVENT,
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
	const [sleepMinutes, setSleepMinutes] = useState("30");
	const [remainingTime, setRemainingTime] = useState<number | null>(null);
	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const isPopoverOpenRef = useRef<boolean>(false);

	useEffect(() => {
		const timerSubscription = PowerManagement.addListener(
			TIMER_ENDED_EVENT,
			() => {
				// Timer has ended, update UI state
			},
		);

		const showSubscription = PowerManagement.addListener(
			POPOVER_SHOW_EVENT,
			() => {
				isPopoverOpenRef.current = true;
			},
		);

		const closeSubscription = PowerManagement.addListener(
			POPOVER_CLOSE_EVENT,
			() => {
				isPopoverOpenRef.current = false;
			},
		);

		return () => {
			timerSubscription.remove();
			showSubscription.remove();
			closeSubscription.remove();
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, []);

	const onReduceMinutes = () => {
		const currentValue = Number(sleepMinutes);
		const nextMultipleOf5 = Math.floor(currentValue / 5) * 5;
		setSleepMinutes(
			String(
				Math.max(
					nextMultipleOf5 === currentValue
						? nextMultipleOf5 - 5
						: nextMultipleOf5,
					0,
				),
			),
		);
	};

	const onAddMinutes = () => {
		const currentValue = Number(sleepMinutes);
		const nextMultipleOf5 = Math.ceil(currentValue / 5) * 5;
		setSleepMinutes(
			String(
				nextMultipleOf5 === currentValue ? currentValue + 5 : nextMultipleOf5,
			),
		);
	};

	const onTogglePreventSleep = () => {
		if (remainingTime !== null) {
			PowerManagement.allowSleep();

			if (timerRef.current) {
				clearInterval(timerRef.current);
				timerRef.current = null;
			}

			setRemainingTime(null);
			return;
		}

		PowerManagement.preventSleep(Number(sleepMinutes));
		const seconds = Number(sleepMinutes) * 60;
		setRemainingTime(seconds);

		timerRef.current = setInterval(() => {
			setRemainingTime((prev) => {
				if (prev === null || prev <= 1) {
					if (timerRef.current) {
						clearInterval(timerRef.current);
						timerRef.current = null;
					}
					return null;
				}
				return prev - 1;
			});
		}, 1000);
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
					<Text style={styles.headerText}>Prevent display sleep (min)</Text>
				</View>

				<View style={styles.counter}>
					<Button
						onPress={onReduceMinutes}
						disabled={sleepMinutes === "0" || sleepMinutes === ""}
					>
						<Text>-</Text>
					</Button>

					<View style={styles.inputContainer}>
						<TextInput
							style={styles.counterInput}
							placeholder="30"
							placeholderTextColor={theme.colors.separator}
							value={sleepMinutes.toString()}
							onChangeText={(text) => {
								if (/^\d{0,4}$/.test(text)) {
									setSleepMinutes(text);
								}
							}}
							maxLength={4}
						/>
					</View>

					<Button onPress={onAddMinutes}>
						<Text>+</Text>
					</Button>
				</View>

				<StartButton
					remainingTime={remainingTime}
					onPress={onTogglePreventSleep}
					disabled={sleepMinutes === "0" || sleepMinutes === ""}
				/>
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
	inputContainer: {
		width: 50,
		height: 40,
		borderWidth: 1,
		borderColor: theme.colors.separator,
		borderRadius: 5,
		justifyContent: "center",
		alignItems: "center",
	},
	counterInput: {
		width: 50,
		height: 40,
		paddingVertical: 10,
		textAlign: "center",
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
