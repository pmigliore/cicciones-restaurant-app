import React, {useState} from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Keyboard, Text, Alert } from 'react-native';
import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import { ActivityIndicator } from 'react-native-paper';

//firebase
import { PhoneAuthProvider, updatePhoneNumber } from 'firebase/auth';
import { auth, db } from '../../api/firebase';
import { doc, updateDoc } from 'firebase/firestore';


export default function ChangeNumber({navigation, route}) {

  const [code, setCode] = useState('')
  const [ loaded, setLoaded ] = useState(true);


  const confirmCode = () => {
    setLoaded(false)
    
        const {verificationId, phoneNumber} = route.params;
        const credential = PhoneAuthProvider.credential(
          verificationId,
          code
      );
        updatePhoneNumber(auth.currentUser, credential)
          .then((result) => {
            const fetchInformation = doc(db, 'clients', 'user', 'Information', auth.currentUser.uid)
            updateDoc(fetchInformation, {
              phoneNumber: phoneNumber
            })
            setLoaded(true)
            navigation.navigate('Profile')
          })
        .catch((err) => {
          console.log(err)
          if (err.length !== 0) {
            Alert.alert('Invalid Code')
            setLoaded(true)
          }
        })
      }

return(
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{fontSize:23, color:'#6E6D6D', padding:'5%'}}>Verify Code</Text>
            <CustomTextInput
              label="code"
              placeholder="Verification Code"
              autoCapitalize={"none"}
              autoCompleteType={"off"}
              autoCorrect={false}
              keyboardType="numeric"
              paddingLeft={12}
              width={'90%'}
              height={65}
              onChangeText={(code) => setCode(code)}
              />
              <View style={{padding:'5%'}}/>
              <CustomButton
                buttonTxt={loaded == true ? 'Change Phone Number' : <ActivityIndicator color='white' />}
                backgroundColor={'black'}
                onPress={confirmCode}
                txtColor={'white'}
              />
        </View>
    </TouchableWithoutFeedback>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems:'center',
        justifyContent:'center',
        height:'100%'
    }
})