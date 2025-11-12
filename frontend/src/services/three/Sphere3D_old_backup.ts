import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'
import type { Person } from '../../store/lottery'
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js'

export interface Sphere3DConfig {
  containerWidth: number
  containerHeight: number
  sphereRadius?: number
  cardSize?: { width: number; height: number }
  nameColor?: string
  backgroundColor?: string
  maxVisibleNames?: number
}

export class Sphere3DManager {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: CSS3DRenderer
  private objects: CSS3DObject[] = []
  private personIdMap: Map<CSS3DObject, string> = new Map()
  private animationId: number | null = null
  private isSpinning: boolean = false
  private config: Required<Sphere3DConfig>
  private viewMode: 'grid' | 'sphere' = 'grid'
  private gridTargets: THREE.Object3D[] = []
  private sphereTargets: THREE.Object3D[] = []

  constructor(container: HTMLElement, config: Sphere3DConfig) {
    this.config = {
      sphereRadius: 5,
      cardSize: { width: 200, height: 50 },
      nameColor: '#ffffff',
      backgroundColor: '#000000',
      maxVisibleNames: 40,
      ...config
    }

    // Create scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(this.config.backgroundColor)

    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.config.containerWidth / this.config.containerHeight,
      0.1,
      1000
    )
    this.camera.position.z = 15

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(this.config.containerWidth, this.config.containerHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(this.renderer.domElement)

    // Add lights
    this.setupLights()

    // Create sphere
    this.createSphere()

    // Setup post-processing
    this.setupPostProcessing()

    // Start animation loop
    this.animate()
  }

