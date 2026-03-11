import { Colors } from "@/constants";
import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "outline";
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = "primary",
  loading = false,
  icon,
  disabled,
  ...props
}) => {
  const getBackgroundColor = () => {
    if (disabled) return Colors.gray[300];
    switch (variant) {
      case "primary":
        return Colors.primary[500];
      case "secondary":
        return Colors.secondary[500];
      case "outline":
        return "transparent";
      default:
        return Colors.primary[500];
    }
  };

  const getTextColor = () => {
    if (disabled) return Colors.gray[500];
    return variant === "outline" ? Colors.primary[500] : Colors.white;
  };

  const getBorderColor = () => {
    if (disabled) return Colors.gray[300];
    return variant === "outline" ? Colors.primary[500] : "transparent";
  };

  return (
    <TouchableOpacity
      className="py-4 rounded-xl flex-row items-center justify-center"
      style={{
        backgroundColor: getBackgroundColor(),
        borderWidth: variant === "outline" ? 1.5 : 0,
        borderColor: getBorderColor(),
        opacity: disabled ? 0.6 : 1,
      }}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            className="text-base font-bold"
            style={{
              color: getTextColor(),
              marginLeft: icon ? 8 : 0,
            }}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};
