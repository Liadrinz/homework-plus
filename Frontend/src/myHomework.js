import React from 'react';
import {Button,Col,Row,Modal,Tag,Form,message,Input,Icon,Upload} from 'antd';
import axios from 'axios';
import {_} from 'underscore';
import moment from 'moment';
import './myHomework.css';

var re=/^\/studentcenter\/myHomeWork\/(.*)\/$/;
var re2=/^homework_file\/(.*)$/;
var filelist=[];//作业要求的附件
var addfile=[];//上传文件的ID列表(交作业时)
const FormItem = Form.Item;
const { TextArea } = Input;

class UploadAssignmentFile extends React.Component{
    componentWillMount(){
        filelist=[];
    }
    render(){
        if(this.props.addfile.length===0) return(<div/>)
        else{ 
            for(var i=0;i<this.props.addfile.length;i++){
                filelist.push(
                    <div>
                    <a href={"http://localhost:8000/media/"+this.props.addfile[i].data}
                       style={{fontSize:"20px"}}>
                    {re2.exec(this.props.addfile[i]["data"])[1]}
                    </a>
                    </div>
                )
            }
            return(            
                <div>
                <p>点击下载文件:</p>
                {filelist}
                </div>
            )
        }
    }
}

class Review extends React.Component{
    render(){
        return(
            <div>fuck world</div>
        )
    }
}

class CheckHomework extends React.Component{
    constructor(props){
        super(props);
        this.state={
            description:"xxx",
            url:"xxx",
        }
    }
    componentWillMount(){
        var that=this;
        var getHomework=axios.create({
            url:"http://localhost:8000/graphql/",
            headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
            method:'post',
            data:{
              "query":`query{
                getSubmissionsByIds(ids:[${that.props.submittedID}]){
                    aware
                    description
                    longPicture{
                       data
                    }
                    zippedFile{
                       data
                    } 
                }
              }`
            },
            timeout:1000,
        })
        getHomework().then(function(response){
            let url="xxx";
            if(response.data.data.getSubmissionsByIds[0].aware===true){
            if(that.props.type==="图片作业") url=response.data.data.getSubmissionsByIds[0].longPicture.data;
            else if(that.props.type==="文件作业") url=response.data.data.getSubmissionsByIds[0].zippedFile.data;
            }
            that.setState({description:response.data.data.getSubmissionsByIds[0].description,url:url});
        })
        .catch(function(error){
            console.log(error);
        })
    }
    
    componentWillReceiveProps(nextProps){
        var that=this;
        if(nextProps.changeflag!==this.props.changeflag||(nextProps.isSubmitted===true&&this.props.isSubmitted===false)){
            var getHomework=axios.create({
                url:"http://localhost:8000/graphql/",
                headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
                method:'post',
                data:{
                  "query":`query{
                    getSubmissionsByIds(ids:[${that.props.submittedID}]){
                        aware
                        description
                        longPicture{
                           data
                        }
                        zippedFile{
                           data
                        } 
                    }
                  }`
                },
                timeout:1000,
            })
            getHomework().then(function(response){
                let url="xxx";
                if(response.data.data.getSubmissionsByIds[0].aware===true){
                if(that.props.type==="图片作业") url=response.data.data.getSubmissionsByIds[0].longPicture.data;
                else if(that.props.type==="文件作业") url=response.data.data.getSubmissionsByIds[0].zippedFile.data;
                }
                that.setState({description:response.data.data.getSubmissionsByIds[0].description,url:url});
            })
            .catch(function(error){
                console.log(error);
            })
        }
    }

    render(){
        if(this.props.type==="图片作业"){ return(
            <div>
               <span style={{fontSize:"20px"}}>作业备注：</span>
               <TextArea value={this.state.description} rows={4}/>
               <br/><br/>
               <span style={{fontSize:"20px"}}>已提交的作业：</span>
               <br/><br/>
               <img src={"http://localhost:8000/media/"+this.state.url} alt="图片作业" width="750px"/>
            </div>
        )}else if(this.props.type==="文件作业") return(
            <div>
               <span style={{fontSize:"20px"}}>作业备注：</span>
               <TextArea value={this.state.description} rows={4}/>
               <br/><br/>
               <span style={{fontSize:"20px"}}>已提交的作业：</span>
               <br/><br/>
               <a href={"http://localhost:8000/media/"+this.state.url}
                  style={{fontSize:"20px"}}>
                {this.state.url==="xxx"?"xxx":re2.exec(this.state.url)[1]}
               </a>
            </div>           
        )
    }
}

