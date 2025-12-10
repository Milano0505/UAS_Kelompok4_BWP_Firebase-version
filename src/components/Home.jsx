import React, { useState, useEffect, useRef } from "react";
import homeBg from "../assets/Indoor/Home.jpeg";

export default function Home({
  onExitHome,
  state,
  setState,
  selectedAvatar,
  keyboardEnabled,
}) {
  const [player, setPlayer] = useState({ x: 188, y: 448 });

  const movementRef = useRef(null);
  const activityTimerRef = useRef(null);
  const moveInterval = useRef(null);
  const lastDir = useRef(null);

  const [dir, setDir] = useState("idle");

  const [activity, setActivity] = useState(null);

  const [actionPanel, setActionPanel] = useState({
    visible: false,
    x: 0,
    y: 0,
    actions: [],
  });

  const [effectType, setEffectType] = useState(null);

  function perTickEffectMultiple(ticks) {
    if (!currentPerTickEffectRef.current) return;
    for (let i = 0; i < ticks; i++) {
      currentPerTickEffectRef.current();
    }
  }

  const currentPerTickEffectRef = useRef(null);

  // =====================
  //   ACTIVITY SYSTEM
  // =====================
  function startActivity(name, duration, perTickEffect) {
    setActivity({ name, total: duration, remaining: duration });

    setState((s) => ({ ...s, activitiesDone: s.activitiesDone + 1 }));

    currentPerTickEffectRef.current = perTickEffect;

    // Set effect based on activity
    if (name === "Bathing") setEffectType("bath-effect");
    else if (name === "Sleeping") setEffectType("sleep-effect");
    else if (name === "Eating") setEffectType("eat-effect");
    else if (name === "Relaxing") setEffectType("relax-effect");

    activityTimerRef.current = setInterval(() => {
      setActivity((a) => {
        if (!a) return null;

        const left = a.remaining - 1;

        perTickEffect(); // jalankan efek per detik

        if (left <= 0) {
          clearInterval(activityTimerRef.current);
          currentPerTickEffectRef.current = null;
          setEffectType(null); // hilangkan efek
          showMessage(`${name} finished!`);
          return null;
        }

        return { ...a, remaining: left };
      });
    }, 1000);
  }

  // =========================================================
  //               INTERACTION ZONES
  // =========================================================
  const areas = [
    {
      id: "bath",
      label: "Bathroom",
      x: 42,
      y: 42,
      w: 42,
      h: 42,
      action: () =>
        startActivity("Bathing", 8, () =>
          setState((s) => ({
            ...s,
            hygiene: Math.min(100, s.hygiene + 5),
            happy: Math.min(100, s.happy + 0.5),
          }))
        ),
    },

    {
      id: "sleep",
      label: "Bed",
      x: 91,
      y: 184,
      w: 47,
      h: 92,
      action: () =>
        startActivity("Sleeping", 10, () =>
          setState((s) => ({
            ...s,
            sleep: Math.min(100, s.sleep + 4),
            happy: Math.min(100, s.happy + 0.8),
            hygiene: Math.min(100, s.hygiene + 1),
          }))
        ),
    },

    {
      id: "eat",
      label: "Dining Table",
      x: 274,
      y: 373,
      w: 93,
      h: 133,
      action: () =>
        startActivity("Eating", 6, () =>
          setState((s) => ({
            ...s,
            meal: Math.min(100, s.meal + 6),
            happy: Math.min(100, s.happy + 1),
          }))
        ),
    },

    {
      id: "relax",
      label: "Relax Zone",
      x: 460,
      y: 367,
      w: 234,
      h: 142,
      action: () =>
        startActivity("Relaxing", 5, () =>
          setState((s) => ({
            ...s,
            happy: Math.min(100, s.happy + 4),
          }))
        ),
    },

    {
      id: "exit",
      label: "Exit Door",
      x: 186,
      y: 508,
      w: 43,
      h: 43,
      action: () => onExitHome(),
    },
  ];

  // =========================================================
  //            INTERSECT CHECK
  // =========================================================
  function isOverlap(a, b) {
    return !(
      a.right < b.left ||
      a.left > b.right ||
      a.bottom < b.top ||
      a.top > b.bottom
    );
  }

  // =========================================================
  //            MOVEMENT SYSTEM
  // =========================================================
  function move(dir) {
    const speed = 20;

    setPlayer((prev) => {
      let x = prev.x;
      let y = prev.y;

      let dx = 0,
        dy = 0;

      if (dir === "up") dy = -speed;
      if (dir === "down") dy = speed;
      if (dir === "left") dx = -speed;
      if (dir === "right") dx = speed;

      x += dx;
      y += dy;

      x = Math.max(0, Math.min(736 - 40, x));
      y = Math.max(0, Math.min(552 - 60, y));

      if (dy < 0) setDir("back");
      else if (dy > 0) setDir("idle");
      else if (dx > 0) setDir("right");
      else if (dx < 0) setDir("left");

      return { ...prev, x, y };
    });
  }

  function startHold(dir) {
    lastDir.current = dir;
    move(dir);

    if (moveInterval.current) clearInterval(moveInterval.current);

    moveInterval.current = setInterval(() => {
      move(lastDir.current);
    }, 120);
  }

  function stopHold() {
    lastDir.current = null;
    if (moveInterval.current) {
      clearInterval(moveInterval.current);
      moveInterval.current = null;
    }
  }

  function onKeyDown(e) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
    }
    if (e.repeat) return;

    if (e.key === "ArrowUp") startHold("up");
    if (e.key === "ArrowDown") startHold("down");
    if (e.key === "ArrowLeft") startHold("left");
    if (e.key === "ArrowRight") startHold("right");
  }

  function onKeyUp() {
    stopHold();
  }

  useEffect(() => {
    if (!keyboardEnabled) return;

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [keyboardEnabled]);

  // =========================================================
  //        DETECT WHICH ZONE PLAYER IS IN
  // =========================================================
  useEffect(() => {
    const pRect = {
      left: player.x,
      top: player.y,
      right: player.x + 40,
      bottom: player.y + 60,
    };
    let inside = null;

    for (const a of areas) {
      const aRect = {
        left: a.x,
        top: a.y,
        right: a.x + a.w,
        bottom: a.y + a.h,
      };

      if (isOverlap(pRect, aRect)) inside = a;
    }

    if (!inside) {
      setActionPanel({ visible: false });
      return;
    }

    setActionPanel({
      visible: true,
      x: player.x + 50,
      y: player.y - 10,
      actions: [
        {
          label: inside.id === "exit" ? "Exit Home 🚪" : `Use ${inside.label}`,
          exec: inside.action,
        },
      ],
    });
  }, [player]);

  // =========================================================
  //              FLOATING MESSAGE SYSTEM
  // =========================================================
  function showMessage(text) {
    const msg = document.createElement("div");
    msg.className = "random-event-msg";
    msg.textContent = text;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
  }

  // =========================================================
  //                      RENDER
  // =========================================================
  return (
    <div className="home-container">
      <div
        className="home-map"
        style={{
          width: 736,
          height: 552,
          backgroundImage: `url(${homeBg})`,
          backgroundSize: "cover",
          position: "relative",
          margin: "auto",
        }}
      >
        {/* PLAYER SPRITE */}
        <img
          src={
            dir === "left"
              ? selectedAvatar.left
              : dir === "right"
              ? selectedAvatar.right
              : dir === "back"
              ? selectedAvatar.back
              : selectedAvatar.idle
          }
          className="player-avatar"
          style={{
            position: "absolute",
            left: player.x,
            top: player.y,
            width: 40,
            height: 60,
          }}
        />
      </div>

      {/* MOVEMENT CONTROLS */}
      <div className="controls" style={{ textAlign: "center", marginTop: 10 }}>
        <button onMouseDown={() => startHold("up")} onMouseUp={stopHold}>
          ▲
        </button>

        <div>
          <button onMouseDown={() => startHold("left")} onMouseUp={stopHold}>
            ◀
          </button>
          <button onMouseDown={() => startHold("down")} onMouseUp={stopHold}>
            ▼
          </button>
          <button onMouseDown={() => startHold("right")} onMouseUp={stopHold}>
            ▶
          </button>
        </div>
      </div>

      {/* ACTIVITY EFFECT ON PLAYER */}
      {effectType && (
        <div
          className={`player-effect ${effectType}`}
          style={{ left: player.x, top: player.y }}
        ></div>
      )}

      {/* ACTIVITY OVERLAY */}
      {activity && (
        <div className="box activity-overlay">
          <h2>{activity.name}</h2>
          <div>
            {activity.remaining} / {activity.total}
          </div>
          <button
            className="fast-forward-btn"
            onClick={() => {
              clearInterval(activityTimerRef.current);

              const ticksRemaining = activity.remaining;
              perTickEffectMultiple(ticksRemaining);

              setActivity(null);
              setEffectType(null);
              showMessage(`${activity.name} completed instantly!`);
            }}
          >
            Fast Forward ⏩
          </button>
        </div>
      )}

      {actionPanel.visible && (
        <div className="home-action-panel box">
          {actionPanel.actions.map((a, i) => (
            <button key={i} className="action-btn" onClick={a.exec}>
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
