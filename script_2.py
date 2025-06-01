# Let's create a simple CSV file with example sensor data for the IoT dashboard
import csv
import random
import math
from datetime import datetime, timedelta

# Create sample sensor data
data = []
start_time = datetime.now() - timedelta(hours=24)  # Start from 24 hours ago

# Generate 100 data points
for i in range(100):
    timestamp = start_time + timedelta(minutes=15*i)  # Data point every 15 minutes
    
    # Temperature follows a sine wave pattern to simulate day/night changes
    hour_angle = (timestamp.hour * 60 + timestamp.minute) * (2 * math.pi / (24 * 60))
    temperature = 22 + 5 * math.sin(hour_angle)  # Temperature between 17-27°C
    
    # Humidity decreases as temperature increases
    humidity = 70 - (temperature - 22) * 3 + random.uniform(-5, 5)  # Base 70% with some noise
    humidity = max(30, min(90, humidity))  # Keep humidity between 30-90%
    
    # Light level depends on time of day
    if 6 <= timestamp.hour < 18:  # Daytime
        light = 800 + random.uniform(-200, 200)  # Higher during day with some noise
        if 10 <= timestamp.hour < 14:  # Peak daylight
            light += 200  # Even higher at midday
    else:  # Nighttime
        light = 50 + random.uniform(-30, 30)  # Low at night with some noise
    
    # Motion is random but more likely during active hours
    if 8 <= timestamp.hour < 22:  # Active hours
        motion = random.choice([0, 0, 0, 0, 1, 1])  # 2/6 chance of motion
    else:  # Inactive hours
        motion = random.choice([0, 0, 0, 0, 0, 1])  # 1/6 chance of motion
    
    # CO2 levels follow a pattern with randomness
    co2_base = 400  # Baseline outdoor level
    if 9 <= timestamp.hour < 17:  # Working hours
        co2_base += 200  # Higher during working hours
    co2 = co2_base + random.uniform(-50, 50)  # Add some noise
    
    data.append({
        'timestamp': timestamp.strftime('%Y-%m-%d %H:%M:%S'),
        'temperature': round(temperature, 1),
        'humidity': round(humidity, 1),
        'light': round(light, 0),
        'motion': motion,
        'co2': round(co2, 0)
    })

# Write data to CSV file
with open('sensor_data.csv', 'w', newline='') as file:
    fieldnames = ['timestamp', 'temperature', 'humidity', 'light', 'motion', 'co2']
    writer = csv.DictWriter(file, fieldnames=fieldnames)
    
    writer.writeheader()
    for row in data:
        writer.writerow(row)

print("Generated sample sensor data (sensor_data.csv)")

# Let's also create a sample dataset for the signal processing demo
signal_data = []
sample_rate = 1000  # Hz
duration = 1  # second

# Generate a composite signal with multiple frequency components
for i in range(sample_rate * duration):
    t = i / sample_rate  # Time in seconds
    
    # Base signal (50 Hz)
    base_signal = 1.0 * math.sin(2 * math.pi * 50 * t)
    
    # Harmonic components
    harmonic1 = 0.5 * math.sin(2 * math.pi * 100 * t)  # 100 Hz
    harmonic2 = 0.3 * math.sin(2 * math.pi * 150 * t)  # 150 Hz
    
    # High-frequency noise
    noise = 0.1 * random.uniform(-1, 1)
    
    # Combined signal
    signal = base_signal + harmonic1 + harmonic2 + noise
    
    signal_data.append({
        'time': t,
        'signal': signal
    })

# Write signal data to CSV file
with open('signal_data.csv', 'w', newline='') as file:
    fieldnames = ['time', 'signal']
    writer = csv.DictWriter(file, fieldnames=fieldnames)
    
    writer.writeheader()
    for row in signal_data:
        writer.writerow(row)

print("Generated sample signal data (signal_data.csv)")

# Preview the first few rows of both datasets
print("\nSensor Data Preview:")
for row in data[:5]:
    print(row)

print("\nSignal Data Preview:")
for row in signal_data[:5]:
    print(row)