export const evtSource = new EventSource("http://localhost:8080/climateData");

evtSource.onopen = () => {
    console.log("Connection to server opened.");
}

evtSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log(data);
}

evtSource.onerror = (event) => {
    console.log("EventSource failed.");
}
