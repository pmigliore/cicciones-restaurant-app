import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Divider } from 'react-native-paper';



export default function Receipt({route}) {

  const { item } = route.params;

  const order = item.order;

  return (
      <View style={{flex:1, backgroundColor:'white'}}>
          <View style={{width:'100%', alignItems:'center', flexDirection: 'row', justifyContent: 'space-between', padding:15}}>
              <View>
                  <Text style={{fontSize:20, fontWeight:'bold'}}>{item.serviceRequested}</Text>
                  <Text>{item.phoneNumber}</Text>
                  <Text>{item.adress}</Text>
                  <Text>{item.instructions}</Text>
                  <View style={{flexDirection:'row', alignItems:'center'}}>
                    <Ionicons
                        name="cash-outline"
                        size={23}
                      />
                    <Text style={{fontSize:20, fontWeight:'bold', padding:5}}>
                        {item.paymentType}
                     </Text>
                   </View>
                  <Text style={{color:'#FF6666'}}>{item.cancelReason}</Text>
              </View>
              <View style={{ alignItems: 'center', justifyContent:'center' }}>
                  <Text style={{fontSize:20, fontWeight:'bold'}}>${item.total.toFixed(2)}</Text>
                  <View style={{flexDirection:'row', alignItems:'center'}}>
                    <Ionicons
                        name='ellipse'
                        size={12}
                        style={{color: item.orderStatus == 'Completed' ? '#E0E0E0' : item.orderStatus == 'Cooking' ? '#6CFF8F' : item.orderStatus == undefined ? '#6CFF8F' : '#FF6666', padding:5}}
                    />
                    {item.orderStatus == undefined ? (
                      <Text>Pending</Text>
                    ): (
                      <Text>{item.orderStatus}</Text>
                    )}
                  </View>
              </View>
          </View>
          <View>
            <Text style={{fontSize:20, fontWeight:'bold', padding:15}}>Order</Text>
            <FlatList
                data={order}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    return (
                        <View key={item.id}
                        style={{
                            backgroundColor:'white',
                            justifyContent:'center',
                            padding: 10,
                        }}>
                            <View style={{ padding: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <View style={{flexDirection:'row', alignItems:'center'}}>
                                    <View style={{ alignItems: 'center', justifyContent: 'center', borderRadius: 5, backgroundColor: '#F0F0F0', padding:5 }}>
                                    <Text style={{ fontSize: 15 }}>{item.quantity}</Text>
                                    </View>
                                <Text style={[styles.txtDescription, { color: 'black', fontWeight: 'bold', paddingLeft: 10 }]}>{item.title}</Text>
                                </View>
                                <Text style={styles.txtPrice}>${item.price.toFixed(2)}</Text>
                            </View>
                            <Divider/>
                        </View>
                    )
                }}
            />
          </View>
      <View style={{ padding: 15 }}>
              {item.serviceRequested == 'Pick Up' ? (
                null
              ) : (
                <View style={{flexDirection:'row', alignItems:'center', width:'100%', justifyContent:'space-between'}}>
                    <Text style={{fontSize: 13}}>Delvery Fee</Text>
                    <Text style={{fontSize: 13}}>${parseFloat(item.deliveryFee).toFixed(2)}</Text>
                </View>
              )}
              <View style={{flexDirection:'row', alignItems:'center', width:'100%', justifyContent:'space-between', paddingTop: 10}}>
                  <Text style={{fontSize: 13}}>Taxes</Text>
                  <Text style={{fontSize: 13}}>${item.taxes.toFixed(2)}</Text>
              </View>
              <View style={{flexDirection:'row', alignItems:'center', width:'100%', justifyContent:'space-between', paddingTop: 10}}>
                  <Text style={{fontSize: 17, fontWeight:'bold'}}>Total</Text>
                  <Text style={{fontSize: 17, fontWeight:'bold'}}>${item.total.toFixed(2)}</Text>
              </View>
          </View>
    </View>
  )
}

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
  }
});