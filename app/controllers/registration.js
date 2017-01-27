const axios = require('axios')
const OAuth = require('oauth-1.0a')
const crypto = require('crypto')
const url = require('url')
const jwt = require('jsonwebtoken')
const uuidV4 = require('uuid/v4')()
const toolProxyJSON = require('../../config/toolProxy')

exports.register = (req, res) => {
  const endpoint = req.body.tc_profile_url
  const method = 'GET'
  const oauth = configureOAuth(req)
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
  const endpoint = buildTcpServiceUrl(tcp, 0)
  const method = 'POST'
  const request = requestData(req, endpoint, method, tcp)
  const oauth = configureOAuth(req)

  axios({
    url: request.url,
    method: request.method,
    headers: {
      'Authorization': oauth.toHeader(oauth.authorize(request))['Authorization'],
      'Content-Type': 'application/vnd.ims.lti.v2.toolproxy+json'
    },
    data: request.data
  })
  .then((toolProxyResponse) => {
    const returnURL =
      `${req.body.launch_presentation_return_url}?tool_proxy_guid=${toolProxyResponse.data.tool_proxy_guid}&status=success`
    res.send(`<script> window.location = "${returnURL}" </script>`)
    setTimeout(() => {
      authorizationJwtRequest(req, res, tcp, toolProxyResponse)
    }, 5000)
  })
  .catch((err) => {
    console.log(err)
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

function configureOAuth (req) {
  const oauth = OAuth({
    consumer: {
      key: process.env.DEVELOPER_KEY_GLOBAL_ID,
      secret: process.env.DEVELOPER_KEY_API_KEY,
    },
    signature_method: 'HMAC-SHA1',
    hash_function: (baseString, key) => {
      return crypto.createHmac('sha1', key).update(baseString).digest('base64')
    }
  })
  return oauth
}

function authorizationJwtRequest (req, res, tcp, toolProxyResponse) {
  const AuthorizationJWT = generateJWT(req, tcp, toolProxyResponse)
  const service = buildTcpServiceUrl(tcp, 1)

  axios({
    url: service,
    method: 'POST',
    data: {
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: AuthorizationJWT
    }
  })
  .then((res) => {
    console.log(res)
  })
  .catch((err) => {
    console.log(err)
  })
}

function generateJWT (req, tcp, toolProxyResponse) {
  const toolProxyGuid = toolProxyResponse.data.tool_proxy_guid
  const service = buildTcpServiceUrl(tcp, 1)
  const payload = {
    "iss": toolProxyGuid,
    "sub": toolProxyGuid,
    "aud": service,
    "jti": uuidV4
  }
  const secret = toolProxyResponse.data.tc_half_shared_secret + req.body.reg_password
  const header = {
    kid: toolProxyGuid
  }
  const token = jwt.sign(payload, secret, { header: header, expiresIn: '1m' })
  return token
}
