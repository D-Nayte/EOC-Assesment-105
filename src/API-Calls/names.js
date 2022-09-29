const dataURLBase = "https://docs.google.com/spreadsheets/d/";
const dataURLEnd = "/gviz/tq?tqx=out:json&tq&gid=";
const id = "1C1-em4w0yHmd2N7__9cCSFzxBEf_8r74hQJBsR6qWnE";
const gids = ["0", "1574569648", "1605451198"];

async function getDataFromSheet(gids) {
  const urlToCall = `${dataURLBase}${id}${dataURLEnd}${gids}`;
  try {
    const response = await fetch(urlToCall);
    const dataInText = await response.text();
    const dataFormatted = dataInText.substring(47).slice(0, -2);
    const json = JSON.parse(dataFormatted);
    return json;
  } catch (error) {
    console.error("API ERROR:", error);
  }
}

const fetchNames = getDataFromSheet(gids[0]);
