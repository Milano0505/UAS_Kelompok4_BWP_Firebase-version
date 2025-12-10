import React, { useState, useEffect, useRef } from "react";
import mineBg from "../assets/Indoor/Mine.jpg";

export default function Mine({
  onExitMine,
  state,
  setState,
  selectedAvatar,
  keyboardEnabled,
}) {
  const [player, setPlayer] = useState({ x: 522, y: 263 });

  function preloadImages(srcArray) {
    srcArray.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }

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

    if (name === "Cleaning Tools") setEffectType("clean-effect");
    else if (name === "Mining Ores") setEffectType("mine-effect");
    else if (name === "Selling Ores") setEffectType("sell-effect");
    else if (name === "Resting") setEffectType("rest-effect");

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
      id: "clean",
      label: "Clean Tools",
      x: 195,
      y: 1,
      w: 174,
      h: 166,
      action: () =>
        startActivity("Cleaning Tools", 5, () =>
          setState((s) => ({
            ...s,
            hygiene: Math.min(100, s.hygiene + 5),
            happy: Math.min(100, s.happy + 2),
          }))
        ),
    },
    {
      id: "sell",
      label: "Sell Ores",
      x: 455,
      y: 1,
      w: 182,
      h: 111,
      action: () => {
        setState((s) => {
          if (s.ore <= 0) {
            showMessage("You have no ore to sell!");
            return s;
          }

          startActivity("Selling Ores", 4, () =>
            setState((s2) => {
              if (s2.ore <= 0) return s2;
              const inv = { ...s2.inventory };
              inv.ore = Math.max(0, (inv.ore || 0) - 1);
              if (inv.ore <= 0) delete inv.ore;

              return {
                ...s2,
                ore: s2.ore - 1,
                money: s2.money + 20,
                inventory: inv,
                happy: Math.min(100, s2.happy + 1),
              };
            })
          );

          return s;
        });
      },
    },
    {
      id: "mine",
      label: "Mine Ores",
      x: 33,
      y: 113,
      w: 116,
      h: 159,
      action: () =>
        startActivity("Mining Ores", 8, () =>
          setState((s) => {
            const inv = { ...s.inventory };
            inv.ore = (inv.ore || 0) + 1;
            return {
              ...s,
              ore: s.ore + 1,
              inventory: inv,
              hygiene: Math.min(100, s.hygiene - 2),
              happy: Math.min(100, s.happy - 3),
            };
          })
        ),
    },
    {
      id: "rest",
      label: "Rest",
      x: 767,
      y: 160,
      w: 98,
      h: 190,
      action: () =>
        startActivity("Resting", 6, () =>
          setState((s) => ({
            ...s,
            sleep: Math.min(100, s.sleep + 6),
            happy: Math.min(100, s.happy + 2),
            hygiene: Math.min(100, s.hygiene - 1),
          }))
        ),
    },
    {
      id: "exit",
      label: "Exit Mine",
      x: 521,
      y: 198,
      w: 82,
      h: 65,
      action: () => onExitMine(),
    },
  ];

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

      x = Math.max(0, Math.min(900 - 40, x));
      y = Math.max(0, Math.min(520 - 60, y));

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
          label: inside.id === "exit" ? "Exit Mine 🚪" : `${inside.label}`,
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
    <div className="mine-container">
      <div
        className="mine-map"
        style={{
          width: 900,
          height: 520,
          backgroundImage: `url(${mineBg})`,
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
          className={`mine-player-effect ${effectType}`}
          style={{ left: player.x, top: player.y }}
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
        <div className="mine-action-panel box">
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
