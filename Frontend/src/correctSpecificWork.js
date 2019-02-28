import React from 'react';
import axios from 'axios';
import {Row,Col,Card,Layout,Button,Drawer,Tag,Table,Menu,Radio,message,Input,Form,Modal,InputNumber} from 'antd';
import weburl from './url.js';
import timeout from './timeout.js'
import moment from 'moment';
import {_} from 'underscore'
import "./correctSpecificWork.css";

var assignmentId;//特定作业任务的Id
var re2=/^homework_file\/(.*)$/;
var filelist=[];//作业要求的附件
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const { TextArea } = Input;
const { Header, Footer, Sider, Content,} = Layout;

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
                    <a href={weburl+"/media/"+this.props.addfile[i].data}
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

class NotcorrectedTable extends React.Component{
    constructor(props){
        super(props);
        this.state={data:[]};
    }

    componentWillMount(){
        if(typeof(this.props.submission)!=="undefined"){
             let data=_.filter(this.props.submission,(info)=>{return info.isReviewed===false});
             this.setState({data:data});
             if(data.length!==0)this.props.changeCorrectId(data[0]["id"]);
        }
    }

    componentWillReceiveProps(nextProps){
        if(typeof(nextProps.submission)!=="undefined"&&typeof(this.props.submission)==="undefined"||nextProps.submission!==this.props.submission){
             let data=_.filter(nextProps.submission,(info)=>{return info.isReviewed===false});
             this.setState({data:data});
             if(data.length!==0)this.props.changeCorrectId(data[0]["id"]);
        }
    }

    handleChange=(selectedRowKeys,selectedRows)=>{
        this.props.changeCorrectId(selectedRowKeys[0]);//这个key即为submission的ID
    }

    render(){
        const column=[{
            title:'姓名',
            dataIndex:'submitter.name',
            width: 80,
        },{
            title:'性别',
            dataIndex:'submitter.gender',
            render:text=>text=="MALE"?'男':'女',
            width: 60,
        },{
            title:'班级',
            dataIndex:'submitter.classNumber',
            width: 100,
        },{
            title:'学号',
            dataIndex:'submitter.buptId',
            width: 100,
        }]
        const rowSelection={
            hideDefaultSelections:true,
            type:"radio",
            onChange:this.handleChange,
            columnTitle:"批改作业",
        }
        return(
            <Table 
            style={{marginLeft:"20px",marginRight:"20px",marginTop:"10px"}}
            columns={column} 
            dataSource={this.state.data} 
            bordered 
            rowKey={record=>record["id"]}
            pagination={{pageSize:50}}
            scroll={{y:500}}
            rowSelection={rowSelection}/>   
        )
    }
}

class CorrectedTable extends React.Component{
    handleChange=(selectedRowKeys,selectedRows)=>{
        this.props.changeCorrectId(selectedRowKeys[0]);//这个key即为submission的ID
    }

    render(){
        const column=[{
            title:'姓名',
            dataIndex:'submitter.name',
            width: 80,
        },{
            title:'性别',
            dataIndex:'submitter.gender',
            render:text=>text=="MALE"?'男':'女',
            width: 80,
        },{
            title:'班级',
            dataIndex:'submitter.classNumber',
            width: 100,
        },{
            title:'学号',
            dataIndex:'submitter.buptId',
            width: 100,
        },{
            title:'作业分数',
            dataIndex:'score',
            width: 100,
        },{
            title:'优秀作业',
            dataIndex:'isExcellent',
            render:text=>{
                if(text===true) return <Tag color="gold">优秀作业</Tag>
            },
            width: 100,
        }]
        const data=_.filter(this.props.submission,(info)=>{return info.isReviewed===true});
        const rowSelection={
            hideDefaultSelections:true,
            type:"radio",
            onChange:this.handleChange,
            columnTitle:"更新批改",
        }
        return(
            <Table 
            style={{marginLeft:"20px",marginRight:"20px",marginTop:"10px"}}
            columns={column} 
            dataSource={data} 
            bordered 
            rowKey={record=>record["id"]}
            pagination={{pageSize:50}}
            scroll={{y:500}}
            rowSelection={rowSelection}/>   
        )
    } 
}

