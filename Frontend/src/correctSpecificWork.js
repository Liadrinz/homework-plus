import React from 'react';
import axios from 'axios';

var assignmentId;//特定作业任务的Id
var re=/^\/teachercenter\/correctWork\/(.*)\/$/;

class CorrectSpecificWork extends React.Component{
    
    componentWillMount(){
        assignmentId=re.exec(window.location.pathname)[1];
        var getAssignmentInfo=axios.create({
            url:"http://localhost:8000/graphql/",
            headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
            method:'post',
            data:{
               "query":`query{
                 getAssignmentsByIds(ids:${[assignmentId]})
                 {
                    name
                    description
                    assignmentType
                    startTime
                    deadline
                    courseClass{
                        name
                    }
                    addfile{
                        data
                    }
                 }
                }`//用反引号      
            },
            timeout:1000,
        })
        getAssignmentInfo().then(function(response){
            console.log(response);
        })
        .catch(function(error){
            console.log(error);
        })
    }

    render(){
        return(
            <div/>
        )
    }
}

export default CorrectSpecificWork;