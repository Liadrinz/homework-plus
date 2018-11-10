import React from 'react';
import ReactDOM from 'react-dom';
import {Row,Col,Card,Button,Modal,Menu,Select,Table,Form,Radio} from'antd'
import './teacherSpecificClass.css';
import {_} from 'underscore'
import axios from 'axios';
var courseid;//特定课程的id
var courseStudents;//该课程的所有学生
var re=/^\/teachercenter\/teacherclass\/(.*)\/$/;
var toDate=/^(\d{4})\-(\d{2})\-(\d{2})(.*)$/;
var usernamechildren=[];//手动添加成员里通过搜索用户名的标签
var namechildren=[];//手动添加成员里通过搜索真实姓名的标签
var schoolIdchildren=[];//手动添加成员里通过搜索学号的标签
var lastUpdateUsername=[];//最后更新时用户名列表
var lastUpdateName=[];//最后更新时真实姓名列表
var lastUpdateSchoolId=[];//最后更新时学号列表
const Option = Select.Option;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;

class Homework extends React.Component{
    render(){
        return(
            <span>hello world</span>
        )
    }
}

class SelectUsername extends React.Component{
    constructor(props){
        super(props);
        this.state={
          usernames:[],
        }
    }
  
    componentDidMount(){
      var getStudentsUsername=axios.create({
        url:"http://homeworkplus.cn/graphql/",
        headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
        method:'post',
        data:{
           "query":`query{
             allUsers
             {
               username
             }
            }`      
        },
        timeout:1000,
      })
      getStudentsUsername().then(function(response){
        if(JSON.stringify(lastUpdateUsername)!==JSON.stringify(response.data.data.allUsers)){
         lastUpdateUsername=response.data.data.allUsers;
         for(let i=0;i<response.data.data.allUsers.length;i++){
          usernamechildren.push(
          <Option key={response.data.data.allUsers[i].username} value={response.data.data.allUsers[i].username}>
          {response.data.data.allUsers[i].username}
          </Option>);
         }
        }
      })
      .catch(function(error){
         console.log(error);
      })
    }
  
    componentWillReceiveProps(nextProps) {
      if ('value' in nextProps) {
        const value = nextProps.value;
        this.setState({usernames:value});
      }
    }
  
    handleChange=(username)=>{
       if(!('value' in this.props)){
        this.setState({usernames:username});
       }
       this.triggerChange(username);
    }
  
    triggerChange = (changedValue) => {
      const onChange = this.props.onChange;
      if (onChange) {
        onChange(changedValue);
      }
    }
  
    render(){
        return(
          <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="通过用户名搜索，可以多选"
          onChange={this.handleChange}
          value={this.state.usernames}
        >
          {usernamechildren}
          </Select>
        )
    }
  }

class Selectname extends React.Component{
    constructor(props){
        super(props);
        this.state={
          names:[],
        }
    }
  
    componentDidMount(){
      var getStudentsname=axios.create({
        url:"http://homeworkplus.cn/graphql/",
        headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
        method:'post',
        data:{
           "query":`query{
             allUsers
             {
               name
             }
            }`      
        },
        timeout:1000,
      })
      getStudentsname().then(function(response){
        if(JSON.stringify(lastUpdateName)!==JSON.stringify(response.data.data.allUsers)){
        lastUpdateName=response.data.data.allUsers;
         for(let i=0;i<response.data.data.allUsers.length;i++){
          namechildren.push(
          <Option key={response.data.data.allUsers[i].name} value={response.data.data.allUsers[i].name}>
          {response.data.data.allUsers[i].name}
          </Option>);
         }
        }
      })
      .catch(function(error){
         console.log(error);
      })
    }
  
    componentWillReceiveProps(nextProps) {
      if ('value' in nextProps) {
        const value = nextProps.value;
        this.setState({names:value});
      }
    }
  
    handleChange=(name)=>{
       if(!('value' in this.props)){
        this.setState({names:name});
       }
       this.triggerChange(name);
    }
  
    triggerChange = (changedValue) => {
      const onChange = this.props.onChange;
      if (onChange) {
        onChange(changedValue);
      }
    }
  
    render(){
        return(
          <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="通过真实姓名搜索，可以多选"
          onChange={this.handleChange}
          value={this.state.names}
        >
          {namechildren}
          </Select>
        )
    }
}

class SelectSchoolId extends React.Component{
    constructor(props){
        super(props);
        this.state={
          schoolIds:[],
        }
    }
  
    componentDidMount(){
      var getStudentsSchoolId=axios.create({
        url:"http://homeworkplus.cn/graphql/",
        headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
        method:'post',
        data:{
           "query":`query{
             allUsers
             {
                classNumber
             }
            }`      
        },
        timeout:1000,
      })
      getStudentsSchoolId().then(function(response){
        if(JSON.stringify(lastUpdateSchoolId)!==JSON.stringify(response.data.data.allUsers)){
         lastUpdateSchoolId=response.data.data.allUsers;
         for(let i=0;i<response.data.data.allUsers.length;i++){
          schoolIdchildren.push(
          <Option key={response.data.data.allUsers[i].classNumber} value={response.data.data.allUsers[i].classNumber}>
          {response.data.data.allUsers[i].classNumber}
          </Option>);
         }
        }
      })
      .catch(function(error){
         console.log(error);
      })
    }
  
