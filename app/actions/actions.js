import actionTypes from "../actionTypes"
import pageTypes from "../pageTypes"
import BiasCheckerService from "../services/BiasCheckerService"
import Settings from "../model/Settings"
import Auth from '../model/Auth'
import {FetchUrlInstance} from '../services/FetchUrl'

const settings = new Settings()
export const fetchUrl = new FetchUrlInstance()
const biasCheckerService = new BiasCheckerService(settings.biasServiceUrl, settings.biasCheckerAppId, settings.biasCheckerSecret, fetchUrl)

//tested
export const indicatePageWasLoaded = (page) => {
	return{
		type: actionTypes.SET_PAGE,
		id: 0,
		currentPage: page
	}
}

const failCall = (error, actionType) => {
//	console.log(error,actionType)
	var action = {
		type: (actionType !== undefined ? actionType : actionTypes.FAILED),
		id: 16,
		error: error
	}
//	console.log(action)
	return action
}

//tested
export const changePage = (fromPage, toPage, history) => {
	history.push("/") //reposition at root - hacky, i know
	history.push(toPage)
	return{
		type: actionTypes.CHANGE_PAGE,
		id: 6,
		fromPage: fromPage,
		toPage: toPage
	}
}

export const loginBasicAsync = (username, password, biasService) =>{
	//log user in to biaschecker and retrieve biasToken, keep details
	if(biasService === undefined){
		biasService = biasCheckerService
	}
	return function(dispatch) {
		return biasService.authenticateBasic(username, password)
		.then((data)=>{
			if(data.error !== undefined){
				dispatch(failCall(data.error))
			}else{
				dispatch(loginJwt(data))
			}
		})
		.catch((error) => {
			dispatch(failCall(error))
		})
	}
}

export const loginJwt = (jwt) =>{
	//sync jwt in browser with current jwt
	localStorage.setItem(new Settings().biasCheckerJwtKey, jwt)
	let jwtd = Auth.decodeJwt(jwt)
	if(jwtd !== null){
		return {
			type: actionTypes.LOGIN,
			id: 15,
			userName: jwtd.name,
			userId: jwtd.userId,
			memberId: jwtd.memberId,
			roles: jwtd.scope
		}		
	}else{
		return failCall({
			message: "Invalid client-side JWT"
		}, actionTypes.LOGIN_FAILED)
	}
}

const loadArticles = (articles) => {
	return {
		type: actionTypes.SHOW_ARTICLES,
		id: 7,
		articles: articles
	}
}

export const loadArticlesAsync = (settings, biasService) => {
	if(biasService === undefined){
		biasService = biasCheckerService
	}
	return function(dispatch){
		return biasService.loadArticles()
		.then((data) =>{
			if(data.error !== undefined){
				dispatch(failCall(data.error))
			}else{
				dispatch(loadArticles(data))			
			}
		})
		.catch((error) => {
			dispatch(failCall(error))
		})
	}
}

const loadRoleRequests = (members) => {
	return {
		type: actionTypes.LOAD_ROLE_REQUESTS,
		id: 5,
		members: members
	}
}

export const loadRoleRequestsAsync = (biasService) => {
	if(biasService === undefined){
		biasService = biasCheckerService
	}
	return function(dispatch){
		return biasService.loadMembersForApproval()
		.then((data) =>{
			if(data.error !== undefined){
				dispatch(failCall(data.error))
			}else{
				dispatch(loadRoleRequests(data))
			}
		})
		.catch((error) => {
			console.log("loadRoleRequestsAsync", error)
		})
	}
}

const addRole = (grantInfo) => {
	return {
		type: actionTypes.GRANT_PROMOTION_REQUEST,
		id: 8,
		grantInfo: grantInfo
	}
}

export const addRoleAsync = (targetMemberId, targetRoleId, biasService) => {
	if(biasService === undefined){
		biasService = biasCheckerService
	}
	return function(dispatch){
		return biasService.approveRole(targetMemberId, targetRoleId)
		.then((data) => {
			if(data.error !== undefined){
				dispatch(failCall(data.error))
			}else{
				dispatch(addRole(data))
			}
		})
		.catch((error) => {
			dispatch(failCall(error))
		})
	}	
}

