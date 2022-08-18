import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import CustomButton from "../../components/CustomButton";
import CustomTextInput from "../../components/CustomTextInput";
import { ActivityIndicator } from "react-native-paper";

//firebase
import { db, auth, user } from "../../api/firebase";
import {
  linkWithCredential,
  PhoneAuthProvider,
  signInWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const API_URL =
  "https://us-central1-restaurantapptemplate-691c3.cloudfunctions.net/addCustomerToStripe";

export default function VerifyPhoneNumber({ route }) {
  const [loaded, setLoaded] = useState(true);
  const [code, setCode] = useState("");
  const { verificationId, email, password, phoneNumber, firstName, lastName } =
    route.params;

  const confirmCode = () => {
    setLoaded(false);

    const credentialPhone = PhoneAuthProvider.credential(verificationId, code);
    const credentialEmail = EmailAuthProvider.credential(email, password);

    signInWithCredential(auth, credentialPhone)
      .then((result) => {
        linkWithCredential(auth.currentUser, credentialEmail)
          .then(async (result) => {
            const response = await fetch(`${API_URL}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: email,
                name: firstName + "" + lastName,
              }),
            });
            const { customer } = await response.json();

            const setInformation = doc(
              db,
              "clients",
              "user",
              "Information",
              auth.currentUser.uid
            );
            setDoc(setInformation, {
              email: email,
              firstName: firstName,
              lastName: lastName,
              phoneNumber: phoneNumber,
              mainAddress: null,
              secondaryAddress: null,
              apt: null,
              instructions: null,
              deliveryMethod: null,
              newUser: true,
              smsNotifications: false,
              promoNotifications: false,
              stripeCustomerId: customer,
            }).catch((err) => {
              Alert.alert(`${err}`);
              setLoaded(true);
            });
          })
          .catch((err) => {
            Alert.alert(`${err}`);
            setLoaded(true);
          });
      })
      .catch((err) => {
        if (err.code === "auth/invalid-verification-code") {
          Alert.alert("Alert", `Invalid verification code`);
          setLoaded(true);
        } else {
          Alert.alert("Alert", err);
          setLoaded(true);
        }
        setLoaded(true);
      });
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <CustomTextInput
          placeholder={"Verification Code"}
          paddingLeft={12}
          value={code}
          width={"90%"}
          height={65}
          keyboardType="numeric"
          onChangeText={(code) => setCode(code)}
        />
        <View style={{ padding: "20%" }} />
        <CustomButton
          buttonTxt={
            loaded == true ? "Continue" : <ActivityIndicator color="white" />
          }
          backgroundColor={"black"}
          onPress={confirmCode}
          txtColor={"white"}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    backgroundColor: "white",
  },
});
