import React, { useState } from "react";
import {
  View,
  TouchableWithoutFeedback,
  Text,
  Keyboard,
  Alert,
} from "react-native";
import CustomButton from "../../components/CustomButton";
import CustomTextInput from "../../components/CustomTextInput";
import { ActivityIndicator } from "react-native-paper";

//firebase
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../api/firebase";

export default function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState("");
  const [loaded, setLoaded] = useState(true);

  const resetPassword = () => {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    setLoaded(false);
    if (reg.test(email) === false) {
      Alert.alert("Alert", "Please enter valid e-mail", [{ text: "OK" }]);
      setLoaded(true);
    } else {
      sendPasswordResetEmail(auth, email)
        .then(() => {
          setLoaded(true);
          Alert.alert(
            "Email Sent",
            "Link was sent successfully, please check your email to reset your password"
          );
          navigation.goBack();
        })
        .catch((error) => {
          Alert.alert("Error", "Email not found");
          setLoaded(true);
        });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View
        style={{
          flex: 1,
          backgroundColor: "white",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ padding: "5%", color: "#6E6D6D" }}>
          A link will be sent to your email to reset your password
        </Text>
        <CustomTextInput
          label="email"
          placeholder="Email Address"
          autoCapitalize={"none"}
          autoCompleteType={"off"}
          autoCorrect={false}
          keyboardType="email-address"
          paddingLeft={12}
          width={"90%"}
          height={65}
          onChangeText={(email) => setEmail(email)}
        />
        <View style={{ padding: 20 }} />
        <CustomButton
          buttonTxt={
            loaded == true ? "Send Email" : <ActivityIndicator color="white" />
          }
          backgroundColor={"black"}
          onPress={resetPassword}
          txtColor={"white"}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}
