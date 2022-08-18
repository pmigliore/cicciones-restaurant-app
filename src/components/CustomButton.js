import * as React from "react";
import { Text, TouchableOpacity } from "react-native";

export default function CustomButton(props) {
  return (
    <TouchableOpacity
      style={{
        width: "90%",
        backgroundColor: props.backgroundColor,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 0,
        height: 70,
      }}
      onPress={props.onPress}
    >
      <Text
        style={{
          color: props.txtColor,
          fontWeight: "bold",
          fontSize: 16,
          textAlign: "center",
        }}
      >
        {props.buttonTxt}
      </Text>
    </TouchableOpacity>
  );
}
