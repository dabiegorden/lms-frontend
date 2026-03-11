import React, { useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
  StatusBar,
  Animated,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";

import { onboardingSlides } from "@/data";
import { Colors, Spacing } from "@/constants";

const { width, height } = Dimensions.get("window");

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);
  const router = useRouter();

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = () => {
    if (currentIndex < onboardingSlides.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.replace("/role");
    }
  };

  const skip = () => {
    router.replace("/role");
  };

  const renderItem = ({ item }: { item: (typeof onboardingSlides)[0] }) => (
    <View style={[styles.slideContainer, { width, height }]}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Image Container with Modern Gradient Background */}
      <View className="items-center justify-center mb-12">
        <View
          className="w-72 h-72 rounded-3xl items-center justify-center"
          style={[styles.outerCircle, { backgroundColor: `${item.color}15` }]}
        >
          <View
            className="w-56 h-56 rounded-3xl items-center justify-center"
            style={{ backgroundColor: `${item.color}30` }}
          >
            <View
              className="w-40 h-40 rounded-3xl items-center justify-center"
              style={{ backgroundColor: item.color }}
            >
              <Text className="text-white text-7xl font-bold">{item.id}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Text Content */}
      <View className="px-8 items-center">
        <Text
          className="text-3xl font-bold text-center mb-4"
          style={[styles.title, { color: Colors.gray[900] }]}
        >
          {item.title}
        </Text>

        <Text
          className="text-base text-center"
          style={[styles.description, { color: Colors.gray[600] }]}
        >
          {item.description}
        </Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Main Content Area */}
      <View style={{ flex: 1 }}>
        <FlatList
          data={onboardingSlides}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false },
          )}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
          scrollEventThrottle={16}
        />
      </View>

      {/* Fixed Footer */}
      <View className="px-6 pb-12 pt-6 bg-white" style={styles.footer}>
        {/* Pagination Dots */}
        <View className="flex-row justify-center mb-8">
          {onboardingSlides.map((_: any, index: any) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 32, 8],
              extrapolate: "clamp",
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });

            return (
              <Animated.View
                key={`dot-${index}`}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity,
                    backgroundColor: Colors.primary[500],
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-between items-center">
          {currentIndex < onboardingSlides.length - 1 ? (
            <>
              <TouchableOpacity
                onPress={skip}
                className="py-4 px-6"
                activeOpacity={0.7}
              >
                <Text
                  className="text-base font-semibold"
                  style={{ color: Colors.gray[500] }}
                >
                  Skip
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={scrollTo}
                className="py-4 px-10 rounded-full"
                style={[
                  styles.nextButton,
                  { backgroundColor: Colors.primary[500] },
                ]}
                activeOpacity={0.85}
              >
                <Text className="text-white text-base font-bold text-center">
                  Next
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              onPress={scrollTo}
              className="flex-1 py-5 rounded-full items-center"
              style={[
                styles.getStartedButton,
                { backgroundColor: Colors.primary[500] },
              ]}
              activeOpacity={0.85}
            >
              <Text className="text-white text-lg font-bold">Get Started</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slideContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  outerCircle: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    maxWidth: 320,
    lineHeight: 40,
  },
  description: {
    maxWidth: 340,
    fontSize: 16,
    lineHeight: 24,
  },
  footer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  nextButton: {
    minWidth: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  getStartedButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
});
