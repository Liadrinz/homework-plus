import React from 'react';
import axios from 'axios';
import './myHomework.css';

var re=/^\/studentcenter\/myHomeWork\/(.*)\/$/;

class MyHomework extends React.Component{
    constructor(props){
        super(props);
        this.state={
            isSubmitted:false,//判断用户是否已经提交了该作业
        }
    }

    componentWillMount(){
        var getSubmission=axios.create({
            url:"http://localhost:8000/graphql/",
            headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
            method:'post',
            data:{
               "query":`query{
                 getSubmissionsByAssignments(assignments:${[re.exec(window.location.pathname)[1]]})
                 {
                    submitter{
                        id
                    }
                 }
                }`//用反引号      
            },
            timeout:1000,
        })
        getSubmission().then(function(response){
            var that=this;
            console.log(response);
            let submissions=response.data.data.getSubmissionsByAssignments;
            for(let i in submissions){
                if(submissions[i].submitter["id"]==that.props.userinformation["id"]){
                    that.setState({isSubmitted:true});break;
                }
            }
        })
        .catch(function(error){
            console.log(error);
        })
    }

    render(){
        console.log(this.props.userinformation["id"]);
        return(
            <div/>
        )
    }
}
export default MyHomework;