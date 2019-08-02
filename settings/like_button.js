'use strict';

class LikeButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = { liked: false };
  }


  /*
  componentDidMount() {
    fetch('https://cloud.crownstone.rocks')
      .then(response => response.json())
      .then(data => this.setState({ data }));
  }*/

  render() {
    if (this.state.liked) {
      return 'You liked this.';
    }

    return React.createElement(
      'button',
      { onClick: () => this.setState({ liked: true }) },
      'Like'
    );
  }
}

ReactDOM.render(<LikeButton />, document.getElementById('like_button_container'));

