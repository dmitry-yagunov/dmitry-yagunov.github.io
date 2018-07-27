import React, { Component } from 'react';
import Clarifai from 'clarifai';
import Navigation from './components/navigation/navigation';
import Signin from './components/signin/signin.js';
import Register from './components/register/register.js';
import Logo from './components/logo/logo';
import ImageLinkForm from './components/imageLinkForm/imageLinkForm.js';
import Rank from './components/rank/rank.js'
import FaceRecognition from './components/faceRecognition/faceRecognition'
import Particles from 'react-particles-js';
import './App.css';
import 'tachyons'

const app = new Clarifai.App({
  apiKey : 'acce4a5f450b4bf492eeaee4332e2b00'
});

const particlesOptions = {
    particles: {
      number: {
        value: 100,
        density: {
          enable: true,
          value_area: 800
        }
      }
    }
}
const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
    }})
  }

  // componentDidMount() {
  //   fetch('http://localhost:3001')
  //     .then(response => response.json())
  //     .then(console.log);
  // }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    console.log(width, height);

    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height),
    }
  }

  displayFaceBox = (box) => {
    console.log(box);
    this.setState({box: box});
  }
  //http://www.dreams.metroeve.com/wp-content/uploads/2017/05/dreams.metroeve_face-dreams-meaning.jpg
  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  }

  onButtonSubmit = () => {
    this.setState({ imageUrl: this.state.input });
    app.models
    .predict(
      Clarifai.FACE_DETECT_MODEL, 
      this.state.input)
    .then(response => {
      if (response) {
        fetch('http://localhost:3001/image', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: this.state.user.id
          })
        })
          .then(response => response.json())
          .then(count => {
              this.setState(Object.assign(this.state.user, { entries: count}))
          })
      }
      
      this.displayFaceBox(this.calculateFaceLocation(response))
    })
    .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState);
    } else if (route === 'home') {
      this.setState({ isSignedIn: true});
    }
    
    this.setState({ route: route});
  }
 
  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;
    
    return (
      <div className="App">
        <Particles className='particles' params={ particlesOptions } />
        <Navigation
           isSignedIn = { isSignedIn } 
           onRouteChange = {this.onRouteChange}/>
        { route === 'home' 
          ? <div>
              <Logo/>
              <Rank 
                name = { this.state.user.name} 
                entries = { this.state.user.entries} />
              <ImageLinkForm 
                onInputChange = { this.onInputChange } 
                onButtonSubmit = { this.onButtonSubmit} />
              <FaceRecognition 
                box = { box } 
                imageUrl = { imageUrl }/>
            </div>
          : (
            route === 'signin' 
            ? <Signin 
                loadUser = { this.loadUser}
                onRouteChange = {this.onRouteChange}/>
            : <Register
                loadUser = { this.loadUser}
                onRouteChange = {this.onRouteChange}/>
            )
        }
      </div>
    );
  }
}

export default App;
