import React from 'react';
import ReactDOM from 'react-dom';
import {Row,Col,Card,Button,Table,Select,Tag} from'antd'
import './studentspecificclass.css';
import moment from 'moment';
import axios from 'axios';
import {Link} from 'react-router-dom';
import weburl from './url.js'
import timeout from './timeout.js'
import {_} from 'underscore'
var courseid;//特定课程的id
var re=/^\/studentcenter\/class\/(.*)\/$/;
var re2=/^(.*)\/(.*)$/;
var toDate=/^(\d{4})\-(\d{2})\-(\d{2})(.*)$/;
const Option=Select.Option;

class SubmitHomework extends React.Component{
    constructor(props){
        super(props);
        this.state={
            flag:false
        }
    }
    
    componentWillMount(){
        var that=this;
        var getAllHomework=axios.create({
            url:weburl+"/graphql/",
            headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
            method:'post',
            data:{
               "query":`query{
                    getAssignmentsByCourses(courses:${[this.props.courseId]}){
                        id
                        name
                        assignmentType
                        startTime
                        deadline
                        assignmentSubmissions{
                            id
                            score
                            submitter{
                                id
                            }
                        }
                    }
                }`//用反引号      
            },
            timeout:timeout,
        })
        getAllHomework().then(function(response){
           const assignments=response.data.data.getAssignmentsByCourses;
           for(let i in assignments){
               let submit=false;
               for(let j in assignments[i].assignmentSubmissions){
                   if(assignments[i].assignmentSubmissions[j].submitter["id"]===that.props.userId){
                       submit=true;break;
                   }
               }
               if(moment().isBefore(assignments[i].startTime,"minutes")) assignments[i].submitInfo="尚未开始";
               else if(moment().isAfter(assignments[i].deadline,"minute")&&submit) assignments[i].submitInfo="已提交";
               else if(moment().isAfter(assignments[i].deadline,"minute")&&!submit) assignments[i].submitInfo="缺交";
               else if(!moment().isAfter(assignments[i].deadline,"minute")&&!submit) assignments[i].submitInfo="待提交";
               else assignments[i].submitInfo="可更新提交";
               assignments[i].submitInfoplus=assignments[i].submitInfo+"/"+assignments[i]["id"];
           }
           that.setState({
               assignmentInfo:assignments,
           })
        })
        .catch(function(error){
            console.log(error);
        })
    }

    componentWillUpdate(nextProps,nextState){
        if(nextState.flag!==this.state.flag){
        var getAllHomework=axios.create({
            url:weburl+"/graphql/",
            headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
            method:'post',
            data:{
               "query":`query{
                    getAssignmentsByCourses(courses:${[this.props.courseId]}){
                        id
                        name
                        assignmentType
                        deadline
                        assignmentSubmissions{
                            id
                            score
                            submitter{
                                id
                            }
                        }
                    }
                }`//用反引号      
            },
            timeout:timeout,
        })
        getAllHomework().then(function(response){
           const assignments=response.data.data.getAssignmentsByCourses;
           nextState.assignmentInfo=assignments;
        })
        .catch(function(error){
            console.log(error);
        })
        }
    }

    changeValue=()=>{};

    render(){
        const column=[{
            title:'作业名',
            dataIndex:'name',
        },{
            title:'作业类型',
            dataIndex:'assignmentType',
            render:text=>{if(text=="IMAGE"){ return '图片作业'}else if(text=="DOCS"){ return "文件作业"}else{ return "任意"}},
        },{
            title:'结束日期',
            dataIndex:'deadline',
            render:text=> moment(text).format("YYYY"+"年"+"M"+"月"+"D"+"日"+"HH"+"点"+"mm"+"分"),
        },{
            title:'作业状态',
            dataIndex:'submitInfo',
            render:text=> {
                if(text==="尚未开始") return <Tag color="red">{text}</Tag>;
                if(text==="已提交") return <Tag color="green">{text}</Tag>;
                if(text==="缺交") return <Tag color="red">{text}</Tag>;
                if(text==="待提交") return <Tag color="volcano">{text}</Tag>;
                if(text==="可更新提交") return <Tag color="green">{text}</Tag>;
            }
        },{
            title:'作业提交',
            dataIndex:'submitInfoplus',
            render:text=>{
                let text1=re2.exec(text)[1];
                let text2=re2.exec(text)[2];
                if(text1==="尚未开始") return (<Link to={'/studentcenter/myHomeWork/'+text2+'/'} 
                                                   style={{color:"blue"}}
                                                   onClick={this.props.redirecttocourse}
                                              >查看作业描述</Link>);
                else if(text1==="已提交"||text1==="缺交") return (<Link to={'/studentcenter/myHomeWork/'+text2+'/'} 
                                                       style={{color:"blue"}}
                                                       onClick={this.props.redirecttocourse}
                                                 >查看作业反馈</Link>);
                else if(text1==="待提交")return (<Link to={'/studentcenter/myHomeWork/'+text2+'/'} 
                                                       style={{color:"blue"}}
                                                       onClick={this.props.redirecttocourse}
                                                 >提交作业</Link>);
                else return (<Link to={'/studentcenter/myHomeWork/'+text2+'/'} 
                                   style={{color:"blue"}}
                                   onClick={this.props.redirecttocourse}
                             >更新提交</Link>);
            }
        }]
        const data=this.state.assignmentInfo;
        return(
            <div>
                <br/>
                <Col xs={24} sm={{span:8,offset:16}} style={{left:"10%"}}>
                  <Select defaultValue="all" style={{ width: 200 }} onChange={this.changeValue}>
                   <Option value="all">显示全部作业</Option>
                   <Option value="underway">只显示尚可提交的作业</Option>
                   <Option value="end">只显示已结束提交的作业</Option>
                  </Select>
                </Col>
                <br/><br/>
                <Table columns={column} dataSource={data} bordered rowKey={record=>record["id"]} />
            </div>
        )
    }
} 