class UnpaidTable extends React.Component{
    render(){
        const column=[{
            title:'姓名',
            dataIndex:'name',
            width: 100,
        },{
            title:'性别',
            dataIndex:'gender',
            render:text=>text=="MALE"?'男':'女',
            width: 100,
        },{
            title:'班级',
            dataIndex:'classNumber',
            width: 100,
        },{
            title:'学号',
            dataIndex:'buptId',
            width: 100,
        }]
        const data=_.filter(this.props.students,(info)=>{return !_.contains(_.pluck(_.pluck(this.props.submission,"submitter"),"buptId"),info.buptId);})
        return(
            <Table 
            style={{marginLeft:"20px",marginRight:"20px",marginTop:"10px"}}
            columns={column} 
            dataSource={data} 
            bordered 
            rowKey={record=>record.buptId}
            pagination={{pageSize:50}}
            scroll={{y:500}}/>   
        )
    }     
}

class ThreeTable extends React.Component{
    render(){
        if(this.props.current==="notcorrected") return <NotcorrectedTable submission={this.props.submission} changeCorrectId={this.props.changeCorrectId}/>
        else if(this.props.current==="corrected") return <CorrectedTable submission={this.props.submission} changeCorrectId={this.props.changeCorrectId}/>
        else return <UnpaidTable submission={this.props.submission} students={this.props.students}/>
    }
}

