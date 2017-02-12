import React, { Component } from 'react'

export default class Hello extends Component {
  render() {
    return (
      <div>Successful launch for {this.props.name}</div>
    )
  }
}