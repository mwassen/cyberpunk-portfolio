// 3D BACKGROUND
import LogoBackground from "./ThreeLogo";

// WEBGL COMPATIBILITY
import { WebGL } from "three-full/sources/helpers/WebGL";

// CSS
import "../css/main.css";

// Check for WebGL Compatibility
if (WebGL.isWebGLAvailable() === false) {
  document.body.innerHTML = WebGL.getWebGLErrorMessage();
}

// let logoMesh; // Logo model for global access
let scale = 70;

// Window sizing
let width = window.innerWidth;
let height = window.innerHeight;

// Device check
const onMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(
  navigator.userAgent
);

if (onMobile) {
  const mobileHeight = height + 56;
  height = mobileHeight;
  threeDiv.style.height = mobileHeight + "px";
  scrollSvg.style.marginBottom = "75px";
  scale = 60;
}

// element references
const scrollSvg = document.getElementById("scroll-marker");
const contentBg = document.getElementById("bg");
const writtenContent = document.getElementById("main-container");
const threeDiv = document.getElementById("three");
const projectDivs = [...document.getElementsByClassName("work-project")];

// THREE BACKGROUND
const threeBackground = LogoBackground({
  width,
  height,
  onMobile,
  scale
});
threeDiv.appendChild(threeBackground.domElement);

// Show scroll indicator
setTimeout(() => {
  scrollSvg.style.opacity = 1;
}, 2500);

// EVENTS
if (!onMobile) {
  window.addEventListener("resize", () => {
    threeBackground.resize([window.innerWidth, window.innerHeight]);
  });
} else {
  window.addEventListener("orientationchange", () => {
    threeBackground.reorient(screen.orientation.angle, [
      window.innerWidth,
      window.innerHeight
    ]);
  });
}
window.addEventListener("scroll", () => {
  threeBackground.scroll(window.scrollY);

  // Fade in/out scroll indicator
  if (window.scrollY > 0) {
    scrollSvg.style.opacity = 0;
  } else if (window.scrollY === 0) {
    scrollSvg.style.opacity = 1;
  }

  // Fade in/out written content
  if (window.scrollY > 200) {
    writtenContent.style.opacity = 1;
    contentBg.style.opacity = 0.7;
  } else {
    writtenContent.style.opacity = 0;
    contentBg.style.opacity = 0;
  }
});
// Mouse effects for project Divs
projectDivs.forEach(project => {
  const ghLink = project.querySelector(".github-link");
  project.addEventListener("mouseenter", () => {
    ghLink.style.opacity = 0.25;
    ghLink.style.cursor = "pointer";
  });
  project.addEventListener("mouseleave", () => {
    ghLink.style.opacity = 0;
    ghLink.style.cursor = "none";
  });
  ghLink.addEventListener("mouseenter", () => {
    ghLink.style.opacity = 1;
  });
  ghLink.addEventListener("mouseleave", () => {
    ghLink.style.opacity = 0.25;
  });
});

// Reset scroll location on page reload
window.onbeforeunload = () => {
  window.scrollTo(0, 0);
};
