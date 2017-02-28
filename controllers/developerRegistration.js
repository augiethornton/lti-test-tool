const axios = require('axios')
const url = require('url')
const jwt = require('jsonwebtoken')
const uuid = require('uuid/v4')
const toolProxyJSON = require('../config/toolProxy')

exports.register = (req, res) => {
  
  authorizationJwtRequest (req, res).then((authJwt) => {
    console.log(req.body.tc_profile_url)
    axios({
      url: req.body.tc_profile_url,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authJwt}`,
        'Content-Type': 'application/vnd.ims.lti.v2.toolproxy+json'
      }
    })
    .then((customTCP) => {
      console.log(customTCP.data)
      toolProxyRequest(req, res, customTCP)
    })
    .catch((err) => {
      console.log(err)
    })
  })
}

function toolProxyRequest (req, res, customTCP) {
  const method = 'POST'
  const service = url.parse(customTCP.data.service_offered[0]['endpoint'])
  const endpoint = service.protocol + '//' + service.hostname + service.path
  const toolProxyData = buildToolProxyData(req, customTCP)
  
  authorizationJwtRequest (req, res).then((authJwt) => {
	  axios({
      url: endpoint,
      method: method,
      headers: {
        'Authorization': `Bearer ${authJwt}`,
        'Content-Type': 'application/vnd.ims.lti.v2.toolproxy+json'
      },
      data: toolProxyData
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

function buildToolProxyData (req, customTCP) {
  toolProxyJSON.tool_proxy_guid = req.body.reg_key
  toolProxyJSON.security_contract.tp_half_shared_secret = req.body.reg_password
  toolProxyJSON.tool_consumer_profile = req.body.tc_profile_url
  toolProxyJSON.security_contract.tool_service = customTCP.data.service_offered.map((hash) => {
    let newHash = {}
    newHash['@type'] = hash['@type']
    newHash['service'] = hash['@id']
    newHash['action'] = hash['action']
    return newHash
  })
  return toolProxyJSON
}

function authorizationJwtRequest (req, res) {
  
  function buildTcpAuthUrl (req) {
    return new Promise((resolve, reject) => {
      axios({
        url: req.body.tc_profile_url,
        method: 'GET'
      })
      .then((tcp) => {
        const endpoint = url.parse(tcp.data.service_offered[2]['endpoint'])
        const authUrl = endpoint.protocol + '//' + endpoint.hostname + endpoint.path
        resolve(authUrl)
      })
      .catch((err) => {
        reject(console.log(err))
      })
    })   
  }
  
  return new Promise((resolve, reject) => {
    buildTcpAuthUrl(req).then((authUrl) => {
      const authJwt = signJwt(req, authUrl)
	
      axios({
        url: authUrl,
        method: 'POST',
        data: {
          grant_type: 'authorization_code',
          code: req.body.reg_key,
          assertion: authJwt
        }
      })
      .then((res) => {
        resolve(res.data.access_token)
      })
      .catch((err) => {
        reject(console.log(err))
      })
    })
  })
}

function signJwt (req, authUrl) {
	const secret = process.env.DEVELOPER_KEY_API_KEY
	const payload = {
    "sub": process.env.DEVELOPER_KEY_GLOBAL_ID,
    "aud": authUrl,
    "jti": uuid()
  }
  return jwt.sign(payload, secret, { expiresIn: '1m' })
}
