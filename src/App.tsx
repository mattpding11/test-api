// src/App.jsx
import { useEffect, useState } from "react";
import axios, { AxiosError, type RawAxiosRequestHeaders } from "axios";
import "./App.css";

// http://localhost:4000/api/v1/test
// https://reqres.in/api/users

export default function App() {
  const URL_API_VALIDATOR_AGENT = "http://localhost:5555/api/v1";
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState([{ id: 0, key: "", value: "" }]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AxiosError | null>(null);
  const [response, setResponse] = useState<any>(null);
  const [agentAvailable, setAgentAvailable] = useState<boolean>(false);

  const agentClient = axios.create({
    baseURL: URL_API_VALIDATOR_AGENT,
    // headers: { "Content-Type": "application/json" },
    timeout: 20_000, // evita cuelgues infinitos / 20ms
    withCredentials: true,
    // validateStatus: () => true,  // descomenta si NO quieres que Axios lance on 4xx/5xx
  });

  console.log({ agentClient });

  // Comprobar AGENTE
  useEffect(() => {
    agentClient
      .get("/test")
      .then((resp) => {
        console.log("RESPUESTA OBTENIDA ", { resp });
        setAgentAvailable(true);
      })
      .catch((err) => {
        console.log("ERROR DE CONEXION ", { err });
        setAgentAvailable(false);
      });
  }, []);

  console.log({ agentAvailable });

  // if (agentAvailable) {
  //   console.log("AGENTE CONECTADO");
  //   agentClient
  //     .options("/preflight")
  //     .then((res) => {
  //       console.log("preflight: ", { res });
  //     })
  //     .catch((err) => {
  //       console.log("Error preflight: ", { err });
  //     });
  // } else {
  //   console.log("AGENTE DESCONECTADO");
  // }

  // Campos que acepta
  // method = "GET",
  // url,
  // headers = {},
  // body,
  // maxContentLength,
  // maxBodyLength,
  // responseType,
  // validateStatus,
  // httpAgent,
  // httpsAgent,
  // clientCert, // opcional, base64
  // clientKey, // opcional, base64
  // clientCa, // opcional, base64

  const sendViaAgent = async (
    method: string,
    url: string,
    headers: RawAxiosRequestHeaders = {},
    body: any = null
  ) => {
    console.log("PETICION ENVIANTE", {
      method: method.toUpperCase(),
      url,
      headers,
      body,
    });

    const { data } = await agentClient.post("/proxy", {
      method: method.toUpperCase(), // homogeniza
      url,
      headers,
      body,
    });

    console.log("FINAL RESPONSE", data);

    return data;
  };

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
    if (headers.length > 1) {
      return setHeaders((h) => h.slice(0, -1));
    } else {
      return setHeaders([{ id: 0, key: "", value: "" }]);
    }
  };

  console.log({ headers });
  console.log("headers lenght: ", headers.length);

  const getCleanHeaders = (): any => {
    if (headers[0].key.length != 0 && headers[0].value.length != 0) {
      const acc: any = {};
      headers.forEach(({ key, value }) => {
        if (key.trim()) acc[key] = value;
      });
      return acc;
    } else {
      return null;
    }
  };

  /* ---------- main action ---------- */
  const send = async () => {
    console.log("ADENTRO");

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const options: any = {
        method,
        url,
      };

      const headers = getCleanHeaders();

      if (headers) {
        options.headers = headers;
      } else {
        options.headers = {};
      }

      console.log("METODO", method);
      console.log("HOLA", body);

      if (method === "POST" && body.trim() !== "") {
        try {
          console.log("in1");
          options.data = JSON.parse(body);
          console.log("TRANS", options.data);
          options.headers["Content-Type"] = options.headers["Content-Type"]
            ? options.headers["Content-Type"]
            : "application/json";
        } catch (e) {
          console.log("FAILLLL", e);
          options.data = body;
        }
      }

      const domains: string[] = [
        "www.",
        ".com",
        ".co",
        ".org",
        "localhost",
        "127.0.0.1",
        "0.0.0.0",
        "::1",
        "https",
        ".net",
        ".es",
        ".edu",
        ".org"
      ];

      console.log(domains);

      const matchesCaseInsensitive = domains.some((d) =>
        url.toLowerCase().includes(d.toLowerCase())
      );
      console.log({matchesCaseInsensitive}); //

      let res: any;

      if (agentAvailable && !matchesCaseInsensitive) {
        console.log("USA EL AGENTE");
        console.log("REQ AXIOS", options.data);
        res = await sendViaAgent(
          options.method,
          options.url,
          options.headers || {},
          options.data || null
        );
      } else {
        console.log("USA EL NAVEGADOR");
        res = await axios(options);
      }

      setResponse(res);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err); // err es AxiosError
      } else {
        setError(null); // otro tipo → lo descartas o lo manejas aparte
      }
      console.log("ERROR en Consumir Servicio dinamico de usuario", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="container">
      <h1>API VALIDATOR TEST</h1>
      <span style={{ font: "24px" }}>
        {/* &#x2717; // Equis (X)
    <br/>
    &#x2713; // Check */}
      </span>
      <h4 style={agentAvailable ? { color: "green" } : { color: "red" }}>
        Agente {agentAvailable ? " Conectado" : " Desconectado"}
      </h4>
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
            rows={10}
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
          {response.headers
            ? "Headers: \n\n" +
              Object.entries(response.headers)
                .map(([k, v]) => `${k} : ${v}`)
                .join("\n")
            : ""}

          {/* body response */}

          <div style={{ color: " #0f0" }}>
            {"\n\n Response: \n"}
            {typeof response.data === "object"
              ? JSON.stringify(response.data, null, 2)
              : String(response.data)}
          </div>
        </pre>
      )}
    </div>
  );
}

{
  /* <h4 style={agentAvailable ? { color: "gray" } : { color: "red" }}>
  Agente{" "}
  {agentAvailable ? (
    <>
      Conectado <span>&#x2713;</span>
    </>
  ) : (
    <>
      Desconectado <span>&nbsp;</span>
    </>
  )}
</h4> */
}

//or

// const status = agentAvailable
//   ? ["Conectado", <span key="tick">&#x2713;</span>]
//   : ["Desconectado", <span key="space">&nbsp;</span>];

// <h4 style={{ color: agentAvailable ? "gray" : "red" }}>
//   Agente {status}
// </h4>
