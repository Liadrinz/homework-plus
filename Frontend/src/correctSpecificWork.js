import React from 'react';
import axios from 'axios';
import {Row,Col,Card} from 'antd';
import "./correctSpecificWork.css";

var assignmentId;//特定作业任务的Id
var re=/^\/teachercenter\/correctWork\/(.*)\/$/;

class AssignmentInfo extends React.Component{
    render(){
        return(
            <span>
            {(this.props.assignmentInfo.courseClass["name"]==undefined?" ":this.props.assignmentInfo.courseClass["name"])+
             "----"+
             this.props.assignmentInfo["name"]}
            </span>
        )
    }
}

class CorrectSpecificWork extends React.Component{
    
    componentWillMount(){
        var that=this;
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
        this.getInfo=setInterval(()=>{
        getAssignmentInfo().then(function(response){
            that.setState({assignmentInfo:response.data.data.getAssignmentsByIds[0]});
        })
        .catch(function(error){
            console.log(error);
        })
        },2000)
    }

    componentWillUnmount(){
        clearInterval(this.getInfo);
    }

    render(){
        return(
            <div>
            <Col xs={24} sm={{span:12,offset:12}}>
              <span>
                {(this.state.assignmentInfo==null?" ":this.state.assignmentInfo.courseClass["name"])+
                 "----"+
                this.props.assignmentInfo["name"]}
              </span>
            </Col>            
            <Col xs={24} sm={{span:12,offset:12}}>
              <Card title="...">
                 <div className="scrollprac">
                     <p>some content</p>
                     <p>some content</p>
                     <p>some content</p>
                     <p>some content</p>
                     <p>some content</p>  
                     <p>some content</p>   
                     <p>some content</p>   
                     <p>some content</p>                     
                 </div>
              </Card>
            </Col>
            </div>
        )
    }
}

export default CorrectSpecificWork;