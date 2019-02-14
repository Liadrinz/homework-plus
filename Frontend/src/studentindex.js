import React from 'react';
import ReactDOM from 'react-dom';
import './studentindex.css';
import {Button,Tag,Icon,Layout,Menu,Avatar,Badge,Row,Col}from'antd';
import axios from 'axios';
import {Route,Switch,Redirect} from 'react-router-dom';
import WrappedStudentcenter from './studentcenter.js'
import Studentclass from './studentclass.js'
import Specificclass from './studentspecificclass.js'
import AssistantSpecificclass from './assistantspecificclass.js'
import CorrectWork from './correctWork.js';
import CorrectSpecificWork from './correctSpecificWork.js';
import MyHomework from './myHomework.js'
import {_} from 'underscore'

//大多数的地方使用graphql技术获取和传送数据
const { Header, Content, Sider,Footer } = Layout;
var userinformation={bupt_id:"",class_number:"",email:"",gender:"",id:"",name:"",username:"",usertype:"",phone:"",wechat:""};

class StudentIndex extends React.Component{
   constructor(props){
    super(props);
    this.state={
        key:1,//当前状态下菜单的key
        norepeatkey1:true,
        norepeatkey2:true,
        norepeatkey3:true,
        norepeatkey4:true,
        norepeatkey5:true,
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
        courselist:[],//学生作为学生加入的课程班信息，为一个数组，数组里面的每个元素均为单个课程班的信息
        assistantcourselist:[],//学生作为助教参加的课程班信息，为一个数组，数组里面的每个元素均为单个课程班的信息
    }
 }
   
   componentWillMount(){
    if(window.location.pathname==='/studentcenter'){
      this.setState({norepeatkey1:false})
    }
    if(window.location.pathname==='/studentcenter/class'){
       this.setState({norepeatkey2:false})
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
      var lastUpdatestudentcourse=[];
      var lastUpdateassistantcourse=[];//学生作为助教参加的课程
      this.getCourse=setInterval(()=>{
      var getUserCourse=axios.create({
        url:"http://localhost:8000/graphql/",
        headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
        method:'post',
        data:{
          "query":`query{
            getUsersByIds(ids:${localStorage.getItem('userloginKey')})
            {
              studentsCourses{
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
                  name
                }
              }
              teachingAssistantsCourses{
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
                  name
                }
              }
            }
           }`
        },
        timeout:1000,
      })
      getUserCourse().then(function(response){
        //获得该用户拥有的所有的课程版的ID
        if(JSON.stringify(lastUpdatestudentcourse)!==JSON.stringify(response.data.data.getUsersByIds[0].studentsCourses)){
          lastUpdatestudentcourse=response.data.data.getUsersByIds[0].studentsCourses;
          that.setState({courselist:lastUpdatestudentcourse})
        }
        if(JSON.stringify(lastUpdateassistantcourse)!==JSON.stringify(response.data.data.getUsersByIds[0].teachingAssistantsCourses)){
          lastUpdateassistantcourse=response.data.data.getUsersByIds[0].teachingAssistantsCourses;
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
      this.setState({username:info.username,class_number:info.classNumber,phone:info.phone});
   }
  
   //对studentcenter里面课程班管理的跳转操作进行反应
   redirecttocourse=()=>{
     this.setState({key:2,clickmenu:false,norepeatkey1:true,norepeatkey3:true,norepeatkey4:true,norepeatkey5:true,norepeatkey6:true})
   }
   //对studentclass里面课程班管理的跳转操作进行反应
   redirecttocourse2=()=>{
    this.setState({key:2,clickmenu:false,norepeatkey1:true,norepeatkey2:true,norepeatkey3:true,norepeatkey4:true,norepeatkey5:true,norepeatkey6:true})
   }    
   //对assistantspecificclass里面作业批改的跳转操作进行反应
   redirecttocourse3=()=>{
    this.setState({key:4,clickmenu:false,norepeatkey1:true,norepeatkey2:true,norepeatkey3:true,norepeatkey4:true,norepeatkey5:true,norepeatkey6:true})
   } 
   //对studentspecificclass里面提交作业的跳转操作进行反应
   redirecttocourse4=()=>{
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
        return (<Redirect exact push to='/studentcenter'/>);
       }
      if(this.state.key==2&&this.state.norepeatkey2&&this.state.clickmenu){
       return (<Redirect exact push to='/studentcenter/class'/>);
      }
      if(this.state.key==4&&this.state.norepeatkey4&&this.state.clickmenu){
        return (<Redirect exact push to='/studentcenter/correctWork'/>);
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
                  <Menu.Item key="2"><span><Icon type="team" />课程组</span></Menu.Item>
                  <Menu.Item key="3"><span><Icon type="edit" />我的作业</span></Menu.Item>
                  <Menu.Item key="4"><span><Icon type="form" />批改作业</span></Menu.Item>
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
                    <Route exact path='/studentcenter' render={(props)=>(
                      <WrappedStudentcenter {...props} 
                       userinformation={userinformation}
                       changeinformation={this.changeinformation}
                       courselist={this.state.courselist}
                       assistantcourselist={this.state.assistantcourselist}
                       redirecttocourse={this.redirecttocourse}
                       />
                    )}/>
                    <Route exact path='/studentcenter/class' render={(props)=>(
                      <Studentclass {...props}
                        userinformation={userinformation}
                        courselist={this.state.courselist}
                        assistantcourselist={this.state.assistantcourselist}
                        redirecttocourse2={this.redirecttocourse2}
                      /> 
                    )}/>
                    <Route path='/studentcenter/class/:courseID' render={(props)=>(
                      <Specificclass {...props}
                      userinformation={userinformation}
                      courselist={this.state.courselist}
                      redirecttocourse4={this.redirecttocourse4}
                      />
                    )}/>
                    <Route path='/studentcenter/assistantclass/:courseID' render={(props)=>(
                      <AssistantSpecificclass {...props}
                      userinformation={userinformation}
                      courselist={this.state.courselist}
                      assistantcourselist={this.state.assistantcourselist}
                      redirecttocourse3={this.redirecttocourse3}
                      />
                    )}/>                    
                    <Route exact path='/studentcenter/correctWork' render={(props)=>(
                      <CorrectWork {...props}
                      userinformation={userinformation}
                      courselist={this.state.courselist}
                      assistantcourselist={this.state.assistantcourselist}
                      /> 
                    )}/>    
                    <Route exact path='/studentcenter/correctWork/:assignmentId' render={(props)=>(
                      <CorrectSpecificWork {...props}
                       userinformation={userinformation}
                       re={/^\/studentcenter\/correctWork\/(.*)\/$/}
                      /> 
                    )}/>
                    <Route exact path='/studentcenter/myHomework/:assignmentId' render={(props)=>(
                      <MyHomework {...props}
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



//const StudentIndex=()=>(
//    <main>
//        <Switch>
//           <Route exact path='/studentcenter/' component={Studentcenter}/>
//           <Route exact path='/studentcenter/class/' component={Studentclass}/>
//           <Route path='/studentcenter/class/courseid/' component={StudentclassID}/>
//           <Route path='/studentcenter/feedback/' component={StudentFeedback}/>
//           <Route path='/studentcenter/homework/' component={Studenthomework}/>
//           <Route path='/studentcenter/message/' component={StudentMessage}/>
//           <Route path='/studentcenter/showhomework/' component={Showhomework}/>
//           <Route path='/studentcenter/handling/' component={Handling}/>
//           <Route path='/aboutus/' component={Introducing}/>
//        </Switch>
//    </main>    
//)


export default StudentIndex;