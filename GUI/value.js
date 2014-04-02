/*
Function called on input change. Will return html reflecting value change.  Does not change stored values in inputs.
 */

function changeValue(n, slider){
    //slider = name attribute of input tag
    document.getElementById(slider).innerHTML = n;
}