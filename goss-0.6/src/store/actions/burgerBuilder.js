import * as actionTypes from './actionTypes';
import axios from '../../axios-orders';

export const addIngredient = ( name ) => {
    return {
        type: actionTypes.ADD_INGREDIENT,
        ingredientName: name
    };
};

export const removeIngredient = ( name ) => {
    return {
        type: actionTypes.REMOVE_INGREDIENT,
        ingredientName: name
    };
};

export const setIngredients = ( ingredients ) => {
    return {
        type: actionTypes.SET_INGREDIENTS,
        ingredients: ingredients
    };
};

export const fetchIngredientsFailed = () => {
    return {
        type: actionTypes.FETCH_INGREDIENTS_FAILED
    };
};

export const initIngredients = () => {
    return dispatch => {
        axios.get( 'http://localhost:8080/api/ingredients' )
            .then( response => {
                dispatch(setIngredients(response.data[0]));
                //dispatch(setIngredients({bacon:1, salad:1, meat:1, cheese:1}))
            } )
            .catch( error => {
                dispatch(fetchIngredientsFailed());
            } );
    };
};