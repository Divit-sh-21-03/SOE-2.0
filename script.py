# Let's create an animated logo for the ElectroMos club using Python
# We'll generate an SVG file that can be included in the website

import math
import random
from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom import minidom

def prettify(elem):
    """Return a pretty-printed XML string for the Element."""
    rough_string = tostring(elem, 'utf-8')
    reparsed = minidom.parseString(rough_string)
    return reparsed.toprettyxml(indent="  ")

# SVG dimensions
width = 500
height = 500
center_x = width // 2
center_y = height // 2

# Create the SVG element
svg = Element('svg', width=str(width), height=str(height), 
              xmlns="http://www.w3.org/2000/svg",
              viewBox=f"0 0 {width} {height}")

# Add a dark background
background = SubElement(svg, 'rect', x='0', y='0', width=str(width), 
                       height=str(height), fill='#121212')

# Create a gradient for the circuit lines
gradient = SubElement(svg, 'defs')
linear_gradient = SubElement(gradient, 'linearGradient', id='circuitGradient', 
                            x1='0%', y1='0%', x2='100%', y2='100%')
SubElement(linear_gradient, 'stop', offset='0%', 
          style='stop-color:#4845D3;stop-opacity:1')
SubElement(linear_gradient, 'stop', offset='100%', 
          style='stop-color:#FC7753;stop-opacity:1')

# Create a gradient for the outer ring
ring_gradient = SubElement(gradient, 'linearGradient', id='ringGradient', 
                          x1='0%', y1='0%', x2='100%', y2='100%')
SubElement(ring_gradient, 'stop', offset='0%', 
          style='stop-color:#00FF9F;stop-opacity:1')
SubElement(ring_gradient, 'stop', offset='100%', 
          style='stop-color:#4845D3;stop-opacity:1')

# Add the outer ring
ring_radius = 220
SubElement(svg, 'circle', cx=str(center_x), cy=str(center_y), r=str(ring_radius),
          fill='none', stroke='url(#ringGradient)', stroke_width='5')

# Add some dots around the ring
for i in range(0, 360, 90):
    x = center_x + int(ring_radius * math.cos(math.radians(i)))
    y = center_y + int(ring_radius * math.sin(math.radians(i)))
    SubElement(svg, 'circle', cx=str(x), cy=str(y), r='10',
              fill='#00FF9F')

# Create the inner sections for PCB, IoT, and Signal Processing
# First, create a group for easier transforms
main_group = SubElement(svg, 'g', id='main')

# Add PCB section (red)
pcb_section = SubElement(main_group, 'path', 
                        d=f'M {center_x} {center_y} L {center_x} {center_y-150} A 150 150 0 0 1 {center_x+150} {center_y} Z',
                        fill='#d32f2f', stroke='#121212', stroke_width='2')

# Add IoT section (blue)
iot_section = SubElement(main_group, 'path', 
                        d=f'M {center_x} {center_y} L {center_x+150} {center_y} A 150 150 0 0 1 {center_x} {center_y+150} Z',
                        fill='#1976d2', stroke='#121212', stroke_width='2')

# Add Signal Processing section (cyan)
signal_section = SubElement(main_group, 'path', 
                           d=f'M {center_x} {center_y} L {center_x} {center_y+150} A 150 150 0 0 1 {center_x-150} {center_y} Z',
                           fill='#00acc1', stroke='#121212', stroke_width='2')

# Add Electronics section (purple)
electronics_section = SubElement(main_group, 'path', 
                               d=f'M {center_x} {center_y} L {center_x-150} {center_y} A 150 150 0 0 1 {center_x} {center_y-150} Z',
                               fill='#7b1fa2', stroke='#121212', stroke_width='2')

# Add icons for each section
# PCB icon
pcb_icon_group = SubElement(svg, 'g', id='pcb_icon', 
                           transform=f'translate({center_x-15} {center_y-90}) scale(0.3)')
pcb_icon = SubElement(pcb_icon_group, 'path', 
                     d='M10,10 H50 V50 H10 Z M15,15 H45 V45 H15 Z M20,20 H30 V30 H20 Z M35,35 H40 V40 H35 Z',
                     fill='white')
# Add circuit lines
for i in range(3):
    x1 = random.randint(15, 45)
    y1 = random.randint(15, 45)
    x2 = random.randint(15, 45)
    y2 = random.randint(15, 45)
    SubElement(pcb_icon_group, 'line', x1=str(x1), y1=str(y1), x2=str(x2), y2=str(y2),
              stroke='white', stroke_width='2')

# IoT icon (wifi signal)
iot_icon_group = SubElement(svg, 'g', id='iot_icon', 
                           transform=f'translate({center_x+90} {center_y+15}) scale(0.3)')
# Wifi signal arcs
for i in range(3):
    radius = 10 + i*10
    SubElement(iot_icon_group, 'path', 
              d=f'M0,0 v-{radius} a {radius} {radius} 0 0 1 {radius} {radius}',
              fill='none', stroke='white', stroke_width='3')
# Center dot
SubElement(iot_icon_group, 'circle', cx='0', cy='0', r='5', fill='white')

# Signal processing icon (wave)
signal_icon_group = SubElement(svg, 'g', id='signal_icon', 
                              transform=f'translate({center_x-90} {center_y+15}) scale(0.3)')
# Create a sine wave
points = []
for i in range(0, 61, 5):
    x = i
    y = 20 * math.sin(i/10)
    points.append(f"{x},{y}")
SubElement(signal_icon_group, 'polyline', points=' '.join(points),
          fill='none', stroke='white', stroke_width='3')

# Electronics icon (chip)
electronics_icon_group = SubElement(svg, 'g', id='electronics_icon', 
                                   transform=f'translate({center_x-15} {center_y-15}) scale(0.4)')
chip = SubElement(electronics_icon_group, 'rect', x='-25', y='-25', width='50', height='50',
                 fill='#121212', stroke='white', stroke_width='2')
# Add pins to the chip
for i in range(-20, 21, 10):
    # Left pins
    SubElement(electronics_icon_group, 'line', x1='-30', y1=str(i), x2='-25', y2=str(i),
              stroke='white', stroke_width='2')
    # Right pins
    SubElement(electronics_icon_group, 'line', x1='25', y1=str(i), x2='30', y2=str(i),
              stroke='white', stroke_width='2')
    # Top pins
    SubElement(electronics_icon_group, 'line', x1=str(i), y1='-30', x2=str(i), y2='-25',
              stroke='white', stroke_width='2')
    # Bottom pins
    SubElement(electronics_icon_group, 'line', x1=str(i), y1='25', x2=str(i), y2='30',
              stroke='white', stroke_width='2')
# Add a circle in the center
SubElement(electronics_icon_group, 'circle', cx='0', cy='0', r='10',
          fill='none', stroke='white', stroke_width='2')

# Add some circuit paths connecting the sections
circuit_group = SubElement(svg, 'g', id='circuits')
# From PCB to IoT
SubElement(circuit_group, 'path', 
          d=f'M {center_x+30} {center_y-30} C {center_x+50} {center_y-50}, {center_x+50} {center_y+50}, {center_x+30} {center_y+30}',
          fill='none', stroke='url(#circuitGradient)', stroke_width='2', stroke_dasharray='5,5')
# From IoT to Signal
SubElement(circuit_group, 'path', 
          d=f'M {center_x+30} {center_y+30} C {center_x+20} {center_y+60}, {center_x-20} {center_y+60}, {center_x-30} {center_y+30}',
          fill='none', stroke='url(#circuitGradient)', stroke_width='2', stroke_dasharray='5,5')
# From Signal to Electronics
SubElement(circuit_group, 'path', 
          d=f'M {center_x-30} {center_y+30} C {center_x-50} {center_y+50}, {center_x-50} {center_y-50}, {center_x-30} {center_y-30}',
          fill='none', stroke='url(#circuitGradient)', stroke_width='2', stroke_dasharray='5,5')
# From Electronics to PCB
SubElement(circuit_group, 'path', 
          d=f'M {center_x-30} {center_y-30} C {center_x-20} {center_y-60}, {center_x+20} {center_y-60}, {center_x+30} {center_y-30}',
          fill='none', stroke='url(#circuitGradient)', stroke_width='2', stroke_dasharray='5,5')

# Add animation to make the circuit paths glow
animation = SubElement(svg, 'style')
animation.text = """
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
    #pcb_icon, #iot_icon, #signal_icon, #electronics_icon {
        animation: pulse 2s infinite;
    }
"""

# Convert to string and save to file
svg_string = prettify(svg)
with open('electromos_logo.svg', 'w') as f:
    f.write(svg_string)

print("Generated ElectroMos animated logo (electromos_logo.svg)")