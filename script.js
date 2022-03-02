const url =
  "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party";
const token = "76458ba41488f33b809fa7e53b9f270f71de85eb";

const options = {
  method: "POST",
  mode: "cors",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: "Token " + token,
  },
};

class customSearchInput extends HTMLElement {
  constructor() {
    super();
    this.response;
    this.options;
    this.input;
    this.info;
  }

  connectedCallback() {
    let html = document.importNode(customSearchInputTemplate.content, true);
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(html);

    this.shadowRoot.querySelector(".input-label").textContent +=
      " " + this.getAttribute("label");

    this.shadowRoot
      .querySelector(".input")
      .setAttribute("placeholder", this.getAttribute("placeholder"));

    this.options = this.shadowRoot.querySelector("#options select");
    this.input = this.shadowRoot.querySelector("input");
    this.info = this.shadowRoot.querySelector(".input-info");

    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        if (/^\d{10}$/.test(e.target.value)) {
          this.search(e.target.value, this.fillByInn.bind(this));
          this.input.blur();
        }
      } else if (e.key === undefined) {
        setTimeout(() => {
          this.fillInputs(this.input.value);
          this.input.blur();
        });
      }
    });
    this.input.addEventListener("input", (e) => {
      this.search(e.target.value, this.renderOptions.bind(this));
    });
  }

  search(value, callback) {
    fetch(url, {
      ...options,
      body: JSON.stringify({ query: value }),
    })
      .then((response) => response.text())
      .then((result) => {
        this.options.innerHTML = "";
        this.response = [];
        let resultParse = JSON.parse(result);
        this.response = resultParse;
        callback(resultParse);
      })
      .catch((error) => {
        this.options.innerHTML = "";
        this.response = [];
        console.log("error", error);
      });
  }

  renderOptions(response) {
    if (response.suggestions.length) {
      response.suggestions.forEach((item) => {
        let option = document.createElement("option");
        option.value = item.value;
        option.textContent = `${item.data.inn} ${item.data.address.value}`;
        this.options.appendChild(option);
      });

      let disabledOption = document.createElement("option");
      disabledOption.value = "Выберите вариант или продолжите ввод";
      disabledOption.setAttribute("readonly", true);
      disabledOption.textContent = "Выберите вариант или продолжите ввод";
      this.options.appendChild(disabledOption);
    }
  }

  fillByInn(response) {
    if (response.suggestions.length) {
      this.fillInputs(response.suggestions[0].value);
    } else {
      alert("Нет такой компании");
    }
  }

  fillInputs(value) {
    let inputs = {
      name: document.querySelector("#short-name"),
      fullName: document.querySelector("#full-name"),
      inn: document.querySelector("#inn"),
      address: document.querySelector("#address"),
    };

    let findetItem = this.response.suggestions.find(
      (item) => item.value === value
    );

    this.info.innerHTML = `Организация (${findetItem.data.type})`;
    inputs.name.shadowRoot.querySelector("input").value = findetItem.value;
    inputs.fullName.shadowRoot.querySelector("input").value =
      findetItem.data.name.full_with_opf;
    inputs.inn.shadowRoot.querySelector(
      "input"
    ).value = `${findetItem.data.inn} / ${findetItem.data.kpp}`;
    inputs.address.shadowRoot.querySelector("input").value =
      findetItem.data.address.value;
  }
}

class customInput extends HTMLElement {
  connectedCallback() {
    let html = document.importNode(customInputTemplate.content, true);
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(html);
    this.shadowRoot.querySelector(".input-label").textContent +=
      " " + this.getAttribute("label");
  }
}

customElements.define("custom-search", customSearchInput);
customElements.define("custom-input", customInput);
