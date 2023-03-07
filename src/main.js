import './assets/css/style.css'
import Chart from "chart.js/auto";
import TableActions from "table-actions";

import MapChart from "./map-chart";

export default class MapChartTable {
  constructor(element) {
    this.element = element;
  }

  async init() {
    const self = this;
    self.render();

    const mapChart = new MapChart(this.element.querySelector(".map__canva-section"));
    await mapChart.init();
  }

  render () {
    const self = this;

    const card = `
        <section class="map__canva-section"></section>
        <section class="map__buttons-section-footer">
          <div class="map__select-labeled map__select-labeled--bottom">
            <label class="map__select-label"  for="type" class="text-xs">Tipo</label><br>
            <select class="map__select" name="type" id="type">
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
      .querySelector("select.map__select")
      .addEventListener('change', async (event) => {
        const select = event.target;
        await self.changeType(select.options[select.selectedIndex].value);
      });
  }


  async changeType(value) {

    // Remove all child of section chart
    const canvaSection = document.querySelector(".map__canva-section");
    canvaSection.innerHTML = "";

    if (value === "chart") {
      const canvas = document.createElement("canvas");
      canvas.classList = "map__canva";
      canvas.width = 600;
      canvas.height = 420;
      canvas.id = "canvas";
      document.querySelector(".map__canva-section").appendChild(canvas)

      new Chart(document.getElementById("canvas"), {
        type: 'line',
        data: {
          labels: [2018,2019,2020,2021,2022],
          datasets: [{
            data: [111,133,221,783,2478],
            label: "Vacinações",
            backgroundColor: "rgb(227, 52, 106)",
            borderColor: "rgb(227, 52, 106)",
          }, {
            data: [809,947,1402,3700,267],
            label: "Contaminações",
            backgroundColor: "rgb(64, 42, 196)",
            borderColor: "rgb(64, 42, 196)",
          }]
        },
        options: {
          title: {
            display: true,
            text: 'World population per region (in millions)'
          }
        }
      });
    } else if (value === "map") {
      const canvas = document.createElement("div");
      canvas.classList = "map__canva";
      canvas.id = "canvas";
      document.querySelector(".map__canva-section").appendChild(canvas)

      const mapChart = new MapChart(this.element.querySelector(".map__canva-section"));
      await mapChart.init();
    } else {
      const canvas = document.createElement("div");
      canvas.classList = "map__canva";
      canvas.id = "canvas";
      const result =  `<section class="ta-container">
        <table class="ta ta-responsive-full">
          <thead>
            <tr>
              <th>Estado</th>
              <th>Imunização</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr data-row-id="1">
              <td>Paraíba</td>
              <td>Polio</td>
              <td>1000</td>
            </tr>
            <tr data-row-id="2">
              <td>São Paulo</td>
              <td>COVID-19</td>
              <td>51234</td>
            </tr>
            <tr data-row-id="3">
              <td>Bahia</td>
              <td>BCG</td>
              <td>3442</td>
            </tr>
            <tr data-row-id="4">
              <td>Pernambuco</td>
              <td>Polio</td>
              <td>57456</td>
            </tr>
            <tr data-row-id="4">
              <td>Lorem ipsum</td>
              <td>Polio</td>
              <td>57456</td>
            </tr>
            <tr data-row-id="4">
              <td>Lorem ipsum</td>
              <td>Polio</td>
              <td>57456</td>
            </tr>
          </tbody>
        </table>`

      document.querySelector(".map__canva-section").innerHTML = result;

      new TableActions("table", {
        sortable: true,
        searchable: true,
        paginable: "buttons",
      });
    }

  }
};
