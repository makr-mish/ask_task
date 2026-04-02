"use client";

import { useEffect, useState } from "react";

export default function LoadingGame() {
  const [teleportFx, setTeleportFx] = useState(false);

  useEffect(() => {
    const boy = document.getElementById("boy");
    const coin = document.getElementById("coin");
    const obstacle = document.getElementById("obstacle");

    if (!boy || !coin || !obstacle) return;

    boy.classList.add("running");

    const jumpInterval = setInterval(() => {
      boy.classList.remove("jump");
      void boy.offsetWidth;
      boy.classList.add("jump");
    }, 2600);

    const coinInterval = setInterval(() => {
      coin.classList.remove("move-coin");
      void coin.offsetWidth;
      coin.classList.add("move-coin");
    }, 2200);

    const obstacleInterval = setInterval(() => {
      obstacle.classList.remove("move-obstacle");
      void obstacle.offsetWidth;
      obstacle.classList.add("move-obstacle");
    }, 3400);

    const teleportInterval = setInterval(() => {
      boy.classList.remove("teleport");
      void boy.offsetWidth;
      boy.classList.add("teleport");

      setTeleportFx(true);
      setTimeout(() => setTeleportFx(false), 500);
    }, 7000);

    return () => {
      clearInterval(jumpInterval);
      clearInterval(coinInterval);
      clearInterval(obstacleInterval);
      clearInterval(teleportInterval);
    };
  }, []);

  return (
    <div className="game-wrap">
      <div className="game-container">
        <div className="sky-decor"></div>
        <div className="ground"></div>
        <div className="ground-line"></div>

        <div className={`teleport-ring ${teleportFx ? "show" : ""}`}></div>

        <img
          src="/single-1554903-1.png"
          className="boy"
          id="boy"
          alt="boy"
        />

        <div className="coin" id="coin">🪙</div>
        <div className="obstacle" id="obstacle"></div>

        <div className="loading-title">Идёт анализ... не закрывайте страницу</div>
      </div>
    </div>
  );
}