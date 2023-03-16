import { getColor } from "./utils.js";
import { playIcon } from "./icons.js";

export default class MapChart {

  constructor({ element, api, statesAcronym, legendTitle, legendSource }) {
    this.nationMap =
      'https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=image/svg+xml&qualidade=intermediaria&intrarregiao=UF';
    this.stateMap =
      'https://servicodados.ibge.gov.br/api/v3/malhas/estados/25?formato=image/svg+xml&qualidade=intermediaria&intrarregiao=municipio';
    this.element = element;
    this.mapTitle = "Cobertura vacinal para";
    this.api = api;
    this.statesAcronym = statesAcronym;
    this.citiesAcronym = {};
    this.legendTitle = legendTitle;
    this.legendSource = legendSource;
    this.loadFunction = this.loadMapNation;
  }

  async init() {
    const self = this;
    self.render();

    // TODO: Make possible user update states with select
    self.currentState = "PB";
    self.citiesAcronym = await self.api.requestState(`${self.currentState}/citiesAcronym`);

    await self.refreshData()
    await self.loadFunction();
  }

  async refreshData() {
    const self = this;

    await self.sicksUpdate();

    self.datasetStates =
      await self.api.request(self.currentSick);

    self.datasetCities =
      await self.api.requestState("PB/" + self.currentSick);


    self.years = Object.keys(self.datasetStates);
    self.currentYear = self.years[self.years.length - 1];
    self.render();
  }

  async sicksUpdate() {
    const self = this;
    let sicks = {};

    if (self.loadFunction === self.loadMapNation) {
       sicks = await self.api.request("options");
    } else {
       sicks = await self.api.requestState("PB/" + "options");
    }

    self.sicks = sicks.result;
    if (!self.currentSick) {
      self.currentSick = self.sicks[0];
    }
  }

  async loadMapNation() {
    const self = this;

    const result =
      Object.entries(
        self.datasetStates[self.currentYear]
      ).map(([key, val]) =>
        {
          return {
            label: key,
            data: [val]
          }
        }
      )

    await self.applyMap(self.nationMap);
    self.setData({
      datasetStates: result,
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
      datasetStates,
      contentData
    } = {}
  ) {
    const self = this;
    // Querying map country states setting eventListener
    for (const path of self.element.querySelectorAll('#canvas svg path')) {
      const content = contentData ? contentData[path.id] : [];
      const dataset = self.findElement(datasetStates, content);

      if (!dataset || !dataset.data[row]) {
        path.style.fill = "#c7c7c7";
        continue;
      }
      const result = dataset.data[row];
      const resultColor = getColor(result);
      const tooltip = self.element.querySelector(".mct-tooltip")

      path.addEventListener("mousemove", (event) => {
        tooltip.style.left = event.clientX + 5 + window.scrollX + "px";
        tooltip.style.top = event.clientY + 10 + window.scrollY + "px";
      });
      path.addEventListener("mouseover", (event) => {
        path.style.transition = "all 0.3s";
        path.style.fill = "gold";
        tooltip.innerHTML = `
          <article>
            <div class="mct-tooltip__title">${content.name}</div>
            <div class="mct-tooltip__result">${result + " %"}</div>
          </article>`;
        path.style.opacity = "95%";
        tooltip.style.display = "block";
        tooltip.style.left = event.clientX + 5 + window.scrollX + "px";
        tooltip.style.top = event.clientY + 10 + window.scrollY + "px";
      });
      path.addEventListener("mouseleave", () => {
        path.style.fill = resultColor;
        tooltip.style.display = "none";
      });

      path.style.fill = resultColor;
    };

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

      const nameAcronymLowerCase = name.acronym ? name.acronym.toLowerCase() : "";
      const nameNameLowerCase = name.name ? name.name.toLowerCase() : "";

      const labelWithoutSpaces = labelLowerCase.replaceAll(" ", "");

      if (
        labelLowerCase == nameAcronymLowerCase ||
        labelWithoutSpaces == nameNameLowerCase.replaceAll(" ", "") ||
        labelLowerCase == nameNameLowerCase ||
        labelWithoutSpaces == nameNameLowerCase.replaceAll(" ", "")
      ) {
        return object;
      }
    }

    return;
  }

