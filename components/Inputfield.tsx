import { Colors } from "@/constants";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TextInputProps,
} from "react-native";

interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="mb-4">
      <Text
        className="text-sm font-semibold mb-2"
        style={{ color: Colors.gray[700] }}
      >
        {label}
      </Text>
      <View
        className="flex-row items-center px-4 rounded-xl"
        style={{
          borderWidth: 1.5,
          borderColor: error
            ? Colors.error[500]
            : isFocused
              ? Colors.primary[500]
              : Colors.gray[300],
          backgroundColor: Colors.gray[50],
        }}
      >
        {icon && <View className="mr-3">{icon}</View>}
        <TextInput
          className="flex-1 py-4 text-base"
          style={{ color: Colors.gray[900] }}
          placeholderTextColor={Colors.gray[400]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            activeOpacity={0.7}
            className="ml-2"
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="text-sm mt-1" style={{ color: Colors.error[500] }}>
          {error}
        </Text>
      )}
    </View>
  );
};
