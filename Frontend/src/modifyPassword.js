import React from 'react';
import ReactDOM from 'react-dom';
import './modifyPassword.css';
import {Modal,Button,Input,Form}from'antd';
import axios from 'axios';
const FormItem = Form.Item;
var gotToken='';
var password={new_pass:''};
var re=/^([0-9a-zA-Z\_\.\/\:]*)\?token=(.*)$/;
var validPassword =/^\w{6,20}$/;

class ModifyPassword extends React.Component{
    constructor(props){
        super(props);
        this.state={
            name:'',
            confirmDirty: false,
        }
    }

    componentDidMount(){
        if(gotToken===''){
            gotToken=re.exec(window.location.href)[2];
            var confirm=axios.create({
             url:"http://localhost:8000/account/confirm_forgotten/",
             headers:{"content-type":"application/json","token":gotToken},
             method:'post',
             timeout:1000,
            })
            var that=this;
            confirm().then(function(response){
               that.setState({name:response.data.data.username});
            })
            .catch(function(error){
                console.log(error);
            })
        }
    }

    componentWillUnmount(){
        gotToken='';
    }

    compareToFirstPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && value !== form.getFieldValue('密码')) {
          callback('您输入的两个密码不一致!');
        } else {
          callback();
        }
      }
    validateToNextPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && this.state.confirmDirty) {
          form.validateFields(['确认密码'], { force: true });
        }
        if(value&&!validPassword.test(value)){
          callback("密码格式不正确(密码必须为6-20位的字母或数字组合)");
        }
        callback();
    }

    handleConfirmBlur = (e) => {
        const value = e.target.value;
        this.setState({ confirmDirty: this.state.confirmDirty || !!value });
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
          if (!err) {
            password.new_pass=values.密码;
            var changePassword=axios.create({
                url:"http://homeworkplus.cn/account/change_directly/",
                headers:{"content-type":"application/json","token":gotToken},
                data:password,
                method:'post',
                timeout:1000,
            })
            changePassword().then(function(response){
                const modal = Modal.success({
                    title:"新密码已设置成功!",
                    okText:"确认",
                });
            })
            .catch(function(error){
                console.log(error);
            })
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
            sm: { span: 10 },
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
        return(
            <div>
                <p className='title'>您好，{this.state.name}!请修改您的密码</p>
                <Form onSubmit={this.handleSubmit} className='form'>
                <FormItem
             {...formItemLayout}
             label="设置新密码"
            >
            {getFieldDecorator('密码', {
             rules: [{
              required: true, message: '请设置新密码!',whitespace:true
            }, {
              validator: this.validateToNextPassword,
            }],
             })(
            <Input type="password" />
             )}
             </FormItem>
            <FormItem
             {...formItemLayout}
             label="再次确认密码"
            >
            {getFieldDecorator('确认密码', {
            rules: [{
              required: true, message: '请确认你的密码!',whitespace:true
            }, {
              validator: this.compareToFirstPassword,
            }],
             })(
            <Input type="password" onBlur={this.handleConfirmBlur} />
            )}
            </FormItem>
            <FormItem {...tailFormItemLayout}>
            <Button type="primary" htmlType="submit" className="submit3">确认</Button>
            </FormItem>
            </Form>
            </div>
        )
    }
}
const WrappedModifyPassword = Form.create()(ModifyPassword);
export default WrappedModifyPassword;