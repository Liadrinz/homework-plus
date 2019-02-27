import React from 'react';
import ReactDOM from 'react-dom';
import './teachercenter.css';
import { Upload, Icon, message,Row,Col,Button,Modal,Form,Input ,Card} from 'antd';
import {Link} from 'react-router-dom';
import axios from 'axios';
import {_} from 'underscore'
import {moment} from 'moment'
import weburl from './url.js'
import timeout from './timeout.js'
var avatarFile;//头像文件
var courseRow=[];//教师的课程列表
var allcourseRow=[];//教师所有的课程列表
var courseassistantRow=[];//作为助教加入的课程列表
var allcourseassistantRow=[];//作为助教加入的所有的课程列表
var Userlogin={type:'',content:''};
var pass={old_pass:"",new_pass:""};
const FormItem = Form.Item;
const gridStyle={
  width:'100%',
  textAlign:'center',
}
var validPassword =/^\w{6,20}$/;
var validPhone=/^1\d{10}$/;
var toDate=/^(\d{4})\-(\d{2})\-(\d{2})(.*)$/;
var loginUser=axios.create({
  url:weburl+"/data/is_repeated/",
  headers:{"content-type":"application/json"},
  method:'post',
  data:Userlogin,
  timeout:timeout,
})
function getBase64(img, callback) {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
}

function beforeUpload(file) {
    const isJPG = file.type === 'image/jpeg';
    if (!isJPG) {
      message.error('你只能上传jpg格式的头像!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不得大于2MB!');
    }
    return isJPG && isLt2M;
}

class UploadAvatar extends React.Component {
    constructor(props){
      super(props)
      this.state={
        loading: false,
      }
    }
  　　　
    handleChange = (info) => {
      if (info.file.status === 'uploading') {
        this.setState({ loading: true });
        return;
      }
      if (info.file.status === 'done') {
        avatarFile=info.file;
        getBase64(info.file.originFileObj, imageUrl => this.setState({
          imageUrl,
          loading: false,
        }));
      }
    }
  
    render() {
      const uploadButton = (
        <div>
          <Icon type={this.state.loading ? "loading" : "plus" } style={{fontSize:"45px"}}/>
          <div>添加头像</div>
        </div>
      );
      const imageUrl = this.state.imageUrl;
      return (
        //upload的data应该是一个参数对象或者是返回参数对象的方法
        <Upload
          name="avatar"
          listType="picture-card"
          className="avatar-uploader"
          showUploadList={false}
          action={weburl+"/data/avatars/"}
          headers={{"content-type":"application/json","token":localStorage.getItem('token')}}
          beforeUpload={beforeUpload}
          onChange={this.handleChange}
          data={{user:this.props.userinformation["id"],useravatar:avatarFile}}
        >
          {imageUrl ? <img src={imageUrl} alt="头像" /> : uploadButton}
        </Upload>
      );
    }
  }

class Teachercenter extends React.Component{
    constructor(props){
      super(props);
      this.state={
        visible1:false,
        visible2:false,
        visible3:false,
        visible4:false,
        confirmDirty:false,
        userinformation:this.props.userinformation,
        username:this.props.userinformation.username,
        phone:this.props.userinformation.phone,
        qrcode:"",//微信二维码所在的url
      }
    }
    
