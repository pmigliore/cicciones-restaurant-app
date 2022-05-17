import React, { Component } from "react";
import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Badge } from 'react-native-paper';

//firebase
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../api/firebase';

//redux
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { fetchUser, getAddress } from '../../redux/actions/index';

//navigation
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import OrdersScreen from "./Orders";
import AccountScreen from "./Account";




const Tab = createBottomTabNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export class TabNavigator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      address: null,
      openAddress: false,
      closed: false,
      newOrder: false
    }
  }

  static getDerivedStateFromProps(props, state) {
  if (props.route.params?.updateAddress) {
      return{
        address: (state.address, props.route.params.updateAddress.address),
      };
    }
    return null;
  }

  componentDidMount() {
    this.interval = setInterval(this.getHours, 1000);
    this.order = setInterval(this.checkOrder, 1000)
    this.props.fetchUser();
    this.registerForPushNotificationsAsync();
    this.fetchNewUser();
    this.setState({ loaded: true });
  }

  componentWillUnmount() {
    clearInterval(this.order)
    clearInterval(this.interval)
  }

  getHours = () => {
    const fetchHours = doc(db, 'Bella Mia Pizza', 'Information')
    getDoc(fetchHours)
      .then((snapshot) => {
        const data = snapshot.data()
        this.setState({ closed: data.closed })
    })
  }

  checkOrder = () => {
    const fetchOrder = doc(db, 'Bella Mia Pizza', 'orders', 'Ongoing Orders', auth.currentUser.uid)
    getDoc(fetchOrder)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data()
          let orders = []
            data.order.map((obj) => {
              orders.push(obj)
            }) 
            const allEqual = arr => arr.every(val => val.orderStatus === 'Completed' || val.orderStatus === 'Cancelled' || val.orderStatus === undefined);
            const result = allEqual(orders)
            if (result == true) {
              this.setState({newOrder: false})
            } else {
              this.setState({newOrder: true})
            }
          }
       })
  }

  
  openAddress = () => {
    if (this.state.address == null) {
      this.props.navigation.navigate('AddressSearch')
    } else {
      const fetchInformation = doc(db, 'clients', 'user', 'Information', auth.currentUser.uid)
      getDoc(fetchInformation)
       .then((snapshot) => {
         let latitude = snapshot.data().latitude
         let longitude = snapshot.data().longitude
         let mainAddress = snapshot.data().mainAddress
         let secondaryAddress = snapshot.data().secondaryAddress
         let apt = snapshot.data().apt
         let fee = snapshot.data().deliveryFee
         let instructions = snapshot.data().instructions
         let deliveryMethod = snapshot.data().deliveryMethod

         this.props.navigation.navigate('AddressSearch', {
           showResult: 2,
           latitude: latitude,
           longitude: longitude,
           mainAddress: mainAddress,
           secondaryAddress: secondaryAddress,
           apt: apt,
           instructions: instructions,
           deliveryMethod: deliveryMethod,
           fee: fee
         })
       })
      .catch((err) => console.log(err))
    }
  }

  

  fetchNewUser = async () => {
    const fetchInformation = doc(db, 'clients', 'user', 'Information', auth.currentUser.uid)
    await getDoc(fetchInformation)
    .then(async (snapshot) => {
      const newUser = await snapshot.data().newUser
      const address = await snapshot.data().mainAddress
      if (newUser == true || newUser == undefined) {
        updateDoc(fetchInformation, {
          newUser: false
        })
      } else {
        this.setState({ address: address })
      }
    })
    .catch((err) => console.log(err))
  }

  registerForPushNotificationsAsync = async () => {
    let token;
     if (Device.isDevice == true) {
       const { status: existingStatus } = await Notifications.getPermissionsAsync();
       let finalStatus = existingStatus;
       if (existingStatus !== 'granted') {
         const { status } = await Notifications.requestPermissionsAsync();
         finalStatus = status;
       }
       token = (await Notifications.getExpoPushTokenAsync()).data;
       const setPushToken = doc(db, 'clients', 'user', 'Push Notifications', auth.currentUser.uid)
       setDoc(setPushToken, {
         expoPushToken: token
       })
     } else {
       Alert.alert('Must use physical device for Push Notifications');
     }

     if (Platform.OS === 'android') {
       Notifications.setNotificationChannelAsync('default', {
         name: 'default',
         importance: Notifications.AndroidImportance.MAX,
         vibrationPattern: [0, 250, 250, 250],
         lightColor: '#FF231F7C',
       });
     }

     return token;
  }
  


  render() {

    if (this.state.loaded == false) {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white', width: '100%', alignItems: 'center' }}>
          <View style={styles.itemPlaceholderParent} />
          <View style={{ width: '100%', flex: 0.8, padding: '5%' }}>
            <View style={styles.itemPlaceholder} />
            <View style={[styles.itemPlaceholder, { height: '30%' }]} />
            <View style={[styles.itemPlaceholder, { width: '40%', height: '6%' }]} />
            <View style={[styles.itemPlaceholder, { height: '30%' }]} />
            <View style={[styles.itemPlaceholder, { height: '20%' }]} />
          </View>
        </SafeAreaView>
      )
    } else {
      return (
        <Tab.Navigator
          screenOptions={{
            headerShown: true,
            activeTintColor: "black",
            inactiveTintColor: "#E5E5E5",
            tabBarShowLabel: false,
            tabBarActiveTintColor: 'black',
            headerShadowVisible: false,
            headerTitleAlign: 'center'
          }}
        >
          <Tab.Screen
            name="Orders"
            component={OrdersScreen}
            options={({ navigation }) => ({
              headerLeft: () => (
                  <Ionicons
                    name='ellipse'
                    size={17}
                    style={{color: this.state.closed == true ? '#FF6666' : '#6CFF8F', paddingLeft:15}}
                  />
              ),
              headerRight: ({ }) => (
                <TouchableOpacity style={{ paddingRight: 15 }} onPress={() => navigation.navigate('OrdersHistory')}>
                  {this.state.newOrder == true ? (
                    <Badge style={{position: 'absolute', right: 7, bottom:15, backgroundColor:'black'}}>1</Badge>
                  ): (
                      null
                  )}
                  <Ionicons
                    name="time-outline"
                    size={28}
                  />
                </TouchableOpacity>
              ),
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="receipt-outline" color={color} size={30} />
              ),
              headerTitle: () => {
                if (this.state.address === null) {
                  return (
                    <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                      onPress={ this.openAddress }
                    >
                      <FontAwesome
                        name="map-marker"
                        size={20}
                      />
                      <Text style={{ paddingLeft: 5, paddingRight: 5, fontWeight: 'bold' }}>
                        Tap to Enter Address
                      </Text>
                      <FontAwesome
                        name="angle-down"
                        size={20}
                      />
                    </TouchableOpacity>
                  )
                } else {
                  return (
                    <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                      onPress={this.openAddress}
                    >
                      <FontAwesome
                        name="map-marker"
                        size={20}
                      />
                      <Text style={{ paddingLeft: 5, paddingRight: 5, fontWeight: 'bold' }}>
                        {this.state.address}
                      </Text>
                      <FontAwesome
                        name="angle-down"
                        size={20}
                      />
                    </TouchableOpacity>
                  )
                }
              }
            })}
          />
          <Tab.Screen
            name="Account"
            component={AccountScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person-outline" color={color} size={30} />
              ),
            }}
          />
        </Tab.Navigator>

      );
    }
  }
}

const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
});

const mapDispatchProps = (dispatch) =>
  bindActionCreators({ fetchUser }, dispatch);


export default connect(mapStateToProps, mapDispatchProps)(TabNavigator);

const styles = StyleSheet.create({
  itemPlaceholder: {
    width: '100%',
    height: '10%',
    backgroundColor: '#DEDEDE',
    borderRadius: 12,
    marginTop:'4%'
  },
  itemPlaceholderParent: {
    width: '90%',
    height: '20%',
    backgroundColor: '#DEDEDE',
    borderRadius: 12,
    marginTop: '2%'
  },
})
