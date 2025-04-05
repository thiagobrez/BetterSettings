import type React from "react";
import { Pressable, StyleSheet } from "react-native";
import { theme } from "../theme";

type ButtonProps = {
	children: React.ReactNode;
	onPress: () => void;
	disabled?: boolean;
};

function Button({ children, onPress, disabled }: ButtonProps) {
	return (
		<Pressable
			style={({ pressed }) => [
				styles.counterButton,
				pressed && { opacity: 0.5 },
				disabled && { opacity: 0.5 },
			]}
			onPress={onPress}
			disabled={disabled}
		>
			{children}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	counterButton: {
		width: 50,
		height: 40,
		borderWidth: 1,
		borderRadius: 5,
		borderColor: theme.colors.separator,
		alignItems: "center",
		justifyContent: "center",
	},
});

export default Button;
