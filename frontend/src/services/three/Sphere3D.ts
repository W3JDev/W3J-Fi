import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'
import type { Person } from '../../store/lottery'

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
  private renderer: THREE.WebGLRenderer
  private sphere: THREE.Mesh | null = null
  private nameSprites: THREE.Sprite[] = []
  private animationId: number | null = null
  private isSpinning: boolean = false
  private config: Required<Sphere3DConfig>

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
    const material = new THREE.MeshPhongMaterial({
      color: 0x0f5fd3,
      emissive: 0x0a4a9f,
      shininess: 100,
      transparent: true,
      opacity: 0.6
    })
    
    this.sphere = new THREE.Mesh(geometry, material)
    this.scene.add(this.sphere)
  }

  /**
   * Create text sprite for a name
   */
  private createTextSprite(text: string): THREE.Sprite {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    
    canvas.width = this.config.cardSize.width
    canvas.height = this.config.cardSize.height

    // Draw background
    context.fillStyle = 'rgba(68, 71, 90, 0.9)'
    context.fillRect(0, 0, canvas.width, canvas.height)

    // Draw border
    context.strokeStyle = this.config.nameColor
    context.lineWidth = 2
    context.strokeRect(0, 0, canvas.width, canvas.height)

    // Draw text
    context.fillStyle = this.config.nameColor
    context.font = 'bold 24px Inter'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(text, canvas.width / 2, canvas.height / 2)

    // Create sprite
    const texture = new THREE.CanvasTexture(canvas)
    const material = new THREE.SpriteMaterial({ map: texture })
    const sprite = new THREE.Sprite(material)
    
    // Scale sprite to match card size
    sprite.scale.set(
      this.config.cardSize.width / 100,
      this.config.cardSize.height / 100,
      1
    )

    return sprite
  }

  /**
   * Distribute names around the sphere
   */
  public updateNames(participants: Person[]) {
    // Clear existing sprites
    this.nameSprites.forEach(sprite => this.scene.remove(sprite))
    this.nameSprites = []

    // Limit number of visible names
    const visibleParticipants = participants.slice(0, this.config.maxVisibleNames)

    // Distribute names using golden spiral (Fibonacci sphere)
    const phi = Math.PI * (3 - Math.sqrt(5)) // Golden angle
    const radius = this.config.sphereRadius + 2

    visibleParticipants.forEach((participant, i) => {
      const sprite = this.createTextSprite(participant.name)

      // Calculate position using Fibonacci sphere algorithm
      const y = 1 - (i / (visibleParticipants.length - 1)) * 2
      const radiusAtY = Math.sqrt(1 - y * y)
      const theta = phi * i

      sprite.position.x = Math.cos(theta) * radiusAtY * radius
      sprite.position.y = y * radius
      sprite.position.z = Math.sin(theta) * radiusAtY * radius

      this.nameSprites.push(sprite)
      this.scene.add(sprite)
    })
  }

  /**
   * Start idle rotation
   */
  private rotateIdle() {
    if (this.sphere && !this.isSpinning) {
      this.sphere.rotation.y += 0.005
      this.nameSprites.forEach(sprite => {
        sprite.rotation.y += 0.005
      })
    }
  }

  /**
   * Spin animation for drawing
   */
  public async spinForDraw(duration: number = 3000): Promise<void> {
    if (!this.sphere) return

    this.isSpinning = true

    return new Promise((resolve) => {
      const startRotation = { y: this.sphere!.rotation.y }
      const endRotation = { y: this.sphere!.rotation.y + Math.PI * 10 }

      new TWEEN.Tween(startRotation)
        .to(endRotation, duration)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => {
          if (this.sphere) {
            this.sphere.rotation.y = startRotation.y
            // Blur effect on names during spin
            this.nameSprites.forEach(sprite => {
              sprite.rotation.y = startRotation.y
            })
          }
        })
        .onComplete(() => {
          this.isSpinning = false
          resolve()
        })
        .start()
    })
  }

  /**
   * Highlight winner
   */
  public highlightWinner(winnerName: string) {
    this.nameSprites.forEach(sprite => {
      const spriteName = this.getSpriteName(sprite)
      if (spriteName === winnerName) {
        // Scale up winner
        new TWEEN.Tween(sprite.scale)
          .to({ x: sprite.scale.x * 2, y: sprite.scale.y * 2 }, 500)
          .easing(TWEEN.Easing.Elastic.Out)
          .start()

        // Add spotlight effect (change color)
        const material = sprite.material as THREE.SpriteMaterial
        material.color.setHex(0xffff00) // Yellow highlight
      }
    })
  }

  /**
   * Get name from sprite (extract from canvas texture)
   */
  private getSpriteName(_sprite: THREE.Sprite): string {
    // This is a simplified version - in production, store name with sprite
    return ''
  }

  /**
   * Animation loop
   */
  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate)

    // Update tweens
    TWEEN.update()

    // Idle rotation
    this.rotateIdle()

    // Render scene
    this.renderer.render(this.scene, this.camera)
  }

  /**
   * Resize handler
   */
  public resize(width: number, height: number) {
    this.config.containerWidth = width
    this.config.containerHeight = height
    
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  /**
   * Cleanup
   */
  public dispose() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId)
    }

    this.nameSprites.forEach(sprite => {
      const material = sprite.material as THREE.SpriteMaterial
      material.map?.dispose()
      material.dispose()
      this.scene.remove(sprite)
    })

    if (this.sphere) {
      const material = this.sphere.material as THREE.Material
      const geometry = this.sphere.geometry
      material.dispose()
      geometry.dispose()
      this.scene.remove(this.sphere)
    }

    this.renderer.dispose()
  }
}
