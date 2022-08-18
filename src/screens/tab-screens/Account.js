import React from 'react'
import { Text, TouchableOpacity, View, StyleSheet, Modal, Image} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../../components/CustomButton.js';
import * as Clipboard from 'expo-clipboard';


//firebase
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../api/firebase';

export class Account extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      closed: false
    }
  }
  

  componentDidMount() {
      this.interval = setInterval(this.getHours, 1000);
  }

  componentWillUnmount() {
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

        

  onSignOut = () => {
    auth
      .signOut()
  }

  
  copyToClipboard = () => {
    this.setState({ modalVisible: true });
    Clipboard.setString('5171 Orange Grove Blvd, North Fort Myers, FL 33903')
  }

  closeModal = () => {
    setTimeout(() => {this.setState({modalVisible: false})}, 2000)
  }


  render() {
    const { modalVisible } = this.state;

    return (
      <View style={{ flex: 1, alignItems: 'center', paddingTop: '5%', backgroundColor: 'white' }}>
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
        >
          <View style={styles.modalView}>
              <Text style={[styles.accountButtonTxt, {color:'white', fontWeight:'bold'}]}>Address Copied to Clipboard</Text>
              <Ionicons
                name="checkmark-circle-outline"
                size={23}
                color={'white'}
              />
          </View>           
        </Modal>
        <View style={{ flex: 0.45, width: '100%', alignItems: 'center', borderBottomWidth: 1, borderColor: '#D5D5D5' }}>
            <Image
              style={{height:60}}
              source={require('../../../assets/c5599d739a20417ba5a952b55060331f.png')}
            />
          <View style={{ flex:0.3, width: '100%', padding:'5%' }}>
            <View style={{ width:'100%'}}>
              <View style={{flexDirection:'row', alignItems:'center'}}>
                <Text style={styles.descriptionTxt}>Italian Food</Text>
                <Text style={{ fontSize: 5 }}> {'\u2B24'} </Text>
                <Text style={styles.descriptionTxt}>Seafood</Text>
                <Text style={{ fontSize: 5 }}> {'\u2B24'} </Text>
                <Text style={styles.descriptionTxt}>Subs</Text>
                <Text style={{ fontSize: 5 }}> {'\u2B24'} </Text>
                <Text style={styles.descriptionTxt}>Pizzeria</Text>
              </View>
              <View style={{flexDirection:'row', alignItems:'center'}}>
                <Ionicons
                  name="star"
                  size={12}
                />
                <Text style={styles.descriptionTxt}>
                   4.8(124 ratings)
                </Text>
              </View>
              <View style={{flexDirection:'row', alignItems:'center', padding: Platform.OS == 'ios' ? '5%' : null}}>
                <Ionicons
                  name='ellipse'
                  size={12}
                  style={{color: this.state.closed == true ? '#FF6666' : '#6CFF8F', padding:2}}
                />
              {this.state.closed == true ? (
                <Text>Closed</Text>
              ): (
                <Text>Open</Text>
              )}
            </View>
            </View>
            <View style={{ width:'100%'}}>
              <Text style={[styles.daysTxt, { fontWeight:'bold'}]}>Monday-Thursday</Text>
              <Text style={styles.descriptionTxt}>11:00 AM - 10:00 PM</Text>
              <Text style={styles.daysTxt}>Friday-Saturday</Text>
              <Text style={styles.descriptionTxt}>11:00 AM - 11:00 PM</Text>
              <Text style={styles.daysTxt}>Sunday</Text>
              <Text style={styles.descriptionTxt}>12:00 AM - 9:00 PM</Text>
            </View>
          </View>
        </View>
        <View style={{flex:0.55, width:'100%'}}>
          <View style={{ width: '100%', flex: 1 }}>
                <TouchableOpacity style={styles.accountButtonBtn} onPress={() => {this.copyToClipboard(), this.closeModal()}}>
                    <Ionicons
                      name="location"
                      size={23}
                    />
              <Text style={[styles.accountButtonTxt, { width: '85%' }]}>
                { Platform.OS == "ios" ? ('123 Main St, New York, NY 12345') :  ('123 Main St, New York, NY 12345')}
              </Text>
                    <Ionicons
                      name="copy"
                      size={23}
                    />
              </TouchableOpacity>
              <TouchableOpacity style={styles.accountButtonBtn} onPress={() => this.props.navigation.push('Profile')}>
                <Ionicons
                  name="person"
                  size={23}
                />
                <Text style={styles.accountButtonTxt}>Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.accountButtonBtn} onPress={() => this.props.navigation.push('Notification')}>
                <Ionicons
                  name="notifications"
                  size={23}
                />
                <Text style={styles.accountButtonTxt}>Notifications</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.accountButtonBtn, { borderBottomWidth: 0 }]} onPress={() => this.props.navigation.navigate('Privacy')}>
                <Ionicons
                  name="shield-checkmark"
                  size={23}
                />
                <Text style={styles.accountButtonTxt}>Privacy</Text>
              </TouchableOpacity>
              <View style={{paddingTop:'2%', alignItems:'center'}}>
                <CustomButton
                  buttonTxt={'Sign Out'}
                  backgroundColor={'black'}
                  onPress={this.onSignOut}
                  txtColor={'white'}
                />
              </View>
            </View>
          </View>
        </View>
    )
  }
}

export default Account;

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
  descriptionTxt: {
    fontSize: 15,
    color: '#6E6D6D'
  },
  accountButtonTxt: {
    fontSize:  Platform.OS == "ios" ? 16 : 14,
    fontWeight: 'bold',
    paddingLeft: 15,
    paddingRight:2
  },
  accountButtonBtn: {
    width: '100%',
    flex:0.2,
    borderBottomWidth: 1,
    borderColor: '#D5D5D5',
    flexDirection: 'row',
    alignItems: 'center',
    padding:15,
    maxHeight: 70,
  },
  daysTxt: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  modalView: {
    flexDirection: 'row',
    marginTop: '12%',
    backgroundColor: 'black',
    height: '6%',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginRight: Platform.OS == "ios" ? '18%' : '10%',
    marginLeft: Platform.OS == "ios" ? '18%' : '10%'
  }
})