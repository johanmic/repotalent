"use client"
import { useEffect, useRef, useState } from "react"
import { Color, Scene, Fog, PerspectiveCamera, Vector3 } from "three"
import ThreeGlobe from "three-globe"
import { useThree, Canvas, extend, ThreeEvent } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import countries from "@/../data/globe.json"

declare module "@react-three/fiber" {
  interface ThreeElements {
    threeGlobe: Partial<ThreeEvent<any>> & {
      ref?: React.Ref<ThreeGlobe | null>
    }
  }
}

extend({ ThreeGlobe })

const RING_PROPAGATION_SPEED = 3
const aspect = 1.2
const cameraZ = 300

type Position = {
  order: number
  startLat: number
  startLng: number
  endLat: number
  endLng: number
  arcAlt: number
  color: string
}

export type GlobeConfig = {
  pointSize?: number
  globeColor?: string
  showAtmosphere?: boolean
  atmosphereColor?: string
  atmosphereAltitude?: number
  emissive?: string
  emissiveIntensity?: number
  shininess?: number
  polygonColor?: string
  ambientLight?: string
  directionalLeftLight?: string
  directionalTopLight?: string
  pointLight?: string
  arcTime?: number
  arcLength?: number
  rings?: number
  maxRings?: number
  initialPosition?: {
    lat: number
    lng: number
  }
  autoRotate?: boolean
  autoRotateSpeed?: number
}

interface WorldProps {
  globeConfig: GlobeConfig
  data: Position[]
}

let numbersOfRings = [0]

export function Globe({ globeConfig, data }: WorldProps) {
  const [globeData, setGlobeData] = useState<
    | {
        size: number
        order: number
        color: string
        lat: number
        lng: number
      }[]
    | null
  >(null)

  const globeRef = useRef<ThreeGlobe>(null)

  const defaultProps = {
    pointSize: 1,
    atmosphereColor: "#ffffff",
    showAtmosphere: true,
    atmosphereAltitude: 0.1,
    polygonColor: "rgba(255,255,255,0.7)",
    globeColor: "#1d072e",
    emissive: "#000000",
    emissiveIntensity: 0.1,
    shininess: 0.9,
    arcTime: 2000,
    arcLength: 0.9,
    rings: 1,
    maxRings: 3,
    ...globeConfig,
  }

  useEffect(() => {
    if (globeRef.current) {
      _buildData()
      _buildMaterial()
    }
  }, [globeRef.current])

  const _buildMaterial = () => {
    if (!globeRef.current) return

    const globeMaterial = globeRef.current.globeMaterial() as unknown as {
      color: Color
      emissive: Color
      emissiveIntensity: number
      shininess: number
    }
    globeMaterial.color = new Color(globeConfig.globeColor)
    globeMaterial.emissive = new Color(globeConfig.emissive)
    globeMaterial.emissiveIntensity = globeConfig.emissiveIntensity || 0.1
    globeMaterial.shininess = globeConfig.shininess || 0.9
  }

  const _buildData = () => {
    const arcs = data
    const points: {
      size: number
      order: number
      color: string
      lat: number
      lng: number
    }[] = []

    // Add validation for input data
    if (!Array.isArray(arcs) || arcs.length === 0) {
      console.warn("Invalid or empty arcs data")
      return
    }

    for (let i = 0; i < arcs.length; i++) {
      const arc = arcs[i]

      // Add defensive check for arc and color
      if (!arc || typeof arc.color === "undefined") {
        console.warn(`Invalid arc data at index ${i}:`, arc)
        continue
      }

      // Ensure color is a string and has a valid format
      const colorStr = String(arc.color).trim()
      if (!colorStr.startsWith("#")) {
        console.warn(`Invalid color format at index ${i}:`, colorStr)
        continue
      }

      const rgb = hexToRgb(colorStr)

      // Validate RGB values
      if (!rgb) {
        console.warn(`Invalid color value at index ${i}:`, colorStr)
        continue
      }

      // Validate coordinates
      if (
        !isValidCoordinate(arc.startLat, arc.startLng) ||
        !isValidCoordinate(arc.endLat, arc.endLng)
      ) {
        console.warn(`Invalid coordinates at index ${i}:`, arc)
        continue
      }

      points.push({
        size: defaultProps.pointSize,
        order: arc.order,
        color: "rgba(251, 113, 133, 0.1)", //
        lat: arc.startLat,
        lng: arc.startLng,
      })
      points.push({
        size: defaultProps.pointSize,
        order: arc.order,
        color: "rgba(251, 113, 133, 0.1)", //
        lat: arc.endLat,
        lng: arc.endLng,
      })
    }

    // Validate final points array
    if (points.length === 0) {
      console.warn("No valid points generated")
      return
    }

    const filteredPoints = points.filter(
      (v, i, a) =>
        a.findIndex((v2) =>
          ["lat", "lng"].every(
            (k) =>
              isFinite(v2[k as "lat" | "lng"]) &&
              v2[k as "lat" | "lng"] === v[k as "lat" | "lng"]
          )
        ) === i
    )

    if (filteredPoints.length === 0) {
      console.warn("No valid points after filtering")
      return
    }
    console.log("Filtered Points:", filteredPoints)
    setGlobeData(
      filteredPoints.map((point) => ({
        ...point,
        color: "rgba(251, 113, 133, 0.1)",
      }))
    )
  }

  const isValidCoordinate = (lat: number, lng: number): boolean => {
    return (
      isFinite(lat) &&
      isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    )
  }

  useEffect(() => {
    if (!globeRef.current || !globeData) return

    try {
      globeRef.current
        .hexPolygonsData(countries.features)
        .hexPolygonResolution(3)
        .hexPolygonMargin(0.7)
        .showAtmosphere(defaultProps.showAtmosphere)
        .atmosphereColor(defaultProps.atmosphereColor)
        .atmosphereAltitude(defaultProps.atmosphereAltitude)
        .hexPolygonColor(() => defaultProps.polygonColor)

      // Remove the scene manipulation entirely since Three.js/React Three Fiber
      // will handle the scene automatically
      requestAnimationFrame(() => {
        if (globeRef.current) {
          startAnimation()
        }
      })
    } catch (error) {
      console.error("Error initializing globe:", error)
    }
  }, [globeData])

  const sanitizeData = (data: Position[]) => {
    return data
      .map((d) => ({
        ...d,
        arcAlt: Math.min(Math.max(d.arcAlt, 0.1), 1.0),
      }))
      .filter((d) => {
        const isValidNumber = (value: number) =>
          !isNaN(value) && isFinite(value)
        return (
          isValidNumber(d.startLat) &&
          isValidNumber(d.startLng) &&
          isValidNumber(d.endLat) &&
          isValidNumber(d.endLng) &&
          d.startLat >= -90 &&
          d.startLat <= 90 &&
          d.endLat >= -90 &&
          d.endLat <= 90 &&
          d.startLng >= -180 &&
          d.startLng <= 180 &&
          d.endLng >= -180 &&
          d.endLng <= 180
        )
      })
  }

  const startAnimation = () => {
    if (!globeRef.current || !globeData) return

    const sanitizedData = sanitizeData(data)
    console.log("Sanitized Data:", sanitizedData)

    if (sanitizedData.length === 0) {
      console.warn("No valid data points for globe animation")
      return
    }

    try {
      // Initialize with empty data first
      globeRef.current.arcsData([]).pointsData([]).ringsData([])

      // Then set the actual data after a short delay
      setTimeout(() => {
        if (!globeRef.current) return

        globeRef.current
          .arcsData(sanitizedData)
          .arcStartLat((d) => (d as { startLat: number }).startLat)
          .arcStartLng((d) => (d as { startLng: number }).startLng)
          .arcEndLat((d) => (d as { endLat: number }).endLat)
          .arcEndLng((d) => (d as { endLng: number }).endLng)
          .arcColor((e: any) => (e as { color: string }).color)
          .arcAltitude((e) => (e as { arcAlt: number }).arcAlt)
          .arcStroke((e) => [0.32, 0.28, 0.3][Math.round(Math.random() * 2)])
          .arcDashLength(defaultProps.arcLength)
          .arcDashInitialGap((e) => (e as { order: number }).order)
          .arcDashGap(15)
          .arcDashAnimateTime((e) => defaultProps.arcTime)

        setTimeout(() => {
          if (globeRef.current) {
            globeRef.current
              .pointsData(globeData)
              .pointColor((e) => (e as { color: string }).color)
              .pointsMerge(true)
              .pointAltitude(0.0)
              .pointRadius(2)
          }
        }, 500)
      }, 100)
    } catch (error) {
      console.error("Error starting globe animation:", error)
    }
  }

  useEffect(() => {
    if (!globeRef.current || !globeData) return

    const interval = setInterval(() => {
      if (!globeRef.current || !globeData) return
      numbersOfRings = genRandomNumbers(
        0,
        data.length,
        Math.floor((data.length * 4) / 5)
      )

      globeRef.current.ringsData(
        globeData.filter((d, i) => numbersOfRings.includes(i))
      )
    }, 2000)

    return () => {
      clearInterval(interval)
    }
  }, [globeRef.current, globeData])

  return (
    <>
      <threeGlobe ref={globeRef} />
    </>
  )
}

