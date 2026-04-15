// Hyperspace Effect for Matrix Digital Rain
// When START button is clicked, transitions from Matrix rain to hyperspace flight with 3D cube

class HyperspaceEffect {
    constructor(matrixCanvas, matrixCtx) {
        this.matrixCanvas = matrixCanvas;
        this.matrixCtx = matrixCtx;
        
        // Create 3D canvas
        this.canvas3D = document.createElement('canvas');
        this.canvas3D.id = 'hyperspace-canvas';
        this.canvas3D.style.position = 'fixed';
        this.canvas3D.style.top = '0';
        this.canvas3D.style.left = '0';
        this.canvas3D.style.width = '100%';
        this.canvas3D.style.height = '100%';
        this.canvas3D.style.zIndex = '3';
        document.body.appendChild(this.canvas3D);
        
        this.ctx3D = this.canvas3D.getContext('2d');
        this.canvas3D.width = window.innerWidth;
        this.canvas3D.height = window.innerHeight;
        
        // State
        this.isActive = false;
        this.transitionProgress = 0; // 0 to 1
        this.transitionSpeed = 0.02;
        
        // 3D Cube
        this.cube = {
            size: 150,
            rotationX: 0,
            rotationY: 0,
            rotationZ: 0,
            rotationSpeed: 0.01
        };
        
        // Hyperspace particles (frozen matrix symbols stretched into lines)
        this.particles = [];
        this.initParticles();
        
        // Animation
        this.animationId = null;
        
        // Handle resize
        window.addEventListener('resize', () => this.handleResize());
    }
    
    initParticles() {
        // Create particles from current matrix symbols
        const fontSize = 14;
        const columns = this.matrixCanvas.width / fontSize;
        
        for (let i = 0; i < columns; i++) {
            const x = i * fontSize;
            const y = Math.random() * this.matrixCanvas.height;
            
            this.particles.push({
                x: x,
                y: y,
                originalX: x,
                originalY: y,
                speed: 0.5 + Math.random() * 2,
                size: fontSize,
                trailLength: 50 + Math.random() * 100,
                angle: Math.random() * Math.PI * 2,
                rotation: 0,
                char: this.getRandomChar(),
                opacity: 0.3 + Math.random() * 0.7
            });
        }
    }
    
    getRandomChar() {
        const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$+-*/=%\"'#&_(),.;:?!\\|{}<>[]^~";
        return chars[Math.floor(Math.random() * chars.length)];
    }
    
    start() {
        this.isActive = true;
        this.transitionProgress = 0;
        this.animate();
    }
    
    stop() {
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        // Remove 3D canvas
        if (this.canvas3D.parentNode) {
            this.canvas3D.parentNode.removeChild(this.canvas3D);
        }
    }
    
