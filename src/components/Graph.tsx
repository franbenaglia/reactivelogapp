import { useEffect, useState } from 'react';
import { evtSource } from '../eventsource/Configuration';
import './List.css';
import { IonButton, IonCol, IonGrid, IonInput, IonRow } from '@ionic/react';
import { Climate } from '../model/Climate';
import { CategoryScale } from "chart.js";
import Chart from "chart.js/auto";
import { Line } from "react-chartjs-2";

Chart.register(CategoryScale);

const Graph: React.FC = () => {

  const [climate, setClimate] = useState<Climate[]>([]);
  const [channelColor, setChannelColor] = useState<Map<number, string>>(new Map<number, string>());
  const [colorCount, setColorCount] = useState<Map<string, number>>(new Map<string, number>());
  const [chartData, setChartData] = useState({ datasets: [] });

  const [index, setIndex] = useState<number>(0);

  const availableColors: string[] = ['red', 'white', 'blue', 'green', 'yellow', 'purple', 'cyan', 'magenta', 'pink'];

  useEffect(() => {

    initializeColor();

    initializeData();

    //evtSource;
    evtSource.onopen = () => {
      console.log("Connection to server opened.");
    }

    evtSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      cssForChannel(data.channel);
      //data.color = availableColors[index];
      //setIndex(index => {
      //  if (!channelColor.has(data.channel)) {
      //    setChannelColor(previous => previous.set(data.channel, data.color));
      //  }
      //  return index < availableColors.length ? index + 1 : 0;
      //});
      setClimate([...climate, data]);
      console.log(data);
    }

    evtSource.onerror = (event) => {
      console.log("EventSource failed.");
    }

  }, [climate]);

  const initializeData = () => {
  //https://blog.logrocket.com/using-chart-js-react/
    setChartData({
      //labels: Data.map((data) => data.year),
      datasets: [
        {
          label: "Users Gained ",
          data: climate && climate.length > 0 ? climate.map((data) => data.temperature) : [],
          backgroundColor: [
            "rgba(75,192,192,1)",
            "ecf0f1",
            "#50AF95",
            "#f3ba2f",
            "#2a71d0"
          ],
          borderColor: "black",
          borderWidth: 2
        }
      ]
    });

  }


  const cssForChannel = (c: number): void => {
    assignColorToChannel(c);
  }

  const initializeColor = () => {
    for (let c of availableColors) {
      colorCount.set(c, 0)
    }
    setColorCount(colorCount);
  }

  const assignColorToChannel = (channel: number): void => {

    if (!channelColor.has(channel)) {
      let luc = lessUsedColor();
      channelColor.set(channel, luc);
      setChannelColor(channelColor);
      colorCount.set(luc, colorCount.get(luc) + 1);
      setColorCount(colorCount)
    }

  }

  const lessUsedColor = (): string => {

    let color: string;
    let arrayVal: number[] = Array.from(colorCount.values());
    let minor: number = Math.min(...arrayVal);

    colorCount.forEach((value, key, map) => {
      if (value === minor) {
        color = key;
      }
    })
    return color;
  }


  const getCssChannel = (channel: number): string => {
    let color = 'red';
    if (channelColor.has(channel)) {
      color = channelColor.get(channel);
    }
    return color;

  }

  return (
    <div>

      <Line
        data={chartData}
        options={{
          plugins: {
            title: {
              display: true,
              text: "Users Gained between 2016-2020"
            },
            legend: {
              display: false
            }
          }
        }}
      />

    </div>
  );
};

export default Graph;