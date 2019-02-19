import React from 'react';
import axios from 'axios';
import {Row,Col,Card,Layout,Button,Drawer,Tag,Table,Menu,Radio,message} from 'antd';
import moment from 'moment';
import {_} from 'underscore'
import "./correctSpecificWork.css";

var assignmentId;//特定作业任务的Id
var re2=/^homework_file\/(.*)$/;
var filelist=[];//作业要求的附件
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

class NotcorrectedTable extends React.Component{
    constructor(props){
        super(props);
        this.state={data:[]};
    }

    componentWillMount(){
        if(typeof(this.props.submission)!=="undefined"){
             let data=_.filter(this.props.submission,(info)=>{return info.isReviewed===false});
             this.setState({data:data});
             this.props.changeCorrectId(data[0]["id"]);
        }
    }

    componentWillReceiveProps(nextProps){
        if(typeof(nextProps.submission)!=="undefined"&&typeof(this.props.submission)==="undefined"){
             let data=_.filter(nextProps.submission,(info)=>{return info.isReviewed===false});
             this.setState({data:data});
             this.props.changeCorrectId(data[0]["id"]);
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
                score:0,
                longPicture:{
                    data:"xxx",
                },
                zippedFile:{
                    data:"xxx",
                },
                submitter:{
                    name:"xxx",
                    buptId:"xxx",
                    classNumber:"xxx",
                    gender:"xxx",
                }
            },//当前批改作业的数据
            visible1:false,
            current:"notcorrected",
            correctId:-1,//当前批改的submission的ID,默认为待批改作业列表中的第一个
        }
    }
    
    componentWillMount(){
        var that=this;
        assignmentId=this.props.re.exec(window.location.pathname)[1];
        var getAssignmentInfo=axios.create({
            url:"http://localhost:8000/graphql/",
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
                        score
                        longPicture{
                            data
                        }
                        zippedFile{
                            data
                        }
                        submitter{
                            name
                            buptId
                            classNumber
                            gender
                        }
                    }
                 }
                }`//用反引号      
            },
            timeout:1000,
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
        if(nextState.correctId!==-1){
            nextState.submissionData=_.filter(nextState.assignmentInfo.assignmentSubmissions,(info)=>{return info["id"]===nextState.correctId})[0];
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

    render(){
        const isEnd=moment().isBefore(this.state.assignmentInfo.startTime,"minute")||moment().isAfter(this.state.assignmentInfo.deadline,"minute");
        return(
            <div>
            <Layout>
              <Sider theme="light" width="650" style={{height:"90vh"}}>
              <div className="scrollprac">
              <br/>
              <span style={{fontSize:"30px"}}>{this.state.submissionData.submitter["name"]+" 的作业"}</span>
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