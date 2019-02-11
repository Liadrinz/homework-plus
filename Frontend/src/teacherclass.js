import React from 'react';
import ReactDOM from 'react-dom';
import './teacherclass.css';
import {Row,Col,Button,Card,Select} from'antd'
import {Link} from 'react-router-dom';
import axios from 'axios';
import {_} from 'underscore'
import moment from 'moment'
const Option=Select.Option;
var toDate=/^(\d{4})\-(\d{2})\-(\d{2})(.*)$/;
var classRow=[];//课程班显示在网页卡片上的列表
const gridStyle={
  width:"33.3%",
  textAlign:'center',
}
const gridStyle2={
  width:"100%",
  textAlign:'center',
}

class Teacherclass extends React.Component{
    constructor(props){
      super(props);
      this.state={
        selectValue:"underway",//课程筛选
        closedcourse:[],//已结束或未开始的课程的ID列表
        underwaycourse:[],//正在进行中的课程的ID列表
      }
    }

    changeValue=(value)=>{
      this.setState({selectValue:value});
    }

    componentWillMount(){
      let closedcourse=[];
      let underwaycourse=[];
      classRow=[];//原有的classRow列表清空
      for(let i=0;i<this.props.courselist.length;i++){
        var courseTeacher=[];
        var courseAssistant=[];
        if(moment().isBefore(this.props.courselist[i].startTime,"day")||moment().isAfter(this.props.courselist[i].endTime,"day")){
          closedcourse.push(this.props.courselist[i]["id"]);
        }else underwaycourse.push(this.props.courselist[i]["id"]);
        for(let j=0;j<this.props.courselist[i].teachers.length;j++){
            courseTeacher.push(
              <span key={j} style={{marginLeft:"5px",marginRight:"5px"}}>
                  {this.props.courselist[i].teachers[j]["name"]}
              </span>
            )
        }
        for(let j=0;j<this.props.courselist[i].teachingAssistants.length;j++){
          courseAssistant.push(
            <span key={j} style={{marginLeft:"5px",marginRight:"5px"}}>
                {this.props.courselist[i].teachingAssistants[j]["name"]}
            </span>
          )
        }
        classRow.push(
          <Col key={this.props.courselist[i]["id"]} xs={24} sm={12}>
          <Card title={
            <span>
            <Row>
              <Col xs={24} sm={8}>{this.props.courselist[i]["name"]}</Col>
              <Col xs={24} sm={8} style={{left:"15%"}}>{this.props.courselist[i].students.length}人</Col>
              <Col xs={24} sm={8} style={{left:"15%"}}>{this.props.courselist[i].marks}学分</Col>
              <Col xs={24} sm={8}>教师: {courseTeacher}</Col>
              <Col xs={24} sm={8} style={{left:"10%"}}>助教: {courseAssistant}</Col>
            </Row>
            <Row>
              <Col xs={24} sm={8} >开课学院: {this.props.courselist[i].school}</Col> 
              <Col xs={24} sm={8} style={{left:"10%"}}>
              时间: 
              <span style={{marginLeft:"10%"}}>
              {toDate.exec(this.props.courselist[i].startTime)[1]+"."}
              {toDate.exec(this.props.courselist[i].startTime)[2]+"."}
              {toDate.exec(this.props.courselist[i].startTime)[3]+"--"}
              {toDate.exec(this.props.courselist[i].endTime)[1]+"."}
              {toDate.exec(this.props.courselist[i].endTime)[2]+"."}
              {toDate.exec(this.props.courselist[i].endTime)[3]}
              </span>
              </Col>
            </Row> 
            </span>
          } 
          style={{marginLeft:"20px",marginRight:"20px",marginBottom:"20px"}}
          hoverable="true">
          <Card.Grid style={gridStyle2}>
          <Link to={'/teachercenter/teacherclass/'+this.props.courselist[i]["id"]+'/'} 
                style={{color:"black"}}
                onClick={this.props.redirecttocourse2}
          > 
            <span style={{fontSize:"25px"}}>
            更多历史作业任务....
            </span>
          </Link>
          </Card.Grid>
          </Card>
          </Col>             
         )
     }
     this.setState({closedcourse:closedcourse,underwaycourse:underwaycourse});
    }

