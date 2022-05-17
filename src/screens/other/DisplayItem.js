import React, { Component} from 'react'
import { Text, TouchableOpacity, View, StyleSheet, ImageBackground, SectionList, SafeAreaView} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import CustomButton from '../../components/CustomButton';

//redux
import { connect } from 'react-redux';
import { addItemToOrder, removeItemFromOrder, updateOrder } from '../../redux/actions';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../api/firebase';



class DisplayItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newOrder: this.props.newOrder,
      quantity: 1,
      present: false,
      item: null,
      additional: [],
      price: 0,
      closed: false,
    }
  }
  
  
  componentDidMount() {
    const { additional, price, title } = this.props.route.params.item;

    this.setState({ price: price })
    this.getHours()

    this.props.newOrder.forEach(item => {
      if (item.title === title) {
        this.setState({ quantity: item.quantity })
        this.setState({ item: item })
        this.setState({ present: true })
        this.setState({ price: item.price/item.quantity })
      }
    })

    if (additional !== undefined) {
      this.setState({additional:[...additional]})
    }
  }

  getHours = () => {
    const fetchHours = doc(db, 'Bella Mia Pizza', 'Information')
    getDoc(fetchHours)
      .then((snapshot) => {
        const data = snapshot.data()
        this.setState({ closed: data.closed })
    })
  }

  pressOptional = (e) => {
    let additional = this.state.additional;
    additional.map((item) => {
      if (item.title == e.type) {
        item.data.map((item) => {
          if (item.id == e.id) {
            item.selected = !item.selected
            if (item.selected == true) {
              this.setState(prevState => ({ price: parseFloat(prevState.price) + parseFloat(item.price) }))
            } else {
              this.setState(prevState => ({ price: prevState.price - item.price }))
            }
          }
        })
      }
    })

    this.setState({additional: [...additional]})
  }

  pressRequired = (e) => {
    let additional = this.state.additional;

    additional.map((item) => {
      if (item.title == e.type) {
        item.data.forEach((item) => {
          if (item.id == e.id) {
            item.selected = !e.selected
          }
          if (item.id !== e.id) {
            item.selected = false
          }
        })
      }
    })

    this.setState({ additional: [...additional] })
  }

  increaseQuantity = () => {
    this.setState(prevState => ({quantity: prevState.quantity + 1}))
  }

  decreaseQuantity = () => {
    if (this.state.quantity > 1) {
      this.setState(prevState => ({ quantity: prevState.quantity - 1 }))
    } else {
      null
    }
  }

  addToOrder = () => {
    const { item } = this.props.route.params;
    let newOrder = this.state.newOrder;
    newOrder.push({
      id: item.id,
      title: item.title,
      price: this.state.quantity * this.state.price,
      description: item.description,
      image: item.image,
      quantity: this.state.quantity,
      additional: this.state.additional
      });
    this.props.addItemToOrder(newOrder)
    this.props.navigation.goBack()
  }
  
  updateOrder = () => {
    const { id, title, description, image } = this.props.route.params.item;
    item = {
      id: id,
      title: title,
      price: this.state.quantity * this.state.price,
      description: description,
      image: image,
      quantity: this.state.quantity,
      additional: this.state.additional
    };
    this.props.updateOrder(item)
    this.props.navigation.goBack()
  }

  removeItem = () => {
    let additional = this.state.additional;

    additional.map((item) => {
      item.data.forEach((obj) => {
        obj.selected = false
      })
    })
    this.setState({additional: [...additional]})
    this.props.removeItemFromOrder(this.state.item);
    this.props.navigation.goBack()
  }

  Header = ({image, title, description}) => {
    return (
      <View style={{height: 300}}>
          <ImageBackground
            style={{
                    flex:1,
                    width: '100%',
                  }}
            source={{
              uri: image
            }}
          >
            {Platform.OS == 'ios' ?
              (<TouchableOpacity
                style={{ borderRadius: 150 / 2, backgroundColor: 'white', width: '10%', alignItems: 'center', justifyContent: 'center', margin: '2%' }}
                onPress={() => this.props.navigation.goBack()}
              >
                <FontAwesome
                  name="angle-down"
                  size={35}
                  style={{ fontWeight: 'bold' }}
                />
              </TouchableOpacity>
              ) : (
                null
              )
            }
          </ImageBackground>
          <View style={styles.mainTxt}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
        </View>
    )
  }

  Footer = (quantity) => {
    return (
      <View  style={styles.quantity}>
          <View style={styles.quantityBtn}>
            <TouchableOpacity style={{height:60, justifyContent:'center', alignItems:'center', width:'33.33%'}} onPress={this.decreaseQuantity}>
              <Text style={styles.title}>-</Text>
            </TouchableOpacity >
            <View style={{height:60, justifyContent:'center', width:'33.33%', alignItems:'center'}}> 
              <Text style={styles.title}>{quantity}</Text>
            </View>
            <TouchableOpacity style={{height:60, justifyContent:'center', alignItems:'center', width:'33.33%'}} onPress={this.increaseQuantity}>
              <Text style={styles.title}>+</Text>
            </TouchableOpacity>
          </View>
          {this.state.present !== false ? (
            <TouchableOpacity style={{paddingTop:10}} onPress={this.removeItem}>
              <Text style={{color:'red', fontSize:17}}>Remove Item</Text>
            </TouchableOpacity>
          ):( null )}
        </View>
    )
  }


  render() {
    const { item } = this.props.route.params;
    const image = item.image;
    const title = item.title;
    const description = item.description;
    const { quantity, additional, price, present } = this.state;

    const total =  quantity * price;

  return (
    <SafeAreaView style={{flex:1, backgroundColor:'white'}}>
        <View style={{ backgroundColor: 'white', width: '100%', flex: 1, alignItems: 'center' }}>
        <SectionList
            style={{width:'100%'}}
            sections={additional}
            keyExtractor={(item, index) => item + index}
            renderSectionHeader={({ section: { title } }) => (
              <View style={{backgroundColor:'white'}}>
                <Text style={{ fontSize: 23, fontWeight: 'bold', paddingLeft: 15, }}>{title}</Text>
              </View>
            )}
          renderItem={({ item, section: { required } }) => {
            if (required == true) {
              return (
                <TouchableOpacity key={item.id} onPress={() => this.pressRequired(item)} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '5%' }}>
                  <View style={{flexDirection:'row', alignItems:'center'}}>
                    <Ionicons
                      name={item.selected == false ? 'ellipse-outline' : 'ellipse'}
                      size={28}
                    />
                    <Text>{item.title}</Text>
                  </View>
                </TouchableOpacity>
              )
            } else {
              return (
                <TouchableOpacity key={item.id} onPress={() => this.pressOptional(item)} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '5%' }}>
                  <View style={{flexDirection:'row', alignItems:'center'}}>
                    <Ionicons
                      name={item.selected == false ? 'square-outline' : 'square'}
                      size={28}
                    />
                    <Text>{item.title}</Text>
                  </View>
                  <Text>${item.price}</Text>
                </TouchableOpacity>
              )
            }
            }
          }
          ListHeaderComponent={this.Header({image: image, title: title, description: description})}
          ListFooterComponent={this.Footer(quantity)}
          /> 
        </View>
      <View style={styles.addTo}>
        {this.state.closed == true ? (
          <CustomButton
              buttonTxt={'Closed'}
              backgroundColor={'#C7C7C7'}
              txtColor={'white'}
              activeOpacity={1}
            />
        ): (
          <CustomButton
            buttonTxt={present === false ? (
                "Add to Order" + '                        $' + `${total.toFixed(2)}`
              ) : (
                "Update Order" + '                        $' + `${total.toFixed(2)}`
                )}
              backgroundColor={'black'}
              onPress={present === false ? this.addToOrder : this.updateOrder}
              txtColor={'white'}
            />
        )}
      </View>
    </SafeAreaView>
    )
}};

function mapStateToProps(store){
  return{
      newOrder: store.userState.newOrder,
  };
}

const mapDispatchToProps = { addItemToOrder, removeItemFromOrder, updateOrder };

export default connect(mapStateToProps, mapDispatchToProps)(DisplayItem);

const styles = StyleSheet.create({
  addTo: {
    borderTopWidth:1,
    borderColor: '#D5D5D5',
    paddingTop:10,
    paddingBottom:30,
    backgroundColor:'white',
    alignItems:'center',
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
    width: '100%',
    height: '20%',
    backgroundColor: '#DEDEDE',
    marginTop: '2%'
  },
  mainTxt: {
    padding: 20,
  },
  title:{
    fontSize:20,
    fontWeight: 'bold'
  },
  description: {
    fontSize:15,
    color:'#6E6D6D',
    paddingTop:10
  },
  quantity: {
    alignItems:'center',
    justifyContent: 'center',
    paddingBottom:20
  },
  quantityBtn: {
    shadowOpacity:0.2,
    flexDirection:'row',
    borderWidth:1,
    borderColor: '#D5D5D5',
    width:'40%',
    borderRadius:12,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'white'
  }
})