export function WebGLRendererConfig() {
  const { gl, size } = useThree()

  useEffect(() => {
    gl.setPixelRatio(window.devicePixelRatio)
    gl.setSize(size.width, size.height)
    gl.setClearColor(0xffaaff, 0)
  }, [])

  return null
}

export function World(props: WorldProps) {
  const { globeConfig } = props
  const scene = new Scene()
  scene.fog = new Fog(0xffffff, 400, 2000)
  return (
    <Canvas scene={scene} camera={new PerspectiveCamera(50, aspect, 180, 1800)}>
      <WebGLRendererConfig />
      <ambientLight color={globeConfig.ambientLight} intensity={0.6} />
      <directionalLight
        color={globeConfig.directionalLeftLight}
        position={new Vector3(-400, 100, 400)}
      />
      <directionalLight
        color={globeConfig.directionalTopLight}
        position={new Vector3(-200, 500, 200)}
      />
      <pointLight
        color={globeConfig.pointLight}
        position={new Vector3(-200, 500, 200)}
        intensity={0.8}
      />
      <Globe {...props} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minDistance={cameraZ}
        maxDistance={cameraZ}
        autoRotateSpeed={1}
        autoRotate={true}
        minPolarAngle={Math.PI / 3.5}
        maxPolarAngle={Math.PI - Math.PI / 3}
      />
    </Canvas>
  )
}

export function hexToRgb(hex: string) {
  // Add type checking
  if (typeof hex !== "string") {
    console.warn("Invalid hex color value:", hex)
    return null
  }

  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b
  })

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

export function genRandomNumbers(min: number, max: number, count: number) {
  const arr: number[] = []
  while (arr.length < count) {
    const r = Math.floor(Math.random() * (max - min)) + min
    if (arr.indexOf(r) === -1) arr.push(r)
  }

  return arr
}
