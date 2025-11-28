import { SignInForm } from "@/src/components/modules/auth/sign-in";
import React from "react";
import {
  Dimensions,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function LoginScreen() {
  const content = (
    <View
      className="h-screen sm:flex-1 items-center justify-center p-4 py-8 sm:py-4 sm:p-6 bg-primary"
      style={{ flex: 1 }}
    >
      <ImageBackground
        source={require("@/src/assets/images/background.png")}
        className="absolute top-0 left-0 right-0 bottom-0 size-full opacity-5"
        style={{
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
        }}
      />
      <SignInForm />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {Platform.OS === "web" ? (
        content
      ) : (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          {content}
        </TouchableWithoutFeedback>
      )}
    </KeyboardAvoidingView>
  );
}