class Handin extends React.Component{
    constructor(props){
        super(props);
        this.state={
            addfile:[],
        }
    }
    componentWillMount(){
        addfile=[];
    }
    
    handleSubmit=(e)=>{
        e.preventDefault();
        var that=this;
        this.props.form.validateFieldsAndScroll(["作业备注","文件上传"],(err,values)=>{
            if(!err){
                if(values.作业备注===undefined)values.作业备注="";
                var handinHomework1=axios.create({
                    url:"http://localhost:8000/graphql/",
                    headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
                    method:'post',
                    data:{
                      "query":`mutation{
                        createSubmission(
                          submissionData:{
                            assignment:${that.props.assignmentId},
                            description:"${values.作业备注}",
                            image:[${addfile}],
                          }
                        ){
                           ok
                           submission{
                             id
                           }
                        }
                      }`
                    },
                    timeout:1000,
                })
                var handinHomework2=axios.create({
                    url:"http://localhost:8000/graphql/",
                    headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
                    method:'post',
                    data:{
                      "query":`mutation{
                        createSubmission(
                          submissionData:{
                            assignment:${that.props.assignmentId},
                            description:"${values.作业备注}",
                            addfile:[${addfile}],
                          }
                        ){
                           ok
                           submission{
                             id
                           }
                        }
                      }`
                    },
                    timeout:1000,
                })
                var updateHomework1=axios.create({
                    url:"http://localhost:8000/graphql/",
                    headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
                    method:'post',
                    data:{
                      "query":`mutation{
                        editSubmission(
                          submissionData:{
                            id:${that.props.submittedID},
                            description:"${values.作业备注}",
                            image:[${addfile}],
                          }
                        ){
                           ok
                        }
                      }`
                    },
                    timeout:1000,
                })
                var updateHomework2=axios.create({
                    url:"http://localhost:8000/graphql/",
                    headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
                    method:'post',
                    data:{
                      "query":`mutation{
                        editSubmission(
                          submissionData:{
                            id:${that.props.submittedID},
                            description:"${values.作业备注}",
                            addfile:[${addfile}],
                          }
                        ){
                           ok
                        }
                      }`
                    },
                    timeout:1000,
                })
                if(that.props.submittedID===-1){
                if(that.props.type==="图片作业"){
                    handinHomework1().then(function(response){
                        if(response.data.data.createSubmission.ok==true){
                            message.success('作业上传成功!',3);
                            that.props.changeSubmitted(response.data.data.createSubmission.submission["id"]);
                            setTimeout(that.props.onClose,1000);
                        }else{
                            message.error('作业上传失败!',3);
                        }
                    })
                    .catch(function(error){
                        message.error('作业上传失败!',3);
                    })
                }else if(that.props.type==="文件作业"){
                    handinHomework2().then(function(response){
                        if(response.data.data.createSubmission.ok==true){
                            message.success('作业上传成功!',3);
                            that.props.changeSubmitted(response.data.data.createSubmission.submission["id"]);
                            setTimeout(that.props.onClose,1000);
                        }else{
                            message.error('作业上传失败!',3);
                        }
                    })
                    .catch(function(error){
                        message.error('作业上传失败!',3);
                    })
                }
            }else{
                if(that.props.type==="图片作业"){
                    updateHomework1().then(function(response){
                        if(response.data.data.editSubmission.ok==true){
                            message.success('作业更新成功!',3);
                            that.props.changeFlag();
                            setTimeout(that.props.onClose,1000);
                        }else{
                            message.error('作业更新失败!',3);
                        }
                    })
                    .catch(function(error){
                        message.error('作业更新失败!',3);
                    })
                }else if(that.props.type==="文件作业"){
                    updateHomework2().then(function(response){
                        if(response.data.data.editSubmission.ok==true){
                            message.success('作业更新成功!',3);
                            that.props.changeFlag();
                            setTimeout(that.props.onClose,1000);
                        }else{
                            message.error('作业更新失败!',3);
                        }
                    })
                    .catch(function(error){
                        message.error('作业更新失败!',3);
                    })
                }
            }
            this.props.form.resetFields();
          }
        })
    }

