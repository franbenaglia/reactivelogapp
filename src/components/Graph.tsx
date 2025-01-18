import { IonFab, IonToggle } from '@ionic/react';
import { CategoryScale } from "chart.js";
import Chart from "chart.js/auto";
import { useEffect, useState } from 'react';
import { Line } from "react-chartjs-2";
import { evtSource } from '../eventsource/Configuration';
import { Climate } from '../model/Climate';
import './List.css';

interface Data {
  labels: number[];
  datasets: any[];
}

Chart.register(CategoryScale);

const Graph: React.FC = () => {

  const [climate, setClimate] = useState<Climate[]>([]);
  const [orderedClimate, setOrderedClimate] = useState<Climate[]>([]);
  const [chartData, setChartData] = useState<Data>({ labels: [], datasets: [] });
  const [chartDataMulti, setChartDataMulti] = useState<Map<number, Climate[]>>(new Map<number, Climate[]>());
  const [stop, setStop] = useState(false);
  const [multi, setMulti] = useState(true);

  const availableColors: string[] = ['red', 'white', 'blue', 'green', 'yellow', 'purple', 'cyan', 'magenta', 'pink'];

  useEffect(() => {

    configData();

    configOrderedClimate();

    evtSource.onopen = () => {
      console.log("Connection to server opened.");
    }

    evtSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (!stop) {
        setClimate([...climate, data]);
        /*
        if (climate.length === 100) {
          const c = climate;
          c.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          setOrderedClimate(c);
        }
          */
      }
      //console.log(data);
    }

    evtSource.onerror = (event) => {
      console.log("EventSource failed.");
    }

  }, [climate]);

  const configOrderedClimate = () => {

    //console.log(orderedClimate);

  }

  const configData = () => {

    const map = new Map<number, Climate[]>();
    const dss: any[] = [];
    const labels: any[] = [];

    for (let i = 0; i < 48; i++) {
      labels.push(i);
    }

    climate.map((data, idx) => {

      //labels.push(data.idx);

      if (data.idx == 0) {
        //map.clear();
      }

      if (map.has(data.channel)) {
        map.set(data.channel, [...map.get(data.channel), data]);
      } else {
        map.set(data.channel, [data]);
      }

    });

    setChartDataMulti(map);

    for (const c of map.values()) {

      dss.push(
        {
          label: "Temperature",
          data: c && c.length > 0 ? c.map((data) => data.temperature) : [],
          backgroundColor: availableColors,
          borderColor: "black",
          borderWidth: 2
        }
      );

    }
    const cd: Data = { labels: labels, datasets: dss };
    setChartData(cd);
  }


  const toggleStop = () => {
    const stopped = !stop;
    setStop(stopped);
  }

  const toggleView = () => {
    setMulti(!multi);
  }



  return (
    <>

      {!multi ? (<Line
        data={chartData}
        options={{
          plugins: {
            title: {
              display: true,
              text: "Temperature"
            },
            legend: {
              display: false
            }
          }
        }}
      />)
        :
        (

          Array.from(chartDataMulti.entries()).map((key, value) =>
            <Line
              data={
                {
                  labels: key[1] && key[1].length > 0 ? key[1].map((data, idx) => new Date(data.date).getTime()) : [],
                  datasets: [{
                    label: "Temperature channel: " + key[0],
                    data: key[1] && key[1].length > 0 ? key[1].map((data, idx) => data.temperature) : [],
                    backgroundColor: availableColors,
                    borderColor: "black",
                    borderWidth: 2
                  }]
                }
              }
              options={{
                plugins: {
                  title: {
                    display: true,
                    text: "Temperature channel: " + key[0],
                  },
                  legend: {
                    display: false
                  }
                }
              }}
            />
          )

        )
      }

      <IonFab slot="fixed" vertical="top" horizontal="start">
        <IonToggle checked={stop} onClick={() => toggleStop()}>Stop data logger</IonToggle>
      </IonFab >
      <IonFab slot="fixed" vertical="top" horizontal="end">
        <IonToggle checked={multi} onClick={() => toggleView()}>Switch view</IonToggle>
      </IonFab >

    </>
  );

};

export default Graph;