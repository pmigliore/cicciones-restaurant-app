import React, { useEffect, useState, useRef } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  FlatList,
  StyleSheet,
  SectionList,
  Modal,
  TextInput,
  Keyboard,
  Image,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

//firebase
import { dbMenu } from "../../api/firebase.js";
import { ref, onValue } from "firebase/database";

//redux
import { connect } from "react-redux";
import { getMenu } from "../../redux/actions/index";

function Orders({ navigation, newOrder, menu }) {
  const [loaded, setLoaded] = useState(false);
  const [click, setClick] = useState(0);
  const [tapBar, setTapBar] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredDataSource, setFilteredDataSource] = useState([]);
  const [finalArray, setFinalArray] = useState([]);
  const scrollToItem = useRef(null);

  useEffect(() => {
    const starCountRef = ref(dbMenu, "menu");
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      if (filteredDataSource.length == 0) {
        data.map((item) => {
          item.data.map((item) => {
            let array = filteredDataSource;
            array.push(item);
            setFilteredDataSource(array);
            setFinalArray(array);
          });
        });
      }
      if (menu.length == 0) {
        menu.push(...data);
      }
      setLoaded(true);
    });
  }, []);

  const openModalSearch = () => {
    setModalVisible(true);
  };

  const closeModalSearchFromCancel = () => {
    setModalVisible(false), setShowSearch(false), setSearch(null);
  };

  const navigateToItemFromModal = (e) => {
    setModalVisible(false);
    navigation.navigate("DisplayItem", {
      item: e,
    });
  };

  const searchFilterFunction = (text) => {
    if (text) {
      const newData = finalArray.filter(function (item) {
        const itemData = item.title
          ? item.title.toUpperCase()
          : "".toUpperCase();
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      setFilteredDataSource(newData);
      setSearch(text);
      setShowSearch(true);
    } else {
      setFilteredDataSource(finalArray);
      setSearch(text);
    }
  };

  const scrollToSection = (e) => {
    setTapBar(true);
    setClick(e);
    scrollToItem.current.scrollToLocation({
      animated: true,
      sectionIndex: e,
      itemIndex: 0,
      viewPosition: 0,
    });
    setTimeout(function () {
      setTapBar(false);
    }, 300);
  };

  const onViewableItemsChanged = ({ viewableItems, changed }) => {
    const section = viewableItems[0].section.id;
    if (section == 0) {
      setClick(0);
    } else if (section == 1) {
      setClick(1);
    } else if (section == 2) {
      setClick(2);
    } else if (section == 3) {
      setClick(3);
    }
  };

  var total = 0;
  newOrder.forEach(function (item, index) {
    total += item.price;
  });

  if (loaded === false) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "white",
          width: "100%",
          alignItems: "center",
        }}
      >
        <View style={styles.itemPlaceholderParent} />
        <View style={{ width: "100%", flex: 0.8, padding: "5%" }}>
          <View style={styles.itemPlaceholder} />
          <View style={[styles.itemPlaceholder, { height: "30%" }]} />
          <View
            style={[styles.itemPlaceholder, { width: "40%", height: "6%" }]}
          />
          <View style={[styles.itemPlaceholder, { height: "30%" }]} />
          <View style={[styles.itemPlaceholder, { height: "20%" }]} />
        </View>
      </SafeAreaView>
    );
  } else {
    return (
      <View style={{ flex: 1, alignItems: "center" }}>
        <StatusBar style="auto" />
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <SafeAreaView
            style={{
              alignItems: "center",
              flex: 0.1,
              backgroundColor: "white",
              borderBottomWidth: 1,
              borderColor: "#D5D5D5",
            }}
          >
            <View
              style={{
                width: "100%%",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                position: "absolute",
                bottom: 0,
              }}
            >
              <FontAwesome
                name="search"
                size={20}
                style={{ width: "5%", color: "#8A8A8A" }}
              />
              <TextInput
                onChangeText={(text) => searchFilterFunction(text)}
                clearButtonMode="while-editing"
                style={styles.searchAddress}
                placeholder={"Search menu"}
                autoFocus={true}
                value={search}
                returnKeyType="search"
              />
            </View>
          </SafeAreaView>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: "rgba(60,60,60,0.85)" }}
            onPress={() => {
              Keyboard.dismiss();
              setModalVisible(false);
            }}
          >
            {search.length > 1 && (
              <FlatList
                data={filteredDataSource}
                keyboardDismissMode="on-drag"
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.btnMenu}
                      activeOpacity={0.9}
                      onPress={() => navigateToItemFromModal(item)}
                    >
                      <View style={{ padding: 25, flex: 1 }}>
                        <Text style={styles.txtTitle}>{item.title}</Text>
                        <Text style={styles.txtPrice}>${item.price}</Text>
                        <Text style={styles.txtDescription}>
                          {item.description}
                        </Text>
                      </View>
                      <Image
                        style={styles.imageMenu}
                        source={{
                          uri: item.image,
                        }}
                      />
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </TouchableOpacity>
        </Modal>
        <View style={{ backgroundColor: "white", flexDirection: "row" }}>
          <TouchableOpacity style={{ padding: 15 }} onPress={openModalSearch}>
            <FontAwesome name="search" size={23} />
          </TouchableOpacity>
          <FlatList
            data={menu}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              return (
                <TouchableOpacity
                  key={item.id}
                  style={{ borderBottomWidth: click === item.id ? 2 : 0 }}
                  onPress={() => scrollToSection(item.id)}
                >
                  <View style={{ padding: 15 }}>
                    <Text style={styles.txtTitle}>{item.title}</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
        <View
          style={{ paddingTop: 10, height: "100%", flex: 1, width: "100%" }}
        >
          <SectionList
            ref={scrollToItem}
            onViewableItemsChanged={
              tapBar == false ? onViewableItemsChanged : null
            }
            viewabilityConfig={{
              itemVisiblePercentThreshold: 95,
              waitForInteraction: true,
            }}
            sections={menu}
            keyExtractor={(item, index) => item + index}
            renderItem={({ item }) => {
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.btnMenu}
                  onPress={() =>
                    navigation.navigate("DisplayItem", {
                      item: item,
                    })
                  }
                >
                  <View style={{ padding: 25, flex: 1 }}>
                    <Text style={styles.txtTitle}>{item.title}</Text>
                    <Text style={styles.txtPrice}>${item.price}</Text>
                    <Text style={styles.txtDescription}>
                      {item.description}
                    </Text>
                  </View>
                  <Image
                    style={styles.imageMenu}
                    source={{
                      uri: item.image,
                    }}
                  />
                </TouchableOpacity>
              );
            }}
            renderSectionHeader={({ section: { title } }) => {
              return (
                <Text
                  style={{
                    fontSize: 23,
                    fontWeight: "bold",
                    padding: 20,
                    backgroundColor: "white",
                  }}
                >
                  {title}
                </Text>
              );
            }}
          />
        </View>
        {newOrder.length === 0 ? null : (
          <TouchableOpacity
            style={styles.cartBtn}
            onPress={() => navigation.navigate("Cart")}
          >
            <Text style={styles.cartTxt}>View Order</Text>
            <Text style={styles.cartTxt}>${total.toFixed(2)}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
}

function mapStateToProps(store) {
  return {
    newOrder: store.userState.newOrder,
    menu: store.userState.menu,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    getMenu: (e) => dispatch(getMenu(e)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Orders);

const styles = StyleSheet.create({
  itemPlaceholder: {
    width: "100%",
    height: "10%",
    backgroundColor: "#DEDEDE",
    borderRadius: 12,
    marginTop: "4%",
  },
  itemPlaceholderParent: {
    width: "90%",
    height: "20%",
    backgroundColor: "#DEDEDE",
    borderRadius: 12,
    marginTop: "2%",
  },
  btnMenu: {
    height: 130,
    width: "100%",
    backgroundColor: "white",
    borderColor: "#8A8A8A",
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
  },

  txtTitle: {
    fontSize: 17,
    fontWeight: "bold",
  },

  txtPrice: {
    paddingTop: 5,
    fontSize: 15,
  },

  txtDescription: {
    paddingTop: 5,
    fontSize: 15,
    color: "#6E6D6D",
  },

  item: {
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8,
  },
  header: {
    fontSize: 32,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
  },
  cartBtn: {
    width: "85%",
    height: "7%",
    backgroundColor: "black",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "space-evenly",
    position: "absolute",
    bottom: "1%",
    flexDirection: "row",
  },
  cartTxt: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  searchAddress: {
    fontWeight: "bold",
    fontSize: 16,
    padding: 15,
    width: "85%",
  },
  imageMenu: {
    resizeMode: "cover",
    height: "80%",
    flex: 0.8,
    borderRadius: 12,
  },
});