  /**
   * Setup scene lighting
   */
  private setupLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    this.scene.add(ambientLight)

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 5, 5)
    this.scene.add(directionalLight)

    // Point light for dramatic effect
    const pointLight = new THREE.PointLight(0x0f5fd3, 1, 100)
    pointLight.position.set(0, 0, 10)
    this.scene.add(pointLight)
  }

  /**
   * Create the 3D sphere
   */
  private createSphere() {
    const geometry = new THREE.SphereGeometry(this.config.sphereRadius, 32, 32)
    const material = new THREE.MeshBasicMaterial({
      color: 0xff69b4, // Hot pink, will be mostly transparent
      transparent: true,
      opacity: 0, // Start fully transparent
      wireframe: true
    })
    
    this.sphere = new THREE.Mesh(geometry, material)
    this.sphere.visible = false // Start invisible
    this.scene.add(this.sphere)
  }

  /**
   * Setup post-processing effects like bloom
   */
  private setupPostProcessing() {
    const renderScene = new RenderPass(this.scene, this.camera)

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.config.containerWidth, this.config.containerHeight),
      1.2, // strength
      0.1, // radius
      0.1  // threshold
    )

    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(renderScene)
    this.composer.addPass(bloomPass)
  }

  /**
   * Create text sprite for a name
   */
  private createTextSprite(person: Person): THREE.Sprite {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    
    const cardWidth = 256
    const cardHeight = 100
    canvas.width = cardWidth
    canvas.height = cardHeight

    // Glassmorphism background
    context.fillStyle = 'rgba(255, 105, 180, 0.2)' // Semi-transparent pink
    context.fillRect(0, 0, cardWidth, cardHeight)

    // Neon-pink border
    context.strokeStyle = 'rgba(255, 105, 180, 0.8)'
    context.lineWidth = 4
    context.strokeRect(0, 0, cardWidth, cardHeight)
    
    // Add a subtle glow for the border
    context.shadowColor = 'rgba(255, 105, 180, 1)';
    context.shadowBlur = 10;
    context.strokeRect(0, 0, cardWidth, cardHeight);
    context.shadowBlur = 0; // Reset shadow for text

    // Draw Name
    context.fillStyle = this.config.nameColor
    context.font = 'bold 32px "Segoe UI", "Helvetica Neue", sans-serif'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(person.name, cardWidth / 2, cardHeight / 2 - 10)

    // Draw Department
    if (person.department) {
      context.font = 'normal 20px "Segoe UI", "Helvetica Neue", sans-serif'
      context.fillStyle = 'rgba(255, 255, 255, 0.8)'
      context.fillText(person.department, cardWidth / 2, cardHeight / 2 + 25)
    }

    // Create sprite
    const texture = new THREE.CanvasTexture(canvas)
    const material = new THREE.SpriteMaterial({ map: texture })
    const sprite = new THREE.Sprite(material)
    
    // Scale sprite
    sprite.scale.set(
      cardWidth / 100,
      cardHeight / 100,
      1
    )

    return sprite
  }

  /**
   * Toggle between grid and sphere view
   */
  public async toggleView(mode: 'grid' | 'sphere'): Promise<void> {
    if (this.viewMode === mode) return
    this.viewMode = mode

    const targetObjects = mode === 'sphere' ? this.sphereObjects : this.gridObjects
    if (targetObjects.length !== this.nameSprites.length) {
      console.warn('Mismatch between sprites and target positions.')
      return
    }

    const transitionDuration = 2000
    const staggerDelay = 15

    if (mode === 'sphere' && this.sphere) {
      this.sphere.visible = true
    }

    this.nameSprites.forEach((sprite, i) => {
      const target = targetObjects[i]
      if (!target) return

      const delay = Math.random() * staggerDelay * i

      new TWEEN.Tween(sprite.position)
        .to({ x: target.position.x, y: target.position.y, z: target.position.z }, transitionDuration)
        .easing(TWEEN.Easing.Exponential.InOut)
        .delay(delay)
        .start()

      new TWEEN.Tween(sprite.rotation)
        .to({ x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, transitionDuration)
        .easing(TWEEN.Easing.Exponential.InOut)
        .delay(delay)
        .start()
    })

    if (this.sphere) {
      new TWEEN.Tween(this.sphere.material)
        .to({ opacity: mode === 'sphere' ? 0.15 : 0 }, transitionDuration)
        .easing(TWEEN.Easing.Exponential.InOut)
        .onComplete(() => {
          if (mode === 'grid' && this.sphere) {
            this.sphere.visible = false
          }
        })
        .start()
    }

    const totalAnimationTime = transitionDuration + staggerDelay * this.nameSprites.length
    return new Promise(resolve => setTimeout(resolve, totalAnimationTime))
  }

  /**
   * Resize the canvas and update camera aspect ratio
   */
  public resize(width: number, height: number) {
    this.config.containerWidth = width
    this.config.containerHeight = height
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
    this.composer.setSize(width, height) // Resize composer
  }

  /**
   * Animate a spin for the draw, resolving when complete.
   */
  public spinForDraw(duration: number): Promise<void> {
    return new Promise(resolve => {
      this.isSpinning = true
      const spinTween = new TWEEN.Tween(this.sphere!.rotation)
        .to({ y: this.sphere!.rotation.y + Math.PI * 4 }, duration)
        .easing(TWEEN.Easing.Cubic.InOut)
        .onUpdate(() => {
          // This rotation is handled by the tween, but we need to sync sprites
        })
        .onComplete(() => {
          this.isSpinning = false
          resolve()
        })
      
      spinTween.start()
    })
  }

  /**
   * Highlight a winner's sprite
   */
  public highlightWinner(personId: string) {
    const spriteToHighlight = this.nameSprites.find(s => this.spriteNameMap.get(s) === personId);

    if (spriteToHighlight) {
      // Make it pop
      new TWEEN.Tween(spriteToHighlight.scale)
        .to({ x: spriteToHighlight.scale.x * 1.5, y: spriteToHighlight.scale.y * 1.5, z: 1.5 }, 500)
        .easing(TWEEN.Easing.Elastic.Out)
        .yoyo(true)
        .repeat(1)
        .start()

      // And bring it to the front
      const direction = new THREE.Vector3().subVectors(spriteToHighlight.position, this.camera.position).normalize()
      const targetPosition = new THREE.Vector3().addVectors(this.camera.position, direction.multiplyScalar(10))

      new TWEEN.Tween(spriteToHighlight.position)
        .to({ x: targetPosition.x, y: targetPosition.y, z: targetPosition.z }, 1000)
        .easing(TWEEN.Easing.Exponential.Out)
        .onComplete(() => {
            // Optionally, move it back after a delay
        })
        .start()
    }
  }

  /**
   * Distribute names around the sphere
   */
  public updateNames(participants: Person[]) {
    // Clear existing sprites
    this.nameSprites.forEach(sprite => this.scene.remove(sprite))
    this.nameSprites = []
    this.gridObjects = []
    this.sphereObjects = []

    const visibleParticipants = participants.slice(0, this.config.maxVisibleNames)

    const gridCols = Math.ceil(Math.sqrt(visibleParticipants.length))
    const gridCellWidth = this.config.cardSize.width / 100 + 0.5
    const gridCellHeight = this.config.cardSize.height / 100 + 0.5
    const gridWidth = gridCols * gridCellWidth
    const gridHeight = Math.ceil(visibleParticipants.length / gridCols) * gridCellHeight

    visibleParticipants.forEach((person, i) => {
      const sprite = this.createTextSprite(person)
      this.nameSprites.push(sprite)
      this.spriteNameMap.set(sprite, person.id)
      this.scene.add(sprite)

      const phi = Math.acos(-1 + (2 * i) / (visibleParticipants.length - 1))
      const theta = Math.sqrt((visibleParticipants.length - 1) * Math.PI) * phi
      const sphereTarget = new THREE.Object3D()
      sphereTarget.position.setFromSphericalCoords(this.config.sphereRadius + 2, phi, theta)
      sphereTarget.lookAt(this.scene.position)
      this.sphereObjects.push(sphereTarget)

      const row = Math.floor(i / gridCols)
      const col = i % gridCols
      const gridTarget = new THREE.Object3D()
      gridTarget.position.x = (col * gridCellWidth - gridWidth / 2 + gridCellWidth / 2) * 1.5
      gridTarget.position.y = (gridHeight / 2 - row * gridCellHeight - gridCellHeight / 2) * 1.5
      gridTarget.position.z = 5
      this.gridObjects.push(gridTarget)

      // Always set initial position to grid view
      sprite.position.copy(gridTarget.position)
      sprite.rotation.copy(gridTarget.rotation)
    })
  }

  /**
   * Start spinning the sphere
   */
  public startSpinning() {
    if (!this.isSpinning) {
      this.isSpinning = true
    }
  }

  /**
   * Stop spinning the sphere
   */
  public stopSpinning() {
    this.isSpinning = false
  }

  /**
   * Get a random name from the spinning sphere
   */
  public getRandomName(): string | null {
    if (this.nameSprites.length === 0) {
      return null
    }
    const randomIndex = Math.floor(Math.random() * this.nameSprites.length)
    const randomSprite = this.nameSprites[randomIndex]
    if (!randomSprite) return null
    return this.spriteNameMap.get(randomSprite) || null
  }

  /**
   * Animation loop
   */
  private animate() {
    this.animationId = requestAnimationFrame(() => this.animate())

    TWEEN.update()

    if (this.isSpinning && this.sphere) {
      this.sphere.rotation.y += 0.005
      this.nameSprites.forEach(sprite => {
        sprite.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.005)
        sprite.lookAt(this.camera.position)
      })
    }

    this.composer.render() // Use composer to render
  }

  /**
   * Clean up resources
   */
  public dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
    this.renderer.dispose()
    // TODO: Dispose geometries, materials, textures
  }
}
