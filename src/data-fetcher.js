export class DataFetcher {
  constructor(api = "/") {
    this.api = api;
  }

  async requestData(endPoint) {
    const self = this;
    try {
      const response = await fetch(self.api + endPoint);
      const data = await response.json();
      return data;
    } catch (error) {
      // Do Nothing
    }
  }

  async request(endPoint) {
    const self = this;
    const result = await self.requestData(endPoint);
    return result;
  }

  async requestState(endPoint) {
    const self = this;
    const result = await self.requestData("UF/" + endPoint);
    return result;
  }

}


export class DataFetcherCsv extends DataFetcher  {

  constructor(data = {}) {
    super();
    this.data = data;
    this.resultData = {};

    this.init();
  }

  init() {
    const self = this;
    self.resultData = self.csvToJSON(self.data);
  }

  requestData(endPoint) {
    const self = this;
    if (endPoint == "options") {
      return { result: Object.keys(self.resultData) };
    }

    return self.resultData[endPoint];
  }

  csvToJSON (csv) {
    const lines = csv.trim().split('\n');
    const data = {};

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const doenca = values[0];
      const ano = Number(values[1]);
      const estado = values[2];
      const atingido = Number(values[3]);

      if (!data[doenca]) {
        data[doenca] = {};
      }

      if (!data[doenca][ano]) {
        data[doenca][ano] = {};
      }

      if (!data[doenca][ano][estado]) {
        data[doenca][ano][estado] = atingido;
      }
    }

    return data;
  };
}