    componentWillMount(){
     courseRow=[];
     allcourseRow=[];
     courseassistantRow=[];
     allcourseassistantRow=[];
      for(let i in this.props.courselist){
           let courseTeacher=[];
           for(let j=0;j<this.props.courselist[i].teachers.length;j++){
             courseTeacher.push(
               <span key={j} style={{marginLeft:"5px",marginRight:"5px"}}>
                   {this.props.courselist[i].teachers[j]["name"]}
               </span>
             )
          }
           if(i<=3){
           courseRow.push(
             <Card.Grid key={this.props.courselist[i]["id"]} style={gridStyle}>
             <Link to={'/teachercenter/teacherclass/'+this.props.courselist[i]["id"]+'/'} 
             style={{color:"black"}}
             onClick={this.props.redirecttocourse}
             >   
             {this.props.courselist[i]["name"]+"    教师:"}
             {courseTeacher}
             </Link>
             </Card.Grid>
           )
           }
           allcourseRow.push(
             <Card.Grid key={this.props.courselist[i]["id"]} style={gridStyle}>
             <Link to={'/teachercenter/teacherclass/'+this.props.courselist[i]["id"]+'/'} 
             style={{color:"black"}}
             onClick={this.props.redirecttocourse}
             >   
             {this.props.courselist[i]["name"]+"    教师:"}
             {courseTeacher}
             {this.props.courselist[i].marks+"学分 "}
             {toDate.exec(this.props.courselist[i].startTime)[1]+"."}
             {toDate.exec(this.props.courselist[i].startTime)[2]+"--"}
             {toDate.exec(this.props.courselist[i].endTime)[1]+"."}
             {toDate.exec(this.props.courselist[i].endTime)[2]}
             </Link>
             </Card.Grid>
           )
      }

      for(let i in this.props.assistantcourselist){
        let courseTeacher2=[];
        for(let j=0;j<this.props.assistantcourselist[i].teachers.length;j++){
          courseTeacher2.push(
            <span key={j} style={{marginLeft:"5px",marginRight:"5px"}}>
                {this.props.assistantcourselist[i].teachers[j]["name"]}
            </span>
          )
       }
        if(i<=3){
          courseassistantRow.push(
          <Card.Grid key={this.props.assistantcourselist[i]["id"]} style={gridStyle}>
          <Link to={'/teachercenter/teacherclass/'+this.props.assistantcourselist[i]["id"]+'/'} 
          style={{color:"black"}}
          onClick={this.props.redirecttocourse}
          >   
          {this.props.assistantcourselist[i]["name"]+"    教师:"}
          {courseTeacher2}
          </Link>
          </Card.Grid>
        )
        }
          allcourseassistantRow.push(
          <Card.Grid key={this.props.assistantcourselist[i]["id"]} style={gridStyle}>
          <Link to={'/teachercenter/teacherclass/'+this.props.assistantcourselist[i]["id"]+'/'} 
          style={{color:"black"}}
          onClick={this.props.redirecttocourse}
          >   
          {this.props.assistantcourselist[i]["name"]+"    教师:"}
          {courseTeacher2}
          {this.props.assistantcourselist[i].marks+"学分 "}
          {toDate.exec(this.props.assistantcourselist[i].startTime)[1]+"."}
          {toDate.exec(this.props.assistantcourselist[i].startTime)[2]+"--"}
          {toDate.exec(this.props.assistantcourselist[i].endTime)[1]+"."}
          {toDate.exec(this.props.assistantcourselist[i].endTime)[2]}
          </Link>
          </Card.Grid>
        )
      }
    }

    componentDidMount(){
      var getQRcode=axios.create({
        url:weburl+"/data/bind_wechat_qrcode/",
        headers:{"content-type":"application/json","token":localStorage.getItem('token')},
        method:'post',
        data:{
          "user_id":localStorage.getItem("userloginKey")
        },
        timeout:timeout,
      })
      var that=this;
      getQRcode().then(function(response){
        that.setState({qrcode:response.data.qrcode});
      })
      .catch(function(error){
        console.log(error);
      })
    }

