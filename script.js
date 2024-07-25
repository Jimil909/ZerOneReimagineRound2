// Smooth Scroll----------------
function LenisScroll() {
  const lenis = new Lenis({
    duration: 1.2,
  });

  lenis.on("scroll", (e) => {
    console.log(e);
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
}
LenisScroll();

function smoothScrollTrigger() {
  const lenis = new Lenis({
    duration: 1.2,
  });

  lenis.on("scroll", (e) => {
    console.log(e);
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
}
smoothScrollTrigger();

// Intro Loading Animation-----------------------------
const preloadImages = (selector = "img") => {
  return new Promise((resolve) => {
    imagesLoaded(
      document.querySelectorAll(selector),
      { background: true },
      resolve
    );
  });
};

const lerp = (a, b, n) => (1 - n) * a + n * b;

const getMousePos = (e) => {
  return {
    x: e.clientX,
    y: e.clientY,
  };
};

function Intro() {
  const body = document.body;
  const frame = document.querySelector(".frame");
  const content = document.querySelector(".content");
  const enterButton = document.querySelector(".enter");
  const fullview = document.querySelector(".fullview");
  const grid = document.querySelector(".grid");
  const gridRows = grid.querySelectorAll(".row");

  let winsize = { width: window.innerWidth, height: window.innerHeight };
  window.addEventListener("resize", () => {
    winsize = { width: window.innerWidth, height: window.innerHeight };
  });

  let mousepos = { x: winsize.width / 2, y: winsize.height / 2 };

  const config = {
    translateX: true,
    skewX: false,
    contrast: true,
    scale: false,
    brightness: true,
  };

  const numRows = gridRows.length;
  const middleRowIndex = Math.floor(numRows / 2);
  const middleRow = gridRows[middleRowIndex];
  const middleRowItems = middleRow.querySelectorAll(".row__item");
  const numRowItems = middleRowItems.length;
  const middleRowItemIndex = Math.floor(numRowItems / 2);
  const middleRowItemInner =
    middleRowItems[middleRowItemIndex].querySelector(".row__item-inner");
  const middleRowItemInnerImage =
    middleRowItemInner.querySelector(".row__item-img");
  middleRowItemInnerImage.classList.add("row__item-img--large");

  const baseAmt = 0.1;
  const minAmt = 0.05;
  const maxAmt = 0.1;

  let renderedStyles = Array.from({ length: numRows }, (v, index) => {
    const distanceFromMiddle = Math.abs(index - middleRowIndex);
    const amt = Math.max(baseAmt - distanceFromMiddle * 0.03, minAmt);
    const scaleAmt = Math.min(baseAmt + distanceFromMiddle * 0.03, maxAmt);
    let style = { amt, scaleAmt };

    if (config.translateX) {
      style.translateX = { previous: 0, current: 0 };
    }
    if (config.skewX) {
      style.skewX = { previous: 0, current: 0 };
    }
    if (config.contrast) {
      style.contrast = { previous: 100, current: 100 };
    }
    if (config.scale) {
      style.scale = { previous: 1, current: 1 };
    }
    if (config.brightness) {
      style.brightness = { previous: 100, current: 100 };
    }

    return style;
  });

  let requestId;

  const updateMousePosition = (ev) => {
    const pos = getMousePos(ev);
    mousepos.x = pos.x;
    mousepos.y = pos.y;
  };

  const calculateMappedX = () => {
    return (((mousepos.x / winsize.width) * 2 - 1) * 40 * winsize.width) / 100;
  };

  const calculateMappedSkew = () => {
    return ((mousepos.x / winsize.width) * 2 - 1) * 3;
  };

  const calculateMappedScale = () => {
    const centerScale = 1;
    const edgeScale = 0.95;
    return (
      centerScale -
      Math.abs((mousepos.x / winsize.width) * 2 - 1) * (centerScale - edgeScale)
    );
  };

  const getCSSVariableValue = (element, variableName) => {
    return getComputedStyle(element).getPropertyValue(variableName).trim();
  };

  const render = () => {
    const mappedValues = {
      translateX: calculateMappedX(),
      skewX: calculateMappedSkew(),
      scale: calculateMappedScale(),
    };

    gridRows.forEach((row, index) => {
      const style = renderedStyles[index];

      for (let prop in config) {
        if (config[prop]) {
          style[prop].current = mappedValues[prop];
          const amt = prop === "scale" ? style.scaleAmt : style.amt;
          style[prop].previous = lerp(
            style[prop].previous,
            style[prop].current,
            amt
          );
        }
      }

      let gsapSettings = {};
      if (config.translateX) gsapSettings.x = style.translateX.previous;
      if (config.skewX) gsapSettings.skewX = style.skewX.previous;
      if (config.scale) gsapSettings.scale = style.scale.previous;

      gsap.set(row, gsapSettings);
    });

    requestId = requestAnimationFrame(render);
  };

  const startRendering = () => {
    if (!requestId) {
      render();
    }
  };

  const stopRendering = () => {
    if (requestId) {
      cancelAnimationFrame(requestId);
      requestId = undefined;
    }
  };

  const enterFullview = () => {
    const flipstate = Flip.getState(middleRowItemInner);
    fullview.appendChild(middleRowItemInner);

    const transContent = getCSSVariableValue(content, "--trans-content");

    const tl = gsap.timeline();

    tl.add(
      Flip.from(flipstate, {
        duration: 0.9,
        ease: "power4",
        absolute: true,
        onComplete: stopRendering,
      })
    )

      .to(
        grid,
        {
          duration: 0.9,
          ease: "power4",
          opacity: 0.01,
        },
        0
      )

      .to(
        middleRowItemInnerImage,
        {
          scale: 1.2,
          duration: 1.6,
          ease: "sine",
        },
        "<-=0.45"
      )

      .to(content, {
        y: transContent,
        duration: 1.2,
        ease: "power4",
      })

      .add(() => frame.classList.remove("hidden"), "<")

      .to(
        middleRowItemInnerImage,
        {
          scale: 1,
          filter: "brightness(40%)",
          y: "-5vh",
          duration: 0.5,
          ease: "power4",
        },
        "<"
      );

    enterButton.classList.add("hidden");
    body.classList.remove("noscroll");
  };

  const init = () => {
    startRendering();
    enterButton.addEventListener("click", enterFullview);
    enterButton.addEventListener("click", function () {
      gsap.to(".navbar", {
        delay: 1.5,
        duration: 0.3,
        ease: "power4",
        opacity: 1
      });
    });
    enterButton.addEventListener("click", function () {
      gsap.from(".btm", {
        bottom: "-300",
        delay: 2,
        duration: 1,
        ease: "power4",
      });
    });
    enterButton.addEventListener("click", function () {
      gsap.from(".lft", {
        left: "-300",
        delay: 2,
        duration: 1,
        ease: "power4",
      });
    });
    enterButton.addEventListener("click", function () {
      gsap.from(".rgt", {
        right: "-300",
        delay: 2,
        duration: 1,
        ease: "power4",
      });
    });
    enterButton.addEventListener("touchstart", enterFullview);
  };

  preloadImages(".row__item-img").then(() => {
    document.body.classList.remove("loading");
    init();
  });

  window.addEventListener("mousemove", updateMousePosition);
  window.addEventListener("touchmove", (ev) => {
    const touch = ev.touches[0];
    updateMousePosition(touch);
  });
}
Intro();

// Story Video Animation---------------------------------------------
function storyVideoAnimation() {
  const __ms = document.querySelector(".micro-slider");
  const __msSlider = new MicroSlider(__ms, {
    padding: 80,
    zoomScale: -10,
    indicators: true,
  });
  const videos = document.querySelectorAll(".slider-item video");
  const __msTimer = 2500;
  let __msAutoplay = setInterval(() => __msSlider.next(), __msTimer);

  __ms.onmouseenter = function (e) {
    clearInterval(__msAutoplay);
  };

  __ms.onmouseleave = function (e) {
    clearInterval(__msAutoplay);
    __msAutoplay = setInterval(() => __msSlider.next(), __msTimer);
  };

  videos.forEach((video) => {
    video.addEventListener("mouseenter", () => {
      videos.forEach((v) => {
        if (v !== video) {
          v.pause();
        }
      });
      video.play();
    });
    video.addEventListener("mouseleave", () => {
      video.pause();
    });
  });

  // videos.forEach((video) => {
  //   const posterOverlay = document.createElement("div");
  //   posterOverlay.className = "poster-overlay";
  //   posterOverlay.style.backgroundImage = `url('${video.getAttribute(
  //     "poster"
  //   )}')`;
  //   video.parentNode.insertBefore(posterOverlay, video);

  //   video.addEventListener("mouseenter", () => {
  //     videos.forEach((v) => {
  //       if (v !== video) {
  //         v.pause();
  //         v.nextElementSibling.style.display = "block"; // Show the poster overlay for paused videos
  //       }
  //     });
  //     video.play();
  //     posterOverlay.style.display = "none"; // Hide the poster overlay for the current video
  //   });

  //   video.addEventListener("mouseleave", () => {
  //     video.pause();
  //     posterOverlay.style.display = "block"; // Show the poster overlay when the mouse leaves the video
  //   });

  //   video.addEventListener("play", () => {
  //     posterOverlay.style.display = "none"; // Hide the poster overlay when the video is playing
  //   });

  //   video.addEventListener("pause", () => {
  //     posterOverlay.style.display = "block"; // Show the poster overlay when the video is paused
  //   });
  // });
}
storyVideoAnimation();

// ZerOne Matter Physics---------------------------------------------
function ZerOne() {
  const world = document.querySelector(".zerone");
  const { Engine, Render, Runner, World, Bodies } = Matter;
  const images = [
    "assets/bottle-1.png", 
    "assets/bottle-2.png",
    "assets/bottle-3.png",
    "assets/bottle-4.png",
    "assets/container-1.png",
    "assets/container-2.png",
    "assets/container-3.png",
  ];

  function createBall() {
    const randomImg = images[Math.floor(Math.random() * images.length)];

    const ball = Bodies.circle(Math.round(Math.random() * 2732), 0, 25, {
      angle: Math.PI * (Math.random() * 2 - 1),
      friction: 0.001,
      frictionAir: 0.01,
      restitution: 1,
      render: {
        sprite: {
          texture: randomImg,
        },
      },
    });

    setTimeout(() => {
      World.remove(engine.world, ball);
    }, 30000);

    return ball;
  }

  const engine = Engine.create();
  const runner = Runner.create();
  const render = Render.create({
    canvas: world,
    engine: engine,
    options: {
      width: 2732,
      height: 720,
      background: "#164e63",
      wireframes: false
    },
  });

  const boundaryOptions = {
    isStatic: true,
    render: {
      fillStyle: "transparent",
      strokeStyle: "transparent",
    },
  };
  const ground = Bodies.rectangle(1366, 700, 2732, 20, boundaryOptions);
  const leftWall = Bodies.rectangle(0, 360, 6, 740, boundaryOptions);
  const rightWall = Bodies.rectangle(2732, 360, 6, 740, boundaryOptions);

  Render.run(render);
  Runner.run(runner, engine);

  World.add(engine.world, [ground, leftWall, rightWall]);

  const handleClick = () => {
    const ball2 = createBall();
    World.add(engine.world, [ball2]);
  };

  const button = document.querySelector(".team-btn");
  button.addEventListener("click", handleClick);
}
ZerOne();