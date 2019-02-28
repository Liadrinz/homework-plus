import React from 'react';
import ReactDOM from 'react-dom';
import {Row,Col,Card,Button,Modal,Menu,Select,Table,Form,Radio,message,Input,DatePicker,Upload,Icon,Tag,InputNumber} from'antd'
import './teacherSpecificClass.css';
import {_} from 'underscore'
import moment from 'moment';
import axios from 'axios';
import weburl from './url.js';
import timeout from './timeout.js'
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
    action: weburl+"/upload_file/",
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
                    url:weburl+"/graphql/",
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
                    timeout:timeout,
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
            url:weburl+"/graphql/",
            headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
            method:'post',
            data:{
               "query":`query{
                    getAssignmentsByCourses(courses:${[this.props.courseId]}){
                        id
                        name
                        assignmentType
                        description
                        deadline
                    }
                }`//用反引号      
            },
            timeout:timeout,
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
            url:weburl+"/graphql/",
            headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
            method:'post',
            data:{
               "query":`query{
                    getAssignmentsByCourses(courses:${[this.props.courseId]}){
                        id
                        name
                        assignmentType
                        description
                        deadline
                    }
                }`//用反引号      
            },
            timeout:timeout,
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
        url:weburl+"/graphql/",
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
        timeout:timeout,
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
        url:weburl+"/graphql/",
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
        timeout:timeout,
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

class CheckDetail extends React.Component{
  constructor(props){
    super(props);
    this.state={
      assignments:[],
      total:0,
    }
  }

  componentWillMount(){
    let length1=this.props.assignment.length;
    let assignments=[];
    let total=0;
    for(let i=0;i<length1;i++){
      let length2=this.props.assignment[i].assignmentSubmissions.length;
      for(let j=0;j<length2;j++){
        if(this.props.assignment[i].assignmentSubmissions[j].submitter["id"]===this.props.studentInfo[0]["id"]){
           assignments.push(this.props.assignment[i].assignmentSubmissions[j]);break;
        }
      }
    }
    length1=this.props.totalInfo.length;
    for(let i=0;i<length1;i++){
      if(this.props.totalInfo[i].student["id"]===this.props.studentInfo[0]["id"]){
        total=this.props.totalInfo[i].average;break;
      }
    }
    this.setState({assignments:assignments,total:total});
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.assignment!==this.props.assignment){
    let length1=nextProps.assignment.length;
    let assignments=[];
    for(let i=0;i<length1;i++){
      let length2=nextProps.assignment[i].assignmentSubmissions.length;
      for(let j=0;j<length2;j++){
        if(nextProps.assignment[i].assignmentSubmissions[j].submitter["id"]===nextProps.studentInfo[0]["id"]){
           assignments.push(nextProps.assignment[i].assignmentSubmissions[j]);break;
        }
      }
    }
    this.setState({assignments:assignments});
   }
    if(nextProps.totalInfo!==this.props.totalInfo){
      let length1=nextProps.totalInfo.length;
      let total=0;
      for(let i=0;i<length1;i++){
        if(nextProps.totalInfo[i].student["id"]===nextProps.studentInfo[0]["id"]){
          total=nextProps.totalInfo[i].average;break;
        }
      }
      this.setState({total:total});
    }
  }

  render(){
    const data=[];
    let length=this.state.assignments.length;
    if(length===0)return(
      <div>
        <div>
        <span style={{fontSize:"25px",marginLeft:"5vw"}}>{this.props.studentInfo[0].name+"  的作业"}</span>
        <span style={{fontSize:"18px",marginLeft:"5vw"}}>作业总成绩:0分</span>
        </div>
        <br/><br/><br/>
        <span style={{fontSize:"25px",marginLeft:"5vw",color:"blue"}}>该学生的所有作业可能未交</span>
      </div>
    )
    for(let i=0;i<length;i++){
      data.push(
        <div>
          <span style={{fontSize:"20px",marginLeft:"3vw"}}>{this.state.assignments[i].assignment.name}</span> 
          <span style={{fontSize:"18px",marginLeft:"5vw"}}>{"作业分数:  "+this.state.assignments[i].score.toFixed(1)+" 分"}</span>
          <Tag style={{marginLeft:"5vw"}}color={this.state.assignments[i].isExcellent?"gold":"cyan"}>{this.state.assignments[i].isExcellent?"优秀作业":"普通作业"}</Tag>
          <br/><br/>
        </div>  
      )
    }
    return(
      <div>
        <div>
        <span style={{fontSize:"25px",marginLeft:"5vw"}}>{this.props.studentInfo[0].name+"  的作业"}</span>
        <span style={{fontSize:"18px",marginLeft:"5vw"}}>{"作业总成绩:  "+this.state.total.toFixed(1)+" 分"}</span>
        </div>       
        <br/><br/>
        {data}
      </div>
    )
  }
}

