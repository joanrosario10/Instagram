import { Pressable, Text } from "react-native";

type ButtonProps = {
  title: string;
  onPress?: () => void;
  disabled?: boolean; // Added optional disabled prop
};

export default function Button({ title, onPress, disabled }: ButtonProps) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress} // Prevent onPress if disabled
      className={`bg-blue-500 w-full p-3 items-center rounded-md ${
        disabled ? "opacity-50" : ""
      }`}
      disabled={disabled} // Apply disabled state to Pressable
    >
      <Text
        className={`text-white font-semibold ${disabled ? "opacity-50" : ""}`}
      >
        {title}
      </Text>
    </Pressable>
  );
}
