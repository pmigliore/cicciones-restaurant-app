import React from "react";
import { SafeAreaView, Image, View, StyleSheet } from "react-native";
import CustomButton from "../../components/CustomButton.js";
import { StatusBar } from "expo-status-bar";

export default function Landing({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.first}>
        <Image
          source={require("../../../assets/c5599d739a20417ba5a952b55060331f.png")}
        />
      </View>
      <View style={styles.second}>
        <CustomButton
          buttonTxt={"Sign Up"}
          txtColor={"white"}
          backgroundColor={"black"}
          onPress={() => navigation.push("Register")}
        />
        <View style={styles.padding} />
        <CustomButton
          buttonTxt={"Log In"}
          txtColor={"black"}
          backgroundColor={"white"}
          onPress={() => navigation.navigate("LogIn")}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
  },
  first: {
    flex: 0.7,
    backgroundColor: "white",
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
  },
  second: {
    flex: 0.3,
    backgroundColor: "white",
    width: "100%",
    alignItems: "center",
  },
  padding: {
    padding: 10,
  },
});
