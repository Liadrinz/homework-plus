import React from 'react';
import axios from 'axios';
import {Row,Col,Card,Layout,Button,Drawer} from 'antd';
import moment from 'moment';
import "./correctSpecificWork.css";

var assignmentId;//特定作业任务的Id
var re=/^\/teachercenter\/correctWork\/(.*)\/$/;
const { Header, Footer, Sider, Content,} = Layout;

class UploadAssignmentFile extends React.Component{
    render(){
        if(this.props.addfile.length===0) return(<div/>)
        else return(            
            <div>
            <p>点击下载文件:</p>
            <a href={"http://localhost:8000/media/"+this.props.addfile[0].data}
               style={{fontSize:"20px"}}>
            {this.props["filename"]}
            </a>
            </div>
        )
    }
}
  
class CorrectSpecificWork extends React.Component{
    constructor(props){
        super(props);
        this.state={
            assignmentInfo:{
                name:"xxx",
                description:"xxx",
                assignmentType:"xxx",
                startTime:"xxx",
                deadline:"xxx",
                courseClass:{
                    name:"xxx",
                },
                addfile:[{
                    data:"xxx",
                }]
            },
            visible1:false,
        }
    }
    
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
        getAssignmentInfo().then(function(response){
            let type=response.data.data.getAssignmentsByIds[0].assignmentType;
            if(type==="IMAGE")response.data.data.getAssignmentsByIds[0].assignmentType="图片作业";
            else if(type==="DOCS")response.data.data.getAssignmentsByIds[0].assignmentType="文件作业";
            else response.data.data.getAssignmentsByIds[0].assignmentType="任意作业";
            that.setState({assignmentInfo:response.data.data.getAssignmentsByIds[0]});
        })
        .catch(function(error){
            console.log(error);
        })
    }

    openDrawer=()=>{
        this.setState({visible1:true});
    }

    onClose=()=>{
        this.setState({visible1:false});
    }

    render(){
        return(
            <div>
            <Layout>
              <Sider theme="light" width="650">
              <p style={{fontSize:"50px",width:"50px"}}>fsaddsfadf</p>
              <p style={{fontSize:"50px",width:"50px"}}>fsaddsfadf</p>
              <p style={{fontSize:"50px",width:"50px"}}>fsaddsfadf</p>
              <p style={{fontSize:"50px",width:"50px"}}>fsaddsfadf</p>
              <p style={{fontSize:"50px",width:"50px"}}>fsaddsfadf</p>
              <p style={{fontSize:"50px",width:"50px"}}>fsaddsfadf</p>
              </Sider>
              <Content>
              <div style={{marginBottom:"10px",marginTop:"10px"}}>
                <span style={{fontSize:"20px"}}>
                 {this.state.assignmentInfo.courseClass["name"]+
                   "----"+
                  this.state.assignmentInfo["name"]+"  "}
                </span>  
                <span style={{fontSize:"15px"}}>
                 {this.state.assignmentInfo.assignmentType}
                </span>  
                <Button type="primary" shape="round" style={{marginLeft:"20px"}} onClick={this.openDrawer}>查看作业描述</Button>        
              </div> 
              <div style={{marginBottom:"10px"}}>
                <span style={{fontSize:"15px"}}>
                {"开始提交:"+ moment(this.state.assignmentInfo.startTime).format("YY"+"/"+"M"+"/"+"D"+" "+"HH"+":"+"mm")+"  "+
                 "结束提交:"+ moment(this.state.assignmentInfo.deadline).format("YY"+"/"+"M"+"/"+"D"+" "+"HH"+":"+"mm")}   
                </span>
              </div>                                      
              <Card title="待批改作业" style={{height:"300px",backgroundColor:"#CCFFEB"}}>
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
              <Card title="已批改作业">
                 <div className="scrollprac2">
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
            </Content>
            </Layout>
            <Drawer
               title="作业要求描述"
               placement="right"
               closable={false}
               onClose={this.onClose}
               visible={this.state.visible1}
            >
            <p>{this.state.assignmentInfo["description"]}</p>
            <br/><br/><br/>
            <UploadAssignmentFile addfile={this.state.assignmentInfo.addfile} filename={this.state.assignmentInfo["name"]}/>
            </Drawer>
            </div>
        )
    }
}

export default CorrectSpecificWork;