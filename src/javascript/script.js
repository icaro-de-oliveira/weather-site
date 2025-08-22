const apiKey = "8a60b2de14f7a17c7a11706b2cfcd87c";

const formBusca = document.getElementById("formBusca");
const cidadeInput = document.getElementById("cidadeInput");
const resultadoDiv = document.getElementById("resultado");
const ilustracaoDiv = document.getElementById("ilustracao");

const climaTemplate = document.getElementById("climaTemplate");
const loader = document.getElementById("loader");
const erroMensagem = document.getElementById("erroMensagem");
const cidadeNomeEl = document.getElementById("cidadeNome");
const climaIconEl = document.getElementById("climaIcon");
const climaTempEl = document.getElementById("climaTemp");
const climaDescEl = document.getElementById("climaDesc");
const tempMaxEl = document.getElementById("tempMax");
const tempMinEl = document.getElementById("tempMin");
const umidadeEl = document.getElementById("umidade");
const ventoEl = document.getElementById("vento");

function mostrarElemento(elemento) {
  elemento.classList.remove("hidden");
}

function esconderElemento(elemento) {
  elemento.classList.add("hidden");
}

function mostrarLoader() {
  esconderElemento(climaTemplate);
  esconderElemento(erroMensagem);
  mostrarElemento(loader);
}

function mostrarErro(mensagem) {
  esconderElemento(climaTemplate);
  esconderElemento(loader);
  erroMensagem.textContent = mensagem;
  mostrarElemento(erroMensagem);
}

function mostrarClima(data) {
  esconderElemento(loader);
  esconderElemento(erroMensagem);

  cidadeNomeEl.textContent = `${data.name}, ${data.sys.country}`;
  climaIconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  climaTempEl.textContent = `${Math.round(data.main.temp)}°C`;
  climaDescEl.textContent = data.weather[0].description;
  tempMaxEl.textContent = `${data.main.temp_max.toFixed(1)}°C`;
  tempMinEl.textContent = `${data.main.temp_min.toFixed(1)}°C`;
  umidadeEl.textContent = `${data.main.humidity}%`;
  ventoEl.textContent = `${data.wind.speed.toFixed(1)} km/h`;

  mostrarElemento(climaTemplate);
}

function buscarClimaPorCoordenadas(lat, lon) {
  mostrarLoader();
  ilustracaoDiv.innerHTML = "";

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pt_br`;

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Não foi possível localizar...");
      }
      return response.json();
    })
    .then((data) => {
      mostrarClima(data);
    })
    .catch((error) => {
      mostrarErro(error.message);
    });
}

window.addEventListener("DOMContentLoaded", () => {
  const ultimaCidade = localStorage.getItem("ultimaCidade");
  if (ultimaCidade) {
    buscarClimaPorNome(ultimaCidade);
  } else if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        buscarClimaPorCoordenadas(
          position.coords.latitude,
          position.coords.longitude
        );
      },
      (error) => {}
    );
  }

  function buscarClimaPorNome(cidade) {
    ilustracaoDiv.innerHTML = "";
    mostrarLoader();
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${apiKey}&units=metric&lang=pt_br`;
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Não foi possível localizar...");
        }
        return response.json();
      })
      .then((data) => {
        mostrarClima(data);
      })
      .catch((error) => {
        mostrarErro(error.message);
      });
  }
});

formBusca.addEventListener("submit", (e) => {
  e.preventDefault();
  const cidade = cidadeInput.value.trim();
  ilustracaoDiv.innerHTML = "";
  if (cidade === "") {
    mostrarErro("Digite uma cidade!");
    return;
  }
  mostrarLoader();
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${apiKey}&units=metric&lang=pt_br`;
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Não foi possível localizar...");
      }
      return response.json();
    })
    .then((data) => {
      mostrarClima(data);
      cidadeInput.value = "";
      localStorage.setItem("ultimaCidade", cidade);
    })
    .catch((error) => {
      mostrarErro(error.message);
      ilustracaoDiv.innerHTML = `<svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="60" cy="70" rx="50" ry="10" fill="#e0e7ef"/><circle cx="40" cy="50" r="18" fill="#6d8cff"/><circle cx="80" cy="55" r="12" fill="#a0c4ff"/><circle cx="70" cy="40" r="6" fill="#fff"/><rect x="55" y="60" width="10" height="10" rx="2" fill="#3b82f6"/><text x="60" y="78" text-anchor="middle" font-size="10" fill="#888">?</text></svg>`;
    });
});