    componentWillReceiveProps(nextProps){
      if(nextProps.courselist!==this.props.courselist){
        courseRow=[];
        allcourseRow=[];
        for(let i in nextProps.courselist){
          let courseTeacher=[];
          for(let j=0;j<nextProps.courselist[i].teachers.length;j++){
            courseTeacher.push(
              <span key={j} style={{marginLeft:"5px",marginRight:"5px"}}>
                  {nextProps.courselist[i].teachers[j]["name"]}
              </span>
            )
         }
          if(i<=3){
          courseRow.push(
            <Card.Grid key={nextProps.courselist[i]["id"]} style={gridStyle}>
            <Link to={'/teachercenter/teacherclass/'+nextProps.courselist[i]["id"]+'/'} 
            style={{color:"black"}}
            onClick={nextProps.redirecttocourse}
            >   
            {nextProps.courselist[i]["name"]+"    教师:"}
            {courseTeacher}
            </Link>
            </Card.Grid>
          )
          }
          allcourseRow.push(
            <Card.Grid key={nextProps.courselist[i]["id"]} style={gridStyle}>
            <Link to={'/teachercenter/teacherclass/'+nextProps.courselist[i]["id"]+'/'} 
            style={{color:"black"}}
            onClick={nextProps.redirecttocourse}
            >   
            {nextProps.courselist[i]["name"]+"    教师:"}
            {courseTeacher}
            {nextProps.courselist[i].marks+"学分 "}
            {toDate.exec(nextProps.courselist[i].startTime)[1]+"."}
            {toDate.exec(nextProps.courselist[i].startTime)[2]+"--"}
            {toDate.exec(nextProps.courselist[i].endTime)[1]+"."}
            {toDate.exec(nextProps.courselist[i].endTime)[2]}
            </Link>
            </Card.Grid>
          )
        }
      }

      if(nextProps.assistantcourselist!==this.props.assistantcourselist){
        courseassistantRow=[];
        allcourseassistantRow=[];
        for(let i in nextProps.assistantcourselist){
          let courseTeacher2=[];
          for(let j=0;j<nextProps.assistantcourselist[i].teachers.length;j++){
            courseTeacher2.push(
              <span key={j} style={{marginLeft:"5px",marginRight:"5px"}}>
                  {nextProps.assistantcourselist[i].teachers[j]["name"]}
              </span>
            )
         }
          if(i<=3){
            courseassistantRow.push(
            <Card.Grid key={nextProps.assistantcourselist[i]["id"]} style={gridStyle}>
            <Link to={'/teachercenter/teacherclass/'+nextProps.assistantcourselist[i]["id"]+'/'} 
            style={{color:"black"}}
            onClick={nextProps.redirecttocourse}
            >   
            {nextProps.assistantcourselist[i]["name"]+"    教师:"}
            {courseTeacher2}
            </Link>
            </Card.Grid>
          )
          }
            allcourseassistantRow.push(
            <Card.Grid key={nextProps.assistantcourselist[i]["id"]} style={gridStyle}>
            <Link to={'/teachercenter/teacherclass/'+nextProps.assistantcourselist[i]["id"]+'/'} 
            style={{color:"black"}}
            onClick={nextProps.redirecttocourse}
            >   
            {nextProps.assistantcourselist[i]["name"]+"    教师:"}
            {courseTeacher2}
            {nextProps.assistantcourselist[i].marks+"学分 "}
            {toDate.exec(nextProps.assistantcourselist[i].startTime)[1]+"."}
            {toDate.exec(nextProps.assistantcourselist[i].startTime)[2]+"--"}
            {toDate.exec(nextProps.assistantcourselist[i].endTime)[1]+"."}
            {toDate.exec(nextProps.assistantcourselist[i].endTime)[2]}
            </Link>
            </Card.Grid>
          )
        }   
      }
    }

    showModal1=()=>{
      this.setState({visible1:true});
    }

    showModal2=()=>{
      this.setState({visible2:true});
    }

    showModal3=()=>{
      this.setState({visible3:true});
    }

    showModal4=()=>{
      this.setState({visible4:true});
    }

    handleCancel1=()=>{
      this.setState({visible1:false});
    }

    handleCancel2=()=>{
      this.setState({visible2:false});
    }

