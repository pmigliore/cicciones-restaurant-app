import React, { useEffect, useState } from 'react'
import { Text, TouchableOpacity, View, StyleSheet, Linking, TextInput, ScrollView, KeyboardAvoidingView } from 'react-native';
import CustomButton from '../../components/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Divider } from 'react-native-paper';
import { useStripe } from '@stripe/stripe-react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

//redux
import { connect } from 'react-redux';
import { clearOrder, getMenu } from '../../redux/actions';

///Maps
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

//firebase
import { db, auth, dbMenu } from '../../api/firebase';
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { onValue, ref } from 'firebase/database';

const API_URL = 'https://us-central1-restaurantapptemplate-691c3.cloudfunctions.net/chargeCustomer'

 
function Cart({ navigation, newOrder, onClearOrder, menu }) {
   
   const [resetMenu, setResetMenu] = useState([])
   const [deliveryLatitude, setDeliveryLatitude] = useState(0)
   const [deliveryLongitude, setDeliveryLongitude] = useState(0)
   const [pickUpLatitude, setPickUpLatitude] = useState(26.666197823113247)
   const [pickUpLongitude, setPickUpLongitude] = useState(-81.91582645852678)
   const [serviceRequested, setServiceRequested] = useState('')
   const [instructions, setInstructions] = useState('')
   const [loaded, setLoaded] = useState(true)
   const [deliveryFee, setDeliveryFee] = useState('')
   const [paymentMethod, setPaymentMethod] = useState('Card')
   const [tip15, setTip15] = useState(false)
   const [tip10, setTip10] = useState(false)
   const [tip20, setTip20] = useState(false)
   const [tip25, setTip25] = useState(false)
   const [tip, setTip] = useState('')
   const [customTip, setCustomTip] = useState('')

  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [customerId, setCustomerId] = useState('')
  const [email, setEmail] = useState('')
   
   useEffect(() => {
     const fetchInformation = doc(db, 'clients', 'user', 'Information', auth.currentUser.uid)
     getDoc(fetchInformation)
       .then((snapshot) => {
         let longitude = snapshot.data().longitude;
         let latitude = snapshot.data().latitude;
         let fee = snapshot.data().deliveryFee;
         let data = snapshot.data();
         if (data.mainAddress == null || data.mainAddress == undefined) {
           setServiceRequested('Pick Up')
         } else {
           setServiceRequested('Delivery')
           setDeliveryLatitude(latitude)
           setDeliveryLongitude(longitude)
           setDeliveryFee(fee)
         }
       })
     fetchCustomer()
     tipPercentage('15')
      const menuGet = ref(dbMenu, 'menu')
      onValue(menuGet, snapshot => {
        const data = snapshot.val();
        setResetMenu(data)
      })
   }, [])
  
  const fetchCustomer = async () => {
    const fetchInformation = doc(db, 'clients', 'user', 'Information', auth.currentUser.uid)
    await getDoc(fetchInformation)
      .then( async (snapshot) => {
        const stripeId = await snapshot.data().stripeCustomerId
        const email = await snapshot.data().email
        setCustomerId(stripeId)
        setEmail(email)
      })
  }
  
  const fetchPaymentSheetParams = async () => {
    const amount = total.toFixed(2) * 100

    const response = await fetch(`${API_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'customer': customerId,
        'amount': amount,
        'email': email
      })
    });
    const { paymentIntent, ephemeralKey, customer, paymentIntentId } = await response.json();

    return {
      paymentIntent,
      ephemeralKey,
      customer,
      paymentIntentId
    };
  };

  const initializePaymentSheet = async () => {
    setLoaded(false)
    const {
      paymentIntent,
      ephemeralKey,
      customer,
      paymentIntentId
    } = await fetchPaymentSheetParams();
    
    const { error } = await initPaymentSheet({
      customerId: customer,
      customerEphemeralKeySecret: ephemeralKey,
      paymentIntentClientSecret: paymentIntent,
      allowsDelayedPaymentMethods: true,
      applePay: true,
      merchantCountryCode: 'US',
      primaryButtonColor: 'black',
    });
    if (!error) {
      openPaymentSheet(paymentIntentId);
    } else {
      setLoaded(true)
    }
  };

  const openPaymentSheet = async (paymentIntentId) => {

    const { error } = await presentPaymentSheet();

    if (error) {
      setLoaded(true)
    } else {
      placeOrder(paymentIntentId)
    }
  };

  const selectDelivery = () => {
     if (serviceRequested === 'Pick Up' && deliveryLatitude === 0) {
       navigation.navigate('AddressSearch')
     } else {
       setServiceRequested('Delivery')
     }
   }

   const selectPickUp = () => {
     setServiceRequested('Pick Up')
   }

   const openMaps = () => {
      const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
      const latLng = `${pickUpLatitude},${pickUpLongitude}`;
      const label = 'Restaurant Name';
      const url = Platform.select({
        ios: `${scheme}${label}@${latLng}`,
        android: `${scheme}${latLng}(${label})`
      });   
      Linking.openURL(url);
   }

   const openAddress = () => {
     const fetchInformation = doc(db, 'clients', 'user', 'Information', auth.currentUser.uid)
     getDoc(fetchInformation)
       .then((snapshot) => {
         let latitude = snapshot.data().latitude
         let longitude = snapshot.data().longitude
         let mainAddress = snapshot.data().mainAddress
         let secondaryAddress = snapshot.data().secondaryAddress
         let apt = snapshot.data().apt
         let instructions = snapshot.data().instructions
         let deliveryMethod = snapshot.data().deliveryMethod
         navigation.navigate('AddressSearch', {
           showResult: 2,
           latitude: latitude,
           longitude: longitude,
           mainAddress: mainAddress,
           secondaryAddress: secondaryAddress,
           apt: apt,
           instructions: instructions,
           deliveryMethod: deliveryMethod
         })
       })
      .catch((err) => console.log(err))
  }
  
  const placeOrder = (paymentIntentId) => {
    setLoaded(false)

    if (serviceRequested === 'Delivery') {
      const fetchInformation = doc(db, 'clients', 'user', 'Information', auth.currentUser.uid)
      getDoc(fetchInformation)
        .then((snapshot) => {
          let email = snapshot.data().email
          let phoneNumber = snapshot.data().phoneNumber
          let mainAddress = snapshot.data().mainAddress
          let secondaryAddress = snapshot.data().secondaryAddress
          let apt = snapshot.data().apt
          let deliveryInstructions = snapshot.data().instructions
          let deliveryMethod = snapshot.data().deliveryMethod
          let firstName = snapshot.data().firstName
          let lastName = snapshot.data().lastName
          const orderId = Math.random()

          const fetchInformation = doc(db, 'Bella Mia Pizza', 'orders', 'Ongoing Orders', auth.currentUser.uid)
          getDoc(fetchInformation)
          .then((snapshot) => {
            
            if (snapshot.exists()) {
              let order = snapshot.data().order
              const doc = {
                id: orderId,
                serviceRequested: 'Delivery',
                customerId: auth.currentUser.uid,
                paymentIntentId: paymentMethod == 'Card' ? paymentIntentId : null,
                order: newOrder,
                email: email,
                name: `${firstName} ${lastName}`,
                phoneNumber: phoneNumber,
                paymentType: paymentMethod == 'Cash' ? 'Cash' : 'Card',
                address: [
                  mainAddress = mainAddress,
                  secondaryAddress = secondaryAddress,
                  apt = apt,
                  deliveryInstructions = deliveryInstructions,
                  deliveryMethod = deliveryMethod
                ],
                instructions: instructions,
                total: total,
                deliveryFee: deliveryFee,
                taxes: taxesPercentage,
                subtotal: subtotal,
                date: Date().toLocaleString(),
                timeStamp: new Date().getTime()
              }
              order.push(doc)
              setDoc(fetchInformation, {order})
              .then(
                setLoaded(true),
                menu.length = 0,
                menu.push(...resetMenu),
                navigation.navigate('OrderStatus', {
                  orderId: orderId,
                  chargeId: paymentMethod == 'Card' ? paymentIntentId : null,
                  paymentType: paymentMethod
                }),
                setTimeout(function () {
                    onClearOrder()
                }, 800)
              )
            } else {
              setDoc(fetchInformation, {
               order : [{
                  id: orderId,
                  serviceRequested: 'Delivery',
                  customerId: auth.currentUser.uid,
                  paymentIntentId: paymentMethod == 'Card' ? paymentIntentId : null,
                  order: newOrder,
                  email: email,
                  name: `${firstName} ${lastName}`,
                  phoneNumber: phoneNumber,
                  paymentType: paymentMethod == 'Cash' ? 'Cash' : 'Card',
                  address: [
                    mainAddress = mainAddress,
                    secondaryAddress = secondaryAddress,
                    apt = apt,
                    deliveryInstructions = deliveryInstructions,
                    deliveryMethod = deliveryMethod
                  ],
                  instructions: instructions,
                  total: total,
                  subtotal: subtotal,
                  deliveryFee: deliveryFee,
                  taxes: taxesPercentage,
                  date: Date().toLocaleString(),
                  timeStamp: new Date().getTime()
                  }]
              })
              .then(
                setLoaded(true),
                menu.length = 0,
                menu.push(...resetMenu),
                navigation.navigate('OrderStatus', {
                  orderId: orderId,
                  chargeId: paymentMethod == 'Card' ? paymentIntentId : null,
                  paymentType: paymentMethod
                }),
                setTimeout(function () {
                    onClearOrder()
                }, 800)
              )
            }
          })
          .catch((err) => console.log(err))
      })
    } else {
      const fetchInformation = doc(db, 'clients', 'user', 'Information', auth.currentUser.uid)
      getDoc(fetchInformation)
        .then((snapshot) => {
          let email = snapshot.data().email
          let phoneNumber = snapshot.data().phoneNumber
          let firstName = snapshot.data().firstName
          let lastName = snapshot.data().lastName
          const orderId = Math.random()

          const fetchInformation = doc(db, 'Bella Mia Pizza', 'orders', 'Ongoing Orders', auth.currentUser.uid)
          getDoc(fetchInformation)
          .then((snapshot) => {
            if (snapshot.exists()) {
              let order = snapshot.data().order
              const doc = {
                id: orderId,
                serviceRequested: 'Pick Up',
                customerId: auth.currentUser.uid,
                paymentIntentId: paymentMethod == 'Card' ? paymentIntentId : null,
                name: `${firstName} ${lastName}`,
                order: newOrder,
                email: email,
                phoneNumber: phoneNumber,
                paymentType: paymentMethod == 'Cash' ? 'Cash' : 'Card',
                instructions: instructions,
                total: total,
                taxes: taxesPercentage,
                subtotal: subtotal,
                date: Date().toLocaleString(),
                timeStamp: new Date().getTime()
              }
              order.push(doc)
              setDoc(fetchInformation, {order})
              .then(
                setLoaded(true),
                menu.length = 0,
                menu.push(...resetMenu),
                navigation.navigate('OrderStatus', {
                  orderId: orderId,
                  chargeId: paymentMethod == 'Card' ? paymentIntentId : null,
                  paymentType: paymentMethod
                }),
                setTimeout(function () {
                    onClearOrder()
                }, 800)
              )
            } else {
              setDoc(fetchInformation, {
               order : [{
                  id: orderId,
                  serviceRequested: 'Pick Up',
                  customerId: auth.currentUser.uid,
                  paymentIntentId: paymentMethod == 'Card' ? paymentIntentId : null,
                  name: `${firstName} ${lastName}`,
                  order: newOrder,
                  email: email,
                  phoneNumber: phoneNumber,
                  paymentType: paymentMethod == 'Cash' ? 'Cash' : 'Card',
                  instructions: instructions,
                  total: total,
                  taxes: taxesPercentage,
                  subtotal: subtotal,
                  date: Date().toLocaleString(),
                  timeStamp: new Date().getTime()
                  }],
              })
              .then(
                setLoaded(true),
                menu.length = 0,
                menu.push(...resetMenu),
                navigation.navigate('OrderStatus', {
                  orderId: orderId,
                  chargeId: paymentMethod == 'Card' ? paymentIntentId : null,
                  paymentType: paymentMethod
                }),
                setTimeout(function () {
                    onClearOrder()
                }, 800)
              )
            }
          })
          .catch((err) => console.log(err))
      })
    }
  }

  const tipPercentage = (e) => {
    if (e == '10') {
      setTip10(true)
      setTip15(false)
      setTip20(false)
      setTip25(false)
      setTip(subtotal * 0.10)
      setCustomTip('')
    } else if (e == '15') {
      setTip10(false)
      setTip15(true)
      setTip20(false)
      setTip25(false)
      setTip(subtotal * 0.15)
      setCustomTip('')
    } else if (e == '20') {
      setTip10(false)
      setTip15(false)
      setTip20(true)
      setTip25(false)
      setTip(subtotal * 0.20)
      setCustomTip('')
    } else if (e == '25') {
      setTip10(false)
      setTip15(false)
      setTip20(false)
      setTip25(true)
      setTip(subtotal * 0.25)
      setCustomTip('')
    }
  }
    
  if (tip.length == 0) {
    setTip('0')
  }
    
  let mapLocation = {
    latitude: serviceRequested == 'Delivery' ? deliveryLatitude : pickUpLatitude,
    longitude: serviceRequested== 'Delivery' ? deliveryLongitude : pickUpLongitude,
    latitudeDelta: 0.009,
    longitudeDelta: 0.009
  }

  var subtotal = newOrder.reduce(function(prev, newOrder) {
    return prev + + newOrder.price
  }, 0);

  var taxesPercentageDelivery = Math.round(((subtotal + parseFloat(deliveryFee) + parseFloat(tip)) * 0.065) * 100) / 100;

  var taxesPercentagePickUp = Math.round(((subtotal + parseFloat(tip)) * 0.065) * 100) / 100;

  var total = 0
  
  if (serviceRequested == 'Delivery') {
    total = (subtotal + taxesPercentageDelivery + parseFloat(deliveryFee) + parseFloat(tip))
  } else if (serviceRequested == 'Pick Up') {
    total = (subtotal + taxesPercentagePickUp + parseFloat(tip))
  }
  console.log()
   
  const items = newOrder.map((item) => {
    return (
      <View key={item.id}>
            <TouchableOpacity
              key={item.id}
              onPress={() => navigation.navigate('DisplayItem', {
                item
              })}
              style={{
                  backgroundColor:'white',
                  justifyContent:'center',
                  padding: 10,
              }}
            >
            <View style={{ padding: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <View style={{flexDirection:'row', alignItems:'center'}}>
                    <View style={{ alignItems: 'center', justifyContent: 'center', borderRadius: 5, backgroundColor: '#F0F0F0', padding:5 }}>
                      <Text style={{ fontSize: 15 }}>{item.quantity}</Text>
                    </View>
                <Text style={[styles.txtDescription, { color: 'black', fontWeight: 'bold', paddingLeft: 10 }]}>{item.title}</Text>
                </View>
                <Text style={styles.txtPrice}>${item.price.toFixed(2)}</Text>
            </View>
        </TouchableOpacity>
        <Divider/>
      </View>
     )})
  
  
    return (
      <View style={styles.container}>
      <KeyboardAwareScrollView style={styles.scrollView} enableOnAndroid={true} >
          <View style={{ alignItems:'center'}}>
            <View style={{flexDirection:'row', width:'100%', justifyContent:'space-evenly', position:'relative', height: 70, alignItems:'center' }}>
              <TouchableOpacity onPress={selectDelivery} style={{width:'45%', backgroundColor: serviceRequested == 'Delivery' ? 'black' : 'white', borderRadius:32, alignItems:'center', justifyContent:'center', height:'60%'}}>
                  <Text style={{ fontSize:18, fontWeight:'bold', color:serviceRequested == 'Delivery' ? 'white' : 'black'}}>Delivery</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={selectPickUp} style={{width:'45%', backgroundColor:serviceRequested == 'Pick Up' ? 'black' : 'white', borderRadius:32, alignItems:'center', justifyContent:'center', height:'60%'}}>
                  <Text style={{ fontSize:18, fontWeight:'bold', color:serviceRequested == 'Pick Up' ? 'white' : 'black'}}>Pick Up</Text>
                </TouchableOpacity>
            </View>
            <View style={{height:150, width:'100%'}}>
              <MapView
                onPress={serviceRequested == 'Pick Up' ? openMaps : openAddress}
                style={StyleSheet.absoluteFillObject}
                provider={Platform.OS !== 'ios' ? PROVIDER_GOOGLE : null}
                  region={mapLocation}
                >
                    <Marker coordinate={{
                        latitude: serviceRequested == 'Delivery' ? deliveryLatitude : pickUpLatitude,
                        longitude: serviceRequested == 'Delivery' ? deliveryLongitude : pickUpLongitude
                      }}
                    />
                </MapView>
            </View>
            <View style={{width:'100%', padding:15}}>
              <Text style={{ fontSize:18, fontWeight:'bold'}}>Your Order</Text>
            </View>
            <View style={{width:'100%'}}>
              <View>{items}</View>
            </View>
            <View style={{ width: '100%' }}>
              <TouchableOpacity onPress={() => navigation.navigate('TabNavigator')} style={{ padding: 15, width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{flexDirection:'row', alignItems:'center'}}>
                  <Ionicons
                    name="add-outline"
                    size={23}
                  />
                  <Text style={{fontSize:16, paddingLeft:10}}>Add Item</Text>
                </View>
              </TouchableOpacity>
              <Divider/>
            </View>
            <View style={{ width: '100%' }}>
              <Text style={{fontWeight:'bold', padding:15}}>Payment Method</Text>
              <TouchableOpacity onPress={() => setPaymentMethod('Cash')} style={{ padding: 15, width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{flexDirection:'row', alignItems:'center'}}>
                  <Ionicons
                    name="cash-outline"
                    size={23}
                  />
                  <Text style={{fontSize:16, paddingLeft:10}}>Cash</Text>
                </View>
                {paymentMethod == 'Cash' ? (
                  <Ionicons
                    name="checkmark"
                    size={23}
                  />
                ) : (null)}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setPaymentMethod('Card')} style={{ padding: 15, width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{flexDirection:'row', alignItems:'center'}}>
                  <Ionicons
                    name="card-outline"
                    size={23}
                  />
                  <Text style={{fontSize:16, paddingLeft:10}}>Credit/Debit Card</Text>
                </View>
                {paymentMethod == 'Card' ? (
                  <Ionicons
                    name="checkmark"
                    size={23}
                  />
                ) : (null)}
              </TouchableOpacity>
              <Divider/>
            </View>
            <View style={{ width: '100%', alignItems:'center', justifyContent:'center', padding:10 }}>
              <View style={{width:'100%', flexDirection:'row', justifyContent:'space-evenly', alignItems:'center'}}>
                <TouchableOpacity onPress={() => tipPercentage('10')} style={[styles.tipBtn, {backgroundColor: tip10 == true ? 'black' : 'white'}]}>
                  <Text style={[styles.tipTxt, { color: tip10 == true ? 'white' : 'black'}]}>10%</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => tipPercentage('15')} style={[styles.tipBtn, {backgroundColor: tip15 == true ? 'black' : 'white'}]}>
                  <Text style={[styles.tipTxt, { color: tip15 == true ? 'white' : 'black'}]}>15%</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => tipPercentage('20')} style={[styles.tipBtn, {backgroundColor: tip20 == true ? 'black' : 'white'}]}>
                  <Text style={[styles.tipTxt, { color: tip20 == true ? 'white' : 'black'}]}>20%</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => tipPercentage('25')} style={[styles.tipBtn, {backgroundColor: tip25 == true ? 'black' : 'white'}]}>
                  <Text style={[styles.tipTxt, { color: tip25 == true ? 'white' : 'black'}]}>25%</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection:'row', alignItems:'center'}}>
                <Text style={{ fontWeight:'bold'}}>$</Text>
                <TextInput
                  placeholder={'Custom Tip'}
                  style={{ fontSize: 16, fontWeight: 'bold', padding: 15 }}
                  keyboardType='numeric'
                  value={customTip}
                  maxLength={3}
                  onChangeText={(text) => {setTip10(false), setTip15(false), setTip20(false), setTip25(false), setCustomTip(text), setTip(text)}}
                />
              </View>
            </View>
            <View style={{ width: '100%'}}>
              <Text style={{fontWeight:'bold', padding:10}}>Additional instructions</Text>
              <TextInput
                width={'100%'}
                height={70}
                placeholder={'e.g. no mushrooms, allergic to cheese'}
                multiline={true}
                onChangeText={(text) => setInstructions(text)}
                style={{ fontSize: 16, fontWeight: 'bold', padding:15 }}
              />
              <Divider/>
            </View>
            {deliveryFee.length == 0 && serviceRequested == 'Delivery' ? (
              null
            ) : (
                <View style={{ width: '100%', paddingBottom: 20 }}>
                  {serviceRequested == 'Delivery' ? (
                    <View style={styles.pricesView}>
                      <Text>Delivery Fee</Text>
                      <Text>${parseFloat(deliveryFee).toFixed(2)}</Text>
                    </View>
                  ) : (
                      null
                  )}
                  <View style={styles.pricesView}>
                    <Text>Tip</Text>
                    <Text>${parseFloat(tip).toFixed(2)}</Text>
                  </View>
                  <View style={styles.pricesView}>
                    <Text>Taxes</Text>
                    {serviceRequested == 'Delivery' ? (
                      <Text>${taxesPercentageDelivery.toFixed(2)}</Text>
                    ):(
                      <Text>${taxesPercentagePickUp.toFixed(2)}</Text>
                    )}
                  </View>
                  <View style={styles.pricesView}>
                    <Text style={styles.txtTotal}>Total</Text>
                    <Text style={styles.txtTotal}>${total.toFixed(2)}</Text>
                  </View>
                </View>
            )}
          </View>
        </KeyboardAwareScrollView>
        <View style={styles.addTo}>
          {newOrder.length === 0 ? (
            <CustomButton
              buttonTxt={ loaded == true ? "Place Order                            " + '$'+`${total.toFixed(2)}` : <ActivityIndicator color='white'/>}
              backgroundColor={'#C7C7C7'}
              txtColor={'white'}
              activeOpacity={1}
            />
          ) : deliveryFee.length == 0 && serviceRequested == 'Delivery' ? (
              <CustomButton
              buttonTxt={ loaded == true ? "It seems like you are too far, try to Pick Up instead"  : <ActivityIndicator color='white'/>}
              backgroundColor={'#C7C7C7'}
              txtColor={'white'}
              activeOpacity={1}
            />
          ) : (
              <CustomButton
              buttonTxt={ loaded == true ? "Place Order                            " + '$'+`${total.toFixed(2)}` : <ActivityIndicator color='white'/>}
              backgroundColor={'black'}
              txtColor={'white'}
              onPress={ paymentMethod == 'Cash' ? placeOrder : initializePaymentSheet}
            />
          )}
          </View>
    </View>
   )
}

function mapStateToProps(store) {
  return {
    newOrder: store.userState.newOrder,
    menu: store.userState.menu,
  };
} 
  
function mapDispatchToProps(dispatch) {
  return {
    onClearOrder: () => dispatch(clearOrder()),
    getMenu: () => dispatch(getMenu()),
  };
}
  
export default connect(mapStateToProps, mapDispatchToProps)(Cart);
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingBottom: '8%'
  },
  scrollView: {
    backgroundColor: 'white',
  },
  text: {
    fontSize: 42,
  },
  addTo: {
    borderTopWidth:1,
    borderColor: '#D5D5D5',
    paddingTop:10,
    backgroundColor:'white',
    alignItems:'center',
    justifyContent:'center'
  },
  pricesView: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  txtTotal: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  tipBtn: {
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    width: '20%',
    height: 30
  },
  tipTxt: {
    fontWeight:'bold'
  }
});
 