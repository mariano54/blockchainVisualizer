import React, { Component } from 'react';
import logo from './logo.png';
import './App.css';
import Canvas from './Canvas';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Ethereum Blockchain Visualizer</h2>
        </div>
        <p className="App-intro">
        </p>
        <Canvas/>
      </div>
    );
  }
}

export default App;
