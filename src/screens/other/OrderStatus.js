import React, {useEffect, useState} from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import LottieView from 'lottie-react-native';

//firebase
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../api/firebase';

const API_URL = 'https://us-central1-restaurantapptemplate-691c3.cloudfunctions.net/refundCustomer'

export default function OrderStatus({ route }) {

  const [status, setStatus] = useState(undefined)
  const [id, setId] = useState('')
  const [prepTime, setPrepTime] = useState('')
  const [cancelReason, setCancelReason] = useState('')
  const [orderDelay, setOrderDelay] = useState(false)
  const [paymentId, setPaymentId] = useState('')
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('')

  useEffect(() => {
    const { orderId, chargeId, paymentType } = route.params

    setId(orderId)
    setPaymentId(chargeId)
    setPaymentMethod(paymentType)

    const timer = setInterval(() => {
       getHours()
    }, 1000)
    return () => clearInterval(timer);
  })
  
  setTimeout(() => {
    if (status == undefined) {
      setOrderDelay(true)
    }
  }, 180000)

  const getHours = () => {
      const fetchOrder = doc(db, 'Bella Mia Pizza', 'orders', 'Ongoing Orders', auth.currentUser.uid)
      getDoc(fetchOrder)
        .then((snapshot) => {
          const data = snapshot.data()
          data.order.forEach((orders) => {
            if (orders.id == id) {
              if (orders.orderStatus == undefined) {
                setStatus(undefined)
              } else {
                setStatus(orders.orderStatus)
                if (orders.prepTime !== undefined) {
                  setPrepTime(orders.prepTime)
                }
                if (orders.cancelReason !== undefined) {
                  setCancelReason(orders.cancelReason)
                }
              }
            }
          })
        })
  }

  const cancelOrder = async () => {
    if (paymentMethod == 'Card') {
      setLoading(true)
      await fetch(`${API_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'paymentIntentId': paymentId
        })
      })

      const fetchOrder = doc(db, 'Bella Mia Pizza', 'orders', 'Ongoing Orders', auth.currentUser.uid)
      getDoc(fetchOrder)
        .then((snapshot) => {
          const data = snapshot.data()
          data.order.map((orders) => {
            if (orders.id == id) {
              if (orders.orderStatus == undefined) {
                orders['orderStatus'] = 'Cancelled'
                orders['cancelReason'] = 'Cancelled by the customer'
              }
            }
          })
          updateDoc(fetchOrder, {
            order: data.order
          })
          setLoading(false)
        })
    } else {
      const fetchOrder = doc(db, 'Bella Mia Pizza', 'orders', 'Ongoing Orders', auth.currentUser.uid)
      getDoc(fetchOrder)
        .then((snapshot) => {
          const data = snapshot.data()
          data.order.map((orders) => {
            if (orders.id == id) {
              if (orders.orderStatus == undefined) {
                orders['orderStatus'] = 'Cancelled'
                orders['cancelReason'] = 'Cancelled by the customer'
              }
            }
          })
          updateDoc(fetchOrder, {
            order: data.order
          })
          setLoading(false)
        })
    }
  }

  return (
    <View style={{flex:1}}>
      {status == undefined ? (
        <View style={{ flex: 1, backgroundColor: 'white', alignItems: 'center' }}>
          {orderDelay == true ? (
            <Text style={{fontSize:16, paddingTop:50, fontWeight:'bold'}}>Something is wrong, call us or cancel and retry</Text>
          ) : (null)}
          <LottieView
            source={require('../../../assets/99276-loading-utensils.json')}
            autoPlay={true}
            loop={true}
            resizeMode='cover'
          />
          <Text style={{ fontSize: 20, fontWeight: 'bold', paddingTop: 200 }}>Your order is awaiting confirmation</Text>
          <View style={{ paddingTop: Platform.OS == 'ios' ? 400 : 300 }} />
          {loading == false ? (
            <TouchableOpacity onPress={cancelOrder}>
              <Text style={{color:'red', fontSize:20}}>Cancel</Text>
            </TouchableOpacity>
          ) : (
              <ActivityIndicator color='red' size={20}/>
          )}
        </View>
      ) : status == 'Cooking' || status == 'Completed' || status == 'OnItsWay' ? (
        <View style={{ flex: 1, backgroundColor: 'white', alignItems: 'center' }}>
          <LottieView
            source={require('../../../assets/6519-cooking.json')}
            autoPlay={true}
            loop={true}
          />
          <View style={{ paddingTop: 50, alignItems: 'center' }}>
            <Text style={{ fontSize: 17, fontWeight: 'bold' }}>Estimated wait time</Text>
            <Text style={{ fontSize: 30 }}>{prepTime} minutes</Text>
          </View>
          <Text style={{ fontSize: 23, paddingTop: 100, fontWeight: 'bold' }}>We are preparing your order</Text>
        </View>
        ) : (
          <View style={{ flex: 1, backgroundColor: 'white', alignItems: 'center' }}>
            <LottieView
              source={require('../../../assets/34468-process-failed.json')}
              autoPlay={true}
              loop={false}
            />
            <View style={{ paddingTop: 50, alignItems: 'center' , width:'100%'}}>
              <Text style={{ fontSize: 17, fontWeight: 'bold' }}>Your order has been cancelled</Text>
              <Text style={{ fontSize: 30, color:'red' }}>{cancelReason}</Text>
            </View>
          </View>
        )}
  </View>
  )
}
