const axios = require('axios')
const OAuth = require('oauth-1.0a')
const crypto = require('crypto')
const url = require('url')
const jwt = require('jsonwebtoken')
const uuid = require('uuid/v4')()
const toolProxyJSON = require('../config/toolProxy')

exports.register = (req, res) => {
  const endpoint = req.body.tc_profile_url
  const method = 'GET'
  const oauth = configureOAuth(req, res)
  const request = {
    method: method,
    url: endpoint,
    includeBodyHash: true
  }

  axios({
    url: endpoint,
    method: method,
    headers: {
      'Authorization': oauth.toHeader(oauth.authorize(request))['Authorization'],
      'Content-Type': 'application/vnd.ims.lti.v2.toolproxy+json'
    }
  })
  .then((tcp) => {
    toolProxyRequest(req, res, tcp)
  })
  .catch((err) => {
    console.log(err)
  })
}

function toolProxyRequest (req, res, tcp) {
	const method = 'POST'
  const endpoint = buildTcpServiceUrl(tcp, 0)
  const request = requestData(req, endpoint, method, tcp)
  
  authorizationJwtRequest (req, res, tcp).then((authJwt) => {
	  axios({
    url: request.url,
    method: request.method,
    headers: {
      'Authorization': `Bearer ${authJwt}`,
      'Content-Type': 'application/vnd.ims.lti.v2.toolproxy+json'
    },
    data: request.data
	  })
	  .then((toolProxyResponse) => {
	    const returnURL =
	      `${req.body.launch_presentation_return_url}?tool_proxy_guid=${toolProxyResponse.data.tool_proxy_guid}&status=success`
	    res.send(`<script> window.location = "${returnURL}" </script>`)
	  })
	  .catch((err) => {
	    console.log(err)
	  })
  })
}

function requestData (req, endpoint, method, tcp) {
  const toolProxyData = buildToolProxyData(req, tcp)
  const requestObject = {
    method: method,
    url: endpoint,
    includeBodyHash: true,
    data: toolProxyData
  }
  return requestObject
}

function buildToolProxyData (req, tcp) {
  toolProxyJSON.tool_proxy_guid = req.body.reg_key
  toolProxyJSON.security_contract.tp_half_shared_secret = req.body.reg_password
  toolProxyJSON.security_contract.tool_service.map(
    (hash) => { hash.service = tcp.data.service_offered[6]['@id'] })
  toolProxyJSON.tool_consumer_profile = req.body.tc_profile_url
  return toolProxyJSON
}

function buildTcpServiceUrl (tcp, index) {
  const endpoint = url.parse(tcp.data.service_offered[index]['endpoint'])
  const service = endpoint.protocol + '//' + endpoint.hostname + endpoint.path
  return service
}

function configureOAuth (req, res) {
	function consumerCredentials (req, res) {
		if (process.env.DEVELOPER_KEY_GLOBAL_ID && process.env.DEVELOPER_KEY_API_KEY) {
			let consumer = {
	      key: process.env.DEVELOPER_KEY_GLOBAL_ID,
	      secret: process.env.DEVELOPER_KEY_API_KEY
	    }
	    return consumer
	  } else if (req.body.reg_key && req.body.reg_password) {
		  let consumer = {
			  key: req.body.reg_key,
			  secret: req.body.reg_password
		  }
		  return consumer
	  } else {
	    res.status(500).send({ error: 'Consumer key and secret not found' })
	    return
	  }
	}
	const consumer = consumerCredentials(req, res)
  const oauth = OAuth({
	  consumer,
    signature_method: 'HMAC-SHA1',
    hash_function: (baseString, key) => {
      return crypto.createHmac('sha1', key).update(baseString).digest('base64')
    }
  })
  return oauth
}

function authorizationJwtRequest (req, res, tcp) {
  return new Promise((resolve, reject) => {
	  const authJwt = signedJwt(req, tcp)
	  const service = buildTcpServiceUrl(tcp, 1)
	
	  axios({
	    url: service,
	    method: 'POST',
	    data: {
	      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
	      assertion: authJwt
	    }
	  })
	  .then((res) => {
		  resolve(res.data.access_token)
	  })
	  .catch((err) => {
	    console.log(err)
	    reject()
	  })
  })
}

function signedJwt (req, tcp) {
	const service = buildTcpServiceUrl(tcp, 1)
	const secret = process.env.DEVELOPER_KEY_API_KEY
	const payload = {
    "sub": process.env.DEVELOPER_KEY_GLOBAL_ID,
    "aud": service,
    "jti": uuid
  }
  return jwt.sign(payload, secret, { expiresIn: '1m' })
}