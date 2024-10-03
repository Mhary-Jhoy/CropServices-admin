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
const btnPending = document.querySelector(".btn-pending");
const btnHiring = document.querySelector(".btn-hiring");

const containerDashboard = document.querySelector(".dashboard-container");
const containerTools = document.querySelector(".tools-container");
const containerMachinery = document.querySelector(".machinery-container");
const containerLand = document.querySelector(".land-container");
const containerTransaction = document.querySelector(".transaction-container");
const containerPending = document.querySelector(".pending-container");
const containerHiring = document.querySelector(".hiring-container");

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
  btnPending.style.removeProperty("background-color");
  btnHiring.style.removeProperty("background-color");

  containerDashboard.style.display = "none";
  containerTools.style.display = "none";
  containerMachinery.style.display = "none";
  containerLand.style.display = "none";
  containerTransaction.style.display = "none";
  containerPending.style.display = "none";
  containerHiring.style.display = "none";
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
  } else if (currentSection === "pending") {
    btnPending.style.backgroundColor = "cyan";
    containerPending.style.display = "grid";
  } else if (currentSection === "hiring") {
    btnHiring.style.backgroundColor = "cyan";
    containerHiring.style.display = "grid";
  } else {
    btnDashboard.style.backgroundColor = "cyan";
    containerDashboard.style.display = "grid";
  }
}

