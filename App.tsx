import type React from "react";
import { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, Switch, Text, View } from "react-native";
import PowerManagement from "./src/modules/PowerManagement";

function App(): React.JSX.Element {
	const [isEnabled, setIsEnabled] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		checkCurrentState();
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
				await PowerManagement.preventSleep();
			} else {
				await PowerManagement.allowSleep(5); // Default to 5 minutes
			}
			await checkCurrentState();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unknown error");
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.content}>
				<Text style={styles.title}>BetterSettings</Text>
				<View style={styles.toggleContainer}>
					<Text style={styles.label}>Prevent Display Sleep</Text>
					<Switch
						trackColor={{ false: "#767577", true: "#81b0ff" }}
						thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
						onValueChange={toggleSwitch}
						value={isEnabled}
					/>
				</View>
				<Text style={styles.status}>
					Status: {isEnabled ? "Display will stay awake" : "Display can sleep"}
				</Text>
				{error && <Text style={styles.error}>Error: {error}</Text>}
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		// backgroundColor: "#f5f5f5",
	},
	content: {
		padding: 20,
		alignItems: "center",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 30,
	},
	toggleContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 20,
	},
	label: {
		fontSize: 16,
		marginRight: 10,
	},
	status: {
		fontSize: 14,
		color: "#666",
	},
	error: {
		marginTop: 10,
		color: "red",
		fontSize: 14,
	},
});

export default App;