    animate() {
        if (!this.isActive) return;
        
        // Update transition
        if (this.transitionProgress < 1) {
            this.transitionProgress += this.transitionSpeed;
            if (this.transitionProgress > 1) this.transitionProgress = 1;
        }
        
        // Clear 3D canvas
        this.ctx3D.clearRect(0, 0, this.canvas3D.width, this.canvas3D.height);
        
        // Draw hyperspace effect
        this.drawHyperspace();
        
        // Draw 3D cube (appears after transition)
        if (this.transitionProgress > 0.5) {
            this.updateCube();
            this.drawCube();
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    drawHyperspace() {
        const ctx = this.ctx3D;
        const progress = this.transitionProgress;
        
        // Calculate perspective distortion
        const perspective = 0.5 + progress * 2;
        
        // Update and draw particles
        for (const particle of this.particles) {
            // Move particles forward (create hyperspace effect)
            particle.x += Math.cos(particle.angle) * particle.speed * progress * 3;
            particle.y += Math.sin(particle.angle) * particle.speed * progress * 3;
            
            // Apply perspective distortion (stretch into lines)
            const stretch = 1 + progress * 10;
            const trailX = particle.x - Math.cos(particle.angle) * particle.trailLength * stretch;
            const trailY = particle.y - Math.sin(particle.angle) * particle.trailLength * stretch;
            
            // Draw trail (stretched line)
            ctx.beginPath();
            ctx.moveTo(trailX, trailY);
            ctx.lineTo(particle.x, particle.y);
            
            // Gradient color from white to gray
            const gradient = ctx.createLinearGradient(trailX, trailY, particle.x, particle.y);
            gradient.addColorStop(0, `rgba(255, 255, 255, ${particle.opacity * 0.3})`);
            gradient.addColorStop(1, `rgba(153, 153, 153, ${particle.opacity * 0.7})`);
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = particle.size / 4;
            ctx.stroke();
            
            // Draw character at the end
            ctx.save();
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation);
            
            ctx.fillStyle = `rgba(153, 153, 153, ${particle.opacity})`;
            ctx.font = `${particle.size}px 'Courier New', monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(particle.char, 0, 0);
            
            ctx.restore();
            
            // Update rotation
            particle.rotation += 0.02;
            
            // Reset particle if it goes off screen
            if (particle.x < -100 || particle.x > this.canvas3D.width + 100 ||
                particle.y < -100 || particle.y > this.canvas3D.height + 100) {
                particle.x = particle.originalX;
                particle.y = particle.originalY;
                particle.char = this.getRandomChar();
            }
        }
    }
    
    updateCube() {
        this.cube.rotationX += this.cube.rotationSpeed;
        this.cube.rotationY += this.cube.rotationSpeed * 1.3;
        this.cube.rotationZ += this.cube.rotationSpeed * 0.7;
    }
    
    drawCube() {
        const ctx = this.ctx3D;
        const centerX = this.canvas3D.width / 2;
        const centerY = this.canvas3D.height / 2;
        const size = this.cube.size;
        const progress = Math.max(0, (this.transitionProgress - 0.5) * 2);
        
        // Cube vertices
        const vertices = [
            [-size, -size, -size],
            [size, -size, -size],
            [size, size, -size],
            [-size, size, -size],
            [-size, -size, size],
            [size, -size, size],
            [size, size, size],
            [-size, size, size]
        ];
        
        // Apply rotation
        const rotatedVertices = vertices.map(v => this.rotateVertex(v));
        
        // Project to 2D with perspective
        const projectedVertices = rotatedVertices.map(v => {
            const scale = 300 / (300 + v[2] * progress * 2);
            return {
                x: centerX + v[0] * scale,
                y: centerY + v[1] * scale
            };
        });
        
        // Cube edges
        const edges = [
            [0, 1], [1, 2], [2, 3], [3, 0], // back face
            [4, 5], [5, 6], [6, 7], [7, 4], // front face
            [0, 4], [1, 5], [2, 6], [3, 7]  // connecting edges
        ];
        
        // Draw edges
        ctx.strokeStyle = `rgba(255, 255, 255, ${progress * 0.8})`;
        ctx.lineWidth = 2;
        
        for (const [i, j] of edges) {
            const p1 = projectedVertices[i];
            const p2 = projectedVertices[j];
            
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }
        
        // Add some matrix symbols floating around the cube
        this.drawFloatingSymbols(centerX, centerY, progress);
    }
    
    rotateVertex(vertex) {
        const [x, y, z] = vertex;
        const { rotationX, rotationY, rotationZ } = this.cube;
        
        // Rotate around X axis
        const cosX = Math.cos(rotationX);
        const sinX = Math.sin(rotationX);
        const y1 = y * cosX - z * sinX;
        const z1 = y * sinX + z * cosX;
        
        // Rotate around Y axis
        const cosY = Math.cos(rotationY);
        const sinY = Math.sin(rotationY);
        const x1 = x * cosY + z1 * sinY;
        const z2 = -x * sinY + z1 * cosY;
        
        // Rotate around Z axis
        const cosZ = Math.cos(rotationZ);
        const sinZ = Math.sin(rotationZ);
        const x2 = x1 * cosZ - y1 * sinZ;
        const y2 = x1 * sinZ + y1 * cosZ;
        
        return [x2, y2, z2];
    }
    
    drawFloatingSymbols(centerX, centerY, progress) {
        const ctx = this.ctx3D;
        const radius = this.cube.size * 2;
        const count = 20;
        
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + Date.now() * 0.001;
            const distance = radius + Math.sin(Date.now() * 0.001 + i) * 50;
            
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(Date.now() * 0.001 + i);
            
            ctx.fillStyle = `rgba(153, 153, 153, ${0.3 + Math.sin(Date.now() * 0.002 + i) * 0.3})`;
            ctx.font = '20px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.getRandomChar(), 0, 0);
            
            ctx.restore();
        }
    }
    
    handleResize() {
        this.canvas3D.width = window.innerWidth;
        this.canvas3D.height = window.innerHeight;
        this.matrixCanvas.width = window.innerWidth;
        this.matrixCanvas.height = window.innerHeight;
    }
}

// Export for use in main HTML file
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HyperspaceEffect;
}