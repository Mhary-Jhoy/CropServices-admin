import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  get,
  push,
  child,
  remove,
  update,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import {
  getStorage,
  ref as storageRef,
  getDownloadURL,
  uploadBytes,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyD1pFPja6Jc47JXJAJLYr0M3PIDLaH-TfQ",
  authDomain: "cropservices-a2575.firebaseapp.com",
  projectId: "cropservices-a2575",
  storageBucket: "cropservices-a2575.appspot.com",
  messagingSenderId: "968472156055",
  appId: "1:968472156055:web:9003f7eaddaa2502e416d2",
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const database = getDatabase(firebaseApp);
const storage = getStorage(firebaseApp);

const landContainer = document.querySelector(".land-container");

const btnAddLandNav = landContainer.querySelector(".btn-add-land");
const addLandContainer = landContainer.querySelector(".add-land-container");

const inpImg = document.getElementById("land-inp-img");
const inpOwner = document.getElementById("land-inp-owner");
const inpContact = document.getElementById("land-inp-contact");
const inpLocation = document.getElementById("land-inp-location");
const inpHectare = document.getElementById("land-inp-hectare");
const inpSquareMeter = document.getElementById("land-inp-square-meter");
const inpPrice = document.getElementById("land-inp-price");
const btnInsertLand = document.querySelector(".btn-insert-land");

const btnLand = document.querySelector(".btn-land");

// const btnSetToolsDate = document.getElementById("set-land-date");
// const inpStartDate = document.getElementById("land-inp-start-date");
// const inpEndDate = document.getElementById("land-inp-end-date");
// const btnChangeDate = document.getElementById("btn-land-change-date");

// const calendarSection = document.getElementById("calendar-section");
const addOverlay = document.getElementById("add-overlay");

// function displayCalendar(data) {
//   const startDateInput = document.querySelector("#start-date");
//   const endDateInput = document.querySelector("#end-date");
//   const datesContainer = document.querySelector("#dates");
//   const monthTitle = document.querySelector("#month-title");
//   const prevMonthBtn = document.querySelector("#prev-month");
//   const nextMonthBtn = document.querySelector("#next-month");
//   const btnSave = document.getElementById("btn-calendar-save");
//   const btnCancel = document.getElementById("btn-calendar-cancel");
//   btnSave.classList.add("disabled");

//   btnCancel.addEventListener("click", () => {
//     calendarSection.style.display = "none";
//     if (data) {
//       addOverlay.classList.remove("active");
//     }
//   });

//   let currentMonth = new Date().getMonth();
//   let currentYear = new Date().getFullYear();
//   let selectedStartDate = null;
//   let selectedEndDate = null;

//   let availableStartDate = data
//     ? new Date(data.availableStartDate + "T00:00:00")
//     : null;
//   let availableEndDate = data
//     ? new Date(data.availableEndDate + "T00:00:00")
//     : null;
//   let notAvailableDates = [];

//   if (data) {
//     notAvailableDates = data.notAvailableDates
//       ? data.notAvailableDates.map((date) => new Date(date + "T00:00:00"))
//       : [];
//   }

//   function generateCalendar(month, year) {
//     datesContainer.innerHTML = "";
//     const firstDay = new Date(year, month).getDay() || 7;
//     const daysInMonth = new Date(year, month + 1, 0).getDate();

//     monthTitle.textContent = new Date(year, month).toLocaleString("default", {
//       month: "long",
//       year: "numeric",
//     });

//     for (let i = 1; i < firstDay; i++) {
//       const blank = document.createElement("div");
//       blank.classList.add("day", "date");
//       datesContainer.appendChild(blank);
//     }

//     for (let day = 1; day <= daysInMonth; day++) {
//       const dayElement = document.createElement("div");
//       dayElement.classList.add("day", "date");
//       dayElement.textContent = day;

//       const currentDate = new Date(year, month, day);

//       if (availableStartDate && availableEndDate) {
//         if (
//           currentDate >= availableStartDate &&
//           currentDate <= availableEndDate
//         ) {
//           if (
//             notAvailableDates.some(
//               (date) => date.getTime() === currentDate.getTime()
//             )
//           ) {
//             dayElement.classList.add("not-available");
//           } else {
//             dayElement.classList.add("available");
//           }
//         }
//       }

//       dayElement.addEventListener("click", () => selectDate(currentDate));
//       datesContainer.appendChild(dayElement);
//     }

//     highlightDates();
//   }

//   function selectDate(date) {
//     if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
//       selectedStartDate = date;
//       selectedEndDate = null;
//     } else if (date < selectedStartDate) {
//       selectedStartDate = date;
//     } else {
//       selectedEndDate = date;
//     }

//     startDateInput.value = selectedStartDate.toLocaleDateString("en-CA");
//     endDateInput.value = selectedEndDate
//       ? selectedEndDate.toLocaleDateString("en-CA")
//       : "";

//     if (startDateInput.value && endDateInput.value) {
//       btnSave.classList.remove("disabled");

//       btnSave.addEventListener("click", async () => {
//         if (data) {
//           update(ref(database, `land/${data.ID}`), {
//             availableStartDate: startDateInput.value,
//             availableEndDate: endDateInput.value,
//           }).then(() => {
//             addOverlay.classList.remove("active");
//             window.location.reload();
//           });
//         }

//         calendarSection.style.display = "none";
//         inpStartDate.value = startDateInput.value;
//         inpEndDate.value = endDateInput.value;
//       });
//     } else {
//       btnSave.classList.add("disabled");
//     }

//     highlightDates();
//   }

//   function highlightDates() {
//     const dates = document.querySelectorAll(".date");

//     dates.forEach((date) => {
//       const dateNumber = parseInt(date.textContent);
//       if (!isNaN(dateNumber)) {
//         const dateObj = new Date(currentYear, currentMonth, dateNumber);
//         date.classList.remove("selected-range");

//         if (selectedStartDate && selectedEndDate) {
//           if (dateObj >= selectedStartDate && dateObj <= selectedEndDate) {
//             date.classList.add("selected-range");
//           }
//         } else if (
//           selectedStartDate &&
//           !selectedEndDate &&
//           dateObj.getTime() === selectedStartDate.getTime()
//         ) {
//           date.classList.add("selected-range");
//         }
//       }
//     });
//   }

//   function changeMonth(direction) {
//     currentMonth += direction;
//     if (currentMonth < 0) {
//       currentMonth = 11;
//       currentYear -= 1;
//     } else if (currentMonth > 11) {
//       currentMonth = 0;
//       currentYear += 1;
//     }
//     generateCalendar(currentMonth, currentYear);
//   }

//   startDateInput.addEventListener("input", highlightDates);
//   endDateInput.addEventListener("input", highlightDates);
//   prevMonthBtn.addEventListener("click", () => changeMonth(-1));
//   nextMonthBtn.addEventListener("click", () => changeMonth(1));

//   generateCalendar(currentMonth, currentYear);
// }

document
  .getElementById("btn-dashboard-land")
  .addEventListener("click", () => btnLand.click());

btnLand.addEventListener("click", () => {
  displayLand();
});

btnInsertLand.addEventListener("click", async () => {
  if (
    inpImg.files.length > 0 &&
    inpOwner.value &&
    inpLocation.value &&
    inpContact.value &&
    inpHectare.value &&
    inpSquareMeter.value &&
    inpPrice.value
  ) {
    const img = inpImg.files[0];

    try {
      const landRef = ref(database, "land");
      const newLandRef = push(landRef);
      const landID = newLandRef.key;

      const imgStorageRef = storageRef(storage, `land/${landID}/${img.name}`);
      const snapshot = await uploadBytes(imgStorageRef, img);

      let uniqueNumber;
      let isUnique = false;

      while (!isUnique) {
        uniqueNumber = Math.floor(1000 + Math.random() * 9000);

        const querySnapshot = await get(landRef);
        if (querySnapshot.exists()) {
          const landData = querySnapshot.val();
          isUnique = !Object.values(landData).some(
            (data) => data.uniqueNumber === uniqueNumber
          );
        } else {
          isUnique = true;
        }
      }

      const landData = {
        landID: landID,
        owner: inpOwner.value,
        uniqueNumber: uniqueNumber,
        contact: inpContact.value,
        hectare: inpHectare.value,
        squareMeter: inpSquareMeter.value,
        price: inpPrice.value,
        location: inpLocation.value,
        imageUrl: await getDownloadURL(imgStorageRef),
        imageName: img.name,
      };

      await set(child(landRef, `${landID}`), landData);
      // alert("Tool has been added.");
      addLandContainer.classList.toggle("active");
      addOverlay.classList.toggle("active");
      displayLand();
    } catch (error) {
      console.error(`Error processing the image: ${img.name}`, error);
    }
  } else {
    alert("Please fill all the fields");
  }
});

btnAddLandNav.addEventListener("click", () => {
  addLandContainer.classList.toggle("active");
  addOverlay.classList.toggle("active");

  inpImg.value = "";
  inpOwner.value = "";
  inpPrice.value = "";
  inpLocation.value = "";
  inpContact.value = "";
  inpHectare.value = "";
  inpSquareMeter.value = "";
  // inpStartDate.value = "";
  // inpEndDate.value = "";

  // btnSetToolsDate.addEventListener("click", () => {
  //   calendarSection.style.display = "block";
  //   displayCalendar(null);
  // });
});

addLandContainer
  .querySelector(".btn-close-add-land")
  .addEventListener("click", () => {
    addLandContainer.classList.toggle("active");
    addOverlay.classList.toggle("active");
  });

displayLand();

// btnChangeDate.removeEventListener("click", handleBtnChangeDateClick);
// btnChangeDate.addEventListener("click", handleBtnChangeDateClick);

// let selectedMachineryData = null;

// function handleBtnChangeDateClick() {
//   if (selectedMachineryData) {
//     addOverlay.classList.toggle("active");
//     calendarSection.style.display = "block";
//     displayCalendar(selectedMachineryData);
//   }
// }

function displayLand() {
  const tBody = landContainer.querySelector(".land-tbody");
  tBody.innerHTML = "";

  const landRef = ref(database, "land");

  get(landRef).then((snapshot) => {
    if (snapshot.exists()) {
      const landData = snapshot.val();

      for (const landID in landData) {
        const data = landData[landID];

        const tr = document.createElement("tr");

        const tdRadio = document.createElement("td");
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "land-radio";
        tdRadio.appendChild(radio);

        const number = document.createElement("p");
        number.textContent = `#${data.uniqueNumber || 0}`;
        tdRadio.appendChild(number);

        const tdImg = document.createElement("td");

        const img = document.createElement("img");
        img.src = `${data.imageUrl}`;

        tdImg.appendChild(img);

        const tdOwner = document.createElement("td");
        tdOwner.textContent = `${data.owner}`;
        tdOwner.contentEditable = "false";

        const tdContact = document.createElement("td");
        tdContact.textContent = `${data.contact}`;
        tdContact.contentEditable = "false";

        const tdLocation = document.createElement("td");
        tdLocation.textContent = `${data.location}`;
        tdLocation.contentEditable = "false";

        const tdHectare = document.createElement("td");
        tdHectare.textContent = `${data.hectare}`;
        tdHectare.contentEditable = "false";

        const tdSquareMeter = document.createElement("td");
        tdSquareMeter.textContent = `${data.squareMeter}`;
        tdSquareMeter.contentEditable = "false";

        const tdPrice = document.createElement("td");
        tdPrice.textContent = `${data.price}`;
        tdPrice.contentEditable = "false";

        const tdActions = document.createElement("td");

        const btnEdit = document.createElement("button");
        btnEdit.classList.add("btn-edit");

        const btnEditImg = document.createElement("img");
        btnEditImg.src = "./../media/icons/icons8-edit-black.png";
        btnEditImg.alt = "edit";

        btnEdit.appendChild(btnEditImg);

        const btnDelete = document.createElement("button");
        btnDelete.classList.add("btn-delete");

        const btnDeleteImg = document.createElement("img");
        btnDeleteImg.src = "./../media/icons/icons8-delete-black.png";
        btnDeleteImg.alt = "delete";

        btnDelete.appendChild(btnDeleteImg);

        tdActions.appendChild(btnEdit);
        tdActions.appendChild(btnDelete);

        tr.appendChild(tdRadio);
        tr.appendChild(tdImg);
        tr.appendChild(tdOwner);
        tr.appendChild(tdContact);
        tr.appendChild(tdLocation);
        tr.appendChild(tdHectare);
        tr.appendChild(tdSquareMeter);
        tr.appendChild(tdPrice);
        tr.appendChild(tdActions);

        tBody.appendChild(tr);

        radio.addEventListener("change", () => {
          selectedMachineryData = { ...data, ID: landID };
        });

        btnDelete.addEventListener("click", async () => {
          try {
            const c = confirm("Proceed to delete item?");
            if (!c) {
              return;
            }

            const landRef = ref(database, `land/${landID}`);
            const imgRef = storageRef(
              storage,
              `land/${landID}/${data.imageName}`
            );

            await remove(landRef);
            await deleteObject(imgRef);

            tBody.removeChild(tr);
            // alert("Land has been deleted.");
            // displayLand();
          } catch (error) {
            console.error(`Error deleting land: ${data.name}`, error);
          }
        });

        btnEdit.addEventListener("click", async () => {
          if (tdOwner.contentEditable === "false") {
            tdOwner.contentEditable = "true";
            tdContact.contentEditable = "true";
            tdLocation.contentEditable = "true";
            tdHectare.contentEditable = "true";
            tdSquareMeter.contentEditable = "true";
            tdPrice.contentEditable = "true";
            btnEditImg.src = "./../media/icons/icons8-check-black.png";
          } else {
            tdOwner.contentEditable = "false";
            tdLocation.contentEditable = "false";
            tdPrice.contentEditable = "false";
            tdContact.contentEditable = "false";
            tdHectare.contentEditable = "false";
            tdSquareMeter.contentEditable = "false";
            btnEditImg.src = "./../media/icons/icons8-edit-black.png";

            try {
              const updatedData = {
                owner: tdOwner.textContent,
                contact: tdContact.textContent,
                location: tdLocation.textContent,
                hectare: tdHectare.textContent,
                squareMeter: tdSquareMeter.textContent,
                price: tdPrice.textContent,
              };
              const landRef = ref(database, `land/${landID}`);
              await update(landRef, updatedData);

              // alert("Land has been updated.");
              displayLand();
            } catch (error) {
              console.error(`Error updating land: ${data.name}`, error);
            }
          }
        });
      }
    }
  });
}
