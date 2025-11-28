import React from "react";
import { ActivityIndicator, View } from "react-native";

const Splash = () => {
  return (
    <View
      style={{
        backgroundColor: "#9A1445",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: 288,
          height: "75%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Image component - using placeholder */}
        <View
          style={{
            width: "100%",
            height: 176,
            marginTop: 128,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size="large" color="white" />
        </View>
      </View>
      <View style={{ height: "25%", justifyContent: "center" }}>
        <ActivityIndicator size={64} color="white" />
      </View>
    </View>
  );
};

export default Splash;
