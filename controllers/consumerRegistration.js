const request = require('superagent')
const OAuth = require('oauth-1.0a')
const crypto = require('crypto')
const url = require('url')
const jwt = require('jsonwebtoken')
const toolProxyJSON = require('../config/toolProxy')

exports.register = (req, res) => {

  request
    .get(req.body.tc_profile_url)
    .set('Content-Type', 'application/vnd.ims.lti.v2.toolproxy+json')
    .then((tcp) => {
      toolProxyRequest(req, res, tcp)
    })
    .catch((err) => {
      console.log(err)
    })
}

function toolProxyRequest (req, res, tcp) {
  const endpoint = buildTcpServiceUrl(tcp, 0)
  const request = requestData(req, endpoint, tcp)
  const oauth = configureOAuth(req)

  request
    .post(request.url)
    .set({
      'Authorization': oauth.toHeader(oauth.authorize(request))['Authorization'],
      'Content-Type': 'application/vnd.ims.lti.v2.toolproxy+json'
    })
    .send(request.data)
    .then((toolProxyResponse) => {
      const returnURL =
        `${req.body.launch_presentation_return_url}?tool_proxy_guid=${toolProxyResponse.data.tool_proxy_guid}&status=success`
      res.send(`<script> window.location = "${returnURL}" </script>`)
    })
    .catch((err) => {
      console.log(err)
    })
}

function requestData (req, endpoint, tcp) {
  const toolProxyData = buildToolProxyData(req, tcp)
  const requestObject = {
    method: 'POST',
    url: endpoint,
    includeBodyHash: true,
    data: toolProxyData
  }
  return requestObject
}

function buildToolProxyData (req, tcp) {
  toolProxyJSON.tool_proxy_guid = req.body.reg_key
  toolProxyJSON.security_contract.tp_half_shared_secret = req.body.reg_password
  toolProxyJSON.tool_consumer_profile = req.body.tc_profile_url
  toolProxyJSON.security_contract.tool_service = tcp.data.service_offered.map((hash) => {
    let newHash = {}
    newHash['@type'] = hash['@type']
    newHash['service'] = hash['@id']
    newHash['action'] = hash['action']
    return newHash
  })
  return toolProxyJSON
}

function buildTcpServiceUrl (tcp, index) {
  const endpoint = url.parse(tcp.data.service_offered[index]['endpoint'])
  const service = endpoint.protocol + '//' + endpoint.hostname + endpoint.path
  return service
}

function configureOAuth (req, res) {
	function consumerCredentials (req, res) {
		if (req.body.reg_key && req.body.reg_password) {
		  let consumer = {
			  key: req.body.reg_key,
			  secret: req.body.reg_password
		  }
		  return consumer
	  } else {
	    return res.status(500).send({ error: 'Consumer key and secret not found' })
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
