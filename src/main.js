import { selectElement } from "./utils";
import './assets/css/style.css'
import Chart from "chart.js/auto";
import TableActions from "table-actions";
import { DataFetcher } from "./data-fetcher.js";

import MapChart from "./map-chart";

export default class MapChartTable {

  constructor(element) {
    this.element = element;
    this.api = new DataFetcher("api/");
  }

  async refreshData() {
    const self = this;

    self.currentResult = await self.api.request(self.currentSick);
    self.years = Object.keys(self.currentResult);
  }

  async init() {
    const self = this;
    self.render();


    const [statesAcronym, sicks] =  await Promise.all(
      [
        self.api.request("statesAcronym"),
        self.api.request("options")
      ]
    );

    self.statesAcronym = statesAcronym;
    self.sicks = sicks.result;

    const states = [];
    for (const [, value] of Object.entries(self.statesAcronym)){
      states.push(value.acronym)
    }

    self.states = states.sort();
    self.currentState = states[0];

    self.currentSick = self.sicks[0];


    await self.refreshData();

    const mapChart =
      new MapChart({
        element: this.element.querySelector(".mct__canva-section"),
        api: self.api,
        states: self.statesAcronym,
        legendTitle: "Porcentagem de vacinação da população brasileira",
        legendSource: "IBGE 2023."
      });
    await mapChart.init();
  }

  render() {
    const self = this;

    const card = `
        <section class="mct__canva-section"></section>
        <section class="mct-buttons__footer">
          <div class="mct-select">
            <label class="mct-select__label" for="type" class="text-xs">Tipo</label>
            <select class="mct-select__element" name="type" id="type">
              <option value="map">Mapa</option>
              <option value="chart">Gráfico</option>
              <option value="table">Tabela</option>
            </select>
          </div>
        </section>
    `

    // Ploting element
    self.element.innerHTML = card;

    self.element
      .querySelector("select.mct-select__element")
      .addEventListener('change', async (event) => {
        const select = event.target;
        await self.changeType(select.options[select.selectedIndex].value);
      });
  }

  convertObjectToArray(obj) {
    const result = [];

    // Get the keys of the object and sort them in ascending order
    const years = Object.keys(obj).sort();

    // Push the headers (year, acronym, value) to the result array
    result.push(['Ano', 'Sigla', 'Resultado']);

    // Loop through each year
    for (const year of years) {
      // Loop through each state in the year
      for (const [acronym, value] of Object.entries(obj[year])) {
        // Push the year, acronym, and value to the result array as an array
        result.push([year, acronym, value]);
      }
    }

    return result;
  }

  // TODO: Add select to change sick type
  plotTable() {
    const self = this;
    const tableData = self.convertObjectToArray(self.currentResult);
    const columns = [];
    for (const column of tableData[0]){
      columns.push(`<th>${column.charAt(0).toUpperCase() + column.slice(1)}</th>`)
    }

    const rows = [];
    for (let i = 1; i < tableData.length; i++) {
      const cells = [];
      for (const row of tableData[i]) {
          cells.push(`<td>${row}</td>`);
      }
      rows.push(
        `<tr>${cells.join("")}</tr>`
      )
    }
    const canvas = document.createElement("div");
    canvas.classList = "mct__canva";
    canvas.id = "canvas";

    const result =  `<h1 class="mct__title">Tabela de dados</h1>
      <section class="ta-container">
        <table class="ta">
          <thead>
            <tr>
              ${columns.join("")}
            </tr>
          </thead>
          <tbody>
            ${rows.join("")}
          </tbody>
        </table>
      </section>`

    document.querySelector(".mct__canva-section").innerHTML = result;

    new TableActions("table", {
      sortable: true,
      searchable: true,
      paginable: "buttons",
      rowsPerPage: 8,
    });
  }

  plotChart() {
    const self = this;

    const canvas = document.createElement("canvas");
    canvas.classList = "mct-canva";
    canvas.style.maxHeight = "475px";
    canvas.id = "canvas";

    const h1 = document.createElement("h1")
    h1.classList = "mct__title";
    h1.innerText = `Cobertura vacinal para ${self.currentSick}`

    const div = document.createElement("div");
    div.style = "display: flex; gap: 4px; justify-content: end; margin-bottom: 20.5px";


    const selectSick = selectElement("doença", self.sicks, self.currentSick);
    const selectState = selectElement("estado", self.states, self.currentState);

    div.appendChild(selectSick)
    div.appendChild(selectState)

    document.querySelector(".mct__canva-section").appendChild(h1);
    document.querySelector(".mct__canva-section").appendChild(div);
    document.querySelector(".mct__canva-section").appendChild(canvas);

    document.querySelector(".mct__canva-section")
      .querySelector("select.mct-select__doença")
      .addEventListener('change', async (event) => {
        const select = event.target;
        self.currentSick = select.options[select.selectedIndex].value;
        self.refreshData();
        self.changeType("chart");
      });

    document.querySelector(".mct__canva-section")
      .querySelector("select.mct-select__estado")
      .addEventListener('change', async (event) => {
        const select = event.target;
        self.currentState = select.options[select.selectedIndex].value;
        self.refreshData();
        self.changeType("chart");
      });

    new Chart(document.getElementById("canvas"), {
      type: 'line',
      data: {
        labels: [...self.years],
        datasets: [
          {
            data: self.years.map(year => self.currentResult[year][self.currentState]),
            label: self.currentState,
            backgroundColor: "rgb(227, 52, 106)",
            borderColor: "rgb(227, 52, 106)",
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Ano'
            }
          },
          y: {
            ticks: {
              // Include a dollar sign in the ticks
              callback: function(value, index, ticks) {
                return value + "%";
              }
            },
            title: {
              display: true,
              text: 'Porcentagem'
            }
          }
        }
      }
    });
  }

  async changeType(value) {
    const self = this;

    // Remove all child of section chart
    const canvaSection = document.querySelector(".mct__canva-section");
    canvaSection.innerHTML = "";

    if (value === "chart") {
      self.plotChart();
    } else if (value === "map") {
      const canvas = document.createElement("div");
      canvas.classList = "mct-canva";
      canvas.id = "canvas";
      document.querySelector(".mct__canva-section").appendChild(canvas)

      const mapChart =
        new MapChart({
          element: this.element.querySelector(".mct__canva-section"),
          api: self.api,
          states: self.statesAcronym,
          legendTitle: "Porcentagem de vacinação da população brasileira",
          legendSource: "IBGE 2023."
        });
      await mapChart.init();
    } else {
      self.plotTable();
    }
  }
};
