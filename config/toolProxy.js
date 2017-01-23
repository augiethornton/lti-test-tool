const uuidV4 = require('uuid/v4')()

module.exports = {

  "@context" : "http://purl.imsglobal.org/ctx/lti/v2/ToolProxy",

  "@type" : "ToolProxy",

  "@id" : "instructure.com/lti-test-tool/" + uuidV4,

  "lti_version" : "LTI-2p1",

  "tool_proxy_guid" : "",

  "security_contract" : { "shared_secret" : "" },

  "tool_consumer_profile" : "",

  "tool_profile": {
    "lti_version": "LTI-2p1",
    "product_instance": {
      "guid": "" + uuidV4,
      "product_info": {
        "product_name": {
          "default_value": "lti-test-tool",
          "key": "tool.name"
        },
        "product_version": "2.x",
        "product_family": {
          "code": "lti-test-tool",
          "vendor": {
            "code": "Instructure.com",
            "vendor_name": {
              "default_value": "Instructure",
              "key": "tool.vendor.name"
            }
          }
        }
      }
    },
    "base_url_choice": [
      { "default_base_url": "http://localhost:8080" || "http://nodelti.docker",
        "selector": {
          "applies_to": ["MessageHandler"]
        }
      }
    ],
    "resource_handler": [
      {
        "resource_type": {"code": "lti-test-tool"},
        "resource_name": {
          "default_value": "lti-test-tool",
          "key": "lti-test-tool.resource.name"
        },
        "message": [{
          "message_type": "basic-lti-launch-request",
          "path": "lti_launch",
          "enabled_capability": ["Canvas.placements.courseNavigation"]
        }]
      }
    ]
  }
}