    onChange=(info)=>{
        if (info.file.status === 'done') {
          this.setState({addfile:addfile.push(info.file.response["id"])});
        } else if (info.file.status === 'error') {
          message.error(`${info.file.name} 作业上传失败.`);
        }
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
        const uploadProps = { //放进Upload组件里的一些属性
            name: 'data',
            action: "http://localhost:8000/upload_file/",
            headers: {
                token:localStorage.getItem('token'),
            },
            onRemove(file){
                return false;
            }
        };
        if(this.props.type==="图片作业") _.extend(uploadProps,{accept:".jpg,.png"});
        return(
            <Form onSubmit={this.handleSubmit}>
                <FormItem 
                 {...formItemLayout}
                 label="添加作业备注(可选)"
                >
                {getFieldDecorator('作业备注')(
                    <TextArea rows={4}/>
                )} 
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="文件上传"
                >
                  <Upload {...uploadProps} onChange={this.onChange}>
                    <Button>
                    <Icon type="upload" /> {this.props.type==="图片作业"?"上传作业图片":"上传作业文件"}
                    </Button>
                  </Upload>                 
                </FormItem> 
                <Button type="primary" htmlType="submit" disabled={this.state.addfile.length==0?true:false}>提交</Button>
            </Form>
        )
    }
}

const WrappedHandin=Form.create()(Handin);

class SubmitHomework extends React.Component{
    constructor(props){
        super(props);
        this.state={
            assignmentInfo:{
                id:-1,
                name:"xxx",
                description:"xxx",
                assignmentType:"xxx",
                startTime:"xxx",
                deadline:"xxx",
                courseClass:{
                    name:"xxx",
                },
                addfile:[{
                    data:"xxx",
                }]
            },
            visible1:false,
            visible2:false,
            visible3:false,
            changeflag:false,//判断是否更新了提交
            isSubmitted:false,//判断是否已经提交过了作业
            submittedID:-1,//提交作业的submission的ID
        }
    }

    componentWillMount(){
        var that=this;
        var getAssignmentInfo=axios.create({
            url:"http://localhost:8000/graphql/",
            headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
            method:'post',
            data:{
               "query":`query{
                 getAssignmentsByIds(ids:${[that.props.assignmentId]})
                 {
                    id
                    name
                    description
                    assignmentType
                    startTime
                    deadline
                    courseClass{
                        name
                    }
                    addfile{
                        data
                    }
                 }
                }`//用反引号      
            },
            timeout:1000,
        })
        var checkSubmission=axios.create({
            url:"http://localhost:8000/graphql/",
            headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
            method:'post',
            data:{
               "query":`query{
                getSubmissionsByAssignments(assignments:${[that.props.assignmentId]})
                 {
                    submitter{
                        id
                    }
                 }
                }`//用反引号      
            },
            timeout:1000,      
        })
        axios.all([getAssignmentInfo(),checkSubmission()]).then(axios.spread(function(response1,response2){
            let type=response1.data.data.getAssignmentsByIds[0].assignmentType;
            let submission=response2.data.data.getSubmissionsByAssignments;
            let isSubmitted=false;
            if(type==="IMAGE")response1.data.data.getAssignmentsByIds[0].assignmentType="图片作业";
            else if(type==="DOCS")response1.data.data.getAssignmentsByIds[0].assignmentType="文件作业";
            else response1.data.data.getAssignmentsByIds[0].assignmentType="任意作业";
            for(let i in submission){
                if(submission[i].submitter["id"]===that.props.userId){
                    isSubmitted=true;break;
                }
            }
            that.setState({assignmentInfo:response1.data.data.getAssignmentsByIds[0],isSubmitted:isSubmitted});
        }))
    }

    componentWillUpdate(nextProps,nextState){
        var that=this;
        if(this.state.isSubmitted===false&&nextState.isSubmitted===true){
            var getSubmissionID=axios.create({
                url:"http://localhost:8000/graphql/",
                headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
                method:'post',
                data:{
                   "query":`query{
                    getSubmissionsByAssignments(assignments:${[that.props.assignmentId]})
                     {
                        id
                        submitter{
                            id
                        }
                     }
                    }`//用反引号      
                },
                timeout:1000,      
            })
            getSubmissionID().then(function(response){
                let submission=response.data.data.getSubmissionsByAssignments;
                for(let i in submission){
                    if(submission[i].submitter["id"]===that.props.userId){
                        that.setState({submittedID:submission[i]["id"]});break;
                    }
                }
            })
            .catch(function(error){
                console.log(error);
            })
        }
    }

    showModal=()=>{
        this.setState({visible1:true})
    };

    showModal2=()=>{
        this.setState({visible2:true})
    }

    showModal3=()=>{
        this.setState({visible3:true})
    }

    onClose=()=>{
        this.setState({visible1:false})
    };

    onClose2=()=>{
        this.setState({visible2:false})
    };

    onClose3=()=>{
        this.setState({visible3:false})
    };

    changeSubmitted=(info)=>{
        this.setState({isSubmitted:true,submittedID:info});
    }

    changeFlag=()=>{
        let changeflag=this.state.changeflag;
        this.setState({changeflag:!changeflag});
    }

