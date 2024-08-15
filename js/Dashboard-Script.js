import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyD1pFPja6Jc47JXJAJLYr0M3PIDLaH-TfQ",
  authDomain: "cropservices-a2575.firebaseapp.com",
  projectId: "cropservices-a2575",
  storageBucket: "cropservices-a2575.appspot.com",
  messagingSenderId: "968472156055",
  appId: "1:968472156055:web:9003f7eaddaa2502e416d2",
};

const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);
const auth = getAuth(firebaseApp);

const btnDashboard = document.querySelector(".btn-dashboard");
const btnTools = document.querySelector(".btn-tools");
const btnMachinery = document.querySelector(".btn-machinery");
const btnLand = document.querySelector(".btn-land");
const btnTransaction = document.querySelector(".btn-transaction");

const containerDashboard = document.querySelector(".dashboard-container");
const containerTools = document.querySelector(".tools-container");
const containerMachinery = document.querySelector(".machinery-container");
const containerLand = document.querySelector(".land-container");
const containerTransaction = document.querySelector(".transaction-container");

const countTools = document.getElementById("tools-count");
const countMachinery = document.getElementById("machinery-count");
const countLand = document.getElementById("land-count");
const countUsers = document.getElementById("users-count");

const profileDropdown = document.querySelector(".profile-dropdown");
const profileDropdownContent = document.querySelector(
  ".profile-dropdown-content"
);

profileDropdown.addEventListener("click", handleProfileDropdown);

function handleProfileDropdown() {
  profileDropdownContent.classList.toggle("active");
}

document.querySelector(".btn-logout").addEventListener("click", () => logout());

function logout() {
  auth.signOut().then(() => {
    window.location.href = "./../index.html";
  });
}

displayCounts();

function displayCounts() {
  const toolsRef = ref(database, "tools");
  const machineryRef = ref(database, "machinery");
  const landRef = ref(database, "land");
  const usersRef = ref(database, "users");

  get(toolsRef).then((snapshot) => {
    if (snapshot.exists()) {
      const toolsData = snapshot.val();

      countTools.textContent = `${Object.keys(toolsData).length}`;
    }
  });

  get(machineryRef).then((snapshot) => {
    if (snapshot.exists()) {
      const machineryData = snapshot.val();

      countMachinery.textContent = `${Object.keys(machineryData).length}`;
    }
  });

  get(landRef).then((snapshot) => {
    if (snapshot.exists()) {
      const landData = snapshot.val();

      countLand.textContent = `${Object.keys(landData).length}`;
    }
  });

  get(usersRef).then((snapshot) => {
    if (snapshot.exists()) {
      const usersData = snapshot.val();

      countUsers.textContent = `${Object.keys(usersData).length}`;
    }
  });
}

displaySection();

function removeStyle() {
  btnDashboard.style.removeProperty("background-color");
  btnTools.style.removeProperty("background-color");
  btnMachinery.style.removeProperty("background-color");
  btnLand.style.removeProperty("background-color");
  btnTransaction.style.removeProperty("background-color");

  containerDashboard.style.display = "none";
  containerTools.style.display = "none";
  containerMachinery.style.display = "none";
  containerLand.style.display = "none";
  containerTransaction.style.display = "none";
}

function displaySection() {
  const currentSection = sessionStorage.getItem("currentSection");
  removeStyle();

  if (currentSection === "tools") {
    btnTools.style.backgroundColor = "cyan";
    containerTools.style.display = "grid";
  } else if (currentSection === "machinery") {
    btnMachinery.style.backgroundColor = "cyan";
    containerMachinery.style.display = "grid";
  } else if (currentSection === "land") {
    btnLand.style.backgroundColor = "cyan";
    containerLand.style.display = "grid";
  } else if (currentSection === "transaction") {
    btnTransaction.style.backgroundColor = "cyan";
    containerTransaction.style.display = "grid";
  } else {
    btnDashboard.style.backgroundColor = "cyan";
    containerDashboard.style.display = "grid";
  }
}

btnDashboard.addEventListener("click", () => {
  sessionStorage.setItem("currentSection", "dashboard");
  displayCounts();
  displaySection();
});

btnTools.addEventListener("click", () => {
  sessionStorage.setItem("currentSection", "tools");
  displaySection();
});

btnMachinery.addEventListener("click", () => {
  sessionStorage.setItem("currentSection", "machinery");
  displaySection();
});

btnLand.addEventListener("click", () => {
  sessionStorage.setItem("currentSection", "land");
  displaySection();
});

btnTransaction.addEventListener("click", () => {
  sessionStorage.setItem("currentSection", "transaction");
  displaySection();
});