    handleCancel3=()=>{
      this.setState({visible3:false});
    }

    handleCancel4=()=>{
      this.setState({visible4:false});
    }

    handleConfirmBlur = (e) => {
      const value = e.target.value;
      this.setState({ confirmDirty: this.state.confirmDirty || !!value });
    }
    compareToFirstPassword = (rule, value, callback) => {
      const form = this.props.form;
      if (value && value !== form.getFieldValue('新的密码')) {
        callback('您输入的两个密码不一致!');
      } else {
        callback();
      }
    }
    validateToNextPassword = (rule, value, callback) => {
      const form = this.props.form;
      if (value && this.state.confirmDirty) {
        form.validateFields(['再次确认'], { force: true });
      }
      if(value&&!validPassword.test(value)){
        callback("密码格式不正确(密码必须为6-20位的字母或数字组合)");
      }
      callback();
   }

     handleSubmit1=(e)=>{
       e.preventDefault();
       this.props.form.validateFieldsAndScroll(["原密码","新的密码","再次确认"],(err,values)=>{
          if(!err){
              pass.old_pass=values.原密码;
              pass.new_pass=values.新的密码;
              var changePass=axios.create({
                url:weburl+"/account/change_password/",
                headers:{"content-type":"application/json","token":localStorage.getItem('token')},
                method:'post',
                data:pass,
                timeout:timeout,
              })
              changePass().then(function(response){
                if(response.data.result.code==1000){
                  message.success('密码修改成功!',3);
                }else if(response.data.result.code==4040){
                  message.error('密码修改失败，可能是由于您的原密码不符',3);
                }
              })
              .catch(function(error){
                message.error('密码修改失败，可能是由于您的原密码不符',3);
              })
              this.setState({visible1:false});
          }
       });
     }

     validateUsername=(rule,value,callback)=>{
      if(value){
      const form=this.props.form;
      Userlogin.type="username";
      Userlogin.content=form.getFieldValue('用户名');
      loginUser().then(function(response){
        if(response.data.data.repeat){
          callback('该用户名已被注册!');
        }else{
          callback();
        }
      })
      .catch(function(error){
        console.log(error);
      });
      }else{callback();}
    }

    checkVaildPhone=(rule,value,callback)=>{
      if(value){
      const form=this.props.form;
      Userlogin.type="phone";
      Userlogin.content=form.getFieldValue('手机号');
      if(value&&!validPhone.test(value)){
        callback('您的手机号格式不正确!');
      }
      loginUser().then(function(response){
        if(response.data.data.repeat){
          callback('该手机号已被注册!');
        }else{
          callback();
        }
      }
       )      
      .catch(function(error){
        console.log(error);
      });
      }else{callback();}
    }

