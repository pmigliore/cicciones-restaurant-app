import React, { Component } from "react";
import {
  TouchableWithoutFeedback,
  View,
  TouchableOpacity,
  Text,
  Alert,
  Keyboard,
  StyleSheet,
} from "react-native";
import CustomButton from "../../components/CustomButton.js";
import CustomTextInput from "../../components/CustomTextInput.js";
import { ActivityIndicator } from "react-native-paper";

//firebase
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../api/firebase.js";

export class LogIn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      loaded: true,
    };
  }

  onLogIn = () => {
    this.setState({ loaded: false });
    const { email, password } = this.state;
    signInWithEmailAndPassword(auth, email, password).catch(() => {
      Alert.alert("Alert", "The e-mail or password entered are incorrect");
      this.setState({ loaded: true });
    });
  };

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <View style={{ paddingTop: "10%" }} />
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
          <View style={{ paddingTop: "6%" }} />
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate("ForgotPassword")}
          >
            <Text style={{ fontWeight: "bold" }}>Forgot password?</Text>
          </TouchableOpacity>
          <View style={{ paddingTop: "15%" }} />
          <CustomButton
            buttonTxt={
              this.state.loaded == true ? (
                "Log In"
              ) : (
                <ActivityIndicator color="white" />
              )
            }
            txtColor={"white"}
            backgroundColor={"black"}
            onPress={this.onLogIn}
          />
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

export default LogIn;

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

  container2: {
    backgroundColor: "white",
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