  async loadMapState () {
    const self = this;

    const result =
      Object.entries(
        self.datasetCities[self.currentYear]
      ).map(([key, val]) =>
        {
          return {
            label: key,
            data: [val]
          }
        }
      );

    await self.applyMap(self.stateMap);
    self.setData({
      datasetStates: result,
      contentData: self.citiesAcronym
    })
  }

  render () {
    const self = this;

    const states = [];
    for (const state of Object.values(this.statesAcronym).map(x => x.acronym)) {
      states.push(`<option value="${state}" ${ self.currentState == state ? 'selected' : ''}>${state}</option>`);
    }

    const years = [];
    if(self.years) {
      for (const year of self.years) {
        years.push(`<option value="${year}" ${ self.currentYear == year ? 'selected' : ''}>${year}</option>`);
      }
    }

    const sicks = [];
    if(self.sicks) {
      for (const sick of self.sicks) {
        sicks.push(`<option value="${sick}" ${ self.currentSick === sick ? 'selected' : ''}>${sick}</option>`);
      }
    }

    const map = `
        <h1 class="mct__title">
          ${self.mapTitle} ${self.currentSick ? self.currentSick : "" }
        </h1>
        <section class="mct-buttons">
          <div class="mct-buttons__start">
            <button
              class="mct-button mct__button--state"
              ${ self.loadFunction === self.loadMapNation ? 'disabled' : ''}
            >
              Por estado
            </button>
            <button
              class="mct-button mct__button--city"
              ${ !self.datasetCities || self.loadFunction === self.loadMapState ? 'disabled' : ''}
            >
              Por município
            </button>
          </div>
          <div class="mct-buttons__end">
            ${ self.loadFunction === self.loadMapState ?
            `<div class="mct-select">
              <label class="mct-select__label" for="sick" class="text-xs">Estados</label>
              <select class="mct-select__element mct-select__states" name="sicks" id="sicks" disabled>
                ${states.join("")}
              </select>
            </div>`
            : ""}
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
                ${playIcon}
              </button>
            </div>
          </div>
        </section>
        <section class="mct__canva-section">
          <div id="canvas" class="mct-canva">
            <div class="spinner-container">
              <div id="spinner" class="spinner"></div>
            </div>
          </div>
          <div class="mct-canva-year"></div>
          <div class="mct-legend">
            <div style="display:flex; gap: 4px;">
              <div class="mct-legend__gradient"></div>
              <div class="mct-legend__content">
                <div class="mct-legend-top">100%</div>
                <div class="mct-legend-middle">50%</div>
                <div class="mct-legend-base">0%</div>
              </div>
            </div>
            <div class="mct-legend-text"></div>
            <div class="mct-legend-source"></div>
          </div>
        </section>
        <div class="mct-tooltip"></div>
      `;

    self.element.innerHTML = map;

    // Listeners
    if (self.datasetCities) {
      self.element
        .querySelector("button.mct__button--city")
        .addEventListener('click', async () => {
          self.loadFunction = self.loadMapState;
          await self.refreshData();
          await self.loadFunction();
        });
    }

    self.element
      .querySelector("button.mct__button--state")
      .addEventListener('click', async () => {
        self.loadFunction = self.loadMapNation;
        await self.refreshData();
        await self.loadFunction();
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
        await self.refreshData();
        await self.loadFunction();
      });

    self.element
      .querySelector("select.mct-select__years")
      .addEventListener('change', async (event) => {
        const select = event.target;
        self.currentYear = select.options[select.selectedIndex].value;
        await self.loadFunction();
      });
  }
}
