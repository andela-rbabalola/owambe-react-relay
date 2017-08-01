import Relay from 'react-relay';

export default class extends Relay.Route {
  static queries = {
    viewer: () => Relay.QL`
      query {
        User {
          username
        }
      }
    `,
  };
  static routeName = 'AppHomeRoute';
}
