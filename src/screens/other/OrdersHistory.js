import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator } from 'react-native-paper';

//firebase
import { db, auth } from '../../api/firebase.js';
import { doc, getDoc } from 'firebase/firestore';


export class OrdersHistory extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
        onGoingOrders: [],
        pastOrders: [],
        loaded: false,
      }
    }
    

  componentDidMount() {
      this.fetchcurrentOrders()
  }


  fetchcurrentOrders = () => {
    const fetchOrders = doc(db, 'Bella Mia Pizza', 'orders', 'Ongoing Orders', auth.currentUser.uid )
    getDoc(fetchOrders)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data().order;
          data.forEach((obj) => {
            let onGoingOrders = this.state.onGoingOrders
            let pastOrders = this.state.pastOrders

            if (obj.orderStatus == 'Cancelled' || obj.orderStatus == 'Completed') {
              pastOrders.push(obj)
            } else if (obj.orderStatus == 'Cooking' || obj.orderStatus == undefined) {
              onGoingOrders.push(obj)
            }

            this.setState({ onGoingOrders: onGoingOrders })
            this.setState({ pastOrders: pastOrders })
          })
          this.setState({loaded: true})
        } else {
          this.setState({loaded: true})
        }
      })
  }

  render() {
    
    return (
      <ScrollView style={{backgroundColor:'white'}}>
      <View style={{ flex: 1, alignItems: 'center', backgroundColor:'white', paddingBottom:50}}>
        <View style={{ width: '100%', padding:20}}>
            <Text style={{fontSize:20, fontWeight:'bold'}}>Current Orders</Text>
        </View>
        <View style={{ width: '85%'}}>
          {this.state.onGoingOrders.length !== 0 ? (
              this.state.onGoingOrders.map((item) => {
                return(
                <View key={item.id}>
                  <TouchableOpacity key={item.id} onPress={() => this.props.navigation.navigate('Receipt', {item: item})} style={{ padding:15 , backgroundColor: '#6CFF8F', height: 70, borderRadius: 12, flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
                    <View>
                      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.serviceRequested}</Text>
                      {item.orderStatus == 'Cooking' ? (
                        <Text style={{fontSize:12}}>Cooking</Text>
                      ) : (
                        <Text style={{fontSize:12}}>Pending</Text>
                      )}
                    </View>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>${item.total.toFixed(2)}</Text>
                    <Ionicons
                      name='chevron-forward'
                      size={25}
                    />
                  </TouchableOpacity>
                  <View style={{ padding: 5 }} />
                  </View>
                )
              })
          ) : this.state.loaded == false ? (
            <View style={{alignItems:'center', justifyContent:'center'}}>
              <ActivityIndicator color='black'/>
            </View>
            ) : (
                <View style={{alignItems:'center', justifyContent:'center'}}>
                  <Text>No Current Orders Available</Text>
                </View>
        )}
        </View>
        <View style={{ width: '100%', padding:20}}>
            <Text style={{fontSize:20, fontWeight:'bold'}}>Past Orders</Text>
        </View>
        <View style={{ width: '85%'}}>
          {this.state.pastOrders.length !== 0 ? (
            this.state.pastOrders.map((item) => {
              return (
                <View key={item.id}>
                  <TouchableOpacity key={item.id} onPress={() => this.props.navigation.navigate('Receipt', {item: item})} style={{ padding:15 , backgroundColor: item.orderStatus == 'Cancelled' ? '#FF6666' : '#E0E0E0', height: 70, borderRadius: 12, flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
                    <View>
                      <Text style={{fontSize: 18, fontWeight:'bold'}}>{item.serviceRequested}</Text>
                      <Text style={{ fontSize: 12 }}>{item.orderStatus}</Text>
                    </View>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>${item.total.toFixed(2)}</Text>
                    <Ionicons
                      name='chevron-forward'
                      size={25}
                    />
                  </TouchableOpacity>
                  <View style={{ padding: 5 }} />
                </View>
              )
            })
          ) : this.state.loaded == false ? (
            <View style={{alignItems:'center', justifyContent:'center'}}>
              <ActivityIndicator color='black'/>
            </View>
            ) : (
                <View style={{alignItems:'center', justifyContent:'center'}}>
                  <Text>No Past Orders Available</Text>
                </View>
        )}
        </View>
        </View>
      </ScrollView>
    )
  }
}

export default OrdersHistory;
