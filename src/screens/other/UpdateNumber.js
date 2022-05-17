import React, {  useState, useRef } from 'react'
import { Text, View, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { ActivityIndicator } from 'react-native-paper';

///firebase
import { PhoneAuthProvider } from 'firebase/auth';
import { getApp } from 'firebase/app';
import { auth } from '../../api/firebase';

const app = getApp();

export default function UpdateNumber({ navigation}) {

  const [phoneNumber, setPhoneNumber] = useState('')
  const [ loaded, setLoaded ] = useState(true);
  const recaptchaVerifier = useRef(null);

  const changeNumber = async () => {
    setLoaded(false)

    if (phoneNumber.length < 10) {
      Alert.alert(
        "Alert",
        "Please enter a valid phone number",
        [
          { text: "OK", onPress: () => console.log("OK Pressed") }
        ]
      );
      setLoaded(true)
    } else {
    
      const number = '+1' + phoneNumber
    
      try {
        const phoneProvider = new PhoneAuthProvider(auth);
        const verificationId = await phoneProvider.verifyPhoneNumber(
          number,
          recaptchaVerifier.current
        )
        setLoaded(true)
        navigation.navigate('ChangeNumber', {
          verificationId: verificationId,
          phoneNumber: number,
        })
      } catch (err) {
        Alert.alert(err)
        setLoaded(true)
      }
    }
  }
   
  
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }}>
            <FirebaseRecaptchaVerifierModal
              ref={recaptchaVerifier}
              firebaseConfig={app.options}
              attemptInvisibleVerification={true}
            />
            <Text style={{fontSize:23, color:'#6E6D6D', padding:'5%'}}>Enter New Phone Number</Text>
            <CustomTextInput
              label="phoneNumber"
              placeholder="Phone Number"
              autoCapitalize={"none"}
              autoCompleteType={"off"}
              autoCorrect={false}
              keyboardType="numeric"
              paddingLeft={12}
              width={'90%'}
              maxLength={10}
              height={65}
              onChangeText={(phoneNumber) => setPhoneNumber(phoneNumber)}
              />
              <View style={{padding:'5%'}}/>
              <CustomButton
                buttonTxt={loaded == true ? 'Send Verification Code' : <ActivityIndicator color='white' />}
                backgroundColor={'black'}
                onPress={changeNumber}
                txtColor={'white'}
              />
        </View>
      </TouchableWithoutFeedback>
      )
};