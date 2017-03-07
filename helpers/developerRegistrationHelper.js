const axios = require('axios')
const url = require('url')
const jwt = require('jsonwebtoken')
const uuid = require('uuid/v4')

function canvasAuthorizationJwt (req, res, toolProxyResponse) {
  
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
      const authJwt = signJwt(req, authUrl, toolProxyResponse)
	
      axios({
        url: authUrl,
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
        reject(console.log(err))
      })
    })
  })
}

function signJwt (req, authUrl, toolProxyResponse) {
  const toolProxyGuid = toolProxyResponse.data.tool_proxy_guid
	const secret = toolProxyResponse.data.tc_half_shared_secret + req.body.reg_password
	const payload = {
    "sub": toolProxyGuid,
    "aud": authUrl,
    "jti": uuid()
  }
  return jwt.sign(payload, secret, { expiresIn: '1m' })
}

module.exports = canvasAuthorizationJwt