// this file handles tokens
/*
const TOKEN_KEY = "access_token"; //Storage Key

export function saveToken(token){
    localStorage.setItem(TOKEN_KEY, token);
}//used at Login; saves a JWT from the server to the browser's memory

export function getToken(token){
    return localStorage.getItem(TOKEN_KEY);
}//retrieves the string whenever whenever needed to send to an API to prove identity

export function removeToken(token){
    localStorage.removeItem(TOKEN_KEY);
}//logout; clears data

export function isAuthenticated(){
    return !!getToken();
}//checks status; returns true if a token exists and false if it doesnt
//getToken above returns a string if logged in and null if logged out; the first ! turns a string into false or null into true(works as a string to boolean converter + NOT), the second ! flips it back
*/
// not needed anymore as cookies are processed by backend