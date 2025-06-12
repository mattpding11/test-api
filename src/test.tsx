import axios from "axios";
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import "./App.css";
import { useState } from "react";

function App() {

  // http://localhost:4000/api/v1/test
  // https://reqres.in/api/users

  const [url, setUrl] = useState("");

  console.log({url})

  const getApi = async () => {
    try {
      const resp = await axios.get(url);
      console.log("Resp", resp);
      console.log("Data", resp.data);
    } catch (err) {
      console.log("error", err);
    }
  };

  return (
    <>
      {/* <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div> */}
      <h1>API VALIDATOR TEST</h1>
      <div className="card">
        <button onClick={getApi} >GET API</button>
        <input className="input" type="text" autoFocus autoComplete="on" onChange={(e) => setUrl(e.target.value)}/>
        <p>
          
        </p>
      </div>
      {/* <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p> */}
    </>
  );
}

export default App;