    componentWillReceiveProps(nextProps) {
      if ('value' in nextProps) {
        const value = nextProps.value;
        this.setState({schoolIds:value});
      }
    }
  
    handleChange=(schoolId)=>{
       if(!('value' in this.props)){
        this.setState({schoolIds:schoolId});
       }
       this.triggerChange(schoolId);
    }
  
    triggerChange = (changedValue) => {
      const onChange = this.props.onChange;
      if (onChange) {
        onChange(changedValue);
      }
    }
  
    render(){
        return(
          <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="通过学号搜索，可以多选"
          onChange={this.handleChange}
          value={this.state.schoolIds}
        >
          {schoolIdchildren}
          </Select>
        )
    }
}

class SelectStudents extends React.Component{
    render(){
        if(this.props.selectvalue===1){return <SelectUsername/>;}
        else if(this.props.selectvalue===2){return <Selectname/>;}
        else {return <SelectSchoolId/>;}
    }    
}

class Member extends React.Component{
    constructor(props){
        super(props);
        this.state={
            visible:false,
            value:1,//手动添加成员中多选框的value
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

    showModal=()=>{
        this.setState({visible:true});
    }

    handleClose=()=>{
        this.setState({visible:false});
    }

    onChange=(e)=>{
        this.setState({value:e.target.value});
    }

    handleSubmit=(e)=>{
        e.preventDefault();
        this.props.form.validateFieldsAndScroll(["学生"],(err,values)=>{
        console.log(typeof(values.学生))
        if(!err&&typeof(values.学生)!=="undefined"){
            console.log(values)
          var getAllStudentIdByUsername=axios.create({
            url:"http://homeworkplus.cn/graphql/",
            headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
            method:'post',
            data:{
                "query":`query{
                    getUsersByUsernames(usernames:${[values.学生]}){
                        id
                    }
                }`//用反引号      
            },
            timeout:1000,
          })
          var getAllStudentIdByName=axios.create({
            url:"http://homeworkplus.cn/graphql/",
            headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
            method:'post',
            data:{
                "query":`query{
                    getUsersByNames(names:${[values.学生]}){
                        id
                    }
                }`//用反引号      
            },
            timeout:1000,
          })
          var getAllStudentIdBySchoolId=axios.create({
            url:"http://homeworkplus.cn/graphql/",
            headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
            method:'post',
            data:{
                "query":`query{
                    getUsersByBuptIds(buptIds:${[values.学生]}){
                        id
                    }
                }`//用反引号      
            },
            timeout:1000,
          })
          if(this.state.value===1){
              getAllStudentIdByUsername().then(function(response){
                  console.log(response);
              })
              .catch(function(error){
                  console.log(error);
              })
          }
          else if(this.state.value===2){
              getAllStudentIdByName().then(function(response){
                  console.log(response);
              })
              .catch(function(error){
                  console.log(error);
              })
          }
          else{
            getAllStudentIdBySchoolId().then(function(response){
                console.log(response);
            })
            .catch(function(error){
                console.log(error);
            })              
          }
        }           
        })

    }

    render(){
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: {
              xs: { span: 24 },
              sm: { span: 8 },
            },
            wrapperCol: {
              xs: { span: 24 },
              sm: { span: 24 },
            },
        };
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
        const tips=(
            <div>
            <p style={{fontSize:"20px"}}>通过单选框的选择来搜索对应的学生并添加</p>
            </div>
        )
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
            <Button type="primary" onClick={this.showModal}>手动添加学生</Button>
            </Col>
            <Modal
                title="手动添加学生"
                visible={this.state.visible}
                footer={null}
                onCancel={this.handleClose}
                destroyOnClose={true}
            >
              <RadioGroup onChange={this.onChange} value={this.state.value}>
                 <Radio value={1}>搜索用户名</Radio>
                 <Radio value={2}>搜索真实姓名</Radio>
                 <Radio value={3}>搜索学号</Radio>
              </RadioGroup>
              <br/><br/>
              <Form onSubmit={this.handleSubmit}>
                 <FormItem 
                   {...formItemLayout}
                   label=""
                 >
                   {getFieldDecorator('学生')(
                     <SelectStudents selectvalue={this.state.value}/>//通过单选框的选项不同来对应不同的搜索标签
                   )} 
                 </FormItem>
                 <FormItem
                   wrapperCol={{
                     xs: { span: 24, offset: 0 },
                     sm: { span: 24, offset: 0 },
                   }}
                   help={tips}
                 >
                  <Button type="primary" htmlType="submit">添加</Button>
                 </FormItem>
              </Form>
            </Modal>
            <br/><br/><br/><br/>
            <Table columns={column} dataSource={data} bordered rowKey={record=>record["id"]} />
            </div>
        )
    }
}

const WrappedMember=Form.create()(Member);

class HomeworkOrMember extends React.Component{
    render(){
         if(this.props["current"]=="homework")return <Homework/>;
         else return <WrappedMember courseId={this.props.courseId}/>;
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