import logo from './logo.svg';
import './App.css';
import {useState} from "react";

function App() {
  const initializeCells = () => new Array()

  const [message, setMessage] = useState('Welcome to Pentago!');
  const [cells, setCells] = useState()

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
