# Let's create a simpler SVG logo for the ElectroMos club
import math
from xml.etree import ElementTree as ET

# SVG dimensions
width = 500
height = 500
center_x = width // 2
center_y = height // 2

# Create the SVG element
svg = ET.Element('svg', {
    'width': str(width), 
    'height': str(height),
    'xmlns': "http://www.w3.org/2000/svg",
    'viewBox': f"0 0 {width} {height}"
})

# Add a dark background
ET.SubElement(svg, 'rect', {
    'x': '0', 
    'y': '0', 
    'width': str(width),
    'height': str(height), 
    'fill': '#121212'
})

# Create a gradient for the circuit lines
defs = ET.SubElement(svg, 'defs')
linear_gradient = ET.SubElement(defs, 'linearGradient', {
    'id': 'circuitGradient',
    'x1': '0%', 
    'y1': '0%', 
    'x2': '100%', 
    'y2': '100%'
})
ET.SubElement(linear_gradient, 'stop', {
    'offset': '0%',
    'style': 'stop-color:#4845D3;stop-opacity:1'
})
ET.SubElement(linear_gradient, 'stop', {
    'offset': '100%',
    'style': 'stop-color:#FC7753;stop-opacity:1'
})

# Create a gradient for the outer ring
ring_gradient = ET.SubElement(defs, 'linearGradient', {
    'id': 'ringGradient',
    'x1': '0%', 
    'y1': '0%', 
    'x2': '100%', 
    'y2': '100%'
})
ET.SubElement(ring_gradient, 'stop', {
    'offset': '0%',
    'style': 'stop-color:#00FF9F;stop-opacity:1'
})
ET.SubElement(ring_gradient, 'stop', {
    'offset': '100%',
    'style': 'stop-color:#4845D3;stop-opacity:1'
})

# Add the outer ring
ring_radius = 220
ET.SubElement(svg, 'circle', {
    'cx': str(center_x), 
    'cy': str(center_y), 
    'r': str(ring_radius),
    'fill': 'none', 
    'stroke': 'url(#ringGradient)', 
    'stroke-width': '5'
})

# Add some dots around the ring
for i in range(0, 360, 90):
    x = center_x + int(ring_radius * math.cos(math.radians(i)))
    y = center_y + int(ring_radius * math.sin(math.radians(i)))
    ET.SubElement(svg, 'circle', {
        'cx': str(x), 
        'cy': str(y), 
        'r': '10',
        'fill': '#00FF9F'
    })

# Create the inner sections for PCB, IoT, and Signal Processing
main_group = ET.SubElement(svg, 'g', {'id': 'main'})

# Add PCB section (red)
ET.SubElement(main_group, 'path', {
    'd': f'M {center_x} {center_y} L {center_x} {center_y-150} A 150 150 0 0 1 {center_x+150} {center_y} Z',
    'fill': '#d32f2f', 
    'stroke': '#121212', 
    'stroke-width': '2'
})

# Add IoT section (blue)
ET.SubElement(main_group, 'path', {
    'd': f'M {center_x} {center_y} L {center_x+150} {center_y} A 150 150 0 0 1 {center_x} {center_y+150} Z',
    'fill': '#1976d2', 
    'stroke': '#121212', 
    'stroke-width': '2'
})

# Add Signal Processing section (cyan)
ET.SubElement(main_group, 'path', {
    'd': f'M {center_x} {center_y} L {center_x} {center_y+150} A 150 150 0 0 1 {center_x-150} {center_y} Z',
    'fill': '#00acc1', 
    'stroke': '#121212', 
    'stroke-width': '2'
})

# Add Electronics section (purple)
ET.SubElement(main_group, 'path', {
    'd': f'M {center_x} {center_y} L {center_x-150} {center_y} A 150 150 0 0 1 {center_x} {center_y-150} Z',
    'fill': '#7b1fa2', 
    'stroke': '#121212', 
    'stroke-width': '2'
})

# Add a center chip icon
center_chip = ET.SubElement(svg, 'g', {'id': 'center_chip'})
ET.SubElement(center_chip, 'rect', {
    'x': str(center_x - 40),
    'y': str(center_y - 40),
    'width': '80',
    'height': '80',
    'fill': '#333',
    'stroke': 'white',
    'stroke-width': '2'
})

# Add circuit lines
circuit_group = ET.SubElement(svg, 'g', {'id': 'circuits'})

# Add animations
style = ET.SubElement(svg, 'style')
style.text = """
    @keyframes dash {
        to {
            stroke-dashoffset: 100;
        }
    }
    #circuits path {
        animation: dash 5s linear infinite;
    }
    @keyframes pulse {
        0% { opacity: 0.7; }
        50% { opacity: 1; }
        100% { opacity: 0.7; }
    }
    #center_chip {
        animation: pulse 2s infinite;
    }
"""

# Convert to string and save to file
xml_string = ET.tostring(svg, encoding='unicode')
with open('electromos_logo.svg', 'w') as f:
    f.write(xml_string)

print("Generated ElectroMos animated logo (electromos_logo.svg)")