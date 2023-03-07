
export default class MainCard {

  constructor(element, stateButton, cityButton) {
    this.element = element;
    this.title = "Cobertura vacinal para Poliomielite";
    this.stateButton = stateButton;
    this.cityButton = cityButton;

    this.render();
  }

  render () {
    const card = `
      <div class="map">
        <h1 class="map__title">${ this.title }</h1>
        <section class="map__buttons-section">
          <div>
            <button class="map__button map__button--state">Por estado</button>
            <button class="map__button map__button--city">Por município</button>
          </div>
          <div class="map__selects-section">
            <div class="map__select-labeled">
              <label class="map__select-label"  for="imunizantes" class="text-xs">Imunizante</label><br>
              <select class="map__select" name="imunizantes" id="imunizantes">
                <option value="Poliomielite">Poliomielite</option>
                <option value="Sarampo">Sarampo</option>
                <option value="BCG">BCG</option>
                <option value="COVID-19">COVID-19</option>
              </select>
            </div>
            <div class="map__select-labeled">
              <label class="map__select-label" for="imunizantes" class="text-xs">Ano</label><br>
              <select class="map__select" name="imunizantes" id="imunizantes">
                <option value="2020">2020</option>
                <option value="2021">2021</option>
                <option value="2022">2022</option>
              </select>
            </div>
          </div>
        </section>
        <section class="map__canva-section">
          <div id="canvas" class="map__canva" width="600" height="420"></div>
        </section>
        <section class="map__buttons-section-footer">
          <div class="map__select-labeled map__select-labeled--bottom">
            <label class="map__select-label"  for="type" class="text-xs">Tipo</label><br>
            <select class="map__select" name="type" id="type">
              <option onclick="changeType(this.value)" value="map">Mapa</option>
              <option onclick="changeType(this.value)" value="chart">Gráfico</option>
              <option onclick="changeType(this.value)" value="table">Tabela</option>
            </select>
          </div>
        </section>
      </div>
    </section>
    `

    this.element.innerHTML = card;
    this.element.querySelector("button.map__button--state").addEventListener('click', async () => {
      this.stateButton();
    });
    this.element.querySelector("button.map__button--city").addEventListener('click', () => {
      this.cityButton();
    })
  }
}
