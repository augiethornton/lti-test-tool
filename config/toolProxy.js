const uuid = require('uuid/v4')()

module.exports = {

  "@context": "http://purl.imsglobal.org/ctx/lti/v2/ToolProxy",

  "@type": "ToolProxy",

  "@id": "instructure.com/ToolProxy/" + uuid,

  "lti_version": "LTI-2p1",

  "tool_proxy_guid": "",

  "enabled_capability": [ "Security.splitSecret" ],

  "security_contract": {
    "tp_half_shared_secret": "",
    "tool_service": []
  },
  "tool_consumer_profile": "",

  "tool_profile": {
    "lti_version": "LTI-2p1",
    "product_instance": {
      "guid": uuid,
      "product_info": {
        "product_name": {
          "default_value": "lti-test-tool"
        },
        "product_version": "2.1",
        "description" : {
	      	"default_value": "Node LTI Tool for testing Canvas Tool Consumer functionality"
	      },
        "product_family": {
          "code": "lti-test-tool",
          "vendor": {
            "code": "Instructure.com",
            "vendor_name": {
              "default_value": "Instructure"
            },
            "description" : {
	            "default_value": "Canvas Learning Management System"
	          }
          }
        }
      }
    },
    "base_url_choice": [
      { "default_base_url": process.env.BASE_URL || "http://localhost:3000",
        "selector": {
          "applies_to": ["MessageHandler"]
        }
      }
    ],
    "resource_handler": [
      {
        "resource_type": {
	        "code": "lti-test-tool"
	      },
        "resource_name": {
          "default_value": "lti-test-tool"
        },
        "message": [{
          "message_type": "basic-lti-launch-request",
          "path": "/launch",
          "enabled_capability": [
          	"Canvas.placements.similarityDetection", "Message.documentTarget", "Message.locale", 
          	"ToolConsumerInstance.guid", "CourseSection.sourcedId", "Person.sourcedId", 
          	"Membership.role", "Context.id"
          ]
        }]
      }
    ]
  }
}
