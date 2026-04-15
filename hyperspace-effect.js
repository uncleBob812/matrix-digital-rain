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
        // Make sure button is above canvas
        const startBtn = document.getElementById('startBtn');
        if (startBtn && startBtn.parentNode) {
            startBtn.parentNode.appendChild(this.canvas3D);
        } else {
            document.body.appendChild(this.canvas3D);
        }
        
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
        this.starfieldParticles = []; // Additional particles for starfield effect
        this.initParticles();
        this.initStarfield();
        
        // Animation
        this.animationId = null;
        
        // Handle resize
        window.addEventListener('resize', () => this.handleResize());
    }
    
    initParticles() {
        // Create particles from current matrix symbols
        const fontSize = 14;
        const columns = this.matrixCanvas.width / fontSize;
        
        for (let i = 0; i < columns * 2; i++) { // More particles
            const x = Math.random() * this.matrixCanvas.width;
            const y = Math.random() * this.matrixCanvas.height;
            
            this.particles.push({
                x: x,
                y: y,
                originalX: x,
                originalY: y,
                speed: 2 + Math.random() * 4, // Faster
                size: fontSize,
                trailLength: 100 + Math.random() * 200, // Longer trails
                angle: Math.random() * Math.PI * 2,
                rotation: 0,
                char: this.getRandomChar(),
                opacity: 0.5 + Math.random() * 0.5,
                z: Math.random() * 100 // Depth for 3D effect
            });
        }
    }
    
    initStarfield() {
        // Create starfield particles for hyperspace effect
        for (let i = 0; i < 200; i++) {
            this.starfieldParticles.push({
                x: Math.random() * this.canvas3D.width,
                y: Math.random() * this.canvas3D.height,
                z: Math.random() * 1000, // Depth
                speed: 10 + Math.random() * 20,
                size: 1 + Math.random() * 3
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
        
        // Draw starfield first (background)
        this.drawStarfield();
        
        // Calculate perspective distortion for hyperspace effect
        const perspective = 0.5 + progress * 3;
        
        // Update and draw matrix particles
        for (const particle of this.particles) {
            // Move particles toward center for tunnel effect
            const centerX = this.canvas3D.width / 2;
            const centerY = this.canvas3D.height / 2;
            
            // Calculate direction to center
            const dx = centerX - particle.x;
            const dy = centerY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Normalize direction
            const dirX = dx / distance;
            const dirY = dy / distance;
            
            // Move particle toward center with speed based on progress
            particle.x += dirX * particle.speed * progress * 5;
            particle.y += dirY * particle.speed * progress * 5;
            
            // Apply perspective (particles get smaller as they move away)
            const scale = 1 / (1 + particle.z * 0.01);
            
            // Draw stretched trail (hyperspace effect)
            const trailLength = particle.trailLength * (1 + progress * 20);
            const trailX = particle.x - dirX * trailLength;
            const trailY = particle.y - dirY * trailLength;
            
            ctx.beginPath();
            ctx.moveTo(trailX, trailY);
            ctx.lineTo(particle.x, particle.y);
            
            // Bright gradient for light speed effect
            const gradient = ctx.createLinearGradient(trailX, trailY, particle.x, particle.y);
            gradient.addColorStop(0, `rgba(255, 255, 255, ${particle.opacity * 0.8})`);
            gradient.addColorStop(0.5, `rgba(200, 200, 255, ${particle.opacity * 0.6})`);
            gradient.addColorStop(1, `rgba(153, 153, 153, ${particle.opacity * 0.3})`);
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = (particle.size / 3) * scale;
            ctx.lineCap = 'round';
            ctx.stroke();
            
            // Draw character at the end (smaller due to perspective)
            ctx.save();
            ctx.translate(particle.x, particle.y);
            ctx.scale(scale, scale);
            ctx.rotate(particle.rotation);
            
            ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
            ctx.font = `${particle.size}px 'Courier New', monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(particle.char, 0, 0);
            
            ctx.restore();
            
            // Update rotation
            particle.rotation += 0.05;
            
            // Increase z for depth effect
            particle.z += particle.speed * 0.5;
            
            // Reset particle if it gets too close to center or off screen
            if (distance < 50 || particle.z > 1000 ||
                particle.x < -200 || particle.x > this.canvas3D.width + 200 ||
                particle.y < -200 || particle.y > this.canvas3D.height + 200) {
                particle.x = Math.random() * this.canvas3D.width;
                particle.y = Math.random() * this.canvas3D.height;
                particle.z = Math.random() * 100;
                particle.char = this.getRandomChar();
            }
        }
    }
    
    drawStarfield() {
        const ctx = this.ctx3D;
        const progress = this.transitionProgress;
        
        for (const star of this.starfieldParticles) {
            // Move stars toward viewer (hyperspace effect)
            star.z -= star.speed * progress * 2;
            
            // Reset star if it goes behind viewer
            if (star.z < 1) {
                star.z = 1000;
                star.x = Math.random() * this.canvas3D.width;
                star.y = Math.random() * this.canvas3D.height;
            }
            
            // Calculate position with perspective
            const scale = 100 / star.z;
            const x = star.x * scale;
            const y = star.y * scale;
            
            // Draw star
            ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + progress * 0.5})`;
            ctx.beginPath();
            ctx.arc(x, y, star.size * scale, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw star trail
            const trailLength = star.speed * 5 * progress;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x - trailLength * scale, y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + progress * 0.3})`;
            ctx.lineWidth = star.size * scale / 2;
            ctx.stroke();
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
        
        // Only draw cube when transition is complete
        if (progress < 0.3) return;
        
        // Proper 3D cube vertices
        const vertices = [
            // Front face
            [-size, -size, size],
            [size, -size, size],
            [size, size, size],
            [-size, size, size],
            // Back face
            [-size, -size, -size],
            [size, -size, -size],
            [size, size, -size],
            [-size, size, -size]
        ];
        
        // Apply rotation
        const rotatedVertices = vertices.map(v => this.rotateVertex(v));
        
        // Project to 2D with proper perspective
        const projectedVertices = rotatedVertices.map(v => {
            const z = v[2] + 500; // Add some distance
            const scale = 500 / z;
            return {
                x: centerX + v[0] * scale,
                y: centerY + v[1] * scale,
                z: z
            };
        });
        
        // Cube edges (connect vertices)
        const edges = [
            // Front face
            [0, 1], [1, 2], [2, 3], [3, 0],
            // Back face
            [4, 5], [5, 6], [6, 7], [7, 4],
            // Connecting edges
            [0, 4], [1, 5], [2, 6], [3, 7]
        ];
        
        // Draw edges with glowing effect
        ctx.strokeStyle = `rgba(255, 255, 255, ${progress})`;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        
        // Add glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        
        for (const [i, j] of edges) {
            const p1 = projectedVertices[i];
            const p2 = projectedVertices[j];
            
            // Only draw if both vertices are in front of camera
            if (p1.z > 0 && p2.z > 0) {
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
        
        // Reset shadow
        ctx.shadowBlur = 0;
        
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