const analyzeArticle = (article) => {
	return {
		type: actionTypes.ANALYZE_ARTICLE,
		id: 9,
		article: article
	}
}

export const analyzeArticleAsync = (label, link, biasService) => {
	if(biasService === undefined){
		biasService = biasCheckerService
	}
	return function(dispatch){
		return biasService.analyzeArticle(label, link)
		.then((data) => {
			if(data.error !== undefined){
				dispatch(failCall(data.error))
			}else{
				dispatch(analyzeArticle(data))				
			}
		})
		.catch((error) => {
			dispatch(failCall(error))
		})
	}
}

const searchForMyArticle = (keywordWasValid, matchingArticles) => {
	return {
		type:actionTypes.MY_ARTICLE_KEYWORD_SEARCH,
		id: 10,
		keywordWasValid: keywordWasValid,
		matchingArticles: matchingArticles
	}
}

export const searchForMyArticleAsync = (keyword, biasService) => {
	if(biasService === undefined){
		biasService = biasCheckerService
	}
	return function(dispatch){
		return biasService.searchMyArticles(keyword)
		.then((data) => {
			if(data.error !== undefined){
				dispatch(failCall(data.error))
			}else{
				dispatch(searchForMyArticle(true, data))
			}
		})
		.catch((error)=>{
			dispatch(failCall(error))
		})			
	}
}

const loadStream = (articles) => {
	return {
		type: actionTypes.SHOW_STREAM,
		id: 11,
		articles: articles
	}
}

export const loadStreamAsync = (count, offset, biasService) => {
	if(biasService === undefined){
		biasService = biasCheckerService
	}
	return function(dispatch){
		return biasService.loadStream(count, offset)
		.then((data) =>{
			if(data.error !== undefined){
				dispatch(failCall(data.error))
			}else{
				dispatch(loadStream(data))			
			}
		})
		.catch((error) => {
			dispatch(failCall(error))
		})
	}
}

const reviewArticle = (article, history) => {
	history.push("/stream/" + article.id)
	return {
		type: actionTypes.REVIEW_ARTICLE,
		id:12,
		article: article
	}
}

export const reviewArticleAsync = (articleId, history, biasService) => {
	if(biasService === undefined){
		biasService = biasCheckerService
	}
	return function(dispatch){
		return biasService.loadArticle(articleId)
		.then((data) =>{
			if(data.error !== undefined){
				dispatch(failCall(data))
			}else{
				dispatch(reviewArticle(data, history))				
			}
		})
		.catch((error) => {
			console.log(error)
			dispatch(failCall(error))
		})
	}	
}

const critiqueArticle = (articleWithNewCritique) => {
	return {
		type: actionTypes.ADD_ARTICLE_CRITIQUE,
		id: 14,
		article: articleWithNewCritique
	}
}

export const critiqueArticleAsync = (articleId, errorType, analysis, quotation, paragraphIndex, sentenceIndex, biasService) => {
	if(biasService === undefined){
		biasService = biasCheckerService
	}
	return function(dispatch){
		return biasService.critiqueArticle(articleId, paragraphIndex, sentenceIndex, quotation, 
			analysis, errorType)
		.then((data) =>{
			if(data.error !== undefined){
				dispatch(failCall(data.error))
			}else{
				dispatch(critiqueArticle(data))				
			}
		})
		.catch((error) => {
			dispatch(failCall(error))
		})
	}
}

const changePassword = (data) => {
	return {
		type: actionTypes.CHANGE_PASSWORD,
		id:15,
		result: data
	}
}

export const changePasswordAsync = (newPassword, biasService) => {
	if(biasService === undefined){
		biasService = biasCheckerService
	}
	return function(dispatch){
		return biasService.changePassword(newPassword)
		.then((data) => {
			if(data.error !== undefined){
				dispatch(failCall(data.error))
			}else{
				dispatch(changePassword(data))
			}
		})
		.catch((error) => {
			dispatch(failCall(error))
		})
	}
}

const createAccount = (data, email) =>{
	return {
		type:actionTypes.CREATE_MEMBER,
		id: 17,
		result:data
	}
}

