import React, { Component } from 'react';
import { StyleSheet, SafeAreaView, View, LogBox, TouchableOpacity, Platform } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { StripeProvider } from '@stripe/stripe-react-native';

//firebase
import { auth } from './src/api/firebase';

//redux
import {Provider} from 'react-redux';
import { createStore, applyMiddleware } from "redux";
import rootReducer from "./src/redux/reducers";
import thunk from "redux-thunk";

//navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigatorScreen from './src/screens/tab-screens/TabNavigator.js';
import OrdersScreen from './src/screens/tab-screens/Orders.js';
import AccountScreen from './src/screens/tab-screens/Account.js';
import LandingScreen from './src/screens/auth/Landing.js';
import LogInScreen from './src/screens/auth/LogIn.js';
import RegisterScreen from './src/screens/auth/Register.js';
import ForgotPasswordScreen from './src/screens/auth/ForgotPassword';
import VerifyPhoneNumberScreen from './src/screens/auth/VerifyPhoneNumber.js';
import AddressSearchScreen from './src/screens/other/AddressSearch.js';
import CartScreen from './src/screens/other/Cart.js';
import ChangeEmailScreen from './src/screens/other/ChangeEmail.js';
import ChangeNumberScreen from './src/screens/other/ChangeNumber.js';
import OrdersHistoryScreen from './src/screens/other/OrdersHistory';
import DisplayItemScreen from './src/screens/other/DisplayItem.js';
import NotificationScreen from './src/screens/other/Notification.js';
import OrderStatusScreen from './src/screens/other/OrderStatus.js';
import PrivacyScreen from './src/screens/other/Privacy.js';
import ProfileScreen from './src/screens/other/Profile.js';
import ReceiptScreen from './src/screens/other/Receipt';
import UpdateEmailScreen from './src/screens/other/UpdateEmail.js';
import UpdateNumberScreen from './src/screens/other/UpdateNumber.js';
import { ActivityIndicator } from 'react-native-paper';





LogBox.ignoreLogs([''])
LogBox.ignoreLogs(["AsyncStorage has been extracted from react-native core and will be removed in a future release. It can now be installed and imported from '@react-native-async-storage/async-storage' instead of 'react-native'. See https://github.com/react-native-async-storage/async-storage"])
LogBox.ignoreLogs(['Setting a timer']);

const store = createStore(rootReducer, applyMiddleware(thunk));
const Stack = createNativeStackNavigator()

const API_URL = 'https://us-central1-restaurantapptemplate-691c3.cloudfunctions.net/getStripePublicKey'

export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      publishableKey: ''
    };
  }

  componentDidMount() {
    this.getPublishableKey()
    auth.onAuthStateChanged((user) => {
      if (!user) {
        this.setState({ loaded: true })
        this.setState({ loggedIn: false })
      } else {
        this.setState({ loaded: true })
        this.setState({ loggedIn: true })
      }
    })
  }

  getPublishableKey = async () => {
    const response = await fetch(`${API_URL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const { publishableKey } = await response.json();

    this.setState({publishableKey: publishableKey})
  }
  


  render() {
    const { loggedIn, loaded, publishableKey } = this.state;


    if (!loaded) {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white', width: '100%', alignItems: 'center', justifyContent:'center' }}>
          <ActivityIndicator color='black' size={45}/>
        </SafeAreaView>
      )
    }
    if (!loggedIn) {
      return (
        <Provider store={store}>
          <NavigationContainer>
            <Stack.Navigator
            screenOptions={{
                headerBackTitleVisible: false,
                headerTintColor: 'black',
                headerShadowVisible: false,
                headerTitleAlign: 'center'
              }}
            initialRouteName='Landing'
            >
              <Stack.Screen name="Landing" component={LandingScreen} options={{ headerShown: false }}/>
              <Stack.Screen name="Register" component={RegisterScreen} options={{ title: null }}/>
              <Stack.Screen name="LogIn" component={LogInScreen} options={{ title: null }} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: null }} />
              <Stack.Screen name="VerifyPhoneNumber" component={VerifyPhoneNumberScreen} options={{ title: null }}/>
            </Stack.Navigator>
          </NavigationContainer>
        </Provider>
    );
    } else {
      return (
        <StripeProvider
          publishableKey={publishableKey}
          merchantIdentifier={"merchant.com.restaurantApp"}
        >
        <Provider store={store}>
            <NavigationContainer>
              <Stack.Navigator
                initialRouteName="TabNavigator"
                screenOptions={{
                  headerBackTitleVisible: false,
                  headerTintColor: 'black',
                  headerShadowVisible: false,
                  headerTitleAlign: 'center'
                }}
              >
                <Stack.Screen name="TabNavigator" component={TabNavigatorScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Profile" component={ProfileScreen}/>
                <Stack.Screen name="Notification" component={NotificationScreen}/>
                <Stack.Screen name="Privacy" component={PrivacyScreen} />
                <Stack.Screen name="Orders" component={OrdersScreen} />
                <Stack.Screen name="Account" component={AccountScreen} />
                <Stack.Screen name="OrdersHistory" component={OrdersHistoryScreen} options={{ title: 'Orders History' }} />
                <Stack.Screen name="UpdateEmail" component={UpdateEmailScreen} options={{title: null}}/>
                <Stack.Screen name="ChangeEmail" component={ChangeEmailScreen} options={{ title: null }} />
                <Stack.Screen name="ChangeNumber" component={ChangeNumberScreen} options={{ title: null }} />
                <Stack.Screen name="UpdateNumber" component={UpdateNumberScreen} options={{ title: null }} />
                <Stack.Screen name="Receipt" component={ReceiptScreen} />
                <Stack.Screen name="OrderStatus" component={OrderStatusScreen} options={({navigation}) => ({
                    title: 'Order Status',
                    headerLeft: () => 
                        <TouchableOpacity
                        onPress={() => navigation.navigate('TabNavigator')}
                          >
                          <Ionicons
                            name='close-outline'
                            size={32}
                          />
                          </TouchableOpacity>

                  })} />
                <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Your Order' }} />
                <Stack.Group
                  screenOptions={{
                    headerShown: Platform.OS == "ios" ? false : true,
                    presentation: 'modal',
                    headerShadowVisible: false
                  }}
                >
                  <Stack.Screen name="AddressSearch" component={AddressSearchScreen} actions={this.handler}
                    options={({ navigation }) => ({
                       headerShown: true, title: 'Search Address', headerLeft: () => 
                        <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        >
                        <FontAwesome
                          name='angle-down'
                          size={32}
                          style={{fontWeight:'bold', padding:'1%'}}
                        />
                        </TouchableOpacity>
                      })}
                  />
                  <Stack.Screen name="DisplayItem" component={DisplayItemScreen} options={{title: Platform.OS !== "ios" ? 'Select Item' : '' }} />
              </Stack.Group>
              </Stack.Navigator>
            </NavigationContainer>
          </Provider>
        </StripeProvider>
      )
    }

  }}

export default App;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
});