class Givescore extends React.Component{
    handleSubmit=(e)=>{
        e.preventDefault();
        var that=this;
        this.props.form.validateFieldsAndScroll(["作业反馈","作业分数","优秀作业"],(err,values)=>{
            if(!err){
                if(values.作业反馈===undefined)values.作业反馈="";
                var givescore=axios.create({
                    url:weburl+"/graphql/",
                    headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
                    method:'post',
                    data:{
                      "query":`mutation{
                        giveScore(
                          scoreGivingData:{
                            submission:${that.props["id"]},
                            reviewComment:"${values.作业反馈}",
                            score:${values.作业分数},
                            isExcellent:${values.优秀作业},
                          }
                        ){
                           ok
                           msg
                        }
                      }`
                    },
                    timeout:timeout,
                })
                var calcTotal=axios.create({
                    url:weburl+"/graphql/",
                    headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
                    method:'post',
                    data:{
                      "query":`mutation{
                        calculateTotal(
                          calcTarget:{
                             course:${that.props.courseId}
                             student:${that.props.studentId}
                          }
                        ){
                           ok
                           msg
                        }
                      }`
                    },
                    timeout:timeout,
                })
                givescore().then(function(response){
                    if(response.data.data.giveScore.ok==true){
                        message.success('作业批改成功!',3);
                        calcTotal().catch(function(error1){
                            console.log(error1);
                        })
                        that.props.changeFlag();
                        that.props.onClose();
                    }else{
                        message.error('作业批改失败!',3);
                    }
                })
                .catch(function(error){
                    message.error('作业批改失败!',3);
                })
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
        return(
            <Form onSubmit={this.handleSubmit}>
                <FormItem 
                 {...formItemLayout}
                 label="添加作业反馈(可选)"
                >
                {getFieldDecorator('作业反馈')(
                    <TextArea rows={4}/>
                )} 
                </FormItem>
                <FormItem 
                  {...formItemLayout}
                  label="作业分数"
                  help="作业分数上限为100分"
                >
                 {getFieldDecorator('作业分数', {
                 rules: [{
                   required: true, message: '请给作业打分!',type:"number"
                 }],
                  })(
                 <InputNumber min={0} max={100} step={0.1}/>
                 )} 
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="是否评为优秀作业"
                >
                 {getFieldDecorator('优秀作业', {
                  rules: [{
                    required: true, message: '请选择!',
                  }],
                 })(
                  <RadioGroup >
                  <Radio value={true}>是</Radio>
                  <Radio value={false}>否</Radio>
                  </RadioGroup>
                )}
                </FormItem> 
                <Button type="primary" htmlType="submit">提交</Button>
            </Form>
        )
    }
}

const WrappedGivescore=Form.create()(Givescore);

class Studenthomework extends React.Component{
    constructor(props){
        super(props);
        this.state={ visible:false,}
    }

    showModal=()=>{
        this.setState({visible:true});
    }

    onClose=()=>{
        this.setState({visible:false});
    }

    render(){
        if(this.props.data.isReviewed===false){
            if(this.props.data.zippedFile.data==="xxx"){
              return(
                <div>
                    <div>
                      <span style={{fontSize:"30px"}}>{this.props.data.submitter["name"]+" 的作业"}</span>
                      <Button style={{marginLeft:"20%"}} size="large" type="primary" 
                              onClick={this.showModal} disabled={(this.props.data["id"]===-1||moment().isBefore(this.props.deadline))?true:false}>批改作业</Button>
                    </div>
                    <br/>
                    <div style={{fontSize:"18px",marginLeft:"-80%"}}>作业备注:</div>
                    <TextArea value={this.props.data.description} style={{width:"95%"}} rows={4}/>
                    <br/><br/><br/>
                    <div style={{fontSize:"18px",marginLeft:"-75%"}}>学生提交的作业:</div>
                    <img src={weburl+"/media/"+this.props.data.longPicture.data} alt="图片作业" width="95%"/>
                    <Modal
                       title="批改作业"
                       footer={null}
                       onCancel={this.onClose}
                       visible={this.state.visible}
                       destroyOnClose
                    >   
                    <WrappedGivescore id={this.props.data["id"]} studentId={this.props.data.submitter["id"]} courseId={this.props.courseId} changeFlag={this.props.changeFlag} onClose={this.onClose}/> 
                    </Modal> 
                </div>
              )
            }
            if(this.props.data.longPicture.data==="xxx"){
                return(
                  <div>
                      <div>
                        <span style={{fontSize:"30px"}}>{this.props.data.submitter["name"]+" 的作业"}</span>
                        <Button style={{marginLeft:"20%"}} size="large" type="primary" 
                                onClick={this.showModal} disabled={(this.props.data["id"]===-1||moment().isBefore(this.props.deadline))?true:false}>批改作业</Button>
                      </div>
                      <br/>
                      <div style={{fontSize:"18px",marginLeft:"-80%"}}>作业备注:</div>
                      <TextArea value={this.props.data.description} style={{width:"95%"}} rows={4}/>
                      <br/><br/><br/>
                      <div style={{fontSize:"18px",marginLeft:"-75%"}}>学生提交的作业:</div>
                      <br/><br/>
                        <a href={weburl+"/media/"+this.props.data.zippedFile.data}
                           style={{fontSize:"20px"}}>
                           {this.props.data.zippedFile.data==="xxx"?"xxx":re2.exec(this.props.data.zippedFile.data)[1]}
                        </a>
                      <Modal
                       title="批改作业"
                       footer={null}
                       onCancel={this.onClose}
                       visible={this.state.visible}
                       destroyOnClose
                      >    
                      <WrappedGivescore id={this.props.data["id"]} studentId={this.props.data.submitter["id"]} courseId={this.props.courseId} changeFlag={this.props.changeFlag} onClose={this.onClose}/> 
                      </Modal> 
                  </div>
                )
            }
        }else{
            if(this.props.data.zippedFile.data==="xxx"){
              return(
                <div>
                    <div>
                      <span style={{fontSize:"30px",marginRight:"5%"}}>{this.props.data.submitter["name"]+" 的作业"}</span>
                      <Tag color={this.props.data.isExcellent?"gold":"cyan"}>{this.props.data.isExcellent?"优秀作业":"普通作业"}</Tag>
                      <Button style={{marginLeft:"20%"}} size="large" type="primary" 
                              onClick={this.showModal} disabled={(this.props.data["id"]===-1||moment().isBefore(this.props.deadline))?true:false}>更新批改</Button>
                    </div>
                    <br/>
                    <div>
                      <span style={{fontSize:"18px",marginRight:"5%"}}>分数:</span>
                      <InputNumber value={this.props.data.score} min={this.props.data.score} max={this.props.data.score}/>
                      <span style={{fontSize:"18px",marginLeft:"5%"}}>分</span>
                    </div>
                    <br/>
                    <div style={{fontSize:"18px",marginLeft:"-80%"}}>作业备注:</div>
                    <TextArea value={this.props.data.description} style={{width:"95%"}} rows={4}/>
                    <br/><br/><br/>
                    <div style={{fontSize:"18px",marginLeft:"-80%"}}>教师反馈:</div>
                    <TextArea value={this.props.data.reviewComment} style={{width:"95%"}} rows={4}/>
                    <br/><br/><br/>
                    <div style={{fontSize:"18px",marginLeft:"-75%"}}>学生提交的作业:</div>
                    <img src={weburl+"/media/"+this.props.data.longPicture.data} alt="图片作业" width="95%"/>
                    <Modal
                       title="批改作业"
                       footer={null}
                       onCancel={this.onClose}
                       visible={this.state.visible}
                       destroyOnClose
                    >   
                    <WrappedGivescore id={this.props.data["id"]} studentId={this.props.data.submitter["id"]} courseId={this.props.courseId} changeFlag={this.props.changeFlag} onClose={this.onClose}/> 
                    </Modal> 
                </div>
               )
            }
            if(this.props.data.longPicture.data==="xxx"){
              return(
                <div>
                <div>
                    <span style={{fontSize:"30px",marginRight:"5%"}}>{this.props.data.submitter["name"]+" 的作业"}</span>
                    <Tag color={this.props.data.isExcellent?"gold":"cyan"}>{this.props.data.isExcellent?"优秀作业":"普通作业"}</Tag>
                    <Button style={{marginLeft:"20%"}} size="large" type="primary" 
                            onClick={this.showModal} disabled={(this.props.data["id"]===-1||moment().isBefore(this.props.deadline))?true:false}>更新批改</Button>
                </div>
                <br/>
                <div>
                    <span style={{fontSize:"18px",marginRight:"5%"}}>分数:</span>
                    <InputNumber value={this.props.data.score} min={this.props.data.score} max={this.props.data.score}/>
                    <span style={{fontSize:"18px",marginLeft:"5%"}}>分</span>
                </div>
                <br/>
                <div style={{fontSize:"18px",marginLeft:"-80%"}}>作业备注:</div>
                <TextArea value={this.props.data.description} style={{width:"95%"}} rows={4}/>
                <br/><br/><br/>
                <div style={{fontSize:"18px",marginLeft:"-80%"}}>教师反馈:</div>
                <TextArea value={this.props.data.reviewComment} style={{width:"95%"}} rows={4}/>
                <br/><br/><br/>
                <div style={{fontSize:"18px",marginLeft:"-75%"}}>学生提交的作业:</div>
                <br/><br/>
                  <a href={weburl+"/media/"+this.props.data.zippedFile.data}
                     style={{fontSize:"20px"}}>
                     {this.props.data.zippedFile.data==="xxx"?"xxx":re2.exec(this.props.data.zippedFile.data)[1]}
                  </a>
                <Modal
                 title="批改作业"
                 footer={null}
                 onCancel={this.onClose}
                 visible={this.state.visible}
                 destroyOnClose
                >    
                <WrappedGivescore id={this.props.data["id"]} studentId={this.props.data.submitter["id"]} courseId={this.props.courseId} changeFlag={this.props.changeFlag} onClose={this.onClose}/> 
                </Modal> 
                </div>
              )
            }
        }
    }
}
  
class CorrectSpecificWork extends React.Component{
    constructor(props){
        super(props);
        this.state={
            assignmentInfo:{
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
            submissionData:{
                aware:false,
                isReviewed:false,
                isExcellent:false,
                id:-1,
                description:"xxx",
                reviewComment:"xxx",
                score:0,
                longPicture:{
                    data:"xxx",
                },
                zippedFile:{
                    data:"xxx",
                },
                submitter:{
                    id:-1,
                    name:"xxx",
                    buptId:"xxx",
                    classNumber:"xxx",
                    gender:"xxx",
                }
            },//当前批改作业的数据
            visible1:false,
            current:"notcorrected",
            correctId:-1,//当前批改的submission的ID,默认为待批改作业列表中的第一个
            flag:true,//当givescore以后这个flag会反转，来重新获取一波作业数据
        }
    }
    
    componentWillMount(){
        var that=this;
        assignmentId=this.props.re.exec(window.location.pathname)[1];
        var getAssignmentInfo=axios.create({
            url:weburl+"/graphql/",
            headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
            method:'post',
            data:{
               "query":`query{
                 getAssignmentsByIds(ids:${[assignmentId]})
                 {
                    name
                    description
                    assignmentType
                    startTime
                    deadline
                    courseClass{
                        id
                        name
                        students{
                            name
                            buptId
                            classNumber
                            gender                            
                        }
                    }
                    addfile{
                        data
                    }
                    assignmentSubmissions{
                        aware
                        isReviewed
                        isExcellent
                        id
                        description
                        reviewComment
                        score
                        longPicture{
                            data
                        }
                        zippedFile{
                            data
                        }
                        submitter{
                            id
                            name
                            buptId
                            classNumber
                            gender
                        }
                    }
                 }
                }`//用反引号      
            },
            timeout:timeout,
        })
        getAssignmentInfo().then(function(response){
            let type=response.data.data.getAssignmentsByIds[0].assignmentType;
            if(type==="IMAGE")response.data.data.getAssignmentsByIds[0].assignmentType="图片作业";
            else if(type==="DOCS")response.data.data.getAssignmentsByIds[0].assignmentType="文件作业";
            else response.data.data.getAssignmentsByIds[0].assignmentType="任意作业";
            that.setState({assignmentInfo:response.data.data.getAssignmentsByIds[0]});
        })
        .catch(function(error){
            console.log(error);
        })
    }

    componentWillUpdate(nextProps,nextState){
        var that=this;
        if(nextState.flag!==this.state.flag){
            assignmentId=this.props.re.exec(window.location.pathname)[1];
            var getAssignmentInfo=axios.create({
                url:weburl+"/graphql/",
                headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
                method:'post',
                data:{
                   "query":`query{
                     getAssignmentsByIds(ids:${[assignmentId]})
                     {
                        name
                        description
                        assignmentType
                        startTime
                        deadline
                        courseClass{
                            id
                            name
                            students{
                                name
                                buptId
                                classNumber
                                gender                            
                            }
                        }
                        addfile{
                            data
                        }
                        assignmentSubmissions{
                            aware
                            isReviewed
                            isExcellent
                            id
                            description
                            reviewComment
                            score
                            longPicture{
                                data
                            }
                            zippedFile{
                                data
                            }
                            submitter{
                                id
                                name
                                buptId
                                classNumber
                                gender
                            }
                        }
                     }
                    }`//用反引号      
                },
                timeout:timeout,
            })
            getAssignmentInfo().then(function(response){
                let type=response.data.data.getAssignmentsByIds[0].assignmentType;
                if(type==="IMAGE")response.data.data.getAssignmentsByIds[0].assignmentType="图片作业";
                else if(type==="DOCS")response.data.data.getAssignmentsByIds[0].assignmentType="文件作业";
                else response.data.data.getAssignmentsByIds[0].assignmentType="任意作业";
                that.setState({assignmentInfo:response.data.data.getAssignmentsByIds[0]});
            })
            .catch(function(error){
                console.log(error);
            })
        }
        if(nextState.correctId!==-1){
            nextState.submissionData=_.filter(nextState.assignmentInfo.assignmentSubmissions,(info)=>{return info["id"]===nextState.correctId})[0];
            if(nextState.submissionData.zippedFile===null){
                nextState.submissionData.zippedFile=new Object();
                nextState.submissionData.zippedFile.data="xxx";
            }
            if(nextState.submissionData.longPicture===null){
                nextState.submissionData.longPicture=new Object();
                nextState.submissionData.longPicture.data="xxx";
            }
        }
    }

    openDrawer=()=>{
        this.setState({visible1:true});
    }

    onClose=()=>{
        this.setState({visible1:false});
    }

    handleClick=(e)=>{
        this.setState({current:e.key});
    }

    changeCorrectId=(info)=>{
        this.setState({correctId:info});
    }

    changeFlag=()=>{
        let flag=this.state.flag;
        this.setState({flag:!flag});
    }

    render(){
        const isEnd=moment().isBefore(this.state.assignmentInfo.startTime,"minute")||moment().isAfter(this.state.assignmentInfo.deadline,"minute");
        return(
            <div>
            <Layout>
              <Sider theme="light" width="650" style={{height:"90vh"}}>
              <div className="scrollprac">
              <br/>
              <Studenthomework data={this.state.submissionData} changeFlag={this.changeFlag} deadline={this.state.assignmentInfo.deadline} courseId={this.state.assignmentInfo.courseClass["id"]}/>
              </div>
              </Sider>
              <Content>
              <div style={{marginBottom:"10px",marginTop:"10px"}}>
                <span style={{fontSize:"20px"}}>
                 {this.state.assignmentInfo.courseClass["name"]+
                   "----"+
                  this.state.assignmentInfo["name"]+"  "}
                </span>  
                <span style={{fontSize:"15px"}}>
                 {this.state.assignmentInfo.assignmentType}
                </span>  
                <Button type="primary" shape="round" style={{marginLeft:"20px"}} onClick={this.openDrawer}>查看作业描述</Button>        
              </div> 
              <div style={{marginBottom:"10px"}}>
                <span style={{fontSize:"15px",marginRight:"30px"}}>
                {"开始提交:"+ moment(this.state.assignmentInfo.startTime).format("YY"+"/"+"M"+"/"+"D"+" "+"HH"+":"+"mm")+"  "+
                 "结束提交:"+ moment(this.state.assignmentInfo.deadline).format("YY"+"/"+"M"+"/"+"D"+" "+"HH"+":"+"mm")}   
                </span>
                <Tag color={isEnd?"red":"green"}>{isEnd?"提交已结束":"提交进行中"}</Tag>
              </div>                                      
              <Menu
                onClick={this.handleClick}
                selectedKeys={[this.state.current]}
                mode="horizontal"
              >
                 <Menu.Item key="notcorrected">
                   <span style={{fontSize:"20px"}}>待批改作业</span>
                 </Menu.Item>
                 <Menu.Item key="corrected">
                   <span style={{fontSize:"20px"}}>已批改作业</span>
                 </Menu.Item>
                 <Menu.Item key="unpaid">
                   <span style={{fontSize:"20px"}}>未交名单</span>
                 </Menu.Item>
              </Menu>
              <ThreeTable current={this.state.current}
                          submission={this.state.assignmentInfo.assignmentSubmissions}
                          students={this.state.assignmentInfo.courseClass.students}
                          changeCorrectId={this.changeCorrectId}/>
             </Content>
            </Layout>
            <Drawer
               title="作业要求描述"
               placement="right"
               closable={false}
               onClose={this.onClose}
               visible={this.state.visible1}
            >
            <p>{this.state.assignmentInfo["description"]}</p>
            <br/><br/><br/>
            <UploadAssignmentFile addfile={this.state.assignmentInfo.addfile}/>
            </Drawer>
            </div>
        )
    }
}

export default CorrectSpecificWork;