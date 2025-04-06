import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { theme } from "../theme";
import { formatTime } from "../utils/formatTime";

type StartButtonProps = {
	remainingTime: number | null;
	onPress: () => void;
	disabled: boolean;
};

function StartButton({ remainingTime, onPress, disabled }: StartButtonProps) {
	return (
		<Pressable
			style={({ pressed }) => [
				styles.startButton,
				(pressed || disabled) && { opacity: 0.5 },
				!!remainingTime && { borderColor: theme.colors.success },
			]}
			onPress={onPress}
			disabled={disabled}
		>
			<Text>{remainingTime ? formatTime(remainingTime) : "START"}</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	startButton: {
		width: 120,
		height: 120,
		borderRadius: 60,
		borderWidth: 1,
		borderColor: theme.colors.separator,
		alignItems: "center",
		justifyContent: "center",
		alignSelf: "center",
	},
});

export default StartButton;
