import React from 'react'
import ReactDOM from 'react-dom'
import {withRouter} from 'react-router'
import {PropTypes} from 'prop-types'
import store from '../store'
import Card, {CardHeader, CardContent} from 'material-ui/Card'
import {createAccountAsync, notifyUser, changePage} from '../actions/actions'
import {connect} from 'react-redux'
import UserNotification from './UserNotification'
import Typography from 'material-ui/Typography'

class CreateAccount extends React.Component{
	constructor(props){
		super(props)
		this.state = {}
		this.handleInputChange = this.handleInputChange.bind(this)
		this.handleSubmit = this.handleSubmit.bind(this)
		this.sendToRoot = this.sendToRoot.bind(this)
		this.history = props.history
		this.validation = {}
		this.createAccount = props.createAccount
		this.notifyUser = props.notifyUser
		this.settings = props.settings
		this.changePage = props.changePage
	}

	handleInputChange(event){
		const target = event.target
		const value = target.type === 'checkbox' ? target.checked : target.value
		const name = target.name
		this.setState({[name]: value})
	}

	handleSubmit(event){
		this.validation = this.validate()
		if(!this.validation.password && !this.validation.email){
			this.createAccount(this.settings, this.state.email, this.state.password, this.history)
		}else{
			alert("The form is invalid.")
		}
	}

	componentWillMount(){
		if(this.hasMounted === undefined){
	    	let state = store.getState()
			this.hasMounted = true		
		}
	}

	sendToRoot(){
		this.changePage("account", "/", this.history)
	}

	validate(){
		return {
			//both password must be equal and not undefined
			password: this.state.password === undefined || this.state.password != this.state.pwconfirm,
			username: this.state.email === undefined
		}
	}

	render(){
		return  <Card>
				<CardContent>
					<Typography type="headline" component="h4">
		                {"Enter account information"}
		            </Typography>
					<form className="col s12">
					    <div className="row">
					        <div className="input-field col s12">
					          <input name="email" type="email" required className="validate" onChange={this.handleInputChange}></input>
					          <label htmlFor="email">Email (will be your username)</label>
					        </div>
					    </div>
					    <div className="row">
					        <div className="input-field col s12">
					          <input name="password" type="password" required className="validate" onChange={this.handleInputChange}></input>
					          <label htmlFor="password">Password</label>
					        </div>
					    </div>
					    <div className="row">
					        <div className="input-field col s12">
					          <input name="pwconfirm" type="password" required className="validate" onChange={this.handleInputChange}></input>
					          <label htmlFor="pwconfirm">Confirm Password</label>
					        </div>
					    </div>
					    <div className="row">
					        <div className="input-field col s12 white-text">
					          <button id="create_member" type="button" onClick={this.handleSubmit} className="btn-large waves-effect waves-light indigo lighten-1">{"Create!"}</button>&nbsp&nbsp
					        </div>
					    </div>
			  		</form>
		  		</CardContent>
		  		<CardContent>
			  		<UserNotification 
			  			triggerGroup="notify" triggerState="newAccountCreated" message="A new account was created" closeAction={this.sendToRoot}/>		  		
		  		</CardContent>
		  	</Card>	
	}
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    createAccount: (settings, email, password, history) => dispatch(createAccountAsync(settings, email, password, history)),
    changePage: (fromPage, toPage, history) => dispatch(changePage(fromPage, toPage, history))
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    settings:state.settings
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CreateAccount))