class Eachweight extends React.Component{
  onChange=(value)=>{
     var that=this; 
     this.props.changeWeight(value,that.props.weightId);
  }

  render(){
    return(
    <InputNumber 
            style={{marginLeft:"2vw"}} min={0} step={0.01} 
            defaultValue={this.props.weight} onChange={this.onChange}/>
    )
  }
}

class Setweight extends React.Component{
  constructor(props){
    super(props);
    this.state={
      assignments:[],
      weights:[],
      assignmentsName:[],
    }
  }

  componentWillMount(){
    var that=this;
    var getAssignmentsWeight=axios.create({
        url:weburl+"/graphql/",
        headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
        method:'post',
        data:{
           "query":`query{
              getCoursesByIds(ids:${[this.props.courseId]}){
                  courseAssignments{
                     name
                     id
                     weight
                  }
              }
            }`//用反引号      
        },
        timeout:timeout,
    })    
    getAssignmentsWeight().then(function(response){
      let info=response.data.data.getCoursesByIds[0].courseAssignments;
      that.setState({
        assignments:_.pluck(info,'id'),weights:_.pluck(info,"weight"),assignmentsName:_.pluck(info,"name"),
      })
    })
    .catch(function(error){
      console.log(error);
    })
  }

  changeWeight=(weight,id)=>{
     if(weight!==this.state.weights[id]){
        let weights=this.state.weights;
        weights[id]=weight;
        this.setState({weights:weights});
     }
  }

  handleSubmit=()=>{
    var that=this;
    var setWeights=axios.create({
      url:weburl+"/graphql/",
      headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
      method:'post',
      data:{
         "query":`mutation{
            setWeight(weightData:{
               assignments:[${this.state.assignments}],
               weights:[${this.state.weights}]
            })
            {
               ok
               msg
            }
          }`//用反引号      
      },
      timeout:timeout,
    }) 
    setWeights().then(function(response){
      if(response.data.data.setWeight.ok===true){
        message.success("权重修改成功!",3);
        setTimeout(()=>{
          that.props.changeFlag();
        },2000);
      }else message.error("权重修改失败!",3); 
    })    
    .catch(function(error){
      message.error("权重修改失败!",3); 
    })   
  }

  render(){
    if(this.state.assignments.length===0){
      return(<div/>);
    }
    let length=this.state.assignments.length;
    let data=[];
    for(let i=0;i<length;i++){
      data.push(
        <div key={i}>
          <span style={{fontSize:"18px",marginLeft:"2vw"}}>{this.state.assignmentsName[i]+"  的权:"}</span>
          <Eachweight key={i} weight={this.state.weights[i]} weightId={i} changeWeight={this.changeWeight}/>
          <br/><br/>
        </div>
      )
    }
    return(
      <div>
        <div style={{fontSize:"16px",marginLeft:"2vw"}}>在没设置权重之前，作业总分默认是几次作业分数的平均分</div>
        <div style={{fontSize:"16px",marginLeft:"2vw"}}>作业权重可以加权平均(权重之和等于1)</div>
        <div style={{fontSize:"16px",marginLeft:"2vw"}}>也可以加权累积(权重之和大于1)</div>
        <br/>
        <div style={{fontSize:"20px",marginLeft:"2vw"}}>权重选择:</div>
        <br/>
        {data}
        <Button type="primary" style={{marginLeft:"40%"}} onClick={this.handleSubmit}>改变权重</Button>
        <br/>
      </div>
    )
  }
}

