import { useEffect, useRef } from "react";
import * as THREE from "three";

import "./MagicRings.css";

const vertexShader = `
void main() {
  gl_Position =
    projectionMatrix *
    modelViewMatrix *
    vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform float uAttenuation;
uniform float uLineThickness;

uniform float uBaseRadius;
uniform float uRadiusStep;
uniform float uScaleRate;

uniform float uOpacity;
uniform float uNoiseAmount;
uniform float uRotation;
uniform float uRingGap;

uniform float uFadeIn;
uniform float uFadeOut;

uniform float uMouseInfluence;
uniform float uHoverAmount;
uniform float uHoverScale;
uniform float uParallax;
uniform float uBurst;

uniform float uCoverageAlpha;

uniform vec2 uResolution;
uniform vec2 uMouse;

uniform vec3 uColor;
uniform vec3 uColorMiddle;
uniform vec3 uColorTwo;

uniform int uRingCount;

const float HP = 1.5707963;
const float CYCLE = 3.45;

float fade(float t) {
  return t < uFadeIn
    ? smoothstep(0.0, uFadeIn, t)
    : 1.0 - smoothstep(
        uFadeOut,
        CYCLE - 0.2,
        t
      );
}

float ring(
  vec2 p,
  float ri,
  float cut,
  float t0,
  float px
) {
  float t = mod(uTime + t0, CYCLE);

  float r =
    ri +
    t / CYCLE *
    uScaleRate;

  float d =
    abs(length(p) - r);

  float a =
    atan(abs(p.y), abs(p.x)) /
    HP;

  float th =
    max(1.0 - a, 0.5) *
    px *
    uLineThickness;

  float h =
    (1.0 - smoothstep(
      th,
      th * 1.5,
      d
    )) +
    1.0;

  d +=
    pow(cut * a, 3.0) *
    r;

  return
    h *
    exp(-uAttenuation * d) *
    fade(t);
}

vec3 getTricolor(float position) {

  /*
    0.0 -> Saffron
    0.5 -> White
    1.0 -> Green
  */

  if (position < 0.5) {

    float t =
      position / 0.5;

    return mix(
      uColor,
      uColorMiddle,
      t
    );

  } else {

    float t =
      (position - 0.5) / 0.5;

    return mix(
      uColorMiddle,
      uColorTwo,
      t
    );
  }
}

void main() {

  float px =
    1.0 /
    min(
      uResolution.x,
      uResolution.y
    );

  vec2 p =
    (
      gl_FragCoord.xy -
      0.5 *
      uResolution.xy
    ) *
    px;

  float cr =
    cos(uRotation);

  float sr =
    sin(uRotation);

  p =
    mat2(
      cr,
      -sr,
      sr,
      cr
    ) *
    p;

  p -=
    uMouse *
    uMouseInfluence;

  float sc =
    mix(
      1.0,
      uHoverScale,
      uHoverAmount
    ) +
    uBurst *
    0.3;

  p /= sc;

  vec3 c =
    vec3(0.0);

  float coverage =
    0.0;

  float rcf =
    max(
      float(uRingCount) - 1.0,
      1.0
    );

  for (int i = 0; i < 12; i++) {

    if (i >= uRingCount) {
      break;
    }

    float fi =
      float(i);

    vec2 pr =
      p -
      fi *
      uParallax *
      uMouse;

    float position =
      fi /
      rcf;

    vec3 rc =
      getTricolor(position);

    float ringAmount =
      ring(
        pr,
        uBaseRadius +
          fi *
          uRadiusStep,
        pow(
          uRingGap,
          fi
        ),
        i == 0
          ? 0.0
          : 2.95 * fi,
        px
      );

    c =
      mix(
        c,
        rc,
        vec3(ringAmount)
      );

    coverage =
      max(
        coverage,
        ringAmount
      );
  }

  c *=
    1.0 +
    uBurst *
    2.0;

  float n =
    fract(
      sin(
        dot(
          gl_FragCoord.xy +
            uTime *
            100.0,
          vec2(
            12.9898,
            78.233
          )
        )
      ) *
      43758.5453
    );

  c +=
    (n - 0.5) *
    uNoiseAmount;

  float intensity =
    max(
      c.r,
      max(
        c.g,
        c.b
      )
    );

  vec3 emissiveColor =
    intensity > 0.0001
      ? clamp(
          c / intensity,
          0.0,
          1.0
        )
      : vec3(0.0);

  vec3 outputColor =
    mix(
      emissiveColor,
      clamp(
        c,
        0.0,
        1.0
      ),
      uCoverageAlpha
    );

  float outputAlpha =
    mix(
      intensity,
      coverage,
      uCoverageAlpha
    );

  gl_FragColor =
    vec4(
      outputColor,
      clamp(
        outputAlpha *
          uOpacity,
        0.0,
        1.0
      )
    );
}
`;