    componentWillReceiveProps(nextProps){
      if(nextProps.courselist!==this.props.courselist){
        let closedcourse=[];
        let underwaycourse=[];
        classRow=[];//原有的classRow列表清空
        for(let i=0;i<nextProps.courselist.length;i++){
          var courseTeacher=[];
          var courseAssistant=[];
          if(moment().isBefore(nextProps.courselist[i].startTime,"day")||moment().isAfter(nextProps.courselist[i].endTime,"day")){
            closedcourse.push(nextProps.courselist[i]["id"]);
          }else underwaycourse.push(nextProps.courselist[i]["id"]);
          for(let j=0;j<nextProps.courselist[i].teachers.length;j++){
              courseTeacher.push(
                <span key={j} style={{marginLeft:"5px",marginRight:"5px"}}>
                    {nextProps.courselist[i].teachers[j]["name"]}
                </span>
              )
          }
          for(let j=0;j<nextProps.courselist[i].teachingAssistants.length;j++){
            courseAssistant.push(
              <span key={j} style={{marginLeft:"5px",marginRight:"5px"}}>
                  {nextProps.courselist[i].teachingAssistants[j]["name"]}
              </span>
            )
          }
          classRow.push(
            <Col key={nextProps.courselist[i]["id"]} xs={24} sm={12}>
            <Card title={
              <span>
              <Row>
                <Col xs={24} sm={8}>{nextProps.courselist[i]["name"]}</Col>
                <Col xs={24} sm={8} style={{left:"15%"}}>{nextProps.courselist[i].students.length}人</Col>
                <Col xs={24} sm={8} style={{left:"15%"}}>{nextProps.courselist[i].marks}学分</Col>
                <Col xs={24} sm={8}>教师: {courseTeacher}</Col>
                <Col xs={24} sm={8} style={{left:"10%"}}>助教: {courseAssistant}</Col>
              </Row>
              <Row>
                <Col xs={24} sm={8} >开课学院: {nextProps.courselist[i].school}</Col> 
                <Col xs={24} sm={8} style={{left:"10%"}}>
                时间: 
                <span style={{marginLeft:"10%"}}>
                {toDate.exec(nextProps.courselist[i].startTime)[1]+"."}
                {toDate.exec(nextProps.courselist[i].startTime)[2]+"."}
                {toDate.exec(nextProps.courselist[i].startTime)[3]+"--"}
                {toDate.exec(nextProps.courselist[i].endTime)[1]+"."}
                {toDate.exec(nextProps.courselist[i].endTime)[2]+"."}
                {toDate.exec(nextProps.courselist[i].endTime)[3]}
                </span>
                </Col>
              </Row> 
              </span>
            } 
            style={{marginLeft:"20px",marginRight:"20px",marginBottom:"20px"}}
            hoverable="true">
            <Card.Grid style={gridStyle2}>
            <Link to={'/teachercenter/teacherclass/'+nextProps.courselist[i]["id"]+'/'} 
                  style={{color:"black"}}
                  onClick={nextProps.redirecttocourse2}
            > 
              <span style={{fontSize:"25px"}}>
              更多历史作业任务....
              </span>
            </Link>
            </Card.Grid>
            </Card>
            </Col>             
           )
       }
       this.setState({closedcourse:closedcourse,underwaycourse:underwaycourse});        
      }
    }

    render(){
      var classRow2=classRow;
      if(this.state.selectValue==="underway"){
        classRow2=_.filter(classRow,(course)=>{return this.state.underwaycourse.indexOf(course.key)!==-1});
      }else if(this.state.selectValue==="end"){
        classRow2=_.filter(classRow,(course)=>{return this.state.closedcourse.indexOf(course.key)!==-1});
      }
        return(
            <div>
            <div style={{fontSize:"28px",marginLeft:"20px",marginTop:"10px",marginBottom:"5px"}}>概览</div>
            <Card hoverable="true" style={{marginLeft:"20px",marginRight:"20px"}}>
              <Card.Grid style={gridStyle}>
              <p style={{fontSize:"20px"}}>我拥有以及作为助教加入的课程班:</p>
              <span style={{fontSize:'30px'}}>{this.props.courselist.length}  </span>
              个
              </Card.Grid>
              <Card.Grid style={gridStyle}>
              <p style={{fontSize:"20px"}}>正在进行的课程班:</p>
              <span style={{fontSize:'30px'}}>{this.state.underwaycourse.length}  </span>
              个
              </Card.Grid>
              <Card.Grid style={gridStyle}>
              <p style={{fontSize:"20px"}}>已结束或未开始的课程班:</p>
              <span style={{fontSize:'30px'}}>{this.state.closedcourse.length}  </span>
              个
              </Card.Grid>
            </Card>
            <br/>
            <Row>
              <Col xs={24} sm={8}>
                <span style={{fontSize:"28px",marginLeft:"20px",marginTop:"20px",marginBottom:"20px"}}>我的课程班</span>
              </Col>
              <Col xs={24} sm={{span:8,offset:8}} style={{left:"10%"}}>
                <Select defaultValue="underway" style={{ width: 200 }} onChange={this.changeValue}>
                  <Option value="underway">只显示进行中课程</Option>
                  <Option value="end">只显示已结束或未开始课程</Option>
                  <Option value="all">全选</Option>
                </Select>
              </Col>   
            </Row>
            <br/>
            <Row gutter={16}>
              {classRow2}
            </Row>
             <br/><br/><br/><br/><br/><br/><br/><br/>
            </div>
        )
    }
}
export default Teacherclass;