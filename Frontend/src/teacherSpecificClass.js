import React from 'react';
import ReactDOM from 'react-dom';
import {Row,Col,Card,Button,Modal,Menu,Select,Table} from'antd'
import './teacherSpecificClass.css';
import {_} from 'underscore'
import axios from 'axios';
var courseid;//特定课程的id
var courseStudents;//该课程的所有学生
var re=/^\/teachercenter\/teacherclass\/(.*)\/$/;
var toDate=/^(\d{4})\-(\d{2})\-(\d{2})(.*)$/;
const Option = Select.Option;

class Homework extends React.Component{
    render(){
        return(
            <span>hello world</span>
        )
    }
}

class Member extends React.Component{
    constructor(props){
        super(props);
        this.state={
            
        }
    }

    componentWillMount(){
        var that=this;
        var getAllStudentInformation=axios.create({
            url:"http://homeworkplus.cn/graphql/",
            headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
            method:'post',
            data:{
               "query":`query{
                  getCoursesByIds(ids:${[this.props.courseId]}){
                      students{
                        id
                        name
                        buptId
                        gender
                        classNumber
                      }
                  }
                }`//用反引号      
            },
            timeout:1000,
        })
        getAllStudentInformation().then(function(response){
            var dataRow=[];//学生姓名列表
            courseStudents=response.data.data.getCoursesByIds[0].students;
            dataRow.push(<Option value='显示全部'>显示全部</Option>)
            for(var i=0;i<response.data.data.getCoursesByIds[0].students.length;i++){
                dataRow.push(
                    <Option value={response.data.data.getCoursesByIds[0].students[i]["name"]}>{response.data.data.getCoursesByIds[0].students[i]["name"]}</Option>
                )
            } 
            that.setState({
               studentsInformation:courseStudents,
               studentsNameRow:dataRow,
            })
        })
        .catch(function(error){
            console.log(error);
        })
    }

    handleSelect=(value)=>{
        if(value==='显示全部') this.setState({studentsInformation:courseStudents});
        else this.setState({studentsInformation:_.filter(courseStudents,function(student){return student["name"]===value})})
    }

    render(){
        const column=[{
            title:'姓名',
            dataIndex:'name',
        },{
            title:'性别',
            dataIndex:'gender',
            render:text=>text=="MALE"?'男':'女',
        },{
            title:'班级',
            dataIndex:'classNumber',
        },{
            title:'学号',
            dataIndex:'buptId',
        },{
            title:'平均成绩',
            dataIndex:'averageScore',
        },{
            title:'优秀作业',
            dataIndex:'goodHomework',
        },{
            title:'缺交作业',
            dataIndex:'lostHomework',
        }]
        const data=this.state.studentsInformation;
        return(
            <div>
            <br/><br/>
            <Col xs={24} sm={16}>
            搜索学生
            <Select
              showSearch
              style={{ width: 250 }}
              placeholder="搜索学生姓名,查询学生信息"
              optionFilterProp="children"
              onSelect={this.handleSelect}
            >
            {this.state.studentsNameRow}
            </Select>
            </Col>
            <Col xs={24} sm={8}>
            <Button type="primary">手动添加学生</Button>
            </Col>
            <br/><br/><br/><br/>
            <Table columns={column} dataSource={data} bordered rowKey={record=>record["id"]} />
            </div>
        )
    }
}

class HomeworkOrMember extends React.Component{
    render(){
         if(this.props["current"]=="homework")return <Homework/>;
         else return <Member courseId={this.props.courseId}/>;
    }
}

class TeacherSpecificclass extends React.Component{
    constructor(props){
        super(props);
        this.state={
            specificCourse:{},//特定课程，为一个对象
            qrcode:"",//加课二维码的地址
            visible1:false,//加课二维码对话框的开闭状态
            current:"homework",
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

    showQRCode=()=>{
        var that=this;
        var getQRCode=axios.create({
            url:"http://homeworkplus.cn/data/get_qrcode/",
            headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
            method:'post',
            data:{course_id:courseid},
            timeout:1000,
        })
        getQRCode().then(function(response){
            that.setState({visible1:true,qrcode:response.data.qrcode});
        })
        .catch(function(error){
            console.log(error);
            that.setState({visible1:true});
        })
    }

    handleClose=()=>{
        this.setState({visible1:false});
    }

    handleClick=(e)=>{
        this.setState({current:e.key});
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
                  <Col xs={24} sm={15} style={{left:"-15%",fontSize:"20px",fontWeight:"550"}}>{this.state.specificCourse[0]["name"]}</Col>
                  <Col xs={24} sm={6} style={{left:"-20%",fontSize:"20px"}}>{this.state.specificCourse[0].school}</Col>
                  <Col xs={24} sm={3} style={{left:"-10%",fontSize:"17px"}}>{this.state.specificCourse[0].students.length}人</Col>
                  <Col xs={24} sm={12} style={{left:"-10%",fontSize:"16px",marginTop:"15px"}}>教师: {courseTeacher}</Col>
                  <Col xs={24} sm={12} style={{left:"-10%",fontSize:"16px",marginTop:"15px"}}>助教: {courseAssistant}</Col>
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
              <Card.Grid style={gridStyle}>
                 <Button type="primary" onClick={this.showQRCode}>生成邀请二维码</Button>
                 <Modal
                   title="扫描课程二维码,加入课程"
                   visible={this.state.visible1}
                   footer={null}
                   onCancel={this.handleClose}
                 >
                 <img src={this.state.qrcode} alt="课程二维码"/>
                 </Modal>
              </Card.Grid>
           </Card>
           <Menu
              onClick={this.handleClick}
              selectedKeys={[this.state.current]}
              mode="horizontal"
           >
              <Menu.Item key="homework">
                <span style={{fontSize:"20px"}}>作业任务</span>
              </Menu.Item>
              <Menu.Item key="member">
                <span style={{fontSize:"20px"}}>成员列表</span>
              </Menu.Item>
            </Menu>
            <HomeworkOrMember current={this.state.current} courseId={courseid}/>
         </div>
        )
    }
}

export default TeacherSpecificclass;