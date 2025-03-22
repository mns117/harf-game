import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  onValue,
  set,
  update,
  push,
  remove,
} from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCe3VBRWHExbMDXBWCkAxMmfsLPQxQIKzU",
  authDomain: "haroof-game.firebaseapp.com",
  databaseURL: "https://haroof-game-default-rtdb.firebaseio.com",
  projectId: "haroof-game",
  storageBucket: "haroof-game.firebasestorage.app",
  messagingSenderId: "968798086027",
  appId: "1:968798086027:web:b87e181a14b8839927458e"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default function HarfGame() {
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [team, setTeam] = useState("");
  const [players, setPlayers] = useState({ orange: [], green: [] });
  const [screenColor, setScreenColor] = useState("white");
  const [timer, setTimer] = useState(5);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    const playersRef = ref(db, "players");
    onValue(playersRef, (snapshot) => {
      const data = snapshot.val() || {};
      const orange = [];
      const green = [];
      Object.entries(data).forEach(([id, player]) => {
        if (player.team === "orange") orange.push(player.name);
        else if (player.team === "green") green.push(player.name);
      });
      setPlayers({ orange, green });
    });

    const screenRef = ref(db, "screen");
    onValue(screenRef, (snapshot) => {
      const data = snapshot.val();
      setScreenColor(data?.color || "white");
      setIsTimerRunning(data?.running || false);
    });
  }, []);

  const handleJoin = () => {
    if (!name || !team) return alert("الرجاء إدخال الاسم واختيار الفريق");
    const newPlayerRef = push(ref(db, "players"));
    set(newPlayerRef, { name, team });
    setRole("player");
  };

  const handlePress = () => {
    if (isTimerRunning) return;
    update(ref(db, "screen"), {
      color: team === "orange" ? "#FFA500" : "#32CD32",
      running: true,
    });
    let t = timer;
    const countdown = setInterval(() => {
      t--;
      if (t <= 0) {
        clearInterval(countdown);
        update(ref(db, "screen"), { color: "white", running: false });
      }
    }, 1000);
  };

  const handleReset = () => {
    remove(ref(db, "players"));
    set(ref(db, "screen"), { color: "white", running: false });
  };

  const handleCancel = () => {
    set(ref(db, "screen"), { color: "white", running: false });
  };

  return (
    <div style={{ backgroundColor: screenColor, minHeight: "100vh", padding: "2rem", textAlign: "center" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>لعبة الحروف مع منص</h1>

      {!role && (
        <div>
          <button onClick={() => setRole("player")}>أنا لاعب</button>
          <button onClick={() => setRole("judge")}>أنا حكم</button>
        </div>
      )}

      {role === "player" && players.orange.length + players.green.length === 0 && (
        <div style={{ marginTop: "1rem" }}>
          <input
            type="text"
            placeholder="اسمك"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div>
            <button onClick={() => setTeam("orange")}>برتقالي</button>
            <button onClick={() => setTeam("green")}>أخضر</button>
          </div>
          <button onClick={handleJoin}>تقدم</button>
        </div>
      )}

      {role === "player" && players.orange.length + players.green.length > 0 && (
        <div>
          <h2>فريقك: {team === "orange" ? "البرتقالي" : "الأخضر"}</h2>
          <button onClick={handlePress} disabled={isTimerRunning} style={{ backgroundColor: "red", color: "white", padding: "1rem", borderRadius: "1rem", fontSize: "1.2rem" }}>
            اضغط هنا
          </button>
          {isTimerRunning && <p>المؤقت يعمل...</p>}
        </div>
      )}

      {role === "judge" && (
        <div style={{ marginTop: "2rem" }}>
          <div>
            <p>البرتقالي: {players.orange.join(", ")}</p>
            <p>الأخضر: {players.green.join(", ")}</p>
          </div>
          <div>
            <button onClick={handleReset}>ريست</button>
            <button onClick={handleCancel}>إلغاء</button>
          </div>
          <div>
            <label>المدة (ثواني): </label>
            <input
              type="number"
              value={timer}
              onChange={(e) => setTimer(Number(e.target.value))}
              style={{ width: "60px" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
