import React, { useState } from 'react'
import { View,Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../../components/CustomButton.js';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function AddPaymentMethod({navigation}) {

  const [modalVisible, setModalVisible] = useState(false);

    return (
        <View style={{backgroundColor: 'white', flex:1}}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
                style={{backgroundColor: 'black'}}
            >
            <TouchableOpacity onPress={() => setModalVisible(false)} style={{flex:1}}/>
              <KeyboardAwareScrollView style={{ backgroundColor: 'white', flex: 1, marginTop: 'auto', borderRadius: 12 }}>
                <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                  <View style={{backgroundColor:'white', alignItems:'center', justifyContent:'center'}}>
                  </View>
                </TouchableWithoutFeedback>
              </KeyboardAwareScrollView>
            </Modal>
                <View style={{position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: modalVisible ===false ? 'white': 'rgba(0,0,0,0.2)'}}/>
                <TouchableOpacity style={styles.accountButtonBtn} onPress={() => navigation.navigate('CardPayment')}>
                    <View style={styles.viewBtn}>
                        <Ionicons
                            name="card-outline"
                            size={23}
                            />
                        <Text style={styles.accountButtonTxtSub}>Credit/Debit Card</Text>
                    </View>
                    <Ionicons
                        name="chevron-forward"
                        size={23}
                    />
                </TouchableOpacity>
            </View>
  )
}

const styles = StyleSheet.create({
  accountButtonTxtTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingLeft: 15,
    paddingRight: 2,
    width: '85%',
    fontWeight: 'normal' 
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
    height: '8%',
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    padding:15
  },
  viewBtn: {
    flexDirection: 'row',
    width: '90%'
  }
})