export const createAccountAsync = (email, password, biasService) => {
	if(biasService === undefined){
		biasService = biasCheckerService
	}	
	return function(dispatch){
		return biasService.createAccount(email, password)
		.then((data) => {
			if(data.error === undefined){
				dispatch(createAccount(data, email))
			}else{
				dispatch(failCall(data))
			}
		})
		.catch((error) => {
			dispatch(failCall(error))
		})
	}
}

const requestRole = (data) => {
	return {
		type: actionTypes.REQUEST_ROLE,
		id: 18,
		result:data
	}
}

export const requestRoleAsync = (targetMemberId, roleName, biasService) => {
	if(biasService === undefined){
		biasService = biasCheckerService
	}	
	return function(dispatch){
		return biasService.requestRole(targetMemberId, roleName)
		.then((data) => {
			if(data.error === undefined){
				dispatch(requestRole(data))
			}else{
				dispatch(failCall(data.error))
			}
		})
		.catch((error) => {
			dispatch(failCall(error))
		})
	}	
}

const denyRole = (grantInfo) => {
	return {
		type: actionTypes.DENY_PROMOTION_REQUEST,
		id: 19,
		grantInfo: grantInfo
	}
}

export const denyRoleAsync = (targetMemberId, targetRoleId, biasService) => {
	if(biasService === undefined){
		biasService = biasCheckerService
	}	
	return function(dispatch){
		return biasService.denyRole(targetMemberId, targetRoleId)
		.then((data) => {
			if(data.error === undefined){
				dispatch(denyRole(data))
			}else{
				dispatch(failCall(data.error))
			}
		})
		.catch((error) => {
			dispatch(failCall(error))
		})
	}	
}

export const notifyUser = (message) => {
	return {
		type: actionTypes.NOTIFY_USER,
		id: 20,
		message: message
	}
}

export const clearUserNotification = (triggerGroup, triggerState) => {
	return {
		type: actionTypes.CLEAR_NOTIFY_USER,
		id: 21,
		triggerGroup: triggerGroup,
		triggerState: triggerState
	}
}

const linkToFacebook = (data) => {
	return {
		type: actionTypes.LINK_TO_FACEBOOK,
		id: 22,
		data: data
	}
}

export const linkToFacebookAsync = (facebookToken, biasService) =>{
	if(biasService === undefined){
		biasService = biasCheckerService
	}
	return function(dispatch) {
		return biasService.linkToFacebook(facebookToken)
		.then((data) => {
			if(data.error === undefined){
				dispatch(linkToFacebook(data))
			}else{
				dispatch(failCall(data))
			}
		})
		.catch((error) => {
			dispatch(failCall(error))
		})
	}
}

export const clearError = () => {
	return {
		type: actionTypes.CLEAR_ERROR,
		id: 23
	}
}
const requestPasswordReset = (data)=>{
	return {
		type: actionTypes.RESET_PASSWORD_REQUEST,
		id: 24,
		passwordReset:true
	}
}

export const requestPasswordResetAsync = (email, biasService)=>{
	if(biasService === undefined){
		biasService = biasCheckerService
	}
	return function(dispatch) {
		return biasService.requestPasswordReset(email)
		.then((data) => {
			if(data.error === undefined){
				dispatch(requestPasswordReset(data))
			}else{
				dispatch(failCall(data.error))
			}
		})
		.catch((error) => {
			dispatch(failCall(error))
		})
	}
}

const resetPassword = (data)=>{
	return {
		type: actionTypes.PASSWORD_RESET,
		id: 25,
		passwordReset:true
	}
}

export const resetPasswordAsync = (passwordResetRequestId, password, biasService)=>{
	if(biasService === undefined){
		biasService = biasCheckerService
	}
	return function(dispatch) {
		return biasService.resetPassword(passwordResetRequestId, password)
		.then((data) => {
			if(data.error !== undefined){
				dispatch(failCall(data.error))
			}else{
				dispatch(resetPassword(data))
			}
		})
		.catch((error) => {
			dispatch(failCall(error))
		})
	}
}
