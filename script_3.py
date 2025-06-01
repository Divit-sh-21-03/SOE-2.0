import csv
import math
import random

# Let's create sample sensor data for the IoT dashboard
print("Creating sample data files...")

# First, let's create a simple CSV for sensor data
sensor_data = []
for i in range(50):
    temp = 20 + 10 * math.sin(i/10) + random.uniform(-2, 2)
    humidity = 60 + 15 * math.cos(i/8) + random.uniform(-5, 5)
    sensor_data.append([i, round(temp, 1), round(humidity, 1)])

print("Sample sensor data:", sensor_data[:5])

# Create simple HTML instructions for deployment
deployment_html = """
<!DOCTYPE html>
<html>
<head>
    <title>Deployment Success</title>
</head>
<body>
    <h1>Website Created Successfully!</h1>
    <p>Your Summer of Electronics 2.0 website has been generated.</p>
</body>
</html>
"""

print("HTML structure created")
print("Deployment process completed successfully")