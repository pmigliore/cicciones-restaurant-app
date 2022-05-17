import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';

export default function Privacy() {


  const _handleOpenWithWebBrowser = () => {
    WebBrowser.openBrowserAsync('https://www.privacypolicies.com/live/e4609c3a-c297-4b6d-af90-dc12cf9a52b3');
  };

  
    return (
      <View style={{flex:1, width:'100%', backgroundColor:'white'}}>
        <View style={{ flex: 0.2, width: '100%', justifyContent: 'space-between', padding:'5%'}}>
          <Text style={{ fontSize: 18, fontWeight:'bold'}}>Legal Agreement</Text>
          <Text style={{ fontSize: 12, fontWeight: 'bold', color:'#6E6D6D' }}>
            We protect your privacy and personal information, tap the button below to access our Privacy Policy
          </Text>
          <TouchableOpacity style={{ flexDirection: 'row', width: '100%', height:'30%', alignItems:'center'}} onPress={_handleOpenWithWebBrowser}>
            <Text style={{fontWeight:'bold'}}>Learn More</Text>
              <Ionicons
                name="chevron-forward"
                size={25}
              />
          </TouchableOpacity>
        </View>
        <View style={{flex:0.8, width:'100%'}} />
      </View>
      )
};
