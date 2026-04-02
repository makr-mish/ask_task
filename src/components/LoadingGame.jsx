"use client";

import { useEffect } from "react";

export default function LoadingGame() {
  useEffect(() => {
    const boy = document.getElementById("boy");
    const coin = document.getElementById("coin");
    const obstacle = document.getElementById("obstacle");

    if (!boy) return;

    boy.classList.add("running");

    const jump = setInterval(() => {
      boy.classList.add("jump");
      setTimeout(() => boy.classList.remove("jump"), 600);
    }, 2500);

    const coinMove = setInterval(() => {
      if (coin) {
        coin.classList.add("move");
        setTimeout(() => coin.classList.remove("move"), 2000);
      }
    }, 3000);

    const obstacleMove = setInterval(() => {
      if (obstacle) {
        obstacle.classList.add("move");
        setTimeout(() => obstacle.classList.remove("move"), 2000);
      }
    }, 4000);

    const teleport = setInterval(() => {
      boy.classList.add("teleport");
      setTimeout(() => boy.classList.remove("teleport"), 500);
    }, 8000);

    return () => {
      clearInterval(jump);
      clearInterval(coinMove);
      clearInterval(obstacleMove);
      clearInterval(teleport);
    };
  }, []);

  return (
    <div className="game-container">
      <div className="ground"></div>

      <img
        src="/single-1554903-1.png"
        className="boy"
        id="boy"
        alt="boy"
      />

      <div className="coin" id="coin"></div>
      <div className="obstacle" id="obstacle"></div>

      <div className="text">
        🤖 Идёт анализ... не закрывайте страницу
      </div>
    </div>
  );
}