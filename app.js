// Global variables for demos
let sensorWidgets = [];
let dataStreamInterval = null;
let isStreaming = false;
let audioContext = null;
let oscillator = null;
let gainNode = null;
let isAudioPlaying = false;

// Signal processing variables
let signalData = [];
let filteredData = [];
let canvas = null;
let ctx = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeSignalProcessor();
    initializeAnimations();
    initializeSmoothScrolling();
});

// Navigation functionality
function initializeNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    }
}

// Smooth scrolling for navigation links
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize animations on scroll
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.session-card, .highlight-card, .perk-card, .demo-section').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// IoT Dashboard Functions
function addSensor() {
    const select = document.getElementById('sensorSelect');
    const sensorType = select.value;
    const dashboardGrid = document.getElementById('dashboardGrid');
    
    // Remove placeholder if it exists
    const placeholder = dashboardGrid.querySelector('.dashboard-placeholder');
    if (placeholder) {
        placeholder.remove();
    }
    
    // Create sensor widget
    const widget = createSensorWidget(sensorType, sensorWidgets.length);
    dashboardGrid.appendChild(widget);
    
    // Add to tracking array
    sensorWidgets.push({
        id: sensorWidgets.length,
        type: sensorType,
        element: widget,
        data: [],
        currentValue: 0
    });
    
    // Start generating data if streaming
    if (isStreaming) {
        generateSensorData();
    }
}

function createSensorWidget(sensorType, id) {
    const widget = document.createElement('div');
    widget.className = 'sensor-widget';
    widget.setAttribute('data-sensor-id', id);
    
    const typeConfig = getSensorConfig(sensorType);
    
    widget.innerHTML = `
        <div class="sensor-header">
            <span class="sensor-title">${typeConfig.name}</span>
            <button class="btn btn--sm btn--outline" onclick="removeSensor(${id})">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="sensor-value" id="sensor-value-${id}">
            ${typeConfig.defaultValue} ${typeConfig.unit}
        </div>
        <div class="sensor-chart" id="sensor-chart-${id}">
            <canvas width="280" height="80" style="width: 100%; height: 100%;"></canvas>
        </div>
        <div class="sensor-status">
            <span class="status status--success">Active</span>
            <span class="sensor-timestamp" id="timestamp-${id}">Just now</span>
        </div>
    `;
    
    return widget;
}

function getSensorConfig(type) {
    const configs = {
        temperature: { name: 'Temperature', unit: '°C', min: 15, max: 45, defaultValue: 25 },
        humidity: { name: 'Humidity', unit: '%', min: 30, max: 90, defaultValue: 60 },
        pressure: { name: 'Pressure', unit: 'kPa', min: 95, max: 105, defaultValue: 101 },
        light: { name: 'Light Intensity', unit: 'lux', min: 0, max: 1000, defaultValue: 300 }
    };
    return configs[type] || configs.temperature;
}

function removeSensor(id) {
    const widget = document.querySelector(`[data-sensor-id="${id}"]`);
    if (widget) {
        widget.remove();
    }
    
    // Remove from tracking array
    sensorWidgets = sensorWidgets.filter(sensor => sensor.id !== id);
    
    // Show placeholder if no sensors remain
    const dashboardGrid = document.getElementById('dashboardGrid');
    if (sensorWidgets.length === 0) {
        dashboardGrid.innerHTML = `
            <div class="dashboard-placeholder">
                <i class="fas fa-plus-circle"></i>
                <p>Add your first sensor to start monitoring</p>
            </div>
        `;
    }
}

function toggleDataStream() {
    const toggleBtn = document.getElementById('streamToggle');
    
    if (isStreaming) {
        // Stop streaming
        clearInterval(dataStreamInterval);
        isStreaming = false;
        toggleBtn.textContent = 'Start Stream';
        toggleBtn.parentElement.classList.remove('btn--primary');
        toggleBtn.parentElement.classList.add('btn--outline');
    } else {
        // Start streaming
        isStreaming = true;
        toggleBtn.textContent = 'Stop Stream';
        toggleBtn.parentElement.classList.remove('btn--outline');
        toggleBtn.parentElement.classList.add('btn--primary');
        
        dataStreamInterval = setInterval(generateSensorData, 1000);
    }
}

function generateSensorData() {
    sensorWidgets.forEach(sensor => {
        const config = getSensorConfig(sensor.type);
        const variation = (config.max - config.min) * 0.1;
        const baseValue = (config.max + config.min) / 2;
        
        // Generate realistic sensor data with some randomness
        const newValue = baseValue + (Math.random() - 0.5) * variation + Math.sin(Date.now() / 10000) * variation * 0.5;
        const clampedValue = Math.max(config.min, Math.min(config.max, newValue));
        
        sensor.currentValue = clampedValue;
        sensor.data.push(clampedValue);
        
        // Keep only last 20 data points
        if (sensor.data.length > 20) {
            sensor.data.shift();
        }
        
        // Update display
        updateSensorDisplay(sensor.id, clampedValue, config.unit);
        updateSensorChart(sensor.id, sensor.data);
    });
}

function updateSensorDisplay(id, value, unit) {
    const valueElement = document.getElementById(`sensor-value-${id}`);
    const timestampElement = document.getElementById(`timestamp-${id}`);
    
    if (valueElement) {
        valueElement.textContent = `${value.toFixed(1)} ${unit}`;
    }
    
    if (timestampElement) {
        timestampElement.textContent = new Date().toLocaleTimeString();
    }
}

function updateSensorChart(id, data) {
    const chartElement = document.getElementById(`sensor-chart-${id}`);
    if (!chartElement) return;
    
    const canvas = chartElement.querySelector('canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    if (data.length < 2) return;
    
    // Find min/max for scaling
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(50, 184, 198, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = (height / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    // Draw data line
    ctx.strokeStyle = '#32b8c6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    data.forEach((value, index) => {
        const x = (width / (data.length - 1)) * index;
        const y = height - ((value - min) / range) * height;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Add glow effect
    ctx.shadowColor = '#32b8c6';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
}

function clearDashboard() {
    // Clear all sensor widgets
    sensorWidgets.forEach(sensor => {
        if (sensor.element && sensor.element.parentNode) {
            sensor.element.parentNode.removeChild(sensor.element);
        }
    });
    
    // Reset arrays
    sensorWidgets = [];
    
    // Stop streaming
    if (isStreaming) {
        toggleDataStream();
    }
    
    // Show placeholder
    const dashboardGrid = document.getElementById('dashboardGrid');
    dashboardGrid.innerHTML = `
        <div class="dashboard-placeholder">
            <i class="fas fa-plus-circle"></i>
            <p>Add your first sensor to start monitoring</p>
        </div>
    `;
}
// Signal Processing Functions
function initializeSignalProcessor() {
    canvas = document.getElementById('signalCanvas');
    if (canvas) {
        ctx = canvas.getContext('2d');
        canvas.width = 800;
        canvas.height = 400;
        updateSignal();
    }
}

function updateSignal() {
    // Update display values
    const frequency = document.getElementById('frequency');
    const amplitude = document.getElementById('amplitude');
    const cutoffFreq = document.getElementById('cutoffFreq');
    
    if (frequency) {
        document.getElementById('frequencyValue').textContent = frequency.value;
    }
    if (amplitude) {
        document.getElementById('amplitudeValue').textContent = amplitude.value;
    }
    if (cutoffFreq) {
        document.getElementById('cutoffFreqValue').textContent = cutoffFreq.value;
    }
    
    generateSignalData();
    drawSignals();
}

function generateSignalData() {
    if (!canvas) return;
    
    const waveType = document.getElementById('waveType')?.value || 'sine';
    const frequency = parseFloat(document.getElementById('frequency')?.value || 10);
    const amplitude = parseFloat(document.getElementById('amplitude')?.value || 1);
    const filterType = document.getElementById('filterType')?.value || 'none';
    const cutoffFreq = parseFloat(document.getElementById('cutoffFreq')?.value || 10);
    const modulationType = document.getElementById('modulationType')?.value || 'none';
    
    const sampleRate = 1000;
    const duration = 2; // 2 seconds
    const samples = sampleRate * duration;
    
    signalData = [];
    filteredData = [];
    modulatedData = [];
    
    // Generate original signal
    for (let i = 0; i < samples; i++) {
        const t = i / sampleRate;
        const omega = 2 * Math.PI * frequency * t;
        
        let value = 0;
        switch (waveType) {
            case 'sine':
                value = amplitude * Math.sin(omega);
                break;
            case 'square':
                value = amplitude * Math.sign(Math.sin(omega));
                break;
            case 'triangle':
                value = amplitude * (2 / Math.PI) * Math.asin(Math.sin(omega));
                break;
            case 'sawtooth':
                value = amplitude * (2 * (t * frequency - Math.floor(t * frequency + 0.5)));
                break;
        }
        signalData.push(value);
    }
    
    // Apply filtering
    filteredData = [...signalData];
    if (filterType !== 'none') {
        filteredData = applyFilter(signalData, filterType, cutoffFreq, frequency);
    }
    
    // Apply modulation to the original signal (not filtered)
    modulatedData = [...signalData];
    if (modulationType !== 'none') {
        modulatedData = applyModulation(signalData, modulationType, frequency);
    }
}

function applyFilter(data, filterType, cutoffFreq, signalFreq) {
    // Simple frequency-based attenuation
    const attenuation = calculateAttenuation(signalFreq, cutoffFreq, filterType);
    return data.map(value => value * attenuation);
}

function calculateAttenuation(signalFreq, cutoffFreq, filterType) {
    const ratio = signalFreq / cutoffFreq;
    
    switch (filterType) {
        case 'lowpass':
            // Attenuate frequencies above cutoff
            return ratio > 1 ? Math.exp(-(ratio - 1) * 2) : 1;
        case 'highpass':
            // Attenuate frequencies below cutoff
            return ratio < 1 ? Math.exp(-(1 / ratio - 1) * 2) : 1;
        default:
            return 1;
    }
}

function applyModulation(data, modulationType, carrierFreq) {
    const modulated = [];
    const sampleRate = 1000;
    const modulationFreq = carrierFreq * 0.1; // Modulation frequency is 10% of carrier
    
    for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const carrierOmega = 2 * Math.PI * carrierFreq * 5 * t; // Higher frequency carrier
        
        let value = data[i];
        switch (modulationType) {
            case 'am':
                // Amplitude modulation
                value = (1 + 0.5 * data[i]) * Math.sin(carrierOmega);
                break;
            case 'fm':
                // Frequency modulation
                const deviation = data[i] * 0.5;
                value = Math.sin(carrierOmega + deviation);
                break;
        }
        modulated.push(value);
    }
    return modulated;
}

function drawSignals() {
    if (!ctx || !canvas) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    drawGrid();
    
    // Draw signals
    const filterType = document.getElementById('filterType')?.value || 'none';
    const modulationType = document.getElementById('modulationType')?.value || 'none';
    
    // Always draw original signal
    drawWaveform(signalData, '#888888', 2, 'Original');
    
    // Draw filtered signal if filter is applied
    if (filterType !== 'none') {
        drawWaveform(filteredData, '#1FB8CD', 2, 'Filtered');
    }
    
    // Draw modulated signal if modulation is applied
    if (modulationType !== 'none') {
        drawWaveform(modulatedData, '#B4413C', 2, 'Modulated');
    }
}

function drawGrid() {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x <= canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    // Center line
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
}

function drawWaveform(data, color, lineWidth, label) {
    if (!data || data.length === 0) return;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    
    const xStep = canvas.width / data.length;
    const yCenter = canvas.height / 2;
    const yScale = canvas.height / 4; // Scale to fit in canvas
    
    for (let i = 0; i < data.length; i++) {
        const x = i * xStep;
        const y = yCenter - data[i] * yScale;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.stroke();
}

// Audio Functions
function toggleAudio() {
    const btn = document.getElementById('audioBtn');
    if (!btn) return;
    
    if (isAudioPlaying) {
        stopAudio();
        btn.textContent = 'Play Audio';
        btn.classList.remove('btn--secondary');
        btn.classList.add('btn--primary');
    } else {
        playAudio();
        btn.textContent = 'Stop Audio';
        btn.classList.remove('btn--primary');
        btn.classList.add('btn--secondary');
    }
}

function playAudio() {
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        const frequency = parseFloat(document.getElementById('frequency')?.value || 10);
        const amplitude = parseFloat(document.getElementById('amplitude')?.value || 1);
        const filterType = document.getElementById('filterType')?.value || 'none';
        const cutoffFreq = parseFloat(document.getElementById('cutoffFreq')?.value || 10);
        
        // Create oscillator
        oscillator = audioContext.createOscillator();
        gainNode = audioContext.createGain();
        
        // Set oscillator properties
        const waveType = document.getElementById('waveType')?.value || 'sine';
        oscillator.type = waveType;
        oscillator.frequency.setValueAtTime(frequency * 50, audioContext.currentTime); // Scale up for audible frequency
        
        // Apply filter effect to volume
        let volume = amplitude * 0.1; // Base volume
        if (filterType !== 'none') {
            const attenuation = calculateAttenuation(frequency, cutoffFreq, filterType);
            volume *= attenuation;
        }
        
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Start oscillator
        oscillator.start();
        isAudioPlaying = true;
        
    } catch (error) {
        console.error('Audio playback failed:', error);
        alert('Audio playback failed. Please check your browser settings.');
    }
}

function stopAudio() {
    if (oscillator) {
        oscillator.stop();
        oscillator.disconnect();
        oscillator = null;
    }
    if (gainNode) {
        gainNode.disconnect();
        gainNode = null;
    }
    isAudioPlaying = false;
}


// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add event listeners for window resize to redraw canvas
window.addEventListener('resize', debounce(() => {
    if (canvas && ctx) {
        drawSignal();
    }
}, 250));

// Cleanup function for when page is unloaded
window.addEventListener('beforeunload', () => {
    if (dataStreamInterval) {
        clearInterval(dataStreamInterval);
    }
    if (isAudioPlaying) {
        stopAudio();
    }
    if (audioContext) {
        audioContext.close();
    }
});