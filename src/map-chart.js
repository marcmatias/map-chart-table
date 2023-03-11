import { munAcronyms, datasetsMun }  from "./data.js";
import { getColor } from "./utils.js";

export default class MapChart {

  constructor({ element, data, sicks, years, statesAcronym, legendTitle, legendSource }) {
    this.nationMap =
      'https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=image/svg+xml&qualidade=intermediaria&intrarregiao=UF';
    this.stateMap =
      'https://servicodados.ibge.gov.br/api/v3/malhas/estados/25?formato=image/svg+xml&qualidade=intermediaria&intrarregiao=municipio';
    this.element = element;
    this.sicks = sicks;
    this.years = years;

    this.mapTitle = "Cobertura vacinal para";
    this.currentSick = this.sicks[0];
    this.currentYear = this.years[0]
    this.data = data;
    this.statesAcronym = statesAcronym;
    this.legendTitle = legendTitle;
    this.legendSource = legendSource;
  }

  async init() {
    const self = this;

    self.render();
    await self.loadMapNation();
  }

  async loadMapNation() {
    const self = this;

    let datasetsStates =
      self.data.filter(row => row[0] == self.currentSick && row[1] == self.currentYear)
    datasetsStates = datasetsStates.map(row =>
      {
        return {
          label: row[2],
          data: [
            row[3],
          ]
        }
      }
    )

    await self.applyMap(self.nationMap);
    self.setData({
      datasetsStates,
      contentData: self.statesAcronym
    })
  }

  async queryMap(mapUrl) {
    const svg = await fetch(mapUrl);
    const mapText = await svg.text();
    return mapText;
  }

  async applyMap(mapUrl) {
    const self = this;
    const map = await self.queryMap(mapUrl);

    const svgContainer = self.element.querySelector('#canvas');
    svgContainer.innerHTML = map;

    const svgElement = svgContainer.querySelector("svg");
    svgElement.style.maxWidth = "100%";
    svgElement.style.height = "100%";
    svgElement.style.margin = "auto";
    svgElement.style.display = "block";
  }

  setData(
    {
      row = 0,
      datasetsStates,
      contentData
    } = {}
  ) {
    const self = this;
    // Querying map country states setting eventListener
    for (const path of self.element.querySelectorAll('#canvas svg path')) {
      const content = contentData[path.id];
      const dataset = self.findElement(datasetsStates, content);

      if (!dataset || !dataset.data[row]) {
        path.style.fill = "#c7c7c7";
        continue;
      }

      path.style.fill =
        getColor(dataset.data[row])
    };

    self.element.querySelector(".mct-legend-top").innerHTML = "100%";
    self.element.querySelector(".mct-legend-middle").innerHTML = "50%";
    self.element.querySelector(".mct-legend-base").innerHTML = "0%";
    if (self.legendTitle) {
      self.element.querySelector(".mct-legend-text").innerHTML = self.legendTitle;
    }
    if (self.legendSource) {
      self.element.querySelector(".mct-legend-source").innerHTML = "Fonte: " + self.legendSource;
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
    const self = this;
    await self.applyMap(self.stateMap);
    self.setData({
      datasetsStates: datasetsMun,
      contentData: munAcronyms
    });
  }

  render () {
    const self = this;

    const years = [] ;
    for (const year of self.years) {
      years.push(`<option value="${year}">${year}</option>`);
    }

    const sicks = [];

    for (const sick of self.sicks) {
      sicks.push(`<option value="${sick}">${sick}</option>`);
    }

    const title = `${self.mapTitle} ${self.currentSick}`;
    const map = `
        <h1 class="mct__title">${ title }</h1>
        <section class="mct-buttons">
          <div class="mct-buttons__start">
            <button class="mct-button mct__button--state">Por estado</button>
            <button class="mct-button mct__button--city">Por município</button>
          </div>
          <div class="mct-buttons__end">
            <div class="mct-select">
              <label class="mct-select__label" for="sick" class="text-xs">Doença</label>
              <select class="mct-select__element mct-select__sicks" name="sicks" id="sicks">
                ${sicks.join("")}
              </select>
            </div>
            <div class="mct-select">
              <label class="mct-select__label" for="years" class="text-xs">Ano</label>
              <select class="mct-select__element mct-select__years" name="years" id="years">
                ${years.join("")}
              </select>
            </div>
            <div class="mct-container-button-play">
              <button class="mct-button mct-button--play" title="Clique para executar demonstração de todos os anos">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" class="mct-icon" viewBox="0 0 16 16">
                  <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                </svg>
              </button>
            </div>
          </div>
        </section>
        <section class="mct__canva-section">
          <div id="canvas" class="mct-canva"></div>
          <div class="mct-canva-year"></div>
          <div class="mct-legend">
            <div class="" style="display:flex; gap: 4px;">
              <div class="mct-legend__gradient"></div>
              <div class="mct-legend__content">
                <div class="mct-legend-top"></div>
                <div class="mct-legend-middle"></div>
                <div class="mct-legend-base"></div>
              </div>
            </div>
            <div class="mct-legend-text"></div>
            <div class="mct-legend-source"></div>
          </div>
        </section>
      `;

    self.element.innerHTML = map;

    // Listeners
    self.element
      .querySelector("button.mct__button--state")
      .addEventListener('click', async () => {
        await self.loadMapNation();
      });

    self.element
      .querySelector("button.mct__button--city")
      .addEventListener('click', async () => {
        await self.loadMapState();
      });

    self.element
      .querySelector("button.mct-button--play")
      .addEventListener('click', async (e) => {
        const selectYears = self.element.querySelector("select.mct-select__years");
        const yearDisplay = self.element.querySelector(".mct-canva-year");
        yearDisplay.style.opacity = "1";
        selectYears.disabled = true;
        e.target.disabled = true;
        const select = self.element.querySelector("select.mct-select__years");
        for (const year of self.years) {
          select.value = year;
          yearDisplay.innerHTML = year;
          select.dispatchEvent(new Event('change'));
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
        e.target.disabled = false;
        selectYears.disabled = false;
        yearDisplay.style.opacity = "0";
      });

    self.element
      .querySelector("select.mct-select__sicks")
      .addEventListener('change', async (event) => {
        const select = event.target;
        self.currentSick = select.options[select.selectedIndex].value;
        self.element.querySelector(".mct__title").innerHTML = `${self.mapTitle} ${self.currentSick}`
        await self.loadMapNation()
      });

    self.element
      .querySelector("select.mct-select__years")
      .addEventListener('change', async (event) => {
        const select = event.target;
        self.currentYear = select.options[select.selectedIndex].value;
        await self.loadMapNation()
      });
  }
}
