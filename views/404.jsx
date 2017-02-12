const React = require('react')
const HelloMessage = require('./index')

class error404 extends React.Component {
  render() {
    return (
      <HelloMessage>
        <h1>404: Not Found</h1>
        <p>Sorry we are not able to find that url</p>
      </HelloMessage>
    )
  }
}

module.exports = error404