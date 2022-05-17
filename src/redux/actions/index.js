import { getDoc, doc } from "firebase/firestore";
import { auth, db } from '../../api/firebase'
import {  USER_STATE_CHANGE, ADD_ITEM_TO_ORDER, TRIG_SEARCH, REMOVE_ITEM, UPDATE_ITEM, CLEAR_ORDER, MENU } from "../constants/index";

export function fetchUser() {
  return (dispatch) => {
    const fetchInformation = doc(db, 'clients', 'user', 'Information', auth.currentUser.uid)
    getDoc(fetchInformation)
    .then((snapshot) => {
      if (snapshot.exists) {
        dispatch({ type: USER_STATE_CHANGE, currentUser: snapshot.data() });
      } else {
        console.log("does not exist");
      }
    });
  };
}

export const trigSearch = (trigSearch) => {
  return { type: TRIG_SEARCH, payload: trigSearch}
}

export const getMenu = (data) => {
  return { type: MENU, payload: data}
}

export const addItemToOrder = (newOrder) => {
  return { type: ADD_ITEM_TO_ORDER, payload: newOrder}
}

export const updateOrder = (item) => {
  return { type: UPDATE_ITEM, payload: item}
}

export const removeItemFromOrder = (item) => {
  return { type: REMOVE_ITEM, payload: item.id};
}

export function clearOrder() {
  return { type: CLEAR_ORDER }
}



