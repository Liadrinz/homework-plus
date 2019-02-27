import React from 'react';
import ReactDOM from 'react-dom';
import './validateEmail.css';
import axios from 'axios';
import weburl from './url.js'
import timeout from './timeout.js'
var gotToken='';
var re=/^([0-9a-zA-Z\_\.\/\:]*)\?token=(.*)$/;
class ValidateEmail extends React.Component{
   componentDidMount(){
       if(gotToken===''){
           gotToken=re.exec(window.location.href)[2];
           var postToken=axios.create({
            url:weburl+"/account/activate/",
            headers:{"content-type":"application/json","token":gotToken},
            method:'post',
            timeout:timeout,
           })
           postToken().then(function(response){
               console.log(response);
           })
           .catch(function(error){
               console.log(error);
           })
       }
   }

   componentWillUnmount(){
       gotToken='';
   }

   render(){
       return(<p className="word">您注册的用户已通过验证!</p>)
   }
}

export default ValidateEmail;