export default function MagicRings({
  color = "#FF9933",
  colorMiddle = "#FFFFFF",
  colorTwo = "#138808",

  speed = 0.55,
  ringCount = 7,

  attenuation = 10,
  lineThickness = 2,

  baseRadius = 0.35,
  radiusStep = 0.1,
  scaleRate = 0.1,

  opacity = 0.72,
  blur = 0,

  noiseAmount = 0.025,

  rotation = 0,
  ringGap = 1.5,

  fadeIn = 0.7,
  fadeOut = 0.5,

  followMouse = true,
  mouseInfluence = 0.12,

  hoverScale = 1.08,
  parallax = 0.025,

  clickBurst = true,

  alphaMode = "luminance",
}) {

  const mountRef =
    useRef(null);

  const propsRef =
    useRef(null);

  const mouseRef =
    useRef([0, 0]);

  const smoothMouseRef =
    useRef([0, 0]);

  const hoverAmountRef =
    useRef(0);

  const isHoveredRef =
    useRef(false);

  const burstRef =
    useRef(0);

  propsRef.current = {
    color,
    colorMiddle,
    colorTwo,

    speed,
    ringCount,

    attenuation,
    lineThickness,

    baseRadius,
    radiusStep,
    scaleRate,

    opacity,
    noiseAmount,

    rotation,
    ringGap,

    fadeIn,
    fadeOut,

    followMouse,
    mouseInfluence,

    hoverScale,
    parallax,

    clickBurst,

    alphaMode,
  };

  useEffect(() => {

    const mount =
      mountRef.current;

    if (!mount) {
      return undefined;
    }

    let renderer;

    try {

      renderer =
        new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference:
            "high-performance",
        });

    } catch {

      return undefined;
    }

    if (!renderer.capabilities.isWebGL2) {

      renderer.dispose();

      return undefined;
    }

    renderer.setClearColor(
      0x000000,
      0
    );

    renderer.domElement.style.width =
      "100%";

    renderer.domElement.style.height =
      "100%";

    renderer.domElement.style.display =
      "block";

    mount.appendChild(
      renderer.domElement
    );

    const scene =
      new THREE.Scene();

    const camera =
      new THREE.OrthographicCamera(
        -0.5,
        0.5,
        0.5,
        -0.5,
        0.1,
        10
      );

    camera.position.z = 1;

    const uniforms = {

      uTime: {
        value: 0,
      },

      uAttenuation: {
        value: 10,
      },

      uResolution: {
        value:
          new THREE.Vector2(),
      },

      uColor: {
        value:
          new THREE.Color(
            color
          ),
      },

      uColorMiddle: {
        value:
          new THREE.Color(
            colorMiddle
          ),
      },

      uColorTwo: {
        value:
          new THREE.Color(
            colorTwo
          ),
      },

      uLineThickness: {
        value: 2,
      },

      uBaseRadius: {
        value: 0.35,
      },

      uRadiusStep: {
        value: 0.1,
      },

      uScaleRate: {
        value: 0.1,
      },

      uRingCount: {
        value: 7,
      },

      uOpacity: {
        value: 0.72,
      },

      uNoiseAmount: {
        value: 0.025,
      },

      uRotation: {
        value: 0,
      },

      uRingGap: {
        value: 1.5,
      },

      uFadeIn: {
        value: 0.7,
      },

      uFadeOut: {
        value: 0.5,
      },

      uMouse: {
        value:
          new THREE.Vector2(),
      },

      uMouseInfluence: {
        value: 0.12,
      },

      uHoverAmount: {
        value: 0,
      },

      uHoverScale: {
        value: 1.08,
      },

      uParallax: {
        value: 0.025,
      },

      uBurst: {
        value: 0,
      },

      uCoverageAlpha: {
        value: 0,
      },
    };

    const material =
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,

        transparent: true,

        depthWrite: false,

        blending:
          THREE.AdditiveBlending,
      });

    const quad =
      new THREE.Mesh(
        new THREE.PlaneGeometry(
          1,
          1
        ),
        material
      );

    scene.add(quad);

    const resize = () => {

      const width =
        Math.max(
          mount.clientWidth,
          1
        );

      const height =
        Math.max(
          mount.clientHeight,
          1
        );

      const dpr =
        Math.min(
          window.devicePixelRatio ||
            1,
          2
        );

      renderer.setPixelRatio(
        dpr
      );

      renderer.setSize(
        width,
        height,
        false
      );

      uniforms.uResolution.value.set(
        width * dpr,
        height * dpr
      );
    };

    resize();

    window.addEventListener(
      "resize",
      resize
    );

    const resizeObserver =
      new ResizeObserver(
        resize
      );

    resizeObserver.observe(
      mount
    );

    const onMouseMove = (event) => {

      const rect =
        mount.getBoundingClientRect();

      if (
        rect.width <= 0 ||
        rect.height <= 0
      ) {
        return;
      }

      mouseRef.current[0] =
        (event.clientX -
          rect.left) /
          rect.width -
        0.5;

      mouseRef.current[1] =
        -(
          (event.clientY -
            rect.top) /
            rect.height -
          0.5
        );
    };

    const onMouseEnter = () => {
      isHoveredRef.current =
        true;
    };

    const onMouseLeave = () => {

      isHoveredRef.current =
        false;

      mouseRef.current[0] = 0;
      mouseRef.current[1] = 0;
    };

    const onClick = () => {

      burstRef.current =
        1;
    };

    mount.addEventListener(
      "mousemove",
      onMouseMove
    );

    mount.addEventListener(
      "mouseenter",
      onMouseEnter
    );

    mount.addEventListener(
      "mouseleave",
      onMouseLeave
    );

    mount.addEventListener(
      "click",
      onClick
    );

    let frameId = 0;

    let isVisible = false;

    let isPageVisible =
      !document.hidden;

    let elapsed = 0;

    let lastTime = 0;

    const animate = (time) => {

      frameId =
        requestAnimationFrame(
          animate
        );

      const props =
        propsRef.current;

      const delta =
        lastTime === 0
          ? 0
          : Math.min(
              time - lastTime,
              100
            );

      lastTime = time;

      elapsed +=
        delta *
        0.001 *
        props.speed;

      smoothMouseRef.current[0] +=
        (
          mouseRef.current[0] -
          smoothMouseRef.current[0]
        ) *
        0.08;

      smoothMouseRef.current[1] +=
        (
          mouseRef.current[1] -
          smoothMouseRef.current[1]
        ) *
        0.08;

      hoverAmountRef.current +=
        (
          (
            isHoveredRef.current
              ? 1
              : 0
          ) -
          hoverAmountRef.current
        ) *
        0.08;

      burstRef.current *=
        0.95;

      if (
        burstRef.current <
        0.001
      ) {
        burstRef.current = 0;
      }

      uniforms.uTime.value =
        elapsed;

      uniforms.uAttenuation.value =
        props.attenuation;

      uniforms.uColor.value.set(
        props.color
      );

      uniforms.uColorMiddle.value.set(
        props.colorMiddle
      );

      uniforms.uColorTwo.value.set(
        props.colorTwo
      );

      uniforms.uLineThickness.value =
        props.lineThickness;

      uniforms.uBaseRadius.value =
        props.baseRadius;

      uniforms.uRadiusStep.value =
        props.radiusStep;

      uniforms.uScaleRate.value =
        props.scaleRate;

      uniforms.uRingCount.value =
        props.ringCount;

      uniforms.uOpacity.value =
        props.opacity;

      uniforms.uNoiseAmount.value =
        props.noiseAmount;

      uniforms.uRotation.value =
        (
          props.rotation *
          Math.PI
        ) /
        180;

      uniforms.uRingGap.value =
        props.ringGap;

      uniforms.uFadeIn.value =
        props.fadeIn;

      uniforms.uFadeOut.value =
        props.fadeOut;

      uniforms.uMouse.value.set(
        smoothMouseRef.current[0],
        smoothMouseRef.current[1]
      );

      uniforms.uMouseInfluence.value =
        props.followMouse
          ? props.mouseInfluence
          : 0;

      uniforms.uHoverAmount.value =
        hoverAmountRef.current;

      uniforms.uHoverScale.value =
        props.hoverScale;

      uniforms.uParallax.value =
        props.parallax;

      uniforms.uBurst.value =
        props.clickBurst
          ? burstRef.current
          : 0;

      uniforms.uCoverageAlpha.value =
        props.alphaMode ===
        "coverage"
          ? 1
          : 0;

      renderer.render(
        scene,
        camera
      );
    };

    const startAnimation = () => {

      if (
        isVisible &&
        isPageVisible &&
        frameId === 0
      ) {

        lastTime = 0;

        frameId =
          requestAnimationFrame(
            animate
          );
      }
    };

    const stopAnimation = () => {

      if (frameId !== 0) {

        cancelAnimationFrame(
          frameId
        );

        frameId = 0;
      }
    };

    const intersectionObserver =
      new IntersectionObserver(
        ([entry]) => {

          isVisible =
            entry.isIntersecting;

          if (isVisible) {
            startAnimation();
          } else {
            stopAnimation();
          }
        },
        {
          threshold: 0,
        }
      );

    intersectionObserver.observe(
      mount
    );

    const onVisibilityChange =
      () => {

        isPageVisible =
          !document.hidden;

        if (isPageVisible) {
          startAnimation();
        } else {
          stopAnimation();
        }
      };

    document.addEventListener(
      "visibilitychange",
      onVisibilityChange
    );

    isVisible = true;

    startAnimation();

    return () => {

      stopAnimation();

      intersectionObserver.disconnect();

      resizeObserver.disconnect();

      window.removeEventListener(
        "resize",
        resize
      );

      document.removeEventListener(
        "visibilitychange",
        onVisibilityChange
      );

      mount.removeEventListener(
        "mousemove",
        onMouseMove
      );

      mount.removeEventListener(
        "mouseenter",
        onMouseEnter
      );

      mount.removeEventListener(
        "mouseleave",
        onMouseLeave
      );

      mount.removeEventListener(
        "click",
        onClick
      );

      if (
        renderer.domElement.parentNode ===
        mount
      ) {
        mount.removeChild(
          renderer.domElement
        );
      }

      quad.geometry.dispose();

      material.dispose();

      renderer.dispose();
    };

  }, []);

  return (
    <div
      ref={mountRef}
      className="magic-rings-container"
      style={
        blur > 0
          ? {
              filter: `blur(${blur}px)`,
            }
          : undefined
      }
    />
  );
}