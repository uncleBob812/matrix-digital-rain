// Hyperspace Effect for Matrix Digital Rain
// When START button is clicked, transitions from Matrix rain to hyperspace flight with 3D cube

class HyperspaceEffect {
    constructor(matrixCanvas, matrixCtx) {
        this.matrixCanvas = matrixCanvas;
        this.matrixCtx = matrixCtx;
        
        // Create main canvas for effects
        this.canvas3D = document.createElement('canvas');
        this.canvas3D.id = 'hyperspace-canvas';
        this.canvas3D.style.position = 'fixed';
        this.canvas3D.style.top = '0';
        this.canvas3D.style.left = '0';
        this.canvas3D.style.width = '100%';
        this.canvas3D.style.height = '100%';
        this.canvas3D.style.zIndex = '4'; // Above button, below cube
        
        // Create separate canvas for cube (highest z-index)
        this.cubeCanvas = document.createElement('canvas');
        this.cubeCanvas.id = 'cube-canvas';
        this.cubeCanvas.style.position = 'fixed';
        this.cubeCanvas.style.top = '0';
        this.cubeCanvas.style.left = '0';
        this.cubeCanvas.style.width = '100%';
        this.cubeCanvas.style.height = '100%';
        this.cubeCanvas.style.zIndex = '6'; // Highest
        
        // Insert canvases
        const startBtn = document.getElementById('startBtn');
        const container = startBtn?.parentNode || document.body;
        container.appendChild(this.canvas3D);
        container.appendChild(this.cubeCanvas);
        
        this.ctxCube = this.cubeCanvas.getContext('2d');
        this.cubeCanvas.width = window.innerWidth;
        this.cubeCanvas.height = window.innerHeight;
        
        this.ctx3D = this.canvas3D.getContext('2d');
        this.canvas3D.width = window.innerWidth;
        this.canvas3D.height = window.innerHeight;
        
        // State
        this.isActive = false;
        this.transitionProgress = 0; // 0 to 1
        this.transitionSpeed = 0.02;
        this.phase = 'fadeOut'; // fadeOut → hyperspace → symbols → cube
        this.phaseTimer = 0;
        this.phaseDuration = {
            fadeOut: 1000, // 1 second
            hyperspace: 5000, // 5 seconds
            symbols: 2000, // 2 seconds
            cube: 0 // indefinite
        };
        
        // Cube appearance animation
        this.cubeAppearProgress = 0;
        this.cubeAppearSpeed = 0.008; // ~2 seconds to appear
        
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
        
        for (let i = 0; i < columns; i++) { // Reduced particles
            const x = Math.random() * this.matrixCanvas.width;
            const y = Math.random() * this.matrixCanvas.height;
            
            this.particles.push({
                x: x,
                y: y,
                originalX: x,
                originalY: y,
                speed: 2 + Math.random() * 3, // Moderate speed
                size: fontSize,
                trailLength: 50 + Math.random() * 100, // Shorter trails
                angle: Math.random() * Math.PI * 2,
                rotation: 0,
                char: this.getRandomChar(),
                opacity: 0.4 + Math.random() * 0.4, // Less bright
                z: Math.random() * 100
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
        this.phase = 'fadeOut';
        this.phaseTimer = 0;
        
        // Hide typing text
        const typingText = document.getElementById('typing-text');
        if (typingText) {
            typingText.style.opacity = '0';
            typingText.style.transition = 'opacity 1s';
        }
        
        this.animate();
    }
    
    stop() {
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        // Remove canvases
        if (this.canvas3D.parentNode) {
            this.canvas3D.parentNode.removeChild(this.canvas3D);
        }
        if (this.cubeCanvas.parentNode) {
            this.cubeCanvas.parentNode.removeChild(this.cubeCanvas);
        }
        
        // Show typing text again
        const typingText = document.getElementById('typing-text');
        if (typingText) {
            typingText.style.opacity = '1';
        }
    }
    
    animate() {
        if (!this.isActive) return;
        
        // Update phase timer
        this.phaseTimer += 16; // ~60fps
        
        // Check phase transitions
        this.checkPhaseTransition();
        
        // Update transition progress based on phase
        this.updateTransitionProgress();
        
        // Update cube appearance progress
        if (this.phase === 'cube' && this.cubeAppearProgress < 1) {
            this.cubeAppearProgress += this.cubeAppearSpeed;
            if (this.cubeAppearProgress > 1) this.cubeAppearProgress = 1;
        }
        
        // Clear 3D canvas
        this.ctx3D.clearRect(0, 0, this.canvas3D.width, this.canvas3D.height);
        
        // Draw based on current phase
        switch (this.phase) {
            case 'fadeOut':
                // Matrix rain fades out, hyperspace starts
                this.drawHyperspace();
                break;
            case 'hyperspace':
                // Full hyperspace effect
                this.drawHyperspace();
                break;
            case 'symbols':
                // Hyperspace lines fade out, symbols remain
                this.drawSymbolsOnly();
                break;
            case 'cube':
                // Only symbols and cube
                this.drawSymbolsOnly();
                this.updateCube();
                this.drawCube();
                break;
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    checkPhaseTransition() {
        const duration = this.phaseDuration[this.phase];
        
        if (duration > 0 && this.phaseTimer >= duration) {
            // Move to next phase
            const phases = ['fadeOut', 'hyperspace', 'symbols', 'cube'];
            const currentIndex = phases.indexOf(this.phase);
            
            if (currentIndex < phases.length - 1) {
                this.phase = phases[currentIndex + 1];
                this.phaseTimer = 0;
                
                // Reset cube appearance progress when entering cube phase
                if (this.phase === 'cube') {
                    this.cubeAppearProgress = 0;
                }
            }
        }
    }
    
    updateTransitionProgress() {
        const duration = this.phaseDuration[this.phase];
        
        switch (this.phase) {
            case 'fadeOut':
                // Matrix rain fades out (0 → 1)
                this.transitionProgress = Math.min(1, this.phaseTimer / duration);
                break;
            case 'hyperspace':
                // Full hyperspace (1)
                this.transitionProgress = 1;
                break;
            case 'symbols':
                // Hyperspace lines fade out, symbols remain
                const symbolProgress = Math.min(1, this.phaseTimer / duration);
                this.transitionProgress = 1 - symbolProgress * 0.5;
                break;
            case 'cube':
                // Stable state
                this.transitionProgress = 0.5;
                break;
        }
    }
    
    drawHyperspace() {
        const ctx = this.ctx3D;
        const phaseProgress = this.phaseTimer / this.phaseDuration[this.phase];
        
        // Clear with black
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, this.canvas3D.width, this.canvas3D.height);
        
        // Draw starfield for depth
        this.drawStarfield();
        
        if (this.phase === 'fadeOut') {
            // Fade out matrix rain
            const fadeProgress = 1 - phaseProgress;
            
            for (const particle of this.particles) {
                ctx.save();
                ctx.globalAlpha = fadeProgress * particle.opacity;
                
                ctx.fillStyle = '#999999';
                ctx.font = `${particle.size}px 'Courier New', monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(particle.char, particle.x, particle.y);
                
                ctx.restore();
            }
        } 
        else if (this.phase === 'hyperspace') {
            // Superluminal flight effect with perspective lines
            const centerX = this.canvas3D.width / 2;
            const centerY = this.canvas3D.height / 2;
            
            for (const particle of this.particles) {
                // Calculate direction from center (perspective effect)
                const dx = particle.x - centerX;
                const dy = particle.y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Normalize direction (away from center)
                const dirX = dx / distance;
                const dirY = dy / distance;
                
                // Move particle away from center (hyperspace flight)
                const speed = particle.speed * (5 + phaseProgress * 10);
                particle.x += dirX * speed;
                particle.y += dirY * speed;
                
                // Calculate perspective (lines get longer as they move away)
                const perspective = 1 + (distance / 1000) * 5;
                
                // Draw long perspective trail
                const trailLength = particle.trailLength * perspective * 30;
                const trailX = particle.x - dirX * trailLength;
                const trailY = particle.y - dirY * trailLength;
                
                // Create gradient for trail (thinner, less bright)
                const gradient = ctx.createLinearGradient(trailX, trailY, particle.x, particle.y);
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
                gradient.addColorStop(0.3, 'rgba(200, 220, 255, 0.4)');
                gradient.addColorStop(1, 'rgba(150, 180, 255, 0.6)');
                
                ctx.beginPath();
                ctx.moveTo(trailX, trailY);
                ctx.lineTo(particle.x, particle.y);
                
                ctx.strokeStyle = gradient;
                ctx.lineWidth = particle.size / 6; // Thinner lines
                ctx.lineCap = 'round';
                ctx.stroke();
                
                // Draw character at the end
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.font = `${particle.size}px 'Courier New', monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(particle.char, particle.x, particle.y);
                
                // Reset particle if it goes too far
                if (distance > Math.max(this.canvas3D.width, this.canvas3D.height) * 1.5) {
                    // Place particle near center again
                    particle.x = centerX + (Math.random() - 0.5) * 100;
                    particle.y = centerY + (Math.random() - 0.5) * 100;
                    particle.char = this.getRandomChar();
                }
            }
        }
    }
    
    drawSymbolsOnly() {
        const ctx = this.ctx3D;
        const phaseProgress = this.phaseTimer / this.phaseDuration[this.phase];
        
        // Clear with black background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, this.canvas3D.width, this.canvas3D.height);
        
        // Draw stars (symbols)
        for (const particle of this.particles) {
            // Make symbols twinkle like stars
            const twinkle = 0.7 + Math.sin(Date.now() * 0.001 + particle.x) * 0.3;
            
            ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity * twinkle})`;
            ctx.font = `${particle.size}px 'Courier New', monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(particle.char, particle.x, particle.y);
        }
    }
    
    drawStarfield() {
        const ctx = this.ctx3D;
        
        for (const star of this.starfieldParticles) {
            // In hyperspace phase, stars move fast toward viewer
            if (this.phase === 'hyperspace') {
                star.z -= star.speed * 5;
            } else {
                // In other phases, stars twinkle slowly
                star.z -= star.speed * 0.1;
            }
            
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
            const brightness = 0.3 + Math.sin(Date.now() * 0.001 + star.x) * 0.2;
            ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
            ctx.beginPath();
            ctx.arc(x, y, star.size * scale, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw star trail only in hyperspace phase
            if (this.phase === 'hyperspace') {
                const trailLength = star.speed * 3;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x - trailLength * scale, y);
                ctx.strokeStyle = `rgba(255, 255, 255, ${brightness * 0.5})`;
                ctx.lineWidth = star.size * scale / 2;
                ctx.stroke();
            }
        }
    }
    
    updateCube() {
        this.cube.rotationX += this.cube.rotationSpeed;
        this.cube.rotationY += this.cube.rotationSpeed * 1.3;
        this.cube.rotationZ += this.cube.rotationSpeed * 0.7;
    }
    
    drawCube() {
        const ctx = this.ctxCube;
        const centerX = this.cubeCanvas.width / 2;
        const centerY = this.cubeCanvas.height / 2;
        const size = this.cube.size * this.cubeAppearProgress;
        
        // Only draw cube in cube phase
        if (this.phase !== 'cube') return;
        
        // Clear cube canvas
        ctx.clearRect(0, 0, this.cubeCanvas.width, this.cubeCanvas.height);
        
        // Don't draw if size is zero
        if (size <= 0) return;
        
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
        
        // Draw edges with glowing effect (fade in with progress)
        const cubeAlpha = 0.9 * this.cubeAppearProgress;
        ctx.strokeStyle = `rgba(255, 255, 255, ${cubeAlpha})`;
        ctx.lineWidth = 3 * this.cubeAppearProgress;
        ctx.lineCap = 'round';
        
        // Add glow effect
        ctx.shadowBlur = 20 * this.cubeAppearProgress;
        ctx.shadowColor = `rgba(255, 255, 255, ${cubeAlpha})`;
        
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
        
        // Symbols are already drawn in drawSymbolsOnly
        // this.drawFloatingSymbols(centerX, centerY, 1);
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
        this.cubeCanvas.width = window.innerWidth;
        this.cubeCanvas.height = window.innerHeight;
        this.matrixCanvas.width = window.innerWidth;
        this.matrixCanvas.height = window.innerHeight;
    }
}

// Export for use in main HTML file
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HyperspaceEffect;
}