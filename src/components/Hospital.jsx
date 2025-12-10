import React, { useState, useEffect, useRef } from "react";
import hospitalBg from "../assets/Indoor/Hospital.jpg";

export default function Hospital({
  onExitHospital,
  state,
  setState,
  selectedAvatar,
  keyboardEnabled,
}) {
  const [player, setPlayer] = useState({ x: 344, y: 623 });

  function preloadImages(srcArray) {
    srcArray.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }

  const moveInterval = useRef(null);
  const lastDir = useRef(null);
  const activityTimerRef = useRef(null);
  const currentPerTickEffectRef = useRef(null);

  const [dir, setDir] = useState("idle");
  const [activity, setActivity] = useState(null);
  const [effectType, setEffectType] = useState(null);

  const [actionPanel, setActionPanel] = useState({
    visible: false,
    x: 0,
    y: 0,
    actions: [],
  });

  function perTickEffectMultiple(ticks) {
    if (!currentPerTickEffectRef.current) return;
    for (let i = 0; i < ticks; i++) {
      currentPerTickEffectRef.current();
    }
  }

  function startActivity(name, duration, perTickEffect) {
    setActivity({ name, total: duration, remaining: duration });

    setState((s) => ({ ...s, activitiesDone: s.activitiesDone + 1 }));

    currentPerTickEffectRef.current = perTickEffect;

    if (name === "Checkup") setEffectType("clean-effect");
    else if (name === "Rest") setEffectType("rest-effect");
    else if (name === "Donate Blood") setEffectType("mine-effect");

    activityTimerRef.current = setInterval(() => {
      setActivity((a) => {
        if (!a) return null;

        const left = a.remaining - 1;
        perTickEffect();

        if (left <= 0) {
          clearInterval(activityTimerRef.current);
          currentPerTickEffectRef.current = null;
          setEffectType(null);
          showMessage(`${name} finished!`);
          return null;
        }

        return { ...a, remaining: left };
      });
    }, 1000);
  }

  const areas = [
    {
      id: "checkup",
      label: "Checkup",
      x: 258,
      y: 102,
      w: 158,
      h: 164,
      action: () =>
        startActivity("Checkup", 4, () =>
          setState((s) => ({
            ...s,
            hygiene: Math.min(100, s.hygiene + 10),
            money: Math.max(0, s.money - 20),
          }))
        ),
    },
    {
      id: "rest",
      label: "Rest",
      x: 41,
      y: 431,
      w: 232,
      h: 189,
      action: () =>
        startActivity("Rest", 3, () =>
          setState((s) => ({
            ...s,
            sleep: Math.min(100, s.sleep + 20),
            happy: Math.min(100, s.happy + 5),
            hygiene: Math.min(100, s.hygiene - 1),
          }))
        ),
    },
    {
      id: "donate",
      label: "Donate Blood",
      x: 483,
      y: 476,
      w: 213,
      h: 210,
      action: () =>
        startActivity("Donate Blood", 5, () =>
          setState((s) => ({
            ...s,
            money: s.money + 20,
            hygiene: Math.max(0, s.hygiene - 8),
          }))
        ),
    },
    {
      id: "exit",
      label: "Exit Hospital",
      x: 284,
      y: 659,
      w: 150,
      h: 78,
      action: () => onExitHospital(),
    },
  ];

  useEffect(() => {
    preloadImages([hospitalBg]);
  }, []);

  function isOverlap(a, b) {
    return !(
      a.right < b.left ||
      a.left > b.right ||
      a.bottom < b.top ||
      a.top > b.bottom
    );
  }

  function move(dir) {
    const speed = 20;

    setPlayer((prev) => {
      let x = prev.x,
        y = prev.y,
        dx = 0,
        dy = 0;

      if (dir === "up") dy = -speed;
      if (dir === "down") dy = speed;
      if (dir === "left") dx = -speed;
      if (dir === "right") dx = speed;

      x += dx;
      y += dy;

      x = Math.max(0, Math.min(736 - 40, x));
      y = Math.max(0, Math.min(736 - 60, y));

      if (dy < 0) setDir("back");
      else if (dy > 0) setDir("idle");
      else if (dx > 0) setDir("right");
      else if (dx < 0) setDir("left");

      return { x, y };
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
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key))
      e.preventDefault();

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
          label: inside.id === "exit" ? "Exit Hospital 🚪" : inside.label,
          exec: inside.action,
        },
      ],
    });
  }, [player]);

  function showMessage(text) {
    const msg = document.createElement("div");
    msg.className = "random-event-msg";
    msg.textContent = text;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
  }

  return (
    <div className="hospital-container">
      <div
        className="hospital-map"
        style={{
          width: 736,
          height: 736,
          backgroundImage: `url(${hospitalBg})`,
          backgroundSize: "cover",
          position: "relative",
          margin: "auto",
        }}
      >
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
          style={{
            position: "absolute",
            left: player.x,
            top: player.y,
            width: 40,
            height: 60,
          }}
        />

        {effectType && (
          <div
            className={`hospital-player-effect ${effectType}`}
            style={{ left: player.x, top: player.y }}
          ></div>
        )}
      </div>

      {/* CONTROLS */}
      <div className="controls" style={{ textAlign: "center", marginTop: 12 }}>
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

      {/* ACTIVITY OVERLAY*/}
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

      {/* ACTION PANEL */}
      {actionPanel.visible && (
        <div className="hospital-action-panel box">
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
