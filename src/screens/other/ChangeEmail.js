import React, { useState } from 'react'
import { Text, View, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import { ActivityIndicator } from 'react-native-paper';

///firebase
import { updateEmail } from 'firebase/auth';
import { auth, db } from '../../api/firebase';
import { doc, updateDoc } from 'firebase/firestore';



export default function ChangeEmail({ navigation }) {

  const [newEmail, setNewEmail] = useState('')
  const [loaded, setLoaded] = useState(true)

  
  const saveUpdate = () => {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    setLoaded(false)
    if (reg.test(newEmail) === false) {
      Alert.alert(
        "Alert",
        "Please enter valid e-mail",
        [
          { text: "OK" }
        ]
      );
      setLoaded(true)
    } else {
      updateEmail(auth.currentUser, newEmail)
      .then((result) => {
        const fetchInformation = doc(db, 'clients', 'user', 'Information', auth.currentUser.uid)
        updateDoc(fetchInformation, {
          email: newEmail
        })
        setLoaded(true)
        navigation.navigate('Profile')
      })
      .catch((err) => {
        Alert.alert(`${err}`)
        setLoaded(true)
      })
    }
  }
  
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1, backgroundColor:'white', alignItems:'center', justifyContent:'center'}}>
            <CustomTextInput
              label="email"
              placeholder="Email Address"
              autoCapitalize={"none"}
              autoCompleteType={"off"}
              autoCorrect={false}
              keyboardType="email-address"
              paddingLeft={12}
              width={'90%'}
              height={65}
              onChangeText={(newEmail) => setNewEmail(newEmail)}
              />
              <Text style={{padding:'5%', color: '#6E6D6D'}}>A confirmation email will be sent to your old email</Text>
              <CustomButton
                  buttonTxt={loaded == true ? 'Update Email' : <ActivityIndicator color='white'/>}
                  backgroundColor={'black'}
                  onPress={saveUpdate}
                  txtColor={'white'}
              />
        </View>
      </TouchableWithoutFeedback>
      )
};