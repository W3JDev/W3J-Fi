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
  rowCount?: number
}

/**
 * Sphere3DManager using CSS3DRenderer (matches original log-lottery architecture)
 */
export class Sphere3DManager {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: CSS3DRenderer
  private objects: CSS3DObject[] = []
  private personIdMap: Map<CSS3DObject, string> = new Map()
  private animationId: number | null = null
  private config: Required<Sphere3DConfig>
  private gridTargets: THREE.Object3D[] = []
  private sphereTargets: THREE.Object3D[] = []
  private tableData: Person[] = []
  private isSpinning: boolean = false
  private spinAnimationId: number | null = null

  constructor(container: HTMLElement, config: Sphere3DConfig) {
    this.config = {
      sphereRadius: 5,
      cardSize: { width: 140, height: 200 },
      nameColor: '#ffffff',
      backgroundColor: '#000000',
      maxVisibleNames: 200,
      rowCount: 17,
      ...config
    }

    // Create scene
    this.scene = new THREE.Scene()

    // Create camera - closer for tighter view
    this.camera = new THREE.PerspectiveCamera(
      40, // Reduced FOV for tighter view
      this.config.containerWidth / this.config.containerHeight,
      1,
      10000
    )
    this.camera.position.z = 2000 // Closer camera (was 3000)

    // Create CSS3D renderer with proper styling
    this.renderer = new CSS3DRenderer()
    this.renderer.setSize(this.config.containerWidth, this.config.containerHeight)
    this.renderer.domElement.style.position = 'absolute'
    this.renderer.domElement.style.top = '0'
    this.renderer.domElement.style.left = '0'
    this.renderer.domElement.style.width = '100%'
    this.renderer.domElement.style.height = '100%'
    this.renderer.domElement.style.overflow = 'hidden'
    container.appendChild(this.renderer.domElement)

    // Start animation loop
    this.animate()
  }

  /**
   * Create a card element for a participant (matches original styling)
   */
  private createCardElement(person: Person): HTMLElement {
    const element = document.createElement('div')
    element.className = 'lottery-card'
    element.style.width = `${this.config.cardSize.width}px`
    element.style.height = `${this.config.cardSize.height}px`
    
    // VIBRANT glassmorphism style
    const hue = Math.random() * 60 + 280 // Purple to pink range
    element.style.backgroundColor = `hsla(${hue}, 80%, 60%, 0.3)`
    element.style.border = `3px solid hsla(${hue}, 80%, 60%, 0.8)`
    element.style.boxShadow = `0 0 25px hsla(${hue}, 80%, 60%, 0.7), inset 0 0 20px rgba(255, 255, 255, 0.1)`
    element.style.borderRadius = '15px'
    element.style.display = 'flex'
    element.style.flexDirection = 'column'
    element.style.justifyContent = 'center'
    element.style.alignItems = 'center'
    element.style.color = this.config.nameColor
    element.style.textAlign = 'center'
    element.style.padding = '15px'
    element.style.boxSizing = 'border-box'
    element.style.backdropFilter = 'blur(10px)'
    // @ts-ignore - webkit prefix for Safari
    element.style['-webkit-backdrop-filter'] = 'blur(10px)'
    element.style.fontFamily = 'system-ui, -apple-system, sans-serif'
    element.style.cursor = 'pointer'
    element.style.transition = 'all 0.3s ease'
    element.style.userSelect = 'none'
    element.style.pointerEvents = 'none' // Important for CSS3D

    // Name element with gradient
    const nameEl = document.createElement('div')
    nameEl.style.fontSize = '20px'
    nameEl.style.fontWeight = '900'
    nameEl.style.marginBottom = '8px'
    nameEl.style.textShadow = '0 2px 4px rgba(0,0,0,0.3)'
    nameEl.style.letterSpacing = '0.5px'
    nameEl.textContent = person.name
    element.appendChild(nameEl)

    // Department element
    if (person.department) {
      const deptEl = document.createElement('div')
      deptEl.style.fontSize = '12px'
      deptEl.style.opacity = '0.85'
      deptEl.style.fontWeight = '600'
      deptEl.style.marginTop = '4px'
      deptEl.style.padding = '4px 12px'
      deptEl.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'
      deptEl.style.borderRadius = '12px'
      deptEl.textContent = person.department
      element.appendChild(deptEl)
    }

    return element
  }

  /**
   * Update participant names and create CSS3D objects
   */
  public updateNames(participants: Person[]) {
    // Clear existing objects
    this.objects.forEach(obj => this.scene.remove(obj))
    this.objects = []
    this.personIdMap.clear()
    this.gridTargets = []
    this.sphereTargets = []
    this.tableData = participants.slice(0, this.config.maxVisibleNames)

    const visibleParticipants = this.tableData

    // Calculate grid layout
    const rowCount = this.config.rowCount
    const gridCellWidth = this.config.cardSize.width + 40
    const gridCellHeight = this.config.cardSize.height + 20

    visibleParticipants.forEach((person, i) => {
      // Create DOM element
      const element = this.createCardElement(person)
      
      // Create CSS3D object - ENSURE VISIBILITY
      const object = new CSS3DObject(element)
      object.position.x = Math.random() * 1500 - 750 // Start nearby for visibility
      object.position.y = Math.random() * 1500 - 750
      object.position.z = Math.random() * 1500 - 750
      
      // Ensure scale is visible
      object.scale.set(1, 1, 1)
      
      this.scene.add(object)
      this.objects.push(object)
      this.personIdMap.set(object, person.id)
      
      console.log(`Card ${i + 1}/${visibleParticipants.length}: ${person.name} created at`, object.position)

      // Calculate grid position (table layout) - TIGHTER spacing
      const row = Math.floor(i / rowCount)
      const col = i % rowCount
      
      const gridTarget = new THREE.Object3D()
      gridTarget.position.x = col * gridCellWidth - (rowCount * gridCellWidth) / 2 + gridCellWidth / 2
      gridTarget.position.y = -(row * gridCellHeight) + 800 // Reduced from 1000
      gridTarget.position.z = 0
      this.gridTargets.push(gridTarget)

      // Calculate sphere position - MUCH TIGHTER sphere
      const phi = Math.acos(-1 + (2 * i) / (visibleParticipants.length - 1))
      const theta = Math.sqrt((visibleParticipants.length - 1) * Math.PI) * phi
      
      const sphereTarget = new THREE.Object3D()
      const radius = 500 // REDUCED from 800 for tighter sphere
      sphereTarget.position.setFromSphericalCoords(radius, phi, theta)
      sphereTarget.lookAt(new THREE.Vector3(0, 0, 0))
      this.sphereTargets.push(sphereTarget)
    })

    // Start in grid view
    this.toggleView('grid', 0)
  }

  /**
   * Toggle between grid and sphere view
   */
  public async toggleView(mode: 'grid' | 'sphere', duration: number = 2000): Promise<void> {
    const targets = mode === 'sphere' ? this.sphereTargets : this.gridTargets

    if (targets.length !== this.objects.length) {
      console.warn('Mismatch between objects and targets')
      return
    }

    return new Promise((resolve) => {
      let completed = 0
      const total = this.objects.length

      this.objects.forEach((object, i) => {
        const target = targets[i]
        if (!target) return

        new TWEEN.Tween(object.position)
          .to({
            x: target.position.x,
            y: target.position.y,
            z: target.position.z
          }, duration)
          .easing(TWEEN.Easing.Exponential.InOut)
          .start()
          .onComplete(() => {
            completed++
            if (completed === total) {
              resolve()
            }
          })

        new TWEEN.Tween(object.rotation)
          .to({
            x: target.rotation.x,
            y: target.rotation.y,
            z: target.rotation.z
          }, duration)
          .easing(TWEEN.Easing.Exponential.InOut)
          .start()
      })
    })
  }

  /**
   * Resize the renderer
   */
  public resize(width: number, height: number) {
    this.config.containerWidth = width
    this.config.containerHeight = height
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  /**
   * Spin the sphere for a drawing animation (FAST rotation like original)
   */
  public spinForDraw(duration: number): Promise<void> {
    return new Promise((resolve) => {
      const rotations = Math.floor(duration / 1000) * 30 // 30 rotations per second - MUCH FASTER
      const targetRotation = this.scene.rotation.y + Math.PI * 2 * rotations
      
      new TWEEN.Tween(this.scene.rotation)
        .to({ y: targetRotation }, duration)
        .easing(TWEEN.Easing.Cubic.InOut) // Smooth acceleration/deceleration
        .start()
        .onComplete(() => {
          resolve()
        })
    })
  }

  /**
   * Highlight and extract winner (moves to front in organized grid)
   */
  public highlightWinner(personId: string, winnerIndex: number = 0, totalWinners: number = 1): Promise<void> {
    return new Promise((resolve) => {
      const winnerObject = this.objects.find(obj => this.personIdMap.get(obj) === personId)
      
      if (!winnerObject) {
        resolve()
        return
      }

      // Calculate CENTER position at front - PROMINENTLY DISPLAYED
      const cardWidth = this.config.cardSize.width * 3 // 3x size for visibility
      const cardHeight = this.config.cardSize.height * 3
      const spacing = 60
      
      // Organize winners in a horizontal row at CENTER
      const cols = Math.min(totalWinners, 5) // Max 5 columns
      const col = winnerIndex % cols
      const row = Math.floor(winnerIndex / cols)
      
      const totalWidth = (cardWidth + spacing) * cols - spacing
      const xPos = col * (cardWidth + spacing) - totalWidth / 2 + cardWidth / 2
      const yPos = row * (cardHeight + spacing * 2) // More vertical spacing
      
      // INSTANT style change for immediate feedback
      if (winnerObject.element) {
        winnerObject.element.style.backgroundColor = 'rgba(255, 215, 0, 0.95)' // Bright gold
        winnerObject.element.style.border = '6px solid rgba(255, 215, 0, 1)'
        winnerObject.element.style.boxShadow = '0 0 60px rgba(255, 215, 0, 1), 0 0 120px rgba(255, 215, 0, 0.8), inset 0 0 30px rgba(255, 255, 255, 0.3)'
        winnerObject.element.style.animation = 'pulse 1s ease-in-out infinite'
      }
      
      // Scale up to 3x - MUCH BIGGER
      new TWEEN.Tween(winnerObject.scale)
        .to({ x: 3, y: 3, z: 3 }, 600)
        .easing(TWEEN.Easing.Back.Out)
        .start()

      // Move to front CENTER position - FAST
      new TWEEN.Tween(winnerObject.position)
        .to({ x: xPos, y: yPos, z: 1200 }, 800) // Faster animation
        .easing(TWEEN.Easing.Back.Out)
        .start()
        .onComplete(() => {
          resolve()
        })

      // Rotate to face camera
      new TWEEN.Tween(winnerObject.rotation)
        .to({ x: 0, y: 0, z: 0 }, 900)
        .easing(TWEEN.Easing.Exponential.InOut)
        .start()
    })
  }

  /**
   * Remove winner from sphere (hide the card)
   */
  public removeWinner(personId: string) {
    const winnerObject = this.objects.find(obj => this.personIdMap.get(obj) === personId)
    
    if (winnerObject && winnerObject.element) {
      // Fade out and remove from scene
      const element = winnerObject.element as HTMLElement
      element.style.transition = 'opacity 0.5s'
      element.style.opacity = '0'
      
      setTimeout(() => {
        this.scene.remove(winnerObject)
        const index = this.objects.indexOf(winnerObject)
        if (index > -1) {
          this.objects.splice(index, 1)
          this.personIdMap.delete(winnerObject)
        }
      }, 500)
    }
  }

  /**
   * Start continuous spinning (for drawing phase) - FAST like original
   */
  public startSpinning() {
    if (this.isSpinning) return
    this.isSpinning = true
    
    const spin = () => {
      if (!this.isSpinning) return
      
      this.scene.rotation.y += 0.15 // MUCH FASTER (was 0.02) - like original
      this.spinAnimationId = requestAnimationFrame(spin)
    }
    
    spin()
  }

  /**
   * Stop spinning
   */
  public stopSpinning() {
    this.isSpinning = false
    if (this.spinAnimationId) {
      cancelAnimationFrame(this.spinAnimationId)
      this.spinAnimationId = null
    }
  }

  /**
   * Get a random participant name
   */
  public getRandomName(): string | null {
    if (this.objects.length === 0) return null
    const randomIndex = Math.floor(Math.random() * this.objects.length)
    const randomObject = this.objects[randomIndex]
    if (!randomObject) return null
    return this.personIdMap.get(randomObject) || null
  }

  /**
   * Animation loop - ENSURE RENDERING
   */
  private animate() {
    this.animationId = requestAnimationFrame(() => this.animate())
    TWEEN.update()
    
    // Update camera if needed
    this.camera.updateMatrixWorld()
    
    // RENDER SCENE
    this.renderer.render(this.scene, this.camera)
  }
  
  /**
   * Force render (for debugging)
   */
  public forceRender() {
    this.renderer.render(this.scene, this.camera)
    console.log('Force render:', {
      objects: this.objects.length,
      camera: this.camera.position,
      scene: this.scene.children.length
    })
  }

  /**
   * Clean up resources
   */
  public dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement)
    }
  }
}
