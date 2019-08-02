class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      userId: '',
      token: '',
      spheres: []
    };
    
    this.h1Style = {
    };
    
    this.buttonStyle = {
      color: 'white',
      background: '#003e52'
    };
  
    this.ulStyle = {
      listStyle: 'none',
      listStyleType: 'none',
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  
  handleChange(event) {
    if (event.target.name == 'password') {
      this.setState({ [event.target.name]: SHA1(event.target.value)});
    } else {
      this.setState({ [event.target.name]: event.target.value});
    }
  }

  handleClick(name) {
    console.log("Select sphere", name);
    this.setState({ ['sphere']: name});
    this.submitToHomey();
  }

  submitToHomey() {
	  Homey.set('email', this.state.email, function( err ){
	    if( err ) return Homey.alert( err );
	  });
	  Homey.set('password', this.state.password, function( err ){
	    if( err ) return Homey.alert( err );
	  });
	  Homey.set('sphere', this.state.sphere, function( err ){
	    if( err ) return Homey.alert( err );
	  });
  }

  handleSubmit(event) {
    fetch('https://cloud.crownstone.rocks/api/users/login',
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({email: this.state.email, password: this.state.password})
      })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        // clear array
        this.setState({ spheres: [] });
        // set token and user id
        this.setState({ ["token"]: data.id });
        this.setState({ ["userId"]: data.userId });
      })
      .then(() => {
        var token = 'access_token=' + this.state.token;
        var urlString = 'https://cloud.crownstone.rocks/api/users/' + this.state.userId + '/spheres?' + token;
        fetch(urlString,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          method: "GET"
        })
        .then(response => response.json())
        .then(data => {
          console.log(data);
          for (var i = 0; i < data.length; i++) { 
            var sphere_name = data[i].name;
            console.log(sphere_name);
            this.setState({
              spheres: this.state.spheres.concat(sphere_name)
            })
            //this.onAddSphere(data[i].name);
          }
        })
        .catch(err => {
          console.log("Error", err);
        });
      })
      .catch(err => {
        console.log("Error", err);
      });

    //alert('A name was submitted: ' + this.state.firstName + ' ' + this.state.lastName);
    event.preventDefault();
  }

  render() {
    return (
      <div>
      <form onSubmit={this.handleSubmit}>

        <h1 style={this.h1Style}>Hi</h1>
      
        <div className="item-group">
          <label>
            Email address
          </label>
          <input type="email" name="email" className="required email" onChange={this.handleChange} />
        </div>
        <div className="item-group">
          <label>
            Password
          </label>
          <input type="password" name="password" className="required" onChange={this.handleChange} />
        </div>
        <input type="submit" className="button" value="Log in" style={this.buttonStyle}/>
      </form>

      <ul style={this.ulStyle}>
        {this.state.spheres.map(name => (
          <li key={name}>{name} <a href='#' onClick={() => this.handleClick(name)}>[ ]</a></li>
        ))}  
      </ul>
      </div>
    );
  }
}

ReactDOM.render(<LoginForm />, document.getElementById('login_form'));