    handleSubmit2=(e)=>{
      e.preventDefault();
      this.props.form.validateFieldsAndScroll(["用户名","手机号"],(err,values)=>{
         if(!err){
             let str=localStorage.getItem("user")
             var user=JSON.parse(str)//字符串转换为对象
          if(values.用户名){
            user.username=values.用户名;
          }
          if(values.手机号){
            user.phone=values.手机号;
          }
             var changeuserinformation=axios.create({
              url:weburl+"/graphql/",
              headers:{"content-type":"application/json","token":localStorage.getItem('token'),"Accept":"application/json"},
              method:'post',
              data:{
                "query":`mutation{
                  editUser(
                    userData:{
                      id:${localStorage.getItem('userloginKey')},
                      username:"${user.username}",
                      phone:"${user.phone}",
                    }
                  ){
                     ok
                     user{
                       username
                       phone
                     }
                  }
                }`
              },
              timeout:timeout,
            })
             var that=this;
             if(values.用户名||values.手机号){
             changeuserinformation().then(function(response){
               that.setState({username:user.username,
               phone:user.phone
              })
              that.props.changeinformation(user);
               if(response.data.data.editUser.ok==true){
                message.success('用户信息修改成功!',3);
               }else{
                message.error('用户信息修改失败!',3);
               }
             })
             .catch(function(error){
               message.error('用户信息修改失败!',3);
             })
            }
             this.setState({visible2:false});
         }
      });
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
      const tailFormItemLayout = {
        wrapperCol: {
          xs: {
            span: 24,
            offset: 0,
          },
          sm: {
            span: 16,
            offset: 8,
          },
        },
      };
      const tips='您只需填自己想要变更的某个信息，不用把所有信息全填满'
       return(
            //背景以后会有专门的壁纸
            <div>
            <div style={{ textAlign: 'center' }}>
              <Row>
                <Col xs={24} sm={6}>
                   <div className='uploadavatar'>
                   <UploadAvatar userinformation={this.state.userinformation} />
                   </div>
                </Col>
                <Col xs={24} sm={6}>
                   <div style={{fontSize:"16px",marginTop:"30px",position:"relative"}}>
                   用户名
                   <span style={{ marginLeft:"20px",borderStyle:"solid",borderWidth:"thin",paddingLeft:30,paddingRight:30,borderColor:"#AAAAAA"}}>
                   {this.state.userinformation.username}
                   </span>
                   </div>
                   <div style={{fontSize:"16px",marginTop:"30px",position:"relative"}}>
                   真实姓名
                   <span style={{ marginLeft:"20px",borderStyle:"solid",borderWidth:"thin",paddingLeft:30,paddingRight:30,borderColor:"#AAAAAA"}}>
                   {this.state.userinformation["name"]}
                   </span>
                   </div>
                   <div style={{fontSize:"16px",marginTop:"30px",position:"relative"}}>
                   班级
                   <span style={{ marginLeft:"20px",borderStyle:"solid",borderWidth:"thin",paddingLeft:30,paddingRight:30,borderColor:"#AAAAAA"}}>
                   {this.state.userinformation.class_number}
                   </span>
                   </div>
                </Col>
                <Col xs={24} sm={6}>
                   <div style={{fontSize:"16px",marginTop:"30px",position:"relative"}}>
                   学号
                   <span style={{ marginLeft:"20px",borderStyle:"solid",borderWidth:"thin",paddingLeft:30,paddingRight:30,borderColor:"#AAAAAA"}}>
                   {this.state.userinformation.bupt_id}
                   </span>
                   </div>
                   <div style={{fontSize:"16px",marginTop:"30px",position:"relative"}}>
                   邮箱
                   <span style={{ marginLeft:"20px",borderStyle:"solid",borderWidth:"thin",paddingLeft:30,paddingRight:30,borderColor:"#AAAAAA"}}>
                   {this.state.userinformation.email}
                   </span>
                   </div>
                   <div style={{fontSize:"16px",marginTop:"30px",position:"relative"}}>
                   手机号
                   <span style={{ marginLeft:"20px",borderStyle:"solid",borderWidth:"thin",paddingLeft:30,paddingRight:30,borderColor:"#AAAAAA"}}>
                   {this.state.userinformation.phone}
                   </span>
                   </div>
                </Col>
                <Col xs={24} sm={6}>
                   <Button style={{marginTop:"30px"}} onClick={this.showModal1}>修改密码?</Button>
                   <br/>
                   <Button style={{marginTop:"15px"}} onClick={this.showModal2}>变更信息</Button>
                </Col>
              </Row>
              <br/><br/>
              <Row>
                <Col xs={24} sm={{span:6,offset:5}}>
                   <div style={{fontSize:"16px",marginTop:"30px",position:"relative"}}>
                    我的课程班
                   </div>
                   <Card style={{width:400}} hoverable="true">
                     {courseRow}
                     <Card.Grid key="-1" style={gridStyle} onClick={this.showModal3}>
                     <span style={{color:"#2B91D5"}}> 更多课程......</span>
                     </Card.Grid> 
                     </Card>
                </Col>
                <Col xs={24} sm={{span:6,offset:2}}>
                   <div style={{fontSize:"16px",marginTop:"30px",position:"relative"}}>
                    作为助教加入的课程班
                   </div>
                   <Card style={{width:400}} hoverable="true">
                     {courseassistantRow}
                     <Card.Grid key="-1" style={gridStyle} onClick={this.showModal4}>
                     <span style={{color:"#2B91D5"}}> 更多课程......</span>
                     </Card.Grid> 
                     </Card>
                </Col>
              </Row>
              <br/><br/>
              <Row>
                <Col xs={24} sm={{span:6,offset:4}}>
                   <span style={{fontSize:"20px"}}>绑定微信</span> 
                </Col>
                <Col xs={24} sm={6}>
                <img src={this.state.qrcode} alt="微信二维码" height="40%" width="40%" style={{position:"relative",left:"-50%"}}/>
                </Col>
              </Row> 
              <br/><br/><br/><br/>
            </div>
            <Modal
              title="修改密码"
              visible={this.state.visible1}
              footer={null}
              onCancel={this.handleCancel1}
              destroyOnClose={true}
            >
              <Form onSubmit={this.handleSubmit1}>
                <FormItem
                  {...formItemLayout}
                  label="原密码"
                >
                {getFieldDecorator('原密码', {
                rules: [{required: true, message: '请输入密码!',whitespace:true}],
                 })(
                <Input type="password" />
                )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="新的密码"
                >
                {getFieldDecorator('新的密码', {
                rules: [{
                  required: true, message: '请输入密码!',whitespace:true
                },{
                  validator:this.validateToNextPassword,
                }],
                 })(
                <Input type="password" />
                )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="再次确认"
                >
                {getFieldDecorator('再次确认', {
                rules: [{
                  required: true, message: '请输入密码!',whitespace:true
                },{
                  validator:this.compareToFirstPassword,
                }],
                 })(
                <Input type="password" onBlur={this.handleConfirmBlur} />
                )}
                </FormItem>
                <FormItem {...tailFormItemLayout}>
                   <Button type="primary" htmlType="submit" className="submit2" >确认</Button>
                </FormItem>
              </Form>
            </Modal>
            <Modal
               title="变更信息"
               visible={this.state.visible2}
               footer={null}
               onCancel={this.handleCancel2}
               destroyOnClose={true}
            >
              <Form onSubmit={this.handleSubmit2}>
                 <FormItem
                   {...formItemLayout}
                   label="新的用户名"
                 >
                  {getFieldDecorator('用户名', {
                   rules: [{
                   whitespace:true
                   }, {
                   validator: this.validateUsername,
                   }],
                  })(
                  <Input />
                  )}
                 </FormItem>
                 <FormItem
                   {...formItemLayout}
                   label="新的手机号"
                 >
                  {getFieldDecorator('手机号', {
                   rules: [{
                   whitespace:true
                   }, {
                   validator: this.checkVaildPhone,
                   }],
                  })(
                  <Input />
                  )}
                 </FormItem>
                 <FormItem {...tailFormItemLayout} help={tips}>
                   <Button type="primary" htmlType="submit" className="submit2" >确认</Button>
                </FormItem>
              </Form>
            </Modal>
            <Modal
              title="课程班管理"
              visible={this.state.visible3}
              footer={null}
              onCancel={this.handleCancel3}
            >
             <Card hoverable="true">
             {allcourseRow}
             </Card>
            </Modal>
            <Modal
              title="助教课程班管理"
              visible={this.state.visible4}
              footer={null}
              onCancel={this.handleCancel4}
            >
             <Card hoverable="true">
             {allcourseassistantRow}
             </Card>
            </Modal>
            </div>
        )
    }
}
const WrappedTeachercenter=Form.create()(Teachercenter);
export default WrappedTeachercenter;
