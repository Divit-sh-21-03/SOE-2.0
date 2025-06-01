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
        generateSignalData();
        updateSignal();
    }
}

function generateSignalData() {
    const signalType = document.getElementById('signalType')?.value || 'sine';
    const frequency = parseFloat(document.getElementById('frequency')?.value || 5);
    const amplitude = parseFloat(document.getElementById('amplitude')?.value || 1);
    
    signalData = [];
    const samples = 800;
    const timeSpan = 2; // 2 seconds
    
    for (let i = 0; i < samples; i++) {
        const t = (i / samples) * timeSpan;
        let value = 0;
        
        switch (signalType) {
            case 'sine':
                value = amplitude * Math.sin(2 * Math.PI * frequency * t);
                break;
            case 'square':
                value = amplitude * Math.sign(Math.sin(2 * Math.PI * frequency * t));
                break;
            case 'triangle':
                value = amplitude * (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * frequency * t));
                break;
            case 'sawtooth':
                value = amplitude * (2 * (t * frequency - Math.floor(t * frequency + 0.5)));
                break;
        }
        
        signalData.push(value);
    }
    
    filteredData = [...signalData];
}

function updateSignal() {
    generateSignalData();
    applyFilter();
    applyModulation();
    drawSignal();
    updateControlValues();
}

function updateControlValues() {
    const freqValue = document.getElementById('freqValue');
    const ampValue = document.getElementById('ampValue');
    const frequency = document.getElementById('frequency')?.value;
    const amplitude = document.getElementById('amplitude')?.value;
    
    if (freqValue) freqValue.textContent = frequency;
    if (ampValue) ampValue.textContent = parseFloat(amplitude).toFixed(1);
}

function applyFilter() {
    const filterType = document.getElementById('filterType')?.value || 'none';
    
    if (filterType === 'none') {
        filteredData = [...signalData];
        return;
    }
    
    // Simple filter implementations
    filteredData = [...signalData];
    
    switch (filterType) {
        case 'lowpass':
            filteredData = lowPassFilter(filteredData, 0.1);
            break;
        case 'highpass':
            filteredData = highPassFilter(filteredData, 0.1);
            break;
        case 'bandpass':
            filteredData = bandPassFilter(filteredData, 0.05, 0.15);
            break;
    }
}

function lowPassFilter(data, alpha) {
    const filtered = [data[0]];
    for (let i = 1; i < data.length; i++) {
        filtered[i] = alpha * data[i] + (1 - alpha) * filtered[i - 1];
    }
    return filtered;
}

function highPassFilter(data, alpha) {
    const filtered = [0];
    for (let i = 1; i < data.length; i++) {
        filtered[i] = alpha * (filtered[i - 1] + data[i] - data[i - 1]);
    }
    return filtered;
}

function bandPassFilter(data, lowAlpha, highAlpha) {
    let temp = lowPassFilter(data, lowAlpha);
    return highPassFilter(temp, highAlpha);
}

function applyModulation() {
    const modType = document.getElementById('modulation')?.value || 'none';
    
    if (modType === 'none') return;
    
    const carrierFreq = 20; // Carrier frequency
    const samples = filteredData.length;
    
    for (let i = 0; i < samples; i++) {
        const t = (i / samples) * 2; // 2 seconds timespan
        const carrier = Math.sin(2 * Math.PI * carrierFreq * t);
        
        switch (modType) {
            case 'am':
                filteredData[i] = (1 + 0.5 * filteredData[i]) * carrier * 0.5;
                break;
            case 'fm':
                const phase = 2 * Math.PI * carrierFreq * t + filteredData[i];
                filteredData[i] = Math.sin(phase) * 0.5;
                break;
        }
    }
}

function drawSignal() {
    if (!canvas || !ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw grid
    drawGrid();
    
    // Draw original signal (faded)
    drawWaveform(signalData, 'rgba(100, 100, 100, 0.3)', 1);
    
    // Draw filtered/modulated signal
    drawWaveform(filteredData, '#32b8c6', 2);
    
    // Draw labels
    drawLabels();
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(50, 184, 198, 0.1)';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let i = 0; i <= 10; i++) {
        const x = (canvas.width / 10) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let i = 0; i <= 6; i++) {
        const y = (canvas.height / 6) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    // Center line
    ctx.strokeStyle = 'rgba(50, 184, 198, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
}

function drawWaveform(data, color, lineWidth) {
    if (data.length < 2) return;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    
    const maxValue = Math.max(...data.map(Math.abs));
    const scale = maxValue > 0 ? (canvas.height * 0.4) / maxValue : 1;
    
    data.forEach((value, index) => {
        const x = (canvas.width / (data.length - 1)) * index;
        const y = canvas.height / 2 - value * scale;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Add glow effect for main signal
    if (lineWidth > 1) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
}

function drawLabels() {
    ctx.fillStyle = '#cccccc';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    
    // Time axis label
    ctx.fillText('Time (s)', 10, canvas.height - 10);
    
    // Amplitude axis label
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Amplitude', 0, 0);
    ctx.restore();
    
    // Signal type label
    const signalType = document.getElementById('signalType')?.value || 'sine';
    ctx.textAlign = 'right';
    ctx.fillText(`Signal: ${signalType.charAt(0).toUpperCase() + signalType.slice(1)}`, canvas.width - 10, 20);
    
    // Filter label
    const filterType = document.getElementById('filterType')?.value || 'none';
    if (filterType !== 'none') {
        ctx.fillText(`Filter: ${filterType}`, canvas.width - 10, 40);
    }
}

// Audio Functions
function initializeAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

function playAudio() {
    if (isAudioPlaying) {
        stopAudio();
        return;
    }
    
    try {
        const context = initializeAudioContext();
        
        // Resume context if suspended (required for some browsers)
        if (context.state === 'suspended') {
            context.resume();
        }
        
        const signalType = document.getElementById('signalType')?.value || 'sine';
        const frequency = parseFloat(document.getElementById('frequency')?.value || 5);
        const amplitude = parseFloat(document.getElementById('amplitude')?.value || 1);
        
        // Create oscillator
        oscillator = context.createOscillator();
        gainNode = context.createGain();
        
        // Set oscillator type
        oscillator.type = signalType;
        oscillator.frequency.setValueAtTime(frequency * 100, context.currentTime); // Scale up frequency for audio
        
        // Set gain (volume)
        gainNode.gain.setValueAtTime(amplitude * 0.1, context.currentTime); // Scale down for comfortable listening
        
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        
        // Start oscillator
        oscillator.start();
        
        isAudioPlaying = true;
        
        // Update button text
        const playBtn = document.querySelector('button[onclick="playAudio()"]');
        if (playBtn) {
            playBtn.innerHTML = '<i class="fas fa-pause"></i> Pause Audio';
        }
        
        // Auto-stop after 3 seconds to prevent endless playing
        setTimeout(() => {
            if (isAudioPlaying) {
                stopAudio();
            }
        }, 3000);
        
    } catch (error) {
        console.error('Error playing audio:', error);
        alert('Audio playback is not supported in this browser or context.');
    }
}

function stopAudio() {
    if (oscillator) {
        try {
            oscillator.stop();
            oscillator.disconnect();
        } catch (error) {
            console.error('Error stopping audio:', error);
        }
        oscillator = null;
    }
    
    if (gainNode) {
        gainNode.disconnect();
        gainNode = null;
    }
    
    isAudioPlaying = false;
    
    // Update button text
    const playBtn = document.querySelector('button[onclick="playAudio()"]');
    if (playBtn) {
        playBtn.innerHTML = '<i class="fas fa-play"></i> Play Audio';
    }
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