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
  private viewMode: 'grid' | 'sphere' = 'grid'
  private gridTargets: THREE.Object3D[] = []
  private sphereTargets: THREE.Object3D[] = []
  private tableData: Person[] = []

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

    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.config.containerWidth / this.config.containerHeight,
      1,
      10000
    )
    this.camera.position.z = 3000

    // Create CSS3D renderer
    this.renderer = new CSS3DRenderer()
    this.renderer.setSize(this.config.containerWidth, this.config.containerHeight)
    this.renderer.domElement.style.position = 'absolute'
    this.renderer.domElement.style.top = '0'
    container.appendChild(this.renderer.domElement)

    // Start animation loop
    this.animate()
  }

  /**
   * Create a card element for a participant (matches original styling)
   */
  private createCardElement(person: Person, index: number): HTMLElement {
    const element = document.createElement('div')
    element.className = 'card-element'
    element.style.width = `${this.config.cardSize.width}px`
    element.style.height = `${this.config.cardSize.height}px`
    
    // Glassmorphism style
    element.style.backgroundColor = `rgba(255, 105, 180, ${Math.random() * 0.5 + 0.25})`
    element.style.border = `2px solid rgba(255, 105, 180, 0.8)`
    element.style.boxShadow = `0 0 20px rgba(255, 105, 180, 0.6)`
    element.style.borderRadius = '10px'
    element.style.display = 'flex'
    element.style.flexDirection = 'column'
    element.style.justifyContent = 'center'
    element.style.alignItems = 'center'
    element.style.color = this.config.nameColor
    element.style.textAlign = 'center'
    element.style.padding = '10px'
    element.style.boxSizing = 'border-box'

    // Name element
    const nameEl = document.createElement('div')
    nameEl.style.fontSize = '24px'
    nameEl.style.fontWeight = 'bold'
    nameEl.style.marginBottom = '8px'
    nameEl.textContent = person.name
    element.appendChild(nameEl)

    // Department element
    if (person.department) {
      const deptEl = document.createElement('div')
      deptEl.style.fontSize = '14px'
      deptEl.style.opacity = '0.9'
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
      const element = this.createCardElement(person, i)
      
      // Create CSS3D object
      const object = new CSS3DObject(element)
      object.position.x = Math.random() * 4000 - 2000
      object.position.y = Math.random() * 4000 - 2000
      object.position.z = Math.random() * 4000 - 2000
      
      this.scene.add(object)
      this.objects.push(object)
      this.personIdMap.set(object, person.id)

      // Calculate grid position (table layout)
      const row = Math.floor(i / rowCount)
      const col = i % rowCount
      
      const gridTarget = new THREE.Object3D()
      gridTarget.position.x = col * gridCellWidth - (rowCount * gridCellWidth) / 2 + gridCellWidth / 2
      gridTarget.position.y = -(row * gridCellHeight) + 1000
      gridTarget.position.z = 0
      this.gridTargets.push(gridTarget)

      // Calculate sphere position
      const phi = Math.acos(-1 + (2 * i) / (visibleParticipants.length - 1))
      const theta = Math.sqrt((visibleParticipants.length - 1) * Math.PI) * phi
      
      const sphereTarget = new THREE.Object3D()
      const radius = 800
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
    this.viewMode = mode
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
   * Spin the sphere for a drawing animation
   */
  public spinForDraw(duration: number): Promise<void> {
    return new Promise((resolve) => {
      const initialRotation = this.scene.rotation.y
      
      new TWEEN.Tween(this.scene.rotation)
        .to({ y: initialRotation + Math.PI * 4 }, duration)
        .easing(TWEEN.Easing.Cubic.InOut)
        .start()
        .onComplete(() => {
          resolve()
        })
    })
  }

  /**
   * Highlight a winner
   */
  public highlightWinner(personId: string) {
    const winnerObject = this.objects.find(obj => this.personIdMap.get(obj) === personId)
    
    if (winnerObject) {
      // Scale up animation
      const originalScale = { x: 1, y: 1, z: 1 }
      new TWEEN.Tween(originalScale)
        .to({ x: 2, y: 2, z: 2 }, 500)
        .easing(TWEEN.Easing.Elastic.Out)
        .onUpdate(() => {
          winnerObject.scale.set(originalScale.x, originalScale.y, originalScale.z)
        })
        .yoyo(true)
        .repeat(1)
        .start()

      // Move to front
      const currentPos = winnerObject.position.clone()
      const frontPos = new THREE.Vector3(0, 0, 1500)
      
      new TWEEN.Tween(winnerObject.position)
        .to({ x: frontPos.x, y: frontPos.y, z: frontPos.z }, 1000)
        .easing(TWEEN.Easing.Exponential.Out)
        .start()
    }
  }

  /**
   * Start spinning
   */
  public startSpinning() {
    // Continuous rotation handled in animate loop if needed
  }

  /**
   * Stop spinning
   */
  public stopSpinning() {
    // Stop handled in animate loop
  }

  /**
   * Get a random participant name
   */
  public getRandomName(): string | null {
    if (this.objects.length === 0) return null
    const randomIndex = Math.floor(Math.random() * this.objects.length)
    const randomObject = this.objects[randomIndex]
    return this.personIdMap.get(randomObject) || null
  }

  /**
   * Animation loop
   */
  private animate() {
    this.animationId = requestAnimationFrame(() => this.animate())
    TWEEN.update()
    this.renderer.render(this.scene, this.camera)
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
