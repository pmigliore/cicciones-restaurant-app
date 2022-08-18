import React, { Component } from "react";
import {
  StyleSheet,
  Keyboard,
  Text,
  TouchableWithoutFeedback,
  View,
  Alert,
} from "react-native";
import CustomButton from "../../components/CustomButton";
import CustomTextInput from "../../components/CustomTextInput";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { ActivityIndicator } from "react-native-paper";

//firebase database
import { PhoneAuthProvider } from "firebase/auth";
import { getApp } from "firebase/app";
import { auth } from "../../api/firebase.js";

const app = getApp();

const recaptchaVerifier = React.createRef(null);

export class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      firstName: "",
      lastName: "",
      loading: false,
    };
    this.onSignUp = this.onSignUp.bind(this);
  }

  async onSignUp() {
    this.setState({ loading: true });

    const {
      email,
      password,
      phoneNumber,
      confirmPassword,
      firstName,
      lastName,
    } = this.state;

    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;

    if (
      (confirmPassword.length == 0,
      password.length == 0,
      email.length == 0,
      phoneNumber.length == 0,
      firstName.length == 0,
      lastName.length == 0)
    ) {
      this.AlertOut("All inputs must be filled");
    } else if (password !== confirmPassword) {
      this.AlertOut("Passwords do not match");
    } else if (password.length < 8) {
      this.AlertOut("Password should contain at least 8 characters");
    } else if (phoneNumber.length < 10) {
      this.AlertOut("Please enter a valid phone number");
    } else if (reg.test(email) === false) {
      this.AlertOut("Please enter valid e-mail");
    } else {
      this.sendVerification();
    }
  }

  sendVerification = async () => {
    const { phoneNumber, email, password, firstName, lastName } = this.state;

    const number = "+1" + phoneNumber;
    try {
      const phoneProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneProvider.verifyPhoneNumber(
        number,
        recaptchaVerifier.current
      );
      this.setState({ loading: false });
      this.props.navigation.navigate("VerifyPhoneNumber", {
        verificationId: verificationId,
        phoneNumber: phoneNumber,
        signInWithPhoneNumber: false,
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
      });
    } catch (err) {
      this.setState({ loading: false });
    }
  };

  AlertOut(message) {
    Alert.alert("Alert", message);
    this.setState({ loading: false });
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <FirebaseRecaptchaVerifierModal
            ref={recaptchaVerifier}
            firebaseConfig={app.options}
            attemptInvisibleVerification={true}
            androidHardwareAccelerationDisabled={true}
          />
          <View style={styles.padding10} />
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
            onChangeText={(email) => this.setState({ email })}
          />
          <View style={styles.padding} />
          <CustomTextInput
            label="firstName"
            placeholder="First Name"
            autoCompleteType={"off"}
            autoCorrect={false}
            paddingLeft={12}
            width={"90%"}
            height={65}
            onChangeText={(firstName) => this.setState({ firstName })}
          />
          <View style={styles.padding} />
          <CustomTextInput
            label="lastName"
            placeholder="Last Name"
            autoCompleteType={"off"}
            autoCorrect={false}
            paddingLeft={12}
            width={"90%"}
            height={65}
            onChangeText={(lastName) => this.setState({ lastName })}
          />
          <View style={styles.padding} />
          <CustomTextInput
            label="phoneNumber"
            placeholder="Phone Number"
            autoCapitalize={"none"}
            autoCompleteType={"off"}
            autoCorrect={false}
            keyboardType={"numeric"}
            paddingLeft={12}
            width={"90%"}
            height={65}
            maxLength={10}
            onChangeText={(phoneNumber) => this.setState({ phoneNumber })}
          />
          <View style={styles.padding} />
          <CustomTextInput
            label="password"
            placeholder="Password"
            autoCapitalize={"none"}
            autoCompleteType={"off"}
            autoCorrect={false}
            secureTextEntry={true}
            width={"90%"}
            height={65}
            paddingLeft={12}
            onChangeText={(password) => this.setState({ password })}
          />
          <View style={styles.padding} />
          <CustomTextInput
            label="confirmPassword"
            placeholder="Confirm Password"
            autoCapitalize={"none"}
            autoCompleteType={"off"}
            autoCorrect={false}
            secureTextEntry={true}
            width={"90%"}
            height={65}
            paddingLeft={12}
            onChangeText={(confirmPassword) =>
              this.setState({ confirmPassword })
            }
          />
          <View style={{ width: "90%", padding: 5 }}>
            <Text
              style={{ fontSize: 12, fontWeight: "bold", color: "#8A8A8A" }}
            >
              Password must contain at least 8 characters
            </Text>
          </View>
          <View style={{ paddingTop: "15%" }} />
          <CustomButton
            buttonTxt={
              this.state.loading !== true ? (
                "Continue"
              ) : (
                <ActivityIndicator color="white" />
              )
            }
            txtColor={"white"}
            backgroundColor={"black"}
            onPress={this.onSignUp}
          />
          <View style={styles.padding10} />
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "white",
  },
  container2: {
    flex: 1,
    alignItems: "center",
  },
  padding: {
    paddingTop: "3%",
  },
  padding10: {
    paddingTop: "5%",
  },
  container2: {
    backgroundColor: "white",
  },
  SignDifferentlyTxt: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    paddingLeft: "5%",
  },
  scene: {
    flex: 1,
  },
  btnGoogle: {
    width: "85%",
    aspectRatio: 17 / 3,
    backgroundColor: "#4285F4",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderWidth: 0,
  },
  btnFacebook: {
    width: "85%",
    aspectRatio: 17 / 3,
    backgroundColor: "#4267B2",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderWidth: 0,
  },
});
