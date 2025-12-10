import React, { useState, useEffect, useRef } from "react";
import ramenBg from "../assets/Indoor/Ramen.jpg";

export default function Ramen({
  onExitRamen,
  state,
  setState,
  selectedAvatar,
  keyboardEnabled,
}) {
  const [player, setPlayer] = useState({ x: 193, y: 454 });

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

  const currentPerTickEffectRef = useRef(null);

  function preloadImages(srcArray) {
    srcArray.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }

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

    if (name === "Buy Ramen") setEffectType("eat-effect");
    else if (name === "Chat with Owner") setEffectType("chat-effect");
    else if (name === "Work Part Time") setEffectType("work-effect");

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
      id: "buy",
      label: "Buy Ramen",
      x: 475,
      y: 110,
      w: 242,
      h: 355,
      action: () =>
        startActivity("Buy Ramen", 4, () =>
          setState((s) => ({
            ...s,
            meal: Math.min(100, s.meal + 20),
            money: Math.max(0, s.money - 10),
          }))
        ),
    },
    {
      id: "chat",
      label: "Chat with Owner",
      x: 7,
      y: 381,
      w: 134,
      h: 153,
      action: () =>
        startActivity("Chat with Owner", 3, () =>
          setState((s) => ({
            ...s,
            happy: Math.min(100, s.happy + 5),
          }))
        ),
    },
    {
      id: "work",
      label: "Work Part Time",
      x: 5,
      y: 124,
      w: 417,
      h: 219,
      action: () =>
        startActivity("Work Part Time", 6, () =>
          setState((s) => ({
            ...s,
            money: s.money + 20,
            happy: Math.min(100, s.happy - 2),
            meal: Math.max(0, s.meal - 5),
          }))
        ),
    },
    {
      id: "exit",
      label: "Exit Ramen Shop",
      x: 160,
      y: 508,
      w: 105,
      h: 51,
      action: () => onExitRamen(),
    },
  ];

  useEffect(() => {
    preloadImages([ramenBg]);
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

      x = Math.max(0, Math.min(720 - 40, x));
      y = Math.max(0, Math.min(562 - 60, y));

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
          label:
            inside.id === "exit" ? "Exit Ramen Shop 🚪" : `${inside.label}`,
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
    <div className="ramen-container">
      <div
        className="ramen-map"
        style={{
          width: 720,
          height: 562,
          backgroundImage: `url(${ramenBg})`,
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

      {effectType && (
        <div
          className={`ramen-player-effect ${effectType}`}
          style={{
            left: player.x + 10,
            top: player.y - 20,
          }}
        ></div>
      )}

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
        <div className="ramen-action-panel box">
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
