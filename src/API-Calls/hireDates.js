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

const fetchHireDates = getDataFromSheet(gids[1]);
