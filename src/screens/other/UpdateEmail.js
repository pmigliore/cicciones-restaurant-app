import React, {  useEffect, useState } from 'react'
import { Text, View, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import { ActivityIndicator } from 'react-native-paper';

///firebase
import { signInWithEmailAndPassword } from 'firebase/auth';
import { deleteDoc, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../api/firebase';

const API_URL = 'https://us-central1-restaurantapptemplate-691c3.cloudfunctions.net/deleteCustomer'

export default function UpdateEmail({ navigation, route }) {

  const oldEmail = auth.currentUser.email;
  const [email, setEmail] = useState(oldEmail)
  const [password, setPassword] = useState('')
  const [loaded, setLoaded] = useState(true)
  const [customerId, setCustomerId] = useState('')

  const { deleteAccount } = route.params;

  useEffect(() => {
    fetchCustomer()
  })

  const fetchCustomer = async () => {
    const fetchInformation = doc(db, 'clients', 'user', 'Information', auth.currentUser.uid)
    await getDoc(fetchInformation)
      .then( async (snapshot) => {
        const stripeId = await snapshot.data().stripeCustomerId
        setCustomerId(stripeId)
      })
  }
  
  const verifyUser = () => {
    setLoaded(false);
    
    signInWithEmailAndPassword(auth, email, password)
      .then((result) => {
        if (deleteAccount === true) {
          const fetchDoc = doc(db, 'clients', 'user', 'Information', auth.currentUser.uid)
          deleteDoc(fetchDoc)
            .then((result) => {
              setLoaded(true)
              deleteStripeAccount()
              Alert.alert('Account Deleted', 'Your account has been deleted successfully')
              auth.currentUser.delete()
            })
        } else {
          setLoaded(true)
          navigation.navigate('ChangeEmail')
        }
      })
      .catch((err) =>
        Alert.alert('User Not Found in our Database'),
        setLoaded(true),
      )
    }
   
  const deleteStripeAccount = async () => {
    const response = await fetch(`${API_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body : JSON.stringify({'customer' : customerId})
    });
  }

  if (loaded == false) {
    return (
      <View style={{alignItems:'center', backgroundColor:'white', justifyContent:'center', flex:1}}>
        <ActivityIndicator color='black' size={40}/>
      </View>
    )
  } else {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 23, color: '#6E6D6D', padding: '5%' }}>Confirm User Information</Text>
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
            defaultValue={oldEmail.toString()}
            onChangeText={(oldEmail) => setEmail(oldEmail)}
          />
          <View style={{ padding: '5%' }} />
          <CustomTextInput
            label="password"
            placeholder="Password"
            autoCapitalize={"none"}
            autoCompleteType={"off"}
            autoCorrect={false}
            secureTextEntry={true}
            paddingLeft={12}
            width={'90%'}
            height={65}
            onChangeText={(password) => setPassword(password)}
          />
          <View style={{ padding: '5%' }} />
          <CustomButton
            buttonTxt={deleteAccount !== true ? (
              'Verify User'
            ) : (
              'Delete Account'
            )}
            backgroundColor={'black'}
            onPress={verifyUser}
            txtColor={'white'}
          />
        </View>
      </TouchableWithoutFeedback>
    )
  }
};