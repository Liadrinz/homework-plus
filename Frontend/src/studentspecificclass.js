import React from 'react';
import ReactDOM from 'react-dom';
import {Row,Col,Card,Button} from'antd'
import './studentspecificclass.css';
import {_} from 'underscore'
var courseid;//特定课程的id
var re=/^\/studentcenter\/class\/(.*)\/$/;
var toDate=/^(\d{4})\-(\d{2})\-(\d{2})(.*)$/;
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
        console.log(this.state.specificCourse)
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
                <p style={{fontSize:"20px"}}>待查看批改数</p>
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
         </div>
        )
    }
}

export default Specificclass;