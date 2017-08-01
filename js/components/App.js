import React, { Component } from 'react';
import Relay from 'react-relay';

class App extends Component {
  render () {
    return (
      <div>
        <h1>Widget list</h1>
        <ul>
          {/* {this.props.viewer.widgets.edges.map(edge =>
            <li key={edge.node.id}>{edge.node.name} (ID: {edge.node.id})</li>
          )} */}
          {console.log(this.props.viewer)}
        </ul>
      </div>
    );
  }
}

export default Relay.createContainer(App, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on UserType {
        username
      }
    `,
  },
});
