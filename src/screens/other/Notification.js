import React, { useState, useEffect } from 'react';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Text, View, Platform, StyleSheet, Switch } from 'react-native';

//firebase
import { auth, db } from '../../api/firebase';
import { updateDoc, getDoc, doc, setDoc } from 'firebase/firestore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function Notification() {

  const [smsNotifications, setSmsNotifications] = useState(false);
  const [promoNotifications, setPromoNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);


  useEffect(() => {
    checkCurrentPermission()
  }, []);

  const checkCurrentPermission = async () => {
    const settings = await Notifications.getPermissionsAsync();
    if (settings.granted == true) {
      setPushNotifications(true)
    } else {
      setPushNotifications(false)
    }
    const fetchInformation = doc(db, 'clients', 'user', 'Information', auth.currentUser.uid)
    getDoc(fetchInformation)
      .then((snapshot) => {
        let data = snapshot.data()
        if (data.smsNotifications == false) {
          setSmsNotifications(false)
        } else {
          setSmsNotifications(true)
        }
        if (data.promoNotifications == false) {
          setPromoNotifications(false)
        } else {
          setPromoNotifications(true)
        }
      })
  }

  const toggleSwitchPush = () => {
    setPushNotifications(previousState => !previousState)
  }


  const toggleSwitchSMS = () => {
    setSmsNotifications(previousState => !previousState)
    const fetchInformation = doc(db, 'clients', 'user', 'Information', auth.currentUser.uid)
    updateDoc(fetchInformation, {
      smsNotifications: !smsNotifications
    })
  }

  const toggleSwitchPromo = () => {
    setPromoNotifications(previousState => !previousState)
    const fetchInformation = doc(db, 'clients', 'user', 'Information', auth.currentUser.uid)
    updateDoc(fetchInformation, {
      promoNotifications: !promoNotifications
    })
  }


  return (
    <View style={{ flex: 1, backgroundColor:'white' }}>
        <View style={{ flex: 0.3, width: '100%', backgroundColor:'white' }}> 
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={styles.accountButtonBtn}>
                <Text style={styles.accountButtonTxtTitle}>Order SMS Notifications</Text>
                <Switch
                  trackColor={{ false: "#D4D4D4", true: "#545454" }}
                  thumbColor={smsNotifications ? "white" : "white"}
                  ios_backgroundColor="#D4D4D4"
                  onValueChange={toggleSwitchSMS}
                  value={smsNotifications}
                />
              </View>
              <View style={styles.accountButtonBtn}>
                  <Text style={styles.accountButtonTxtTitle}>Order Push Notifications</Text>
                  <Switch
                    trackColor={{ false: "#D4D4D4", true: "#545454" }}
                    thumbColor={pushNotifications ? "white" : "white"}
                    ios_backgroundColor="#D4D4D4"
                    onValueChange={toggleSwitchPush}
                    value={pushNotifications}
                  />
              </View>
              <View style={styles.accountButtonBtn}>
                  <Text style={styles.accountButtonTxtTitle}>Promotional Push Notifications</Text>
                  <Switch
                    trackColor={{ false: "#D4D4D4", true: "#545454" }}
                    thumbColor={promoNotifications ? "white" : "white"}
                    ios_backgroundColor="#D4D4D4"
                    onValueChange={toggleSwitchPromo}
                    value={promoNotifications}
                  />
                </View>
            </View>
      </View>
      <View style={{flex:0.7}}/>
      </View>
  );
}

async function registerForPushNotificationsAsync() {
  let token;
  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    alert('Must use physical device for Push Notifications');
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


const styles = StyleSheet.create({
  accountButtonTxtTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingLeft: 15,
    paddingRight: 2,
    width: '85%',
  },
  accountButtonTxtSub: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingLeft: 15,
    paddingRight: 2,
    width: '85%',
  },
  accountButtonBtn: {
    width: '100%',
    height: '28%',
    borderBottomWidth: 1,
    borderColor: '#D5D5D5',
    flexDirection: 'row',
    alignItems: 'center',
    padding:15
  },
  viewBtn: {
    flexDirection: 'column',
    width: '90%'
  }
})
