import "./App.css";
import QRCode from "react-qr-code";
import io from "socket.io-client";
import { useEffect, useState } from "react";

const socket = io.connect("http://localhost:3001");

function App() {
  const [id, setId] = useState("");
  const [session, setSession] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [oldSessionId, setOldSessionId] = useState("");

  const createSessionsForWp = () => {
    socket.emit("createSession", {
      id: session,
    });
  };

  useEffect(() => {
    socket.emit("connected", "hello from client");
    socket.on("qr", (data) => {
      const { qr } = data;
      setQrCode(qr);
    });

    socket.on("ready", (data) => {
      console.log("ready", data);
      const { id } = data;
      setId(id);
    });

    socket.on("allChats", (data) => {
      console.log("allChats", data);
    });
  }, []);

  const getOldSession = () => {
    socket.emit("getSession", { id: oldSessionId });
  };

  const getAllChats = () => {
    socket.emit("getAllChats", { id });
  };

  return (
    <div className="App">
      <h1>Whatsapp Web JS Client</h1>
      <h1>Open Whatsapp and scan Qr Code</h1>
      <div>
        <input
          type="text"
          value={oldSessionId}
          onChange={(e) => {
            setOldSessionId(e.target.value);
          }}
        />
        <button onClick={getOldSession}>Get old session</button>
      </div>
      <div style={{ marginBottom: "40px" }}>
        <input
          type="text"
          value={session}
          onChange={(e) => {
            setSession(e.target.value);
          }}
        />
        <button onClick={createSessionsForWp}>Create Session</button>
      </div>

      <div style={{ marginBottom: "24px" }}>
        {id !== "" && <button onClick={getAllChats}>Get All Chats</button>}
      </div>
      {qrCode ? <QRCode value={qrCode} /> : null}
    </div>
  );
}

export default App;