btnDashboard.addEventListener("click", () => {
  sessionStorage.setItem("currentSection", "dashboard");
  displayCounts();
  displaySection();
  displayLineGraph();
  displayPieGraph();
  displayDonutGraph();
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

btnPending.addEventListener("click", () => {
  sessionStorage.setItem("currentSection", "pending");
  displaySection();
});

btnHiring.addEventListener("click", () => {
  sessionStorage.setItem("currentSection", "hiring");
  displaySection();
});

// =================================================================================================================================================

let lineGraphInstance = null;
let pieGraphInstance = null;
let donutGraphInstance = null;

async function getArrayData(type) {
  const snapshot = await get(ref(database, `graphData/${type}`));
  const snapshotData = snapshot.val();

  const monthlyData = Array(12).fill(0);

  if (snapshotData) {
    for (let i = 0; i < 12; i++) {
      const monthKey = i + 1;

      if (snapshotData[monthKey] !== undefined) {
        monthlyData[i] = snapshotData[monthKey];
      }
    }
  }

  return monthlyData;
}

// displayLineGraph();
async function displayLineGraph() {
  let machineryMonthData = await getArrayData("machinery");
  let landMonthData = await getArrayData("land");
  let toolsMonthData = await getArrayData("tools");

  var ctx = document.getElementById("line-chart-canvas").getContext("2d");

  var config = {
    type: "line",
    data: {
      labels: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
      datasets: [
        {
          label: "Machinery",
          backgroundColor: "rgba(87, 198, 213, 0.5)",
          borderColor: "#6ce5e8",
          data: machineryMonthData,
          fill: true,
        },
        {
          label: "Land",
          backgroundColor: "rgba(92, 189, 234, 0.5)",
          borderColor: "#41b8d5",
          data: landMonthData,
          fill: true,
        },
        {
          label: "Tools",
          backgroundColor: "rgba(36, 72, 98, 0.5)",
          borderColor: "#2d8bba",
          data: toolsMonthData,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: "Machinery, Land, and Tools Over Time",
      },
      tooltips: {
        mode: "index",
        intersect: false,
      },
      hover: {
        mode: "nearest",
        intersect: true,
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            // text: "Time Period",
          },
        },
        y: {
          display: true,
          beginAtZero: true,
          title: {
            display: true,
            text: "Value",
          },
        },
      },
      legend: {
        display: true,
        onClick: function (e, legendItem) {
          var index = legendItem.datasetIndex;
          var chart = this.chart;
          var meta = chart.getDatasetMeta(index);

          meta.hidden =
            meta.hidden === null ? !chart.data.datasets[index].hidden : null;
          chart.update();
        },
      },
    },
  };

  if (lineGraphInstance) {
    lineGraphInstance.destroy();
  }

  // window.onload = function () {};
  lineGraphInstance = new Chart(ctx, config);
}

// displayPieGraph();
async function displayPieGraph() {
  const graphSnapshot = await get(ref(database, "graphData"));
  const graphData = graphSnapshot.val();

  if (!graphData) {
    console.log("No data available.");
    return;
  }

  const accepted = graphData.accepted || 0;
  const rejected = graphData.rejected || 0;
  const total = graphData.acceptedRejectedTotal || 1;

  const acceptedPercentage = ((accepted / total) * 100).toFixed(2);
  const rejectedPercentage = ((rejected / total) * 100).toFixed(2);

  document.getElementById(
    "pie-graph-rejected"
  ).innerHTML = `Rejected: ${rejectedPercentage}%`;
  document.getElementById(
    "pie-graph-accepted"
  ).innerHTML = `Accepted: ${acceptedPercentage}%`;

  var ctx = document.getElementById("pieChart").getContext("2d");

  if (pieGraphInstance) {
    pieGraphInstance.destroy();
  }

  pieGraphInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Accepted", "Rejected"],
      datasets: [
        {
          data: [acceptedPercentage, rejectedPercentage],
          backgroundColor: ["#41b8d5", "#ff2f2f"],
          borderWidth: 2,
          borderColor: "#fff",
        },
      ],
    },
    options: {
      tooltips: {
        callbacks: {
          label: function (tooltipItem, data) {
            var label = data.labels[tooltipItem.index];
            var currentValue =
              data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
            return label + ": " + currentValue + "%";
          },
        },
      },
      legend: {
        display: false,
      },
      plugins: {
        legend: {
          display: false,
        },
      },
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

// displayDonutGraph();
async function displayDonutGraph() {
  const donuts = document.querySelectorAll(".graph-donut");

  donuts.forEach(async (donut, index) => {
    let available = 0;
    let inUse = 0;
    let total = 0;

    if (index === 0) {
      [available, inUse, total] = await checkAvailability("land");
    } else if (index === 1) {
      [available, inUse, total] = await checkAvailability("machinery");
    } else if (index === 2) {
      [available, inUse, total] = await checkAvailability("tools");
    }

    let percent = total > 0 ? ((available / total) * 100).toFixed(2) : 0;

    const canvas = donut.querySelector("canvas");
    const context = canvas.getContext("2d");
    const size = (canvas.width = canvas.height = 152);
    const lineWidth = 15;
    const radius = (size - lineWidth) / 2;
    const startAngle = -0.5 * Math.PI;

    const drawCircle = (color, lineWidth, percent) => {
      context.beginPath();
      context.arc(
        size / 2,
        size / 2,
        radius,
        startAngle,
        startAngle + percent * 2 * Math.PI
      );
      context.strokeStyle = color;
      context.lineWidth = lineWidth;
      context.stroke();
    };

    drawCircle("#6ce5e8", lineWidth, 1);

    const endPercent = percent / 100;
    drawCircle("#41b8d5", lineWidth, endPercent);

    donut.querySelector(".percent").textContent = percent;
    donut.querySelector(".graphTotal").textContent = total;
    donut.querySelector(".graphUse").textContent = inUse;
    donut.querySelector(".graphAvailable").textContent = available;
  });
}

window.onload = () => {
  displayLineGraph();
  displayPieGraph();
  displayDonutGraph();
};

async function checkAvailability(type) {
  const itemsRef = ref(database, `${type}`);
  const snapshot = await get(itemsRef);
  const itemsData = snapshot.val();

  if (!itemsData) {
    return [0, 0, 0];
  }

  let available = 0;
  let inUse = 0;
  let total = 0;

  for (const itemID in itemsData) {
    const item = itemsData[itemID];

    if (type === "land") {
      total++;

      if (item.available == true) {
        available++;
      } else {
        inUse++;
      }
    } else {
      const availableStartDate = new Date(item.availableStartDate);
      const availableEndDate = new Date(item.availableEndDate);

      const notAvailableRef = ref(
        database,
        `${type}/${itemID}/notAvailableDates`
      );
      const notAvailableSnapshot = await get(notAvailableRef);
      const notAvailableData = notAvailableSnapshot.val();

      total += 1;

      if (!notAvailableData) {
        available += 1;
      } else {
        let dateIsAvailable = false;

        for (const uid in notAvailableData) {
          const notAvailableEntry = notAvailableData[uid];
          const notAvailableStart = new Date(notAvailableEntry.dateStart);
          const notAvailableEnd = new Date(notAvailableEntry.dateEnd);

          for (
            let d = new Date(availableStartDate);
            d <= availableEndDate;
            d.setDate(d.getDate() + 1)
          ) {
            if (d < notAvailableStart || d > notAvailableEnd) {
              dateIsAvailable = true;
              break;
            }
          }

          if (dateIsAvailable) {
            break;
          }
        }

        if (dateIsAvailable) {
          available += 1;
        }
        inUse += 1;
      }
    }
  }

  return [available, inUse, total];
}