class Specificclass extends React.Component{
    constructor(props){
        super(props);
        this.state={
            specificCourse:{},//特定课程，为一个对象
        }
    }

    componentWillMount(){
       courseid=re.exec(window.location.pathname)[1];
       this.setState({
           specificCourse:_.filter(this.props.courselist,(info)=>{return info["id"]==courseid})
       })
    }

    componentWillReceiveProps(nextProps){
       if(JSON.stringify(_.filter(nextProps.courselist,(info)=>{return info["id"]==courseid}))!==
          JSON.stringify(_.filter(this.props.courselist,(info)=>{return info["id"]==courseid}))){
         this.setState({
            specificCourse:_.filter(nextProps.courselist,(info)=>{return info["id"]==courseid})
         })
       }
    }

    render(){
        const gridStyle={
            width:"33.3%",
            textAlign:'center',
            height:"125px"
        }
        const gridStyle2={
            width:"16.65%",
            textAlign:'center',
            height:"125px"
        }
        var courseTeacher=[];
        var courseAssistant=[];
        for(let i=0;i<this.state.specificCourse[0].teachers.length;i++){
            courseTeacher.push(
              <span key={i} style={{marginLeft:"5px",marginRight:"5px"}}>
                  {this.state.specificCourse[0].teachers[i]["name"]}
              </span>
            )
        }
        for(let i=0;i<this.state.specificCourse[0].teachingAssistants.length;i++){
          courseAssistant.push(
            <span key={i} style={{marginLeft:"5px",marginRight:"5px"}}>
                {this.state.specificCourse[0].teachingAssistants[i]["name"]}
            </span>
          )
        }
        return(
         <div>
           <Card hoverable>
              <Card.Grid style={gridStyle}>
                  <Col xs={24} sm={16} style={{left:"-15%",fontSize:"20px",fontWeight:"550"}}>{this.state.specificCourse[0]["name"]}</Col>
                  <Col xs={24} sm={6} style={{left:"-20%",fontSize:"20px"}}>{this.state.specificCourse[0].school}</Col>
                  <Col xs={24} sm={2} style={{left:"-10%",fontSize:"20px"}}>{this.state.specificCourse[0].students.length}人</Col>
                  <Col xs={24} sm={12} style={{left:"-10%",fontSize:"16px",marginTop:"15px"}}>教师: {courseTeacher}</Col>
                  <Col xs={24} sm={12} style={{left:"-10%",fontSize:"16px",marginTop:"15px"}}>助教: {courseAssistant}</Col>
              </Card.Grid>
              <Card.Grid style={gridStyle2}>
                <p style={{fontSize:"20px"}}>待提交作业数</p>
                <span style={{fontSize:"20px"}}>3</span>
              </Card.Grid>
              <Card.Grid style={gridStyle2}>
                <p style={{fontSize:"20px"}}>缺交作业数</p>
                <span style={{fontSize:"20px"}}>5</span>
              </Card.Grid>
              <Card.Grid style={gridStyle}>
                 <Col xs={24} sm={12}>
                   <Button type="primary">课程讨论区</Button>
                 </Col>
                 <Col xs={24} sm={12} style={{fontSize:"20px"}}>{this.state.specificCourse[0].marks}学分</Col>
                 <Col xs={24} sm={24} style={{fontSize:"20px",marginTop:"15px"}}>
                 时间:
                 <span style={{marginLeft:"10%"}}>
                 {toDate.exec(this.state.specificCourse[0].startTime)[1]+"."}
                 {toDate.exec(this.state.specificCourse[0].startTime)[2]+"."}
                 {toDate.exec(this.state.specificCourse[0].startTime)[3]+"--"}
                 {toDate.exec(this.state.specificCourse[0].endTime)[1]+"."}
                 {toDate.exec(this.state.specificCourse[0].endTime)[2]+"."}
                 {toDate.exec(this.state.specificCourse[0].endTime)[3]}
                 </span>
                 </Col>
              </Card.Grid>
           </Card>
           <SubmitHomework 
               courseId={this.state.specificCourse[0]["id"]} 
               userId={this.props.userinformation["id"]}
               redirecttocourse={this.props.redirecttocourse4}
            />
         </div>
        )
    }
}

export default Specificclass;