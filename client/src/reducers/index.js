import {combineReducers} from 'redux'

import userLogin from './userLogin';
import flashMessage from './flashMessage';
import myResources from './myResources';
import locationResources from './locationResources';
import allWebResources from './allWebResources';
import buyResources from './buyResources';
import buyerResources from './buyerResources';
import localUser from './localUser';
import blockUser from './blockUser';
import owner from './owner';
import userSignup from './userSignup';

export default combineReducers({
    userLogin,
    flashMessage,
    blockUser: blockUser,
    localUser: localUser,
    owner: owner,
    Customer: userSignup,
    resources: myResources,
    buyResources: buyResources,
    buyerResources: buyerResources,
    localResources: locationResources,
    allWebResources: allWebResources,
});