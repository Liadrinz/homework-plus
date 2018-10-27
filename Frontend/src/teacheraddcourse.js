import React from 'react';
import ReactDOM from 'react-dom';
import './teacheraddcourse.css';
import {Row,Col,Button,Form,Input,Select,DatePicker,InputNumber,message} from 'antd';
import axios from 'axios';
import {_} from 'underscore';

const FormItem = Form.Item;
const Option=Select.Option;
const RangePicker = DatePicker.RangePicker;
const { TextArea } = Input;
const children1=[];//教师选项列表
const children2=[];//助教选项列表
var lastUpdateteachersusername=[];//最后更新时教师的名字列表
var lastUpdateassistantsusername=[];//最后更新时助教的名字列表
var defaultteacher;//SelectTeacher的默认值

class SelectTeacher extends React.Component{
    constructor(props){
        super(props);
        defaultteacher= props.value[0];
        this.state={
          teachersUsername:this.props.value[0],
        }
    }

    componentDidMount(){
      var getTeachersusername=axios.create({
        url:"http://homeworkplus.cn/graphql/",
        headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
        method:'post',
        data:{
           "query":`query{
             getUsersByUsertype(usertype:"teacher")
             {
               username
             }
            }`      
        },
        timeout:1000,
      })
      getTeachersusername().then(function(response){
        if(JSON.stringify(lastUpdateteachersusername)!==JSON.stringify(response.data.data.getUsersByUsertype)){
         lastUpdateteachersusername=response.data.data.getUsersByUsertype;
         for(let i=0;i<response.data.data.getUsersByUsertype.length;i++){
          children1.push(
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
        this.setState({teachersUsername:value});
      }
    }

    handleChange=(teachersUsername)=>{
       if(!('value' in this.props)){
        this.setState({teachersUsername:teachersUsername});
       }
       this.triggerChange(teachersUsername);
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
          placeholder="请选择授课的教师，可以多选"
          defaultValue={defaultteacher}
          onChange={this.handleChange}
          value={this.state.teachersUsername}
        >
          {children1}
          </Select>
        )
    }
}

class SelectAssistant extends React.Component{
  constructor(props){
      super(props);
      this.state={
        assistantsUsername:[],
      }
  }

  componentDidMount(){
    var getAssistantsusername=axios.create({
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
    getAssistantsusername().then(function(response){
      if(JSON.stringify(lastUpdateassistantsusername)!==JSON.stringify(response.data.data.allUsers)){
       lastUpdateassistantsusername=response.data.data.allUsers;
       for(let i=0;i<response.data.data.allUsers.length;i++){
        children2.push(
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
      this.setState({assistantsUsername:value});
    }
  }

  handleChange=(assistantsUsername)=>{
     if(!('value' in this.props)){
      this.setState({assitantsUsername:assistantsUsername});
     }
     this.triggerChange(assistantsUsername);
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
        placeholder="请选择助教，可以多选"
        onChange={this.handleChange}
        value={this.state.assistantsUsername}
      >
        {children2}
        </Select>
      )
  }
}

class Addcourse extends React.Component{

    checkteachersname=(rule,value,callback)=>{
      if(value.length==0){
        callback("授课教师的数量不能为零!");
      }
      callback();
    }

    handleSubmit=(e)=>{
        e.preventDefault();
        this.props.form.validateFieldsAndScroll(["课程名称","授课教师","开课学院","助教","开课时间","学分","课程简介"],(err,values)=>{
          console.log(values)
          if(!err){
            const value={
              ...values,
              "开课时间":[values.开课时间[0].format('YYYY-MM-DD'), values.开课时间[1].format('YYYY-MM-DD')],
            }
            var getTeachersId=axios.create({
              url:"http://homeworkplus.cn/graphql/",
              headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
              method:'post',
              data:{
                "query":`query{
                   getUsersByUsernames(usernames:${JSON.stringify(value.授课教师)})
                   {
                     id
                   }
                }`
              },
              timeout:1000,
            })
            if(typeof(value.助教)=="undefined"){
              value.助教=[];
            }
            var getAssistantsId=axios.create({
              url:"http://homeworkplus.cn/graphql/",
              headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
              method:'post',
              data:{
                "query":`query{
                   getUsersByUsernames(usernames:${JSON.stringify(value.助教)})
                   {
                     id
                   }
                }`
              },
              timeout:1000,
            })
            axios.all([getTeachersId(),getAssistantsId()])
            .then(axios.spread(function(teacher,assistant){
              value.授课教师=_.pluck(teacher.data.data.getUsersByUsernames,'id');
              value.助教=_.pluck(assistant.data.data.getUsersByUsernames,'id');
              var createcourse=axios.create({
                url:"http://homeworkplus.cn/graphql/",
                headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
                method:'post',
                data:{
                  "query":`mutation{
                    createCourse(
                      courseData:{
                        name:"${value.课程名称}",
                        description:"${value.课程简介}",
                        marks:${value.学分},
                        teachers:[${value.授课教师}],
                        teachingAssistants:[${value.助教}],
                        school:"${value.开课学院}",
                        startTime:"${value.开课时间[0]+"T00:00:00+00:00"}",
                        endTime:"${value.开课时间[1]+"T00:00:00+00:00"}",
                      }
                    ){
                       ok
                    }
                  }`
                },
                timeout:1000,
              })
              createcourse().then(function(response){
                if(response.data.data.createCourse.ok==true){
                  message.success('课程创建成功!',3);
                 }else{
                  message.error('课程创建失败!',3);
                 }
              })
              .catch(function(error){
                message.error('课程创建失败!',3);
              })
            }))
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
        const rangeConfig = {
          rules: [{ type: 'array', required: true, message: '请选择时间!' }],
        };
        const tips=(
          <div>
          <p style={{fontSize:"20px"}}>请谨慎选择开始时间与结束时间!</p>
          <p style={{fontSize:"20px"}}>过了结束时间的课程无法再布置作业</p>
          </div>
        )
        return(
          <div>
            <div style={{fontSize:"28px",marginLeft:"20px",marginTop:"10px",marginBottom:"5px"}}>新建课程</div>
            <Form onSubmit={this.handleSubmit}>
            <Row gutter={200}>
             <Col xs={24} sm={11}>
               <FormItem 
                 {...formItemLayout}
                 label="课程名称"
               >
                {getFieldDecorator('课程名称', {
                rules: [{
                  required: true, message: '请输入想要创建课程的名称!',whitespace:true
                }],
                 })(
                <Input/>
                )} 
                </FormItem>
             </Col>
             <Col xs={24} sm={11}>
               <FormItem 
                 {...formItemLayout}
                 label="授课教师"
               >
                {getFieldDecorator('授课教师', {
                initialValue:[this.props.userinformation.username],
                rules:[{
                    validator:this.checkteachersname,
                }],
                 })(
                <SelectTeacher/>
                )} 
                </FormItem>
             </Col>
            </Row>
            <Row gutter={200}>
              <Col xs={24} sm={11}>
               <FormItem 
                 {...formItemLayout}
                 label="开课学院"
               >
                {getFieldDecorator('开课学院', {
                rules: [{
                  required: true, message: '开课学院不能为空!',whitespace:true
                }],
                 })(
                <Input/>
                )} 
                </FormItem>
              </Col>
              <Col xs={24} sm={11}>
               <FormItem 
                 {...formItemLayout}
                 label="助教"
               >
                {getFieldDecorator('助教')(
                <SelectAssistant/>
                )} 
                </FormItem>
             </Col>
            </Row>
            <Row gutter={200}>
              <Col xs={24} sm={11}>
                 <FormItem
                  {...formItemLayout}
                   label="开课时间"
                  >
                   {getFieldDecorator('开课时间', rangeConfig)(
                    <RangePicker />
                   )}
                  </FormItem>
              </Col>
              <Col xs={24} sm={11}>
                <FormItem 
                  {...formItemLayout}
                  label="学分"
                >
                 {getFieldDecorator('学分', {
                 initialValue:0,
                 rules: [{
                   required: true, message: '学分不能为空!',type:"number"
                 }],
                  })(
                 <InputNumber min={0} max={15} step={0.1}/>
                 )} 
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={18}>
              <FormItem 
                  {...formItemLayout}
                  label="课程简介"
                >
                 {getFieldDecorator('课程简介', {
                 rules: [{
                   required: true, message: '课程简介不能为空!'
                 }],
                  })(
                 <TextArea rows={8}/>
                 )} 
                </FormItem>
              </Col>
            </Row>
               <FormItem
                 wrapperCol={{
                   xs: { span: 24, offset: 0 },
                   sm: { span: 16, offset: 8 },
                 }}
                 help={tips}
               >
                <Button type="primary" htmlType="submit">提交</Button>
               </FormItem>
            </Form>
          </div> 
        )
    }
}

const WrappedAddcourse=Form.create()(Addcourse);
export default WrappedAddcourse