
import { 
  USER_STATE_CHANGE,
  GOOGLE_SIGN_IN, 
  ID_TOKEN, 
  ACCESS_TOKEN,
  ADD_ITEM_TO_ORDER,
  TRIG_SEARCH,
  USER_ADDRESS,
  REMOVE_ITEM,
  UPDATE_ITEM,
  CLEAR_ORDER,
  MENU,
} from "../constants";

const initialState = {
  trigSearch: false,
  currentUser: null,
  idToken: "",
  accessToken: "",
  googleSignIn: false,
  newOrder: [],
  currentAddress: [],
  menu: [],
};

export const user = (state = initialState, action) => {
  switch (action.type){
        case USER_STATE_CHANGE:
          return {
            ...state,
            currentUser: action.currentUser,
          };
        case USER_ADDRESS:
          return {
            ...state,
            currentAddress: action.currentAddress,
          };
        case TRIG_SEARCH:
          return {
            ...state,
            trigSearch: action.trigSearch,
        };
        case GOOGLE_SIGN_IN:
        return {
          ...state,
          googleSignIn: action.payload,
        };
        case ID_TOKEN: 
        return{
          ...state,
          idToken: action.payload,
        };
        case ACCESS_TOKEN: 
        return{
          ...state,
          accessToken: action.payload,
        };
        case MENU:
        return {
          ...state,
          menu: [...state.menu, action.payload],
        }
        case ADD_ITEM_TO_ORDER: 
        return{
          ...state,
          newOrder: [...action.payload],
        };
        case REMOVE_ITEM: 
        return{
          ...state,
          newOrder: [...state.newOrder.filter((item) => item.id !== action.payload)],
        }
        case CLEAR_ORDER:
        return {
          ...state,
          newOrder: []
        }
        case UPDATE_ITEM:
        return {
          ...state, 
           newOrder: state.newOrder.map((item) => {
              if (item.id === action.payload.id) {
                return Object.assign({}, item, action.payload);
              }
              return item;
          })
          };
        default:
          return state
    }
  
};
