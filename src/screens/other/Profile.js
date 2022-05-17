import React, { useState, useEffect } from 'react'
import { Text, ActivityIndicator, TouchableOpacity, View, TouchableWithoutFeedback, Keyboard, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'
import { useStripe } from '@stripe/stripe-react-native';

///firebase
import { auth, db } from '../../api/firebase';
import { doc, getDoc } from 'firebase/firestore';


const API_URL = 'https://us-central1-restaurantapptemplate-691c3.cloudfunctions.net/addCardForExistingCustomer'

export default function Profile({navigation}) {

  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')

  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(true);
  const [customerId, setCustomerId] = useState('');

  useEffect(() => {
    updateUser()
    fetchCustomer()
  }, []);

  const updateUser = () => {
    const fetchInformation = doc(db, 'clients', 'user', 'Information', auth.currentUser.uid)
    getDoc(fetchInformation)
      .then((snapshot) => {
        const email = snapshot.data().email
        const phoneNumber = snapshot.data().phoneNumber
        setEmail(email)
        setPhoneNumber(phoneNumber)
    })
  }

  const fetchCustomer = async () => {
    const fetchInformation = doc(db, 'clients', 'user', 'Information', auth.currentUser.uid)
    await getDoc(fetchInformation)
      .then( async (snapshot) => {
        const stripeId = await snapshot.data().stripeCustomerId
        setCustomerId(stripeId)
      })
  }

  const fetchPaymentSheetParams = async () => {
    const response = await fetch(`${API_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body : JSON.stringify({'customer' : customerId})
    });

    const { setupIntent, ephemeralKey, customer } = await response.json();

    return {
      setupIntent,
      ephemeralKey,
      customer,
    };
  };

  const initializePaymentSheet = async () => {
    setLoading(false)
    const {
      setupIntent,
      ephemeralKey,
      customer,
    } = await fetchPaymentSheetParams();

    const { error } = await initPaymentSheet({
      customerId: customer,
      customerEphemeralKeySecret: ephemeralKey,
      setupIntentClientSecret: setupIntent,
      primaryButtonColor: 'black',
    });
    if (!error) {
      setLoading(true);
      openPaymentSheet();
    } else {
      console.log(error)
      setLoading(true);
    }
  };


  const openPaymentSheet = async () => {

    const { error } = await presentPaymentSheet();

    if (!error) {
      setLoading(true);
    } else {
      console.log(error)
      setLoading(true);
    }
  };

  const phone = phoneNumber.replace('+1', '')
  const number = phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1 }}>
        <View style={{ flex: 0.4, width: '100%', backgroundColor:'white' }}> 
          <Text style={{fontSize:20, fontWeight:'bold', padding:'5%'}}>Personal Information</Text>
          <View style={{ flex: 1, alignItems: 'center', backgroundColor:'white' }}>
              <TouchableOpacity style={styles.accountButtonBtn} onPress={() => navigation.navigate('UpdateEmail', {
                oldEmail: email,
                deleteAccount: false
              })}>
                <View style={styles.viewBtn}>
                  <Text style={styles.accountButtonTxtTitle}>Email</Text>
                  <Text style={styles.accountButtonTxtSub}>{email}</Text>
                </View>
                  <Ionicons
                    name="chevron-forward"
                    size={23}
                  />
              </TouchableOpacity>
              <TouchableOpacity style={styles.accountButtonBtn} onPress={() => navigation.navigate('UpdateNumber')}>
                <View style={styles.viewBtn}>
                  <Text style={styles.accountButtonTxtTitle}>Phone Number</Text>
                  <Text style={styles.accountButtonTxtSub}>{number}</Text>
                </View>
                  <Ionicons
                    name="chevron-forward"
                    size={23}
                  />
              </TouchableOpacity>
              <TouchableOpacity style={styles.accountButtonBtn} onPress={() => navigation.navigate('UpdateEmail', {deleteAccount: true})}>
                  <View style={styles.viewBtn}>
                    <Text style={[styles.accountButtonTxtTitle, {color:'red'}]}>Delete Account</Text>
                    <Text style={styles.accountButtonTxtSub}>{email}</Text>
                  </View>
                    <Ionicons
                      name="chevron-forward"
                      size={23}
                    />
                </TouchableOpacity>
            </View>
        </View>
        <View style={{ flex: 0.6, width: '100%', backgroundColor:'white' }}>
          <Text style={{fontSize:20, fontWeight:'bold', padding:'5%'}}>Payment Methods</Text>
          <View style={{ flex: 1, alignItems: 'center', backgroundColor: 'white' }}>
            <TouchableOpacity style={{padding:15, width: '100%', flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth:1, borderColor: '#D5D5D5' }}>
              <View style={{flexDirection:'row', alignItems:'center'}}>
                <Ionicons
                  name="cash-outline"
                  size={23}
                />
                <Text style={{fontSize:16, paddingLeft:10}}>Cash</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={{padding:15, width: '100%', flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth:1, borderColor: '#D5D5D5' }} onPress={initializePaymentSheet}>
                <View style={{flexDirection:'row', alignItems:'center'}}>
                    <Ionicons
                        name="card-outline"
                        size={23}
                        />
                    <Text style={{fontSize:16, paddingLeft:10}}>Credit/Debit Card</Text>
                </View>
                {loading == true ? (
                  <Ionicons
                      name="chevron-forward"
                      size={23}
                  />
                ): (
                  <ActivityIndicator/>
                )}
            </TouchableOpacity>
          </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
  )
}


const styles = StyleSheet.create({
  accountButtonTxtTitle: {
    fontSize:  Platform.OS == "ios" ? 16 : 14,
    fontWeight: 'bold',
    paddingLeft: 15,
    paddingRight: 2,
    width: '85%',
    fontWeight: 'normal' 
  },
  accountButtonTxtSub: {
    fontSize:  Platform.OS == "ios" ? 16 : 14,
    fontWeight: 'bold',
    paddingLeft: 15,
    paddingRight: 2,
    width: '85%',
  },
  accountButtonBtn: {
    width: '100%',
    flex: 0.2,
    borderBottomWidth: 1,
    borderColor: '#D5D5D5',
    flexDirection: 'row',
    alignItems: 'center',
    padding:15
  },
  viewBtn: {
    flexDirection: 'column',
    width: '95%'
  }
})