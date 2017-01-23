const axios = require('axios')
const OAuth = require('oauth-1.0a')
const crypto = require('crypto')
const url = require('url')
const toolProxyJSON = require('../../config/toolProxy')

exports.register = (req, res) => {
  axios.get(req.body.tc_profile_url)
  .then((tcp) => {
    toolProxyRequest(req, res, tcp)
  })
  .catch((error) => {
    console.log(error)
  })
}

function toolProxyRequest (req, res, tcp) {
  const endpoint = url.parse(tcp.data.service_offered[0]['endpoint'])
  const service = endpoint.protocol + '//' + endpoint.hostname + endpoint.path
  const request = requestData(req, service)
  const oauth = configureOAuth(req)
  console.log(request)

  axios({
    url: request.url,
    method: request.method,
    headers: {
      'Authorization': oauth.toHeader(oauth.authorize(request))['Authorization'],
      'Content-Type': 'application/vnd.ims.lti.v2.toolproxy+json',
    },
    data: request.data,
  })
  .then(() => {
    const returnURL =
      `${req.body.launch_presentation_return_url}?tool_proxy_guid=${req.body.reg_key}&status=success`
    res.send(`<script> window.location = "${returnURL}" </script>`)
  })
}

function requestData (req, endpoint) {
  const toolProxyData = configureToolProxy(req)
  const requestObject = {
    method: 'POST',
    url: endpoint,
    includeBodyHash: true,
    data: toolProxyData
  }
  return requestObject
}

function configureToolProxy (req) {
  toolProxyJSON.tool_proxy_guid = req.body.reg_key
  toolProxyJSON.security_contract.shared_secret = req.body.reg_password
  tool_consumer_profile = req.body.tc_profile_url
  return toolProxyJSON
}

function configureOAuth (req) {
  const oauth = OAuth({
    consumer: {
      key: req.body.reg_key,
      secret: req.body.reg_password,
    },
    signature_method: 'HMAC-SHA1',
    hash_function: (baseString, key) => {
      return crypto.createHmac('sha1', key).update(baseString).digest('base64')
    }
  })
  return oauth
}