    render(){
        return(
            <div>
              <div style={{marginBottom:"10px",marginTop:"10px"}}>
                <span style={{fontSize:"20px"}}>
                 {this.state.assignmentInfo.courseClass["name"]+
                   "----"+
                  this.state.assignmentInfo["name"]+"  "}
                </span>  
                <span style={{fontSize:"15px"}}>
                 {this.state.assignmentInfo.assignmentType}
                </span>  
                <Button type="primary" shape="round" style={{marginLeft:"20px"}} onClick={this.showModal}>查看作业描述</Button>        
              </div> 
              <div style={{marginBottom:"10px"}}>
                <span style={{fontSize:"15px",marginRight:"30px"}}>
                {"开始提交:"+ moment(this.state.assignmentInfo.startTime).format("YY"+"/"+"M"+"/"+"D"+" "+"HH"+":"+"mm")+"   "+
                 "结束提交:"+ moment(this.state.assignmentInfo.deadline).format("YY"+"/"+"M"+"/"+"D"+" "+"HH"+":"+"mm")}   
                </span>
              </div> 
              <span>  
              <Button type="primary" size="large" style={{marginLeft:"20px"}} onClick={this.showModal2}>
              {this.state.isSubmitted?"更新提交":"提交作业"}
              </Button>
              <Button size="large" style={{marginLeft:"30px"}} disabled={this.state.submittedID===-1?true:false} onClick={this.showModal3}>
              查看已提交的作业
              </Button>
              </span>
              <Modal
                title="查看已经提交的作业"
                footer={<Button onClick={this.onClose3} type="primary">关闭</Button>}
                onCancel={this.onClose3}
                visible={this.state.visible3}
                maskClosable={false}
                width={800}
               >
                 <CheckHomework submittedID={this.state.submittedID} type={this.state.assignmentInfo.assignmentType} changeflag={this.state.changeflag} isSubmitted={this.state.isSubmitted}/>
              </Modal>
              <Modal
                title={this.state.isSubmitted?"更新提交":"提交作业"}
                footer={null}
                onCancel={this.onClose2}
                visible={this.state.visible2}
                destroyOnClose
              >           
              <WrappedHandin 
                isSubmitted={this.state.isSubmitted} 
                changeSubmitted={this.changeSubmitted}
                changeFlag={this.changeFlag}
                type={this.state.assignmentInfo.assignmentType}
                assignmentId={this.state.assignmentInfo["id"]}
                submittedID={this.state.submittedID}
                onClose={this.onClose2}
               />
               </Modal>   
              <Modal
                title="作业要求描述"
                footer={null}
                onCancel={this.onClose}
                visible={this.state.visible1}
               >
                 <p>{this.state.assignmentInfo["description"]}</p>
                 <br/><br/><br/>
                 <UploadAssignmentFile addfile={this.state.assignmentInfo.addfile}/>
              </Modal>
            </div>
        )
    }
}

class MyHomework extends React.Component{
    constructor(props){
        super(props);
        this.state={
           flag:true,//判断当前时间是否在作业截止提交的ddl之前
           deadline:"",
        }
    }

    componentWillMount(){
        var that=this;
        var getDeadline=axios.create({
            url:"http://localhost:8000/graphql/",
            headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
            method:'post',
            data:{
               "query":`query{
                getAssignmentsByIds(ids:${[re.exec(window.location.pathname)[1]]})
                 {
                    deadline
                 }
                }`//用反引号      
            },
            timeout:1000,
        })
        getDeadline().then(function(response){
            that.setState({deadline:response.data.data.getAssignmentsByIds[0].deadline});
        })
        .catch(function(error){
            console.log(error);
        })
    }

    componentDidMount(){
        var that=this;
        this.getdeadline=setInterval(()=>{
           if(moment().isAfter(that.state.deadline,"minute"))that.setState({flag:false});
        },1000)
    }

    componentWillUpdate(nextProps,nextState){
        if(nextState.flag===false&&this.state.flag===true)clearInterval(this.getdeadline);
    }

    componentWillUnmount(){
        clearInterval(this.getdeadline);
    }

    render(){
        if(this.state.deadline==="") return <Review userId={this.props.userinformation["id"]} assignmentId={re.exec(window.location.pathname)[1]}/>;
        else if(moment().isAfter(this.state.deadline,"minute")) return <Review userId={this.props.userinformation["id"]} assignmentId={re.exec(window.location.pathname)[1]}/>;
        else return <SubmitHomework userId={this.props.userinformation["id"]} assignmentId={re.exec(window.location.pathname)[1]}/>;
    }
}
export default MyHomework;