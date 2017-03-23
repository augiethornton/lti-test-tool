lti-test-tool
=========

Node.js library for registering an LTI-2p1 ToolProxy for Testing Integration

## Usage

### Local

  1. Clone repository
  2. `npm install`
  3. `node app.js`

Note: by default the server runs on Port 3000

### Docker

  1. Clone repository
  2. `docker-compose build`
  3. `docker-compose run --rm app npm install`
  4. `docker-compose up`
  5. App will be running at http://nodelti.docker

### LTI Registration

Tool Registration URL: http://nodelti.docker/register
