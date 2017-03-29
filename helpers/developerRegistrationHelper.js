const request = require('superagent')
const url = require('url')
const jwt = require('jsonwebtoken')
const uuid = require('uuid/v4')

function canvasAuthorizationJwt (req, res, toolProxyResponse) {

  return new Promise((resolve, reject) => {
    const authJwt = signJwt(req, toolProxyResponse)

    request
      .post(req.body.oauth2_access_token_url)
      .send({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: authJwt
      })
      .then((res) => {
        resolve(res.body.access_token)
      })
      .catch((err) => {
        reject(console.log(err))
      })
  })
}

function signJwt (req, toolProxyResponse) {
  const toolProxyGuid = toolProxyResponse.body.tool_proxy_guid
	const secret = toolProxyResponse.body.tc_half_shared_secret + req.body.reg_password
	const payload = {
    "sub": toolProxyGuid,
    "aud": req.body.oauth2_access_token_url,
    "jti": uuid()
  }
  return jwt.sign(payload, secret, { expiresIn: '1m' })
}

module.exports = canvasAuthorizationJwt
