const request = require('superagent')
const url = require('url')
const jwt = require('jsonwebtoken')
const uuid = require('uuid/v4')
const toolProxyJSON = require('../config/toolProxy')
const CanvasAuthorizationJwt = require('../helpers/developerRegistrationHelper')

exports.register = (req, res) => {

  authorizationJwtRequest (req, res).then((authJwt) => {

    request
      .get(req.body.tc_profile_url)
      .set({
        'Authorization': `Bearer ${authJwt}`,
        'Content-Type': 'application/vnd.ims.lti.v2.toolproxy+json'
      })
      .then((customTCP) => {
        console.log(customTCP.body.service_offered)
        toolProxyRequest(req, res, customTCP)
      })
      .catch((err) => {
        console.log(err)
      })
  })
}

function toolProxyRequest (req, res, customTCP) {
  const service = customTCP.body.service_offered.find((srv) => {
    return srv.format.includes('application/vnd.ims.lti.v2.toolproxy+json') &&
           srv.action.includes('POST')
  })
  const toolProxyData = buildToolProxyData(req, customTCP)

  authorizationJwtRequest (req, res).then((authJwt) => {

    request
      .post(service.endpoint)
      .set({
        'Authorization': `Bearer ${authJwt}`,
        'Content-Type': 'application/vnd.ims.lti.v2.toolproxy+json'
      })
      .send(toolProxyData)
      .then((toolProxyResponse) => {
        const returnURL =
          `${req.body.launch_presentation_return_url}?tool_proxy_guid=${toolProxyResponse.body.tool_proxy_guid}&status=success`
        res.send(`<script> window.location = "${returnURL}" </script>`)
        setTimeout(() => {
          CanvasAuthorizationJwt (req, res, toolProxyResponse).then((canvasJwt) => {
            console.log(`Canvas JWT: ${canvasJwt}`)
          })
        }, 5000)
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
  toolProxyJSON.security_contract.tool_service = customTCP.body.service_offered.map((hash) => {
    let newHash = {}
    newHash['@type'] = hash['@type']
    newHash['service'] = hash['@id']
    newHash['action'] = hash['action']
    return newHash
  })
  return toolProxyJSON
}

function authorizationJwtRequest (req, res) {

  return new Promise((resolve, reject) => {
    const authJwt = signJwt(req)

    request
      .post(req.body.oauth2_access_token_url)
      .send({
        grant_type: 'authorization_code',
        code: req.body.reg_key,
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

function signJwt (req) {
	const secret = process.env.DEVELOPER_KEY_API_KEY
	const payload = {
    "sub": process.env.DEVELOPER_KEY_GLOBAL_ID,
    "aud": req.body.oauth2_access_token_url,
    "jti": uuid()
  }
  return jwt.sign(payload, secret, { expiresIn: '1m' })
}
