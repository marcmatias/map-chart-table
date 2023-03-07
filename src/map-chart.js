import { statesAcronym, munAcronyms, datasetsMun, datasetsStates  }  from "./data.js";
import { getColor, getRandom } from "./utils.js";

export default class MapChart {

  constructor(element) {
    this.nationMap =  
      'https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=image/svg+xml&qualidade=intermediaria&intrarregiao=UF';
    this.stateMap = 
      'https://servicodados.ibge.gov.br/api/v3/malhas/estados/25?formato=image/svg+xml&qualidade=intermediaria&intrarregiao=municipio';
    this.element = element;
    this.immunizers = ["Poliomielite", "Sarampo", "BCG", "COVID-19"];
    this.years = [2018, 2019, 2020, 2021];

    this.mapTitle = "Cobertura vacinal para";
    this.currentImmunizer = "";
  }

  async init() {
    const self = this;

    self.render();
    await self.loadMapNation();
  }

  async loadMapNation() {
    const self = this;

    await self.applyMap(self.nationMap);
    const maxDatasetValue = Math.max(...datasetsStates.map(e => e.data).flat());
    self.setData(maxDatasetValue, 0, datasetsStates, statesAcronym)
  }

  // Quering map and
  async applyMap(mapUrl) {
    const svg = await fetch(mapUrl);
    const mapText = await svg.text();

    const svgContainer = document.querySelector('#canvas');
    svgContainer.innerHTML = mapText;

    const svgElement = svgContainer.querySelector("svg");
    svgElement.style.maxWidth = "70%";
    svgElement.style.height = "100%";
    svgElement.style.margin = "auto";
    svgElement.style.display = "block";
  }

  setData(maxDatasetValue, row, datasetsStates, contentData) {
    // Querying map country states setting eventListener
    for (const path of document.querySelectorAll('#canvas svg path')) {
      const content = contentData[path.id];
      const dataset = this.findElement(datasetsStates, content);

      if (!dataset || !dataset.data[row]) {
        path.style.fill = "#c7c7c7";
        continue;
      }

      path.style.fill =
        getColor(
          Math.floor(
            (
              dataset.data[row] / maxDatasetValue
            ) * 100
          ),
          ...getRandom([
            [
              [227, 52, 106],
              [237, 123, 158]
            ],
            [
              [131, 116, 217],
              [64, 42, 196]
            ]
          ])
        )
    }
  }

  findElement(arr, name) {
    for (let i = 0; i < arr.length; i++) {
      const object = arr[i];
      const labelLowerCase = object.label.toLowerCase();

      if(!name) {
        continue;
      }

      const nameAcronymLowerCase = name.acronym.toLowerCase();
      const nameNameLowerCase = name.name.toLowerCase();

      const labelWithoutSpaces = labelLowerCase.replaceAll(" ", "");

      if (labelLowerCase == nameAcronymLowerCase ||
        labelWithoutSpaces == nameNameLowerCase.replaceAll(" ", "")) {
        return object;
      }
    }

    return;
  }

  async loadMapState () {
    await this.applyMap(this.stateMap);
    const maxDatasetValue = Math.max(...datasetsMun.map(e => e.data).flat());
    this.setData(maxDatasetValue, 0, datasetsMun, munAcronyms);
  }


  render () {
    const self = this;

    const years = [] ;
    for (const year of self.years) {
      years.push(`<option value="${year}">${year}</option>`);
    }

    const immunizers = [];

    for (const immunizer of self.immunizers) {
      immunizers.push(`<option value="${immunizer}">${immunizer}</option>`);
    }

    const title = `${ self.mapTitle } ${ self.immunizers[0] }`;
    const map = `
        <h1 class="map__title">${ title }</h1>
        <section class="map__buttons-section">
          <div>
            <button class="map__button map__button--state">Por estado</button>
            <button class="map__button map__button--city">Por município</button>
          </div>
          <div class="map__selects-section">
            <div class="map__select-labeled">
              <label class="map__select-label"  for="imunizantes" class="text-xs">Imunizante</label><br>
              <select class="map__select map__select-immunizers" name="imunizantes" id="imunizantes">
                ${immunizers.join("")}
              </select>
            </div>
            <div class="map__select-labeled">
              <label class="map__select-label" for="years" class="text-xs">Ano</label><br>
              <select class="map__select" name="imunizantes" id="years">
                ${years.join("")}
              </select>
            </div>
          </div>
        </section>
        <section class="map__canva-section">
          <div id="canvas" class="map__canva" width="600" height="420"></div>
        </section>
      `;

    self.element.innerHTML = map;

    // Listeners
    self.element
      .querySelector("button.map__button--state")
      .addEventListener('click', async () => {
        self.loadMapNation();
      });

    self.element
      .querySelector("button.map__button--city")
      .addEventListener('click', () => {
        self.loadMapState();
      })

    self.element
      .querySelector("select.map__select-immunizers")
      .addEventListener('change', async (event) => {
        const select = event.target;
        this.currentImmunizer = select.options[select.selectedIndex].value;
        self.element.querySelector(".map__title").innerHTML = `${self.mapTitle} ${self.currentImmunizer}`
      });
  }
}
