import React, { useState, useEffect} from 'react';
import { View, TouchableOpacity, StyleSheet, TextInput, Text, Alert, ScrollView, Keyboard } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';


///Maps
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';


//firebase
import { auth, db } from '../../api/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';


const axios = require('axios').default;

const API_URL = 'https://us-central1-restaurantapptemplate-691c3.cloudfunctions.net/getMaps'


export default function AddressSearch({ navigation, route }) {

    const [showResult, setShowResult] = useState(0)
    const [location, setLocation] = useState(false)
    const [mainAddress, setMainAddress] = useState('')
    const [secondaryAddress, setSecondaryAddress] = useState('')
    const [apt, setApt] = useState('')
    const [instructions, setInstructions] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [latitude, setLatitude] = useState(0)
    const [longitude, setLongitude] = useState(0)
    const [deliveryMethod, setDeliveryMethod] = useState(1)
    const [fee, setFee] = useState([])
    const [deliveryFees, setDeliveryFees] = useState([])
    const [api, setApi] = useState('')
    const [searchLocationInput, setSearchLocationInput] = useState('')

    useEffect(() => {
        getApi()
        const fetchDeliveryFees = doc(db, 'Bella Mia Pizza', 'Information')
        getDoc(fetchDeliveryFees)
            .then((snapshot) => {
                const fees = snapshot.data().deliveryFees
                setDeliveryFees(fees)
            })
        if (route.params !== undefined){
            setShowResult(2)
            setLatitude(route.params.latitude)
            setLongitude(route.params.longitude)
            setMainAddress(route.params.mainAddress)
            setSecondaryAddress(route.params.secondaryAddress)
            setApt(route.params.apt)
            setInstructions(route.params.instructions)
            setFee(route.params.fee)
            setDeliveryMethod(route.params.deliveryMethod == 'Leave at Door' ? 2 : 1)
        }
    }, [route.params])

    const getApi = async () => {
        const response = await fetch(`${API_URL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        const { key } = await response.json();
        
        Geocoder.init(key)

        setApi(key)
    }

    const getRadius = async (e) => {

        var origin = [`${e.lat}, ${e.lng}`]
        var destination = ['26.666197823113247, -81.91582645852678']
        var config = {
            method: 'get',
            url: `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&mode=driving&key=${api}`,
            headers: { }
        };

        axios(config)
            .then(function (response) {
                const radius = response.data.rows
                radius.map((a) => {
                    a.elements.map((e) => {
                        let object = []
                        const distance = e.distance.value
                        const distanceMiles = (distance / 1609.344).toFixed(2)
                        deliveryFees.map((obj) => {
                            var from = ''
                            var to = ''

                            if (obj.radius.length == 3) {
                                from = obj.radius.slice(0, 1)
                                to = obj.radius.slice(2,3)
                            } else if (obj.radius.length == 4) {
                                from = obj.radius.slice(0, 1)
                                to = obj.radius.slice(2,4)
                            } else if (obj.radius.length == 5) {
                                from = obj.radius.slice(0, 2)
                                to = obj.radius.slice(3,5)
                            }

                            if (distanceMiles >= parseFloat(from) && distanceMiles < parseFloat(to)) {
                                object.push(obj)
                            }
                        })

                        if (object.length !== 0) {
                            object.map((i) => {
                                setFee(`${i.price}`)
                            })
                        } else {
                            setFee('')
                        }
                    })
                })
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    searchLocation = async (text) => {

        setLocation(text);
        setShowResult(1)
        axios
          .request({
            method: 'POST',
            url: `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${api}&input=${location}`,
          })
            .then((response) => {
                setSearchResults(response.data.predictions)
          })
          .catch((e) => {
            console.log(e.response);
          });
    }

    let mapLocation = {
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: 0.009,
        longitudeDelta: 0.009
    }

    const pressAddress = (e) => {
        setShowResult(4)
        setMainAddress(e.main_text)
        setSecondaryAddress(e.secondary_text)
        Geocoder.from( `${e.main_text}` + `${e.secondary_text}`)
        .then(json => {
            var location = json.results[0].geometry.location;
            setLatitude(location.lat)
            setLongitude(location.lng)
            setShowResult(2)
            getRadius(location)
        })
	    .catch(error => console.log(error));
    }

    const saveAddress = async () => {

        const fetchInformation = doc(db, 'clients', 'user', 'Information', auth.currentUser.uid)
            updateDoc(fetchInformation, {
                mainAddress: mainAddress,
                secondaryAddress: secondaryAddress,
                apt: apt,
                instructions: instructions,
                longitude: longitude,
                latitude: latitude,
                deliveryFee: fee,
                deliveryMethod: deliveryMethod == 1 ? 'Hand it to Me' : 'Leave at Door'
            })
            .then(
                navigation.navigate('TabNavigator', {
                    updateAddress: {
                        address: mainAddress
                    }
                }),
                setFee('')
            )
            .catch((err) => Alert.alert(`${err}`))
    }

    const handIt = () => {
        setDeliveryMethod(1)
    }

    const leaveAtDoor = () => {
        setDeliveryMethod(2)
    }

return (
    <View style={styles.container}>
        <View style={styles.areaSearch}>
            <FontAwesome name="search" size={20} style={styles.iconSearch}/>
            <TextInput
                clearButtonMode='while-editing'
                style={styles.inptsearchAddress}
                placeholder={'Search an Address...'}
                onChangeText={(text) => {searchLocation(text), setSearchLocationInput(text)}}
                value={searchLocationInput}
            />
        </View>
        {showResult == 0 ? (
            <View
                style={styles.resultItem}
            >
                <Ionicons
                color='#8A8A8A'
                name="car-outline"
                size={25}
                style={{paddingRight:5}}
                />
                <View>
                    <Text style={{fontSize: Platform.OS == "ios" ? 15 : 12, color: '#8A8A8A'}}>  Search an address to enable our Delivery Service</Text>
                </View>
            </View> 
        ) : showResult == 1 ?  (  
            searchResults.map((item) => {
                return (
                    <TouchableOpacity
                        key={item.place_id}
                        style={styles.resultItem}
                        onPress={() => {pressAddress(item.structured_formatting), setSearchLocationInput(''), Keyboard.dismiss()}}
                    >
                        <Ionicons
                            color='#8A8A8A'
                            name="location"
                            size={25}
                            style={{ paddingRight: 5 }}
                        />
                        <View>
                            <Text style={styles.txtAddress}>{item.structured_formatting.main_text}</Text>
                            <Text style={styles.txtLocation}>{item.structured_formatting.secondary_text}</Text>
                        </View>
                    </TouchableOpacity>
                )})     
        ) : showResult == 2 ? (
            <KeyboardAwareScrollView style={styles.resultContainer} contentContainerStyle={{ alignItems:'center'}}>
                <View name="map" style={{flex:0.3, width:'100%'}}>
                    <MapView
                        style={{ height: 80, width:'100%'}}
                        provider={Platform.OS !== 'ios' ? PROVIDER_GOOGLE : null}
                        region={mapLocation}
                    >
                        <Marker coordinate={{ latitude: latitude, longitude: longitude}}/>    
                    </MapView>
                </View>
                <View style={{ padding:'3%', flex:0.5}}>
                    <Text style={{fontSize:22, fontWeight:'bold'}}>{mainAddress}</Text>
                    <Text style={{fontSize:14, color: '#8A8A8A'}}>{secondaryAddress}</Text>
                    <View style={styles.areaApt}>
                        <Text style={{fontSize:18, paddingRight:20, fontWeight:'bold'}}>Apt/Suite</Text>
                        <CustomTextInput
                            placeholder={'Apt 321'}
                            width={'30%'}
                            height={50}
                            paddingLeft={10}
                            defaultValue={apt}
                            onChangeText={(text) => setApt(text)}
                        />
                    </View>
                    <TouchableOpacity onPress={handIt} style={styles.deliverymethodBtn}>
                        {deliveryMethod == 1 ? (
                            <FontAwesome
                                name="circle"
                                size={27}
                            />
                        ) : (
                            <FontAwesome
                                name="circle-thin"
                                size={27}
                            />
                        )}
                            <Text style={styles.deliveryMethodTxt}>Hand it to me</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={leaveAtDoor} style={styles.deliverymethodBtn}>
                            {deliveryMethod == 1 ? (
                                        <FontAwesome
                                            name="circle-thin"
                                            size={27}
                                        />
                                    ) : (
                                        <FontAwesome
                                                name="circle"
                                                size={27}
                                        />
                                    )}
                            <Text style={styles.deliveryMethodTxt}>Leave at the door</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{flex:0.2, alignItems:'center', width:'100%'}}>
                        <Text style={{fontWeight:'bold'}}>Drop-off instructions</Text>
                        <View style={styles.padding}/>
                        <TextInput
                            width={'90%'}
                            height={80}
                            placeholder={'e.g. leave at door, call upon arrival, my gate code is: 1234'}
                            multiline={true}
                            style={{ fontSize: 16, fontWeight: 'bold' }}
                            defaultValue={instructions}
                            onChangeText={(text) => setInstructions(text)}
                        />
                        <View style={{padding:'3%'}}/>
                        <CustomButton
                            buttonTxt={'Save Address'}
                            backgroundColor={'black'}
                            onPress={saveAddress}
                            txtColor={'white'}
                        />
                    </View>
            </KeyboardAwareScrollView>
    ) : (
        <View style={styles.containerPlaceholder}>
            <View style={styles.mapPlaceholder}/>         
            <View style={{ flex: 0.6, width: '100%', padding:'4%' }}>
                <View style={styles.itemPlaceholder}/>
                <View style={[styles.itemPlaceholder, { width:'40%', height:'6%'}]}/>
                <View style={[styles.itemPlaceholder, { width:'20%'}]}/>
                <View style={[styles.itemPlaceholder, { height:'30%'}]}/>
            </View>
        </View>
        )}
    </View>
);
};


const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        flex: 1,
        backgroundColor:'white'
    },
    areaSearch: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 7,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderColor: '#D5D5D5'
    },
    iconSearch: {
        width: '5%',
        borderBottomWidth: 1,
        borderColor: '#D5D5D5',
        color: '#8A8A8A'
    },
    inptsearchAddress: {
        fontWeight:'bold',
        fontSize:16,
        padding:15,
        width:'85%'
    },
    resultContainer: {
        flex: 1,
        width: '100%',
        backgroundColor:'white',
    },
    areaApt: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        padding: '2%',
        height: '30%'
    },
    resultItem: {
        width:'100%',
        aspectRatio:17/3,
        padding:13,
        flexDirection:'row',
        alignItems: 'center',
        backgroundColor:'white'
    },
    txtAddress: {
        fontWeight:'bold',
        fontSize:16
    },
    txtLocation: {
        fontSize:14,
        color: '#8A8A8A'
    },
    padding: {
        padding: '2%'
    },
    containerPlaceholder: {
        flex: 1,
        alignItems: 'center',
        width: '100%'
    },
    itemPlaceholder: {
        width: '100%',
        height: '10%',
        backgroundColor: '#DEDEDE',
        borderRadius: 12,
        marginTop:'4%'
    },
    mapPlaceholder: {
        width: '100%',
        flex: 0.4,
        backgroundColor: '#DEDEDE'
    },
    deliverymethodBtn: {
        width: '100%',
        aspectRatio: 22 / 3,
        borderBottomWidth: 1,
        borderColor: '#D5D5D5',
        flexDirection: 'row',
        alignItems:'center'
    },
    deliveryMethodTxt: {
        paddingLeft: 10,
        fontSize: 16,
        fontWeight:'bold'
    }
  });