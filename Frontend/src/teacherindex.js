import React from 'react';
import ReactDOM from 'react-dom';
import './teacherindex.css';
import {Button,Tag,Icon,Layout,Menu,Avatar,Badge,Row,Col}from'antd';
import axios from 'axios';
import {Route,Switch,Redirect} from 'react-router-dom';
import WrappedTeachercenter from './teachercenter.js';
import Teacherclass from './teacherclass.js';
import WrappedAddcourse from './teacheraddcourse.js'
import TeacherSpecificClass from './teacherSpecificClass.js';
import CorrectWork from './correctWork.js';
import CorrectSpecificWork from './correctSpecificWork.js';
import {_} from 'underscore'

 //大多数的地方使用graphql技术获取和传送数据
const { SubMenu } = Menu;
const { Header, Content, Sider,Footer } = Layout;
var userinformation={bupt_id:"",class_number:"",email:"",gender:"",id:"",name:"",username:"",usertype:"",phone:"",wechat:""};

class TeacherIndex extends React.Component{
   constructor(props){
    super(props);
    this.state={
        key:1,//当前状态下菜单的key
        norepeatkey1:true,
        norepeatkey2:true,
        norepeatkey3:true,
        norepeatkey4:true,
        norepeatkey5:true,
        norepeatkey6:true,
        clickmenu:true,//确保是在点击侧边菜单的操作
        bupt_id:"",
        class_number:"",
        email:"",
        gender:"",
        id:"",
        name:"",
        phone:"",
        username:"",
        usertype:"",
        wechat:"",
        courselist:[],//教师作为教师的课程班信息，为一个数组，数组里面的每个元素均为单个课程班的信息
        assistantcourselist:[],//教师作为助教参加的课程班信息，为一个数组，数组里面的每个元素均为单个课程班的信息
    }
 }
   
   componentWillMount(){
    if(window.location.pathname==='/teachercenter'){
      this.setState({norepeatkey1:false})
    }
    //后续随着路径的添加而增加
   }

   componentDidMount(){
    const gridStyle={
      width:'100%',
      textAlign:'center',
    }
     var getbuptId=axios.create({
      url:"http://localhost:8000/graphql/",
      headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
      method:'post',
      data:{
         "query":`query{
           getUsersByIds(ids:${localStorage.getItem('userloginKey')})
           {
             buptId
             classNumber
             email
             gender
             id
             name
             phone
             username
             usertype
             wechat
           }
          }`//用反引号      
      },
      timeout:1000,
     })
     var that=this;
     getbuptId().then(function(response){
       var str=JSON.stringify(response.data.data.getUsersByIds[0]);
       localStorage.setItem("user",str);//将对象转换为字符串，这样可以存储在localStorage里
       that.setState({
         bupt_id:response.data.data.getUsersByIds[0].buptId,
         class_number:response.data.data.getUsersByIds[0].classNumber,
         email:response.data.data.getUsersByIds[0].email,
         gender:response.data.data.getUsersByIds[0].gender,
         id:response.data.data.getUsersByIds[0]["id"],
         name:response.data.data.getUsersByIds[0]["name"],
         phone:response.data.data.getUsersByIds[0].phone,
         username:response.data.data.getUsersByIds[0].username,
         usertype:response.data.data.getUsersByIds[0].usertype,
         wechat:response.data.data.getUsersByIds[0].wechat,
         clickmenu:false,
        })
     })
     .catch(function(error){
       console.log(error);
     })
     var lastUpdateteachercourse=[];
     var lastUpdateassistantcourse=[];//教师作为助教参加的课程
     this.getCourse=setInterval(()=>{
     var getUserCourse=axios.create({
       url:"http://localhost:8000/graphql/",
       headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
       method:'post',
       data:{
         "query":`query{
           getUsersByIds(ids:${localStorage.getItem('userloginKey')})
           {
             teachersCourse{
               id
               name
               description
               marks
               school
               startTime
               endTime
               teachers{
                 id
                 name
               }
               teachingAssistants{
                 id
                 name
               }
               students{
                 id
                 buptId
                 name
                 usertype
                 classNumber
               }
             }
             teachingAssistantsCourse{
              id
              name
              description
              marks
              school
              startTime
              endTime
              teachers{
                id
                name
              }
              teachingAssistants{
                id
                name
              }
              students{
                id
                buptId
                name
                usertype
                classNumber
              }
            }
           }
          }`
       },
       timeout:1000,
     })
     getUserCourse().then(function(response){
       //获得该用户拥有的所有的课程版的ID
       if(JSON.stringify(lastUpdateteachercourse)!==JSON.stringify(response.data.data.getUsersByIds[0].teachersCourse)){
         lastUpdateteachercourse=response.data.data.getUsersByIds[0].teachersCourse;
         that.setState({courselist:lastUpdateteachercourse})
       }
       if(JSON.stringify(lastUpdateassistantcourse)!==JSON.stringify(response.data.data.getUsersByIds[0].teachingAssistantsCourse)){
        lastUpdateassistantcourse=response.data.data.getUsersByIds[0].teachingAssistantsCourse;
        that.setState({assistantcourselist:lastUpdateassistantcourse})
      }
     })
     .catch(function(error){
       console.log(error);
     });
    },1000)
   }
   
   componentDidUpdate(){
    if(this.state.key==1&&this.state.norepeatkey1&&this.state.clickmenu){
      this.setState({norepeatkey1:false,norepeatkey2:true,norepeatkey3:true,norepeatkey4:true,norepeatkey5:true,norepeatkey6:true});
     }
    if(this.state.key==2&&this.state.norepeatkey2&&this.state.clickmenu){
      this.setState({norepeatkey1:true,norepeatkey2:false,norepeatkey3:true,norepeatkey4:true,norepeatkey5:true,norepeatkey6:true});
    }
    if(this.state.key==3&&this.state.norepeatkey3&&this.state.clickmenu){
      this.setState({norepeatkey1:true,norepeatkey2:true,norepeatkey3:false,norepeatkey4:true,norepeatkey5:true,norepeatkey6:true});
     }
    if(this.state.key==4&&this.state.norepeatkey4&&this.state.clickmenu){
      this.setState({norepeatkey1:true,norepeatkey2:true,norepeatkey3:true,norepeatkey4:false,norepeatkey5:true,norepeatkey6:true});
    }
    if(this.state.key==5&&this.state.norepeatkey5&&this.state.clickmenu){
      this.setState({norepeatkey1:true,norepeatkey2:true,norepeatkey3:true,norepeatkey4:true,norepeatkey5:false,norepeatkey6:true});
     }
    if(this.state.key==6&&this.state.norepeatkey6&&this.state.clickmenu){
      this.setState({norepeatkey1:true,norepeatkey2:true,norepeatkey3:true,norepeatkey4:true,norepeatkey5:true,norepeatkey6:false});
     }
   }

   componentWillUnmount(){
     clearInterval(this.getCourse);
   }

   changehref=({ item, key, keyPath })=>{
      this.setState({key:key,clickmenu:true,});
   }

   //修改用户信息
   changeinformation=(info)=>{
      this.setState({username:info.username,phone:info.phone});
   }
  
   //对teachercenter里面课程班管理的跳转操作进行反应
   redirecttocourse=()=>{
     this.setState({key:2,clickmenu:false,norepeatkey1:true,norepeatkey3:true,norepeatkey4:true,norepeatkey5:true,norepeatkey6:true})
   }

   //对teacherclass里面课程班管理的跳转操作进行反应
   redirecttocourse2=()=>{
    this.setState({key:2,clickmenu:false,norepeatkey1:true,norepeatkey2:true,norepeatkey3:true,norepeatkey4:true,norepeatkey5:true,norepeatkey6:true})
   }    

   //对teacherspecificclass里面作业批改的跳转操作进行反应
   redirecttocourse3=()=>{
    this.setState({key:3,clickmenu:false,norepeatkey1:true,norepeatkey2:true,norepeatkey3:true,norepeatkey4:true,norepeatkey5:true,norepeatkey6:true})
   }    

    render(){
      userinformation.bupt_id=this.state.bupt_id;
      userinformation.class_number=this.state.class_number;
      userinformation.email=this.state.email;
      userinformation.gender=this.state.gender;
      userinformation["id"]=this.state["id"];
      userinformation["name"]=this.state["name"];
      userinformation.username=this.state.username;
      userinformation.phone=this.state.phone;
      userinformation.usertype=this.state.usertype;
      userinformation.wechat=this.state.wechat;
      if(this.state.key==1&&this.state.norepeatkey1&&this.state.clickmenu){
        return (<Redirect exact push to='/teachercenter'/>);
       }
      if(this.state.key==2&&this.state.norepeatkey2&&this.state.clickmenu){
       return (<Redirect exact push to='/teachercenter/teacherclass'/>);
      }
      if(this.state.key==3&&this.state.norepeatkey3&&this.state.clickmenu){
        return (<Redirect exact push to='/teachercenter/correctWork'/>);
      }
      if(this.state.key==4&&this.state.norepeatkey4&&this.state.clickmenu){
        return (<Redirect exact push to='/teachercenter/createclass'/>);
      }
      //后续随着路径的添加而增加
        return(
          <div>
          <Layout>
            <Sider style={{overflow: 'auto', height: '100vh', position: 'fixed', left: 0 ,top:'64px',background:'#fff' }}>
              <Menu
                mode="inline"
                theme='light'
                defaultSelectedKeys={["1"]}
                selectedKeys={[String(this.state.key)]}
                style={{ height: '100%'}}
                onClick={this.changehref}
              >
                  <Menu.Item key="1"><span><Icon type="user" />我的</span></Menu.Item>
                  <Menu.Item key="2"><span><Icon type="usergroup-add" />课程组</span></Menu.Item>
                  <Menu.Item key="3"><span><Icon type="form" />批改作业</span></Menu.Item>
                  <Menu.Item key="4"><span><Icon type="plus-square-o" />创建课程</span></Menu.Item>
                  <Menu.Item key="5"><span><Icon type="info-circle" />消息</span></Menu.Item>
                  <Menu.Item key="6" className="aboutus"><span className="aboutus2" >关于Homework+</span></Menu.Item>
              </Menu>
            </Sider>
          </Layout>
          <Layout style={{ background:'#E6E6E6'}}>
            <Header  className="header" style={{marginLeft:'200px',zIndex:1,position:'fixed',width:'100%',background:'#fff'}}>
              <div className="logo">Homework+</div>
            <Menu
              theme="light"
              mode="horizontal"
              style={{ lineHeight: '64px' }}
            >
            <Row>
             <Col xs={10} sm={24}>
             <div className="avatar">
             <Button className="info">5通知</Button>
             <a><Badge count={5} ><Avatar shape="circle" icon="user" size="large" /></Badge></a>
             <Tag className="username" color="geekblue">{this.state.username}</Tag>
             </div>
             </Col>
            </Row>
            </Menu>
            </Header>
            <Content style={{ background: '#E6E6E6',paddingLeft: 200,paddingTop:64, margin: 0, minHeight: 280 }}>
            <Switch>
                <Route exact path='/teachercenter' render={(props)=>(
                  <WrappedTeachercenter {...props}
                    userinformation={userinformation}
                    changeinformation={this.changeinformation}
                    courselist={this.state.courselist}
                    assistantcourselist={this.state.assistantcourselist}
                    redirecttocourse={this.redirecttocourse}
                  />
                )}/>
                <Route exact path='/teachercenter/teacherclass' render={(props)=>(
                  <Teacherclass {...props}
                    userinformation={userinformation}
                    courselist={this.state.courselist}
                    assistantcourselist={this.state.assistantcourselist}
                    redirecttocourse2={this.redirecttocourse2}
                  /> 
                )}/>
                <Route exact path='/teachercenter/teacherclass/:courseID' render={(props)=>(
                  <TeacherSpecificClass {...props}
                    userinformation={userinformation}
                    courselist={this.state.courselist}
                    redirecttocourse3={this.redirecttocourse3}
                  /> 
                )}/>
                <Route exact path='/teachercenter/createclass' render={(props)=>(
                  <WrappedAddcourse {...props}
                    userinformation={userinformation}
                  /> 
                )}/>
                <Route exact path='/teachercenter/correctWork' render={(props)=>(
                  <CorrectWork {...props}
                    userinformation={userinformation}
                    courselist={this.state.courselist}
                  /> 
                )}/>    
                <Route exact path='/teachercenter/correctWork/:assignmentId' render={(props)=>(
                  <CorrectSpecificWork {...props}
                    userinformation={userinformation}
                  /> 
                )}/>                               
            </Switch>
            </Content>
            <Footer style={{background:'#E6E6E6'}}>Footer</Footer>
            </Layout>
           </div>
        )
    }
}

export default TeacherIndex;