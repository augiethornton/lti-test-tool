var React = require('react')
var DefaultLayout = require('./layouts/default')

class Index extends React.Component {
  render() {
    return (
      <DefaultLayout title={this.props.title}>
        <div>Welcome to the index page</div>
      </DefaultLayout>
    )
  }
}

module.exports = Index