import React from 'react';
import ReactDOM from 'react-dom';
import {Row,Col,Card,Button,Modal,Menu,Select,Table,Form,Radio,message,Input,DatePicker,Upload,Icon} from'antd'
import './teacherSpecificClass.css';
import {_} from 'underscore'
import moment from 'moment';
import axios from 'axios';
import {Link} from 'react-router-dom';
var courseid;//特定课程的id
var courseStudents;//该课程的所有学生
var re=/^\/teachercenter\/teacherclass\/(.*)\/$/;
var re2=/^(.*)\+(.*)$/;
var toDate=/^(\d{4})\-(\d{2})\-(\d{2})(.*)$/;
var usernamechildren=[];//手动添加成员里通过搜索用户名的标签
var schoolIdchildren=[];//手动添加成员里通过搜索学号的标签
var lastUpdateUsername=[];//最后更新时用户名列表
var lastUpdateSchoolId=[];//最后更新时学号列表
var addfile=[];//上传文件的ID列表(布置作业时)
const Option = Select.Option;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const { TextArea } = Input;
function range(start, end) {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
}
function disabledDateTime() {
    return {
      disabledSeconds: () => range(1,60),
    };
}
const uploadProps = { //放进Upload组件里的一些属性
    name: 'data',
    action: "http://localhost:8000/upload_file/",
    headers: {
        token:localStorage.getItem('token'),
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 作业上传成功!`);
        addfile.push(info.file.response["id"]);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 作业上传失败.`);
      }
    },
    onRemove(file){
        return false;
    }
};
class AddAssignment extends React.Component{

    componentWillMount(){
        addfile=[];
    }

    handleSubmit=(e)=>{
        e.preventDefault();
        var that=this;
        this.props.form.validateFieldsAndScroll(["作业名称","作业描述","截止时间","作业类型"],(err,values)=>{
            if(!err){
                var createAssignment=axios.create({
                    url:"http://localhost:8000/graphql/",
                    headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
                    method:'post',
                    data:{
                      "query":`mutation{
                        createAssignment(
                          assignmentData:{
                            courseClass:${that.props.courseId},
                            assignmentType:"${values.作业类型}",
                            name:"${values.作业名称}",
                            description:"${values.作业描述}",
                            deadline:"${re2.exec(moment(values.截止时间).format())[1]}",
                            addfile:[${addfile}],
                          }
                        ){
                           ok
                        }
                      }`
                    },
                    timeout:1000,
                  })
                  createAssignment().then(function(response){
                    if(response.data.data.createAssignment.ok==true){
                      message.success('作业布置成功!',3);
                      that.props.changeflag();
                      setTimeout(that.props.handleClose,1000);
                     }else{
                      message.error('作业布置失败!',3);
                     }
                  })
                  .catch(function(error){
                    message.error('作业布置失败!',3);
                  })
                  this.props.form.resetFields();
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
              sm: { span: 16 },
            },
        };
        const config = {
            rules: [{ type: 'object', required: true, message: '请选择时间' }],
        };
        return(
            <Form onSubmit={this.handleSubmit}>
                <FormItem 
                 {...formItemLayout}
                 label="作业名称"
                >
                {getFieldDecorator('作业名称', {
                rules: [{
                  required: true, message: '请输入想要创建作业任务的名称!',whitespace:true
                }],
                 })(
                <Input/>
                )} 
                </FormItem>  
                <FormItem 
                  {...formItemLayout}
                  label="作业描述"
                >
                 {getFieldDecorator('作业描述', {
                 rules: [{
                   required: true, message: '作业描述不能为空!'
                 }],
                  })(
                 <TextArea rows={4}/>
                 )} 
                </FormItem>   
                <FormItem
                  {...formItemLayout}
                  label="作业类型"
                >
                 {getFieldDecorator('作业类型', {
                  rules: [{
                    required: true, message: '请选择作业类型!',
                  }],
                 })(
                  <RadioGroup >
                  <Radio value={"image"}>图片作业</Radio>
                  <Radio value={"docs"}>文件作业</Radio>
                  </RadioGroup>
                )}
                </FormItem> 
                <FormItem
                  {...formItemLayout}
                  label="文件上传"
                >
                  <Upload {...uploadProps}>
                    <Button>
                    <Icon type="upload" /> 上传想要附在作业要求上的文件
                    </Button>
                  </Upload>                 
                </FormItem>               
                <FormItem
                  {...formItemLayout}
                  label="作业提交截止时间"
                >
                 {getFieldDecorator('截止时间', config)(
                 <DatePicker showTime={{ defaultValue: moment('23:59', 'HH:mm') }} format="YYYY-MM-DD HH:mm" disabledTime={disabledDateTime} />
                )}
                </FormItem>   
                <FormItem
                 wrapperCol={{
                   xs: { span: 24, offset: 0 },
                   sm: { span: 16, offset: 8 },
                 }}
                >
                <Button type="primary" htmlType="submit">提交</Button>
                </FormItem>                 
            </Form>
        )
    }
}

const WrappedAddAssignment=Form.create()(AddAssignment);

class Homework extends React.Component{
    constructor(props){
        super(props);
        this.state={
            visible1:false,
            flag:false,//设置一个标志，当添加作业成功以后，这个标志会发生改变，然后调用componentWillUpdate来重新获取一遍当前作业任务列表
        }
    }

    componentWillMount(){
        var that=this;
        var getAllHomework=axios.create({
            url:"http://localhost:8000/graphql/",
            headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
            method:'post',
            data:{
               "query":`query{
                    getAssignmentsByCourses(courses:${[this.props.courseId]}){
                        id
                        name
                        assignmentType
                        deadline
                    }
                }`//用反引号      
            },
            timeout:1000,
        })
        getAllHomework().then(function(response){
           const assignments=response.data.data.getAssignmentsByCourses;
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
            url:"http://localhost:8000/graphql/",
            headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
            method:'post',
            data:{
               "query":`query{
                    getAssignmentsByCourses(courses:${[this.props.courseId]}){
                        id
                        name
                        assignmentType
                        deadline
                    }
                }`//用反引号      
            },
            timeout:1000,
        })
        getAllHomework().then(function(response){
           const assignments=response.data.data.getAssignmentsByCourses;
           nextState.assignmentInfo=assignments;//“变着法儿的调用setState”
        })
        .catch(function(error){
            console.log(error);
        })
        }
    }

    showModal=()=>{
        this.setState({visible1:true});
    }

    handleClose=()=>{
        this.setState({visible1:false});
    }

    changeflag=()=>{
        const flag=this.state.flag;
        this.setState({flag:!flag});
    }

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
            title:'点击进入批改',
            dataIndex:'id',
            render:(text)=>(<Link to={'/teachercenter/correctWork/'+text+'/'} 
                                  style={{color:"blue"}}
                                  onClick={this.props.redirecttocourse}
                            >
                            批改作业
                            </Link>
            ),
        },]
        const data=this.state.assignmentInfo;
        return(
            <div>
            <Button 
              type="primary" 
              onClick={this.showModal}
              disabled={(moment().isBefore(this.props.course[0].startTime,'day')||moment().isAfter(this.props.course[0].endTime,'day'))?true:false}
            >
              布置作业
            </Button>
            <br/><br/><br/><br/>
            <Table columns={column} dataSource={data} bordered rowKey={record=>record["id"]} />
            <Modal
                title="添加作业任务"
                visible={this.state.visible1}
                footer={null}
                onCancel={this.handleClose}
                style={{top:0}}
                destroyOnClose
            >
            <WrappedAddAssignment courseId={this.props.courseId} changeflag={this.changeflag} handleClose={this.handleClose}/>
            </Modal>
            </div>
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
        url:"http://localhost:8000/graphql/",
        headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
        method:'post',
        data:{
           "query":`query{
            getUsersByUsertype(usertype:"student")
             {
               username
             }
            }`      
        },
        timeout:1000,
      })
      getStudentsUsername().then(function(response){
        if(JSON.stringify(lastUpdateUsername)!==JSON.stringify(response.data.data.getUsersByUsertype)){
         lastUpdateUsername=response.data.data.getUsersByUsertype;
         for(let i=0;i<response.data.data.getUsersByUsertype.length;i++){
          usernamechildren.push(
          <Option key={response.data.data.getUsersByUsertype[i].username} value={response.data.data.getUsersByUsertype[i].username}>
          {response.data.data.getUsersByUsertype[i].username}
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
       this.props.triggerChange(username);
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

class SelectSchoolId extends React.Component{
    constructor(props){
        super(props);
        this.state={
          schoolIds:[],
        }
    }
  
    componentDidMount(){
      var getStudentsSchoolId=axios.create({
        url:"http://localhost:8000/graphql/",
        headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
        method:'post',
        data:{
           "query":`query{
            getUsersByUsertype(usertype:"student")
             {
                buptId
             }
            }`      
        },
        timeout:1000,
      })
      getStudentsSchoolId().then(function(response){
        if(JSON.stringify(lastUpdateSchoolId)!==JSON.stringify(response.data.data.getUsersByUsertype)){
         lastUpdateSchoolId=response.data.data.getUsersByUsertype;
         for(let i=0;i<response.data.data.getUsersByUsertype.length;i++){
          schoolIdchildren.push(
          <Option key={response.data.data.getUsersByUsertype[i].buptId} value={response.data.data.getUsersByUsertype[i].buptId}>
          {response.data.data.getUsersByUsertype[i].buptId}
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
       this.props.triggerChange(schoolId);
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
    triggerChange = (changedValue) => {
        const onChange = this.props.onChange;
        if (onChange) {
          onChange(changedValue);
        }
    }
    render(){
        if(this.props.selectvalue===1){return <SelectUsername value={this.props.value} triggerChange={this.triggerChange}/>;}
        else {return <SelectSchoolId value={this.props.value} triggerChange={this.triggerChange}/>;}
    }    
}

class Member extends React.Component{
    constructor(props){
        super(props);
        this.state={
            visible:false,
            value:1,//手动添加成员中多选框的value
            flag:false,
        }
    }

    componentWillMount(){
        var that=this;
        var getAllStudentInformation=axios.create({
            url:"http://localhost:8000/graphql/",
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

    componentWillUpdate(nextProps,nextState){
        if(nextState.flag!==this.state.flag){
            var getAllStudentInformation=axios.create({
                url:"http://localhost:8000/graphql/",
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
                nextState.studentsInformation=courseStudents;
                nextState.studentsNameRow=dataRow;
            })
            .catch(function(error){
                console.log(error);
            })
        }
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
        var that=this;
        this.props.form.validateFieldsAndScroll(["学生"],(err,values)=>{
        if(!err&&typeof(values.学生)!=="undefined"){
          var getAllStudentIdByUsername=axios.create({
            url:"http://localhost:8000/graphql/",
            headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
            method:'post',
            data:{
                "query":`query{
                    getUsersByUsernames(usernames:${[JSON.stringify(values.学生)]}){
                        id
                    }
                }`//用反引号      
            },
            timeout:1000,
          })
          var getAllStudentIdBySchoolId=axios.create({
            url:"http://localhost:8000/graphql/",
            headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
            method:'post',
            data:{
                "query":`query{
                    getUsersByBuptIds(buptIds:${JSON.stringify(values.学生)}){
                        id
                    }
                }`//用反引号      
            },
            timeout:1000,
          })
          var getStudentsIdInCourse=axios.create({
            url:"http://localhost:8000/graphql/",
            headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
            method:'post',
            data:{
                "query":`query{
                    getCoursesByIds(ids:${[this.props.courseId]}){
                        students{
                          id
                        }
                    }
                }`//用反引号      
            },
            timeout:1000,
          })
          if(this.state.value===1){
              getAllStudentIdByUsername().then(function(response1){
                  getStudentsIdInCourse().then(function(response2){
                  var addStudents=axios.create({
                    url:"http://localhost:8000/graphql/",
                    headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
                    method:'post',
                    data:{
                        "query":`mutation{
                            editCourse(
                                courseData:{
                                    id:${that.props.courseId},
                                    students:[${_.map(_.union(_.pluck(response1.data.data.getUsersByUsernames,'id'),_.pluck(response2.data.data.getCoursesByIds[0].students,'id')),function(num){return parseInt(num)})}],
                                }
                            ){
                             ok
                             msg
                            }
                        }`//用反引号      
                    },
                    timeout:1000,                     
                  })
                  addStudents().then(function(response3){
                      if(response3.data.data.editCourse.ok===true){
                          message.success("添加学生成功!",3);
                          const flag=that.state.flag;
                          that.setState({flag:!flag});                      
                      }
                      else message.error("添加学生失败!",3);
                  })
                  .catch(function(error3){
                      console.log(error3);
                      message.error("添加学生失败!",3);
                  })
                  })
                  .catch(function(error2){
                      console.log(error2);
                      message.error("添加学生失败!",3);
                  })
              })
              .catch(function(error1){
                  console.log(error1);
                  message.error("添加学生失败!",3);
              })
          }
          else{
            getAllStudentIdBySchoolId().then(function(response1){
                getStudentsIdInCourse().then(function(response2){
                    var addStudents=axios.create({
                      url:"http://localhost:8000/graphql/",
                      headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
                      method:'post',
                      data:{
                          "query":`mutation{
                              editCourse(
                                  courseData:{
                                      id:${that.props.courseId},
                                      students:[${_.map(_.union(_.pluck(response1.data.data.getUsersByBuptIds,'id'),_.pluck(response2.data.data.getCoursesByIds[0].students,'id')),function(num){return parseInt(num)})}],
                                  }
                              ){
                               ok
                               msg
                              }
                          }`//用反引号      
                      },
                      timeout:1000,                     
                    })
                    addStudents().then(function(response3){
                        if(response3.data.data.editCourse.ok===true){
                            message.success("添加学生成功!",3);
                            const flag=that.state.flag;
                            that.setState({flag:!flag});
                        }
                        else message.error("添加学生失败!",3);
                    })
                    .catch(function(error3){
                        console.log(error3);
                        message.error("添加学生失败!",3);
                    })
                    })
                    .catch(function(error2){
                        console.log(error2);
                        message.error("添加学生失败!",3);
                    })
            })
            .catch(function(error1){
                console.log(error1);
                message.error("添加学生失败!",3);
            })              
          }
          this.setState({visible:false});
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
                 <Radio value={2}>搜索学号</Radio>
              </RadioGroup>
              <br/><br/>
              <Form onSubmit={this.handleSubmit}>
                 <FormItem 
                   {...formItemLayout}
                   label=""
                 >
                   {getFieldDecorator('学生')(
                     <SelectStudents selectvalue={this.state.value}/>
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
         if(this.props["current"]=="homework")return <Homework courseId={this.props.courseId} redirecttocourse={this.props.redirecttocourse3} course={this.props.course}/>;
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
           specificCourse:_.filter(_.union(this.props.courselist,this.props.assistantcourselist),(info)=>{return info["id"]==courseid})
       })
    }

    componentWillReceiveProps(nextProps){
       if(JSON.stringify(_.filter(_.union(nextProps.courselist,nextProps.assistantcourselist),(info)=>{return info["id"]==courseid}))!==
          JSON.stringify(_.filter(_.union(this.props.courselist,this.props.assistantcourselist),(info)=>{return info["id"]==courseid}))){
         this.setState({
            specificCourse:_.filter(_.union(nextProps.courselist,nextProps.assistantcourselist),(info)=>{return info["id"]==courseid})
         })
       }
    }

    showQRCode=()=>{
        var that=this;
        var getQRCode=axios.create({
            url:"http://localhost:8000/data/get_qrcode/",
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
                <span style={{fontSize:"20px"}}>学生作业管理</span>
              </Menu.Item>
            </Menu>
            <HomeworkOrMember 
              current={this.state.current} 
              courseId={courseid} 
              redirecttocourse3={this.props.redirecttocourse3}
              course={this.state.specificCourse}/>
         </div>
        )
    }
}

export default TeacherSpecificclass;