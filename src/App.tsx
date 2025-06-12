// src/App.jsx
import { useState } from "react";
import axios, { AxiosError } from "axios";
import "./App.css";

// http://localhost:4000/api/v1/test
// https://reqres.in/api/users

export default function App() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState([{ id: 0, key: "", value: "" }]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AxiosError | null>(null);
  const [response, setResponse] = useState<any>(null);

  /* ---------- helpers ---------- */
  const updateHeader = (i: number, field: string, value: string) => {
    setHeaders((h) =>
      h.map((row, id) => (id === i ? { ...row, [field]: value } : row))
    );
  };

  const addHeaderRow = () =>
    setHeaders((h) => [...h, { id: Date.now(), key: "", value: "" }]);
  // const removeHeaderRow = () =>
  //   setHeaders((h) => (h.length > 1 ? h.slice(0, -1) : h));

    const removeHeaderRow = () => {
      if(headers.length > 1){
         return setHeaders((h) => h.slice(0,-1))
      }else{
        return setHeaders([{ id: 0, key: "", value: "" }]);
      }
    }


  console.log(headers);
  console.log(headers.length);

  const getCleanHeaders = (): any => {

    if(headers[0].key.length != 0 && headers[0].value.length != 0){
    const acc: any = {};
        headers.forEach(({ key, value }) => {
          if (key.trim()) acc[key] = value;
        });
      return acc;
    }else{
      return null
    }

  };

  /* ---------- main action ---------- */
  const send = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const options: any = {
        method,
        url,
        // headers: getCleanHeaders(),
      };

      const headers = getCleanHeaders()
      if(headers) {
        options.headers = headers;
      }

      if (method === "POST" && body.trim() !== "") {
        try {
          options.data = JSON.parse(body);
          options.headers["Content-Type"] =
            options.headers["Content-Type"] || "application/json";
        } catch {
          options.data = body;
        }
      }

      console.log("REQ AXIOS", options)
      const res: any = await axios(options);
      setResponse(res);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err); // err es AxiosError
      } else {
        setError(null); // otro tipo → lo descartas o lo manejas aparte
      }
      console.log("ERROR", err)
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="container">
      <h1>API VALIDATOR TEST</h1>
      <div className="row">
        <select value={method} onChange={(e) => setMethod(e.target.value)}>
          <option>GET</option>
          <option>POST</option>
        </select>
        <input
          className="url"
          placeholder="URL API"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          autoComplete="on"
        />
        <button onClick={send} disabled={loading || !url.trim()}>
          {loading ? "Enviando…" : "Enviar"}
        </button>
      </div>

      <h2>Headers</h2>
      {headers.map((h, i) => (
        <div className="row" key={h.id}>
          <input
            placeholder="Key"
            value={h.key}
            onChange={(e) => updateHeader(i, "key", e.target.value)}
          />
          <input
            placeholder="Value"
            value={h.value}
            onChange={(e) => updateHeader(i, "value", e.target.value)}
          />
        </div>
      ))}
      <button className="small" onClick={addHeaderRow}>
        + Añadir
      </button>
      <button className="small" onClick={() => removeHeaderRow()}>
        - Eliminar
      </button>

      {/* //POST BODY */}
      {method === "POST" && (
        <>
          <h2>Body</h2>
          <textarea
            rows={6}
            placeholder="{key: value}"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </>
      )}

      {/* Respuesta */}
      <br />
      <br />
      <hr />
      <h2>Respuesta</h2>
      {error && (
        <pre className="error">
          {error.message + "\n"}
          {error.code + "\n"}
          {error.response ? "\nStatus: " + error.response.status : ""}
        </pre>
      )}
      {response && (
        <pre className="success">

          {/* status */}
          {`Status HTTP: ${response.status} / ${response.statusText}\n\n`}

          {/* headers */}
          {"Headers: \n\n" +
            Object.entries(response.headers)
              .map(([k, v]) => `${k} : ${v}`)
              .join("\n")}

          {/* body response */}
          {"\n\n Response: \n"}
          {typeof response.data === "object"
            ? JSON.stringify(response.data, null, 2)
            : String(response.data)}

        </pre>
      )}
    </div>
  );
}
