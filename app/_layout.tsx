import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "./globals.css";
import React from "react";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      />
    </>
  );
}