const WrappedSetweight=Form.create()(Setweight);

class Member extends React.Component{
    constructor(props){
        super(props);
        this.state={
            visible:false,
            visible2:false,
            visible3:false,
            value:1,//手动添加成员中多选框的value
            selectedRowKey:[],
            flag:false,
        }
    }

    componentWillMount(){
        var that=this;
        var getAllStudentInformation=axios.create({
            url:weburl+"/graphql/",
            headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
            method:'post',
            data:{
               "query":`query{
                  getCoursesByIds(ids:${[this.props.courseId]}){
                      courseTotalMarks{
                        student{
                          id
                        }
                        average
                      }
                      courseAssignments{
                        assignmentSubmissions{
                          score
                          isExcellent
                          assignment{
                            name
                          }
                          submitter{
                            id
                          }
                        }
                      }
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
            timeout:timeout,
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
            let length1=courseStudents.length;
            for(let i=0;i<length1;i++) _.extend(courseStudents[i],{score:0});
            for(let i=0;i<length1;i++){
              let length2=response.data.data.getCoursesByIds[0].courseTotalMarks.length;
              for(let j=0;j<length2;j++){
                if(response.data.data.getCoursesByIds[0].courseTotalMarks[j].student["id"]===courseStudents[i]["id"]){
                  courseStudents[i].score=response.data.data.getCoursesByIds[0].courseTotalMarks[j].average.toFixed(1);break;
                }
              }
            }
            that.setState({
               studentsInformation:courseStudents,
               studentsNameRow:dataRow,
               totalInfo:response.data.data.getCoursesByIds[0].courseTotalMarks,
               assignment:response.data.data.getCoursesByIds[0].courseAssignments,
            })
        })
        .catch(function(error){
            console.log(error);
        })
    }

    componentWillUpdate(nextProps,nextState){
        if(nextState.flag!==this.state.flag){
            var getAllStudentInformation=axios.create({
                url:weburl+"/graphql/",
                headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
                method:'post',
                data:{
                   "query":`query{
                      getCoursesByIds(ids:${[this.props.courseId]}){
                          courseTotalMarks{
                            student{
                            id
                            }
                            average
                          }
                          courseAssignments{
                            assignmentSubmissions{
                              score
                              isExcellent
                              assignment{
                                name
                              }
                              submitter{
                                id
                              }
                            }
                          }
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
                timeout:timeout,
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
                let length1=courseStudents.length;
                for(let i=0;i<length1;i++) _.extend(courseStudents[i],{score:0});
                for(let i=0;i<length1;i++){
                  let length2=response.data.data.getCoursesByIds[0].courseTotalMarks.length;
                  for(let j=0;j<length2;j++){
                    if(response.data.data.getCoursesByIds[0].courseTotalMarks[j].student["id"]===courseStudents[i]["id"]){
                      courseStudents[i].score=response.data.data.getCoursesByIds[0].courseTotalMarks[j].average.toFixed(1);break;
                    }
                  }
                }
                nextState.studentsInformation=courseStudents;
                nextState.studentsNameRow=dataRow;
                nextState.totalInfo=response.data.data.getCoursesByIds[0].courseTotalMarks;
                nextState.assignment=response.data.data.getCoursesByIds[0].courseAssignments;
            })
            .catch(function(error){
                console.log(error);
            })
        }
    }

    handleSelect=(value)=>{
        if(value==='显示全部') this.setState({studentsInformation:courseStudents});
        else{
           let info=_.filter(courseStudents,function(student){return student["name"]===value});
           this.setState({studentsInformation:info,selectedRowKey:[info[0]["id"]]});
        }
    }

    showModal=()=>{
        this.setState({visible:true});
    }

    showModal2=()=>{
      this.setState({visible2:true});
    }

    showModal3=()=>{
      this.setState({visible3:true});
    }

    handleClose=()=>{
        this.setState({visible:false});
    }

    handleClose2=()=>{
      this.setState({visible2:false});
    }

    handleClose3=()=>{
      this.setState({visible3:false});
    }

    changeFlag=()=>{
      let flag=this.state.flag;
      this.setState({flag:!flag});
    }

    handleChange=(selectedRowKeys)=>{
        this.setState({selectedRowKey:selectedRowKeys});
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
            url:weburl+"/graphql/",
            headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
            method:'post',
            data:{
                "query":`query{
                    getUsersByUsernames(usernames:${[JSON.stringify(values.学生)]}){
                        id
                    }
                }`//用反引号      
            },
            timeout:timeout,
          })
          var getAllStudentIdBySchoolId=axios.create({
            url:weburl+"/graphql/",
            headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
            method:'post',
            data:{
                "query":`query{
                    getUsersByBuptIds(buptIds:${JSON.stringify(values.学生)}){
                        id
                    }
                }`//用反引号      
            },
            timeout:timeout,
          })
          var getStudentsIdInCourse=axios.create({
            url:weburl+"/graphql/",
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
            timeout:timeout,
          })
          if(this.state.value===1){
              getAllStudentIdByUsername().then(function(response1){
                  getStudentsIdInCourse().then(function(response2){
                  var addStudents=axios.create({
                    url:weburl+"/graphql/",
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
                    timeout:timeout,                     
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
                      url:weburl+"/graphql/",
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
                      timeout:timeout,                     
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
            width:150,
        },{
            title:'性别',
            dataIndex:'gender',
            render:text=>text=="MALE"?'男':'女',
            width:150,
        },{
            title:'班级',
            dataIndex:'classNumber',
            width:200,
        },{
            title:'学号',
            dataIndex:'buptId',
            width:200,
        },{
            title:'作业总成绩',
            dataIndex:'score',
            sorter: (a, b) =>b.score-a.score,
            width:150,
        }]
        const tips=(
            <div>
            <p style={{fontSize:"20px"}}>通过单选框的选择来搜索对应的学生并添加</p>
            </div>
        )
        const data=this.state.studentsInformation;
        const rowSelection={
          selectedRowKeys:this.state.selectedRowKey,
          type:"radio",
          onChange:this.handleChange,
          columnTitle:"选择学生",
        }
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
            <br/><br/><br/>
            <Button size="large" type="primary" disabled={this.state.selectedRowKey.length===0} onClick={this.showModal2}>学生详细作业分数</Button>
            <Button size="large" onClick={this.showModal3} style={{marginLeft:"5vw"}}>设置作业分数权重</Button>
            <Modal
                title="查看学生所有交过的作业分数"
                visible={this.state.visible2}
                footer={null}
                onCancel={this.handleClose2}
                destroyOnClose={true}
                width={700}
            >
            <CheckDetail studentInfo={_.filter(this.state.studentsInformation,(info)=>{return info["id"]===this.state.selectedRowKey[0]})}
                         assignment={this.state.assignment}
                         totalInfo={this.state.totalInfo}/>
            </Modal>
            <Modal
                title="设置作业分数权重"
                visible={this.state.visible3}
                footer={null}
                onCancel={this.handleClose3}
                destroyOnClose={true}
            >
            <WrappedSetweight courseId={this.props.courseId} changeFlag={this.changeFlag} handleClose3={this.handleClose3}/>
            </Modal>
            <br/><br/><br/>
            <Table columns={column} dataSource={data} bordered rowKey={record=>record["id"]} rowSelection={rowSelection}/>
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
            url:weburl+"/data/get_qrcode/",
            headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
            method:'post',
            data:{course_id:courseid},
            timeout:timeout,
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