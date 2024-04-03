from datetime import datetime
import matplotlib.pyplot as plt
import csv

fontsize = 20
valueTextSize = 20
backgroundColor = "#393e46"
textColor = "#f5f5dc"

def readFromFile(filePath):
    timestamps = []
    temperatures = []
    co2_levels = []
    humidities = []
    
    with open(filePath, 'r') as file:
        reader = csv.reader(file)
        for row in reader:
            # Assuming each row is in the format: timestamp,Temperature:temp_value,CO2:co2_value,Humidity:humidity_value
            timestamp = row[0]
            temperature = float(row[1].split(':')[1])
            co2 = float(row[2].split(':')[1])
            humidity = float(row[3].split(':')[1])
            
            # Convert ISO 8601 timestamp string to datetime object
            timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))

            timestamps.append(timestamp)
            temperatures.append(temperature)
            co2_levels.append(co2)
            humidities.append(humidity)
            
    return timestamps, temperatures, co2_levels, humidities

def plot_temperature(timestamps, temperatures):
    plt.figure(figsize=(10, 6), facecolor=backgroundColor)
    plt.subplot(facecolor=backgroundColor)
    # Format the x-axis labels to show only hour and minute
    x_labels = [ts.strftime('%H:%M') for ts in timestamps]

    plt.plot(x_labels, temperatures, label='Temperature', color='red')
    # Customize the color of the entire box around the plot
    for spine in plt.gca().spines.values():
        spine.set_color(textColor)

    plt.xlabel('Time', fontsize = fontsize, color=textColor) # x-axis label
    plt.ylabel('Temperature (°C)', fontsize = fontsize, color=textColor) # y-axis label
    plt.title('Temperature Variation Over Time', fontsize = fontsize, color=textColor) # Graph title
    
    # Adjust the size of tick labels for both x and y axes
    plt.tick_params(axis='x', labelsize=valueTextSize)  # Adjust label size for x-axis tick labels
    plt.tick_params(axis='y', labelsize=valueTextSize)  # Adjust label size for y-axis tick labels

    plt.xticks(rotation=45, color=textColor)  # Rotate x-axis labels for better readability
    # Set the intervals for the y-axis ticks from 20 to 31 with 1 step rate
    plt.yticks(range(20, 31, 1), color=textColor) 

    plt.tight_layout()
    plt.savefig('public/Images/TempGraph.png')  # Save the temperature graph image in the public folder

def plot_co2(timestamps, co2_levels):
    plt.figure(figsize=(10, 6), facecolor=backgroundColor)
    plt.subplot(facecolor=backgroundColor) # Set background behind line
    # Format the x-axis labels to show only hour and minute
    x_labels = [ts.strftime('%H:%M') for ts in timestamps]

    plt.plot(x_labels, co2_levels, label='CO2 Level', color='white')
    # Customize the color of the entire box around the plot
    for spine in plt.gca().spines.values():
        spine.set_color(textColor)
    plt.xlabel('Time', fontsize = fontsize, color=textColor)
    plt.ylabel('CO2 Level (ppm)', fontsize = fontsize, color=textColor)
    plt.title('CO2 Level Variation Over Time', fontsize = fontsize, color=textColor)
    
    # Adjust the size of tick labels for both x and y axes
    plt.tick_params(axis='x', labelsize=valueTextSize)  # Adjust label size for x-axis tick labels
    plt.tick_params(axis='y', labelsize=valueTextSize)  # Adjust label size for y-axis tick labels
    
    plt.xticks(rotation=45, color=textColor)  # Rotate x-axis labels for better readability
    plt.yticks(color=textColor)
    plt.tight_layout()
    plt.savefig('public/Images/CO2Graph.png')  # Save the CO2 level graph image in the public folder


def plot_humidity(timestamps, humidities):
    plt.figure(figsize=(10, 6), facecolor=backgroundColor)
    plt.subplot(facecolor=backgroundColor)
    # Format the x-axis labels to show only hour and minute
    x_labels = [ts.strftime('%H:%M') for ts in timestamps]

    plt.plot(x_labels, humidities, label='Humidity', color='blue')
    # Customize the color of the entire box around the plot
    for spine in plt.gca().spines.values():
        spine.set_color(textColor)
    
    plt.xlabel('Time', fontsize = fontsize, color=textColor)
    plt.ylabel('Humidity (%)', fontsize = fontsize, color=textColor)
    plt.title('Humidity Variation Over Time', fontsize = fontsize, color=textColor)
    
    # Adjust the size of tick labels for both x and y axes
    plt.tick_params(axis='x', labelsize=valueTextSize)  # Adjust label size for x-axis tick labels
    plt.tick_params(axis='y', labelsize=valueTextSize)  # Adjust label size for y-axis tick labels
    
    plt.xticks(rotation=45, color=textColor)  # Rotate x-axis labels for better readability
    plt.yticks(color=textColor)
    plt.tight_layout()
    plt.savefig('public/Images/HumidityGraph.png')  # Save the humidity graph image in the public folder

def main():
    filePath = 'uartData.log'
    timestamps, temperatures, co2_levels, humidities = readFromFile(filePath)
    
    # Plot temperature
    plot_temperature(timestamps, temperatures)
    
    # Plot CO2 levels
    plot_co2(timestamps, co2_levels)
    
    # Plot humidity
    plot_humidity(timestamps, humidities)

if __name__ == "__main__":
    main()
