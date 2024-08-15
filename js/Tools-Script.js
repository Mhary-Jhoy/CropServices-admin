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

auth.onAuthStateChanged((user) => {
  if (user) {
    const toolsContainer = document.querySelector(".tools-container");

    const btnAddToolsNav = toolsContainer.querySelector(".btn-add-tools");
    const addToolsContainer = toolsContainer.querySelector(
      ".add-tools-container"
    );

    const inpImg = document.getElementById("tools-inp-img");
    const inpOwner = document.getElementById("tools-inp-owner");
    const inpContact = document.getElementById("tools-inp-contact");
    const inpLocation = document.getElementById("tools-inp-location");
    const inpPrice = document.getElementById("tools-inp-price");
    const btnInsertTools = document.querySelector(".btn-insert-tools");

    const btnTools = document.querySelector(".btn-tools");

    const btnSetToolsDate = document.getElementById("set-tools-date");
    const inpStartDate = document.getElementById("tools-inp-start-date");
    const inpEndDate = document.getElementById("tools-inp-end-date");
    const btnChangeDate = document.getElementById("btn-tools-change-date");

    const calendarSection = document.getElementById("calendar-section");
    const addOverlay = document.getElementById("add-overlay");

    function displayCalendar(data) {
      const startDateInput = document.querySelector("#start-date");
      const endDateInput = document.querySelector("#end-date");
      const datesContainer = document.querySelector("#dates");
      const monthTitle = document.querySelector("#month-title");
      const prevMonthBtn = document.querySelector("#prev-month");
      const nextMonthBtn = document.querySelector("#next-month");
      const btnSave = document.getElementById("btn-calendar-save");
      const btnCancel = document.getElementById("btn-calendar-cancel");
      btnSave.classList.add("disabled");

      btnCancel.addEventListener("click", () => {
        calendarSection.style.display = "none";
        if (data) {
          addOverlay.classList.remove("active");
        }
      });

      let currentMonth = new Date().getMonth();
      let currentYear = new Date().getFullYear();
      let selectedStartDate = null;
      let selectedEndDate = null;

      let availableStartDate = data
        ? new Date(data.availableStartDate + "T00:00:00")
        : null;
      let availableEndDate = data
        ? new Date(data.availableEndDate + "T00:00:00")
        : null;
      let notAvailableDates = [];

      if (data) {
        notAvailableDates = data.notAvailableDates
          ? Object.values(data.notAvailableDates).map((date) => {
              return {
                start: new Date(date.dateStart + "T00:00:00"),
                end: new Date(date.dateEnd + "T00:00:00"),
              };
            })
          : [];
      }

      function generateCalendar(month, year) {
        datesContainer.innerHTML = "";
        const firstDay = new Date(year, month).getDay() || 7;
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        monthTitle.textContent = new Date(year, month).toLocaleString(
          "default",
          {
            month: "long",
            year: "numeric",
          }
        );

        for (let i = 1; i < firstDay; i++) {
          const blank = document.createElement("div");
          blank.classList.add("day", "date");
          datesContainer.appendChild(blank);
        }

        for (let day = 1; day <= daysInMonth; day++) {
          const dayElement = document.createElement("div");
          dayElement.classList.add("day", "date");
          dayElement.textContent = day;

          const currentDate = new Date(year, month, day);

          if (availableStartDate && availableEndDate) {
            if (
              currentDate >= availableStartDate &&
              currentDate <= availableEndDate
            ) {
              if (
                notAvailableDates.some(
                  (date) => currentDate >= date.start && currentDate <= date.end
                )
              ) {
                dayElement.classList.add("not-available");
              } else {
                dayElement.classList.add("available");
              }
            }
          }

          dayElement.addEventListener("click", () => selectDate(currentDate));
          datesContainer.appendChild(dayElement);
        }

        highlightDates();
      }

      function selectDate(date) {
        if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
          selectedStartDate = date;
          selectedEndDate = null;
        } else if (date < selectedStartDate) {
          selectedStartDate = date;
        } else {
          selectedEndDate = date;
        }

        startDateInput.value = selectedStartDate.toLocaleDateString("en-CA");
        endDateInput.value = selectedEndDate
          ? selectedEndDate.toLocaleDateString("en-CA")
          : "";

        if (startDateInput.value && endDateInput.value) {
          btnSave.classList.remove("disabled");

          btnSave.addEventListener("click", async () => {
            if (data) {
              await remove(ref(database, `tools/${data.ID}/notAvailableDates`));

              update(ref(database, `tools/${data.ID}`), {
                availableStartDate: startDateInput.value,
                availableEndDate: endDateInput.value,
              }).then(() => {
                addOverlay.classList.remove("active");
                window.location.reload();
              });
            }

            calendarSection.style.display = "none";
            inpStartDate.value = startDateInput.value;
            inpEndDate.value = endDateInput.value;
          });
        } else {
          btnSave.classList.add("disabled");
        }

        highlightDates();
      }

      function highlightDates() {
        const dates = document.querySelectorAll(".date");

        dates.forEach((date) => {
          const dateNumber = parseInt(date.textContent);
          if (!isNaN(dateNumber)) {
            const dateObj = new Date(currentYear, currentMonth, dateNumber);
            date.classList.remove("selected-range");

            if (selectedStartDate && selectedEndDate) {
              if (dateObj >= selectedStartDate && dateObj <= selectedEndDate) {
                date.classList.add("selected-range");
              }
            } else if (
              selectedStartDate &&
              !selectedEndDate &&
              dateObj.getTime() === selectedStartDate.getTime()
            ) {
              date.classList.add("selected-range");
            }
          }
        });
      }

      function changeMonth(direction) {
        currentMonth += direction;
        if (currentMonth < 0) {
          currentMonth = 11;
          currentYear -= 1;
        } else if (currentMonth > 11) {
          currentMonth = 0;
          currentYear += 1;
        }
        generateCalendar(currentMonth, currentYear);
      }

      startDateInput.addEventListener("input", highlightDates);
      endDateInput.addEventListener("input", highlightDates);
      prevMonthBtn.addEventListener("click", () => changeMonth(-1));
      nextMonthBtn.addEventListener("click", () => changeMonth(1));

      generateCalendar(currentMonth, currentYear);
    }

    btnTools.addEventListener("click", () => {
      displayTools();
    });

    btnInsertTools.addEventListener("click", async () => {
      if (
        inpImg.files.length > 0 &&
        inpOwner.value &&
        inpContact.value &&
        inpLocation.value &&
        inpStartDate.value &&
        inpEndDate.value &&
        inpPrice.value
      ) {
        const img = inpImg.files[0];

        try {
          const toolsRef = ref(database, "tools");
          const newToolsRef = push(toolsRef);
          const toolsID = newToolsRef.key;

          const imgStorageRef = storageRef(
            storage,
            `tools/${toolsID}/${img.name}`
          );
          const snapshot = await uploadBytes(imgStorageRef, img);

          let uniqueNumber;
          let isUnique = false;

          while (!isUnique) {
            uniqueNumber = Math.floor(1000 + Math.random() * 9000);

            const querySnapshot = await get(toolsRef);
            if (querySnapshot.exists()) {
              const toolsData = querySnapshot.val();
              isUnique = !Object.values(toolsData).some(
                (data) => data.uniqueNumber === uniqueNumber
              );
            } else {
              isUnique = true;
            }
          }

          const toolData = {
            toolsID: toolsID,
            owner: inpOwner.value,
            uniqueNumber: uniqueNumber,
            contact: inpContact.value,
            location: inpLocation.value,
            price: inpPrice.value,
            imageUrl: await getDownloadURL(imgStorageRef),
            imageName: img.name,
            availableStartDate: inpStartDate.value,
            availableEndDate: inpEndDate.value,
          };

          await set(child(toolsRef, `${toolsID}`), toolData);
          // alert("Tool has been added.");
          addToolsContainer.classList.toggle("active");
          addOverlay.classList.toggle("active");
          displayTools();
        } catch (error) {
          console.error(`Error processing the image: ${img.name}`, error);
        }
      } else {
        alert("Please fill all the fields");
      }
    });

    // ========================================================================================
    btnAddToolsNav.addEventListener("click", () => {
      addToolsContainer.classList.toggle("active");
      addOverlay.classList.toggle("active");

      inpImg.value = "";
      inpOwner.value = "";
      inpContact.value = "";
      inpLocation.value = "";
      inpPrice.value = "";
      inpStartDate.value = "";
      inpEndDate.value = "";

      btnSetToolsDate.addEventListener("click", () => {
        calendarSection.style.display = "block";
        displayCalendar(null);
      });
    });

    addToolsContainer
      .querySelector(".btn-close-add-tools")
      .addEventListener("click", () => {
        addToolsContainer.classList.toggle("active");
        addOverlay.classList.remove("active");
      });

    displayTools();

    btnChangeDate.removeEventListener("click", handleBtnChangeDateClick);
    btnChangeDate.addEventListener("click", handleBtnChangeDateClick);

    let selectedMachineryData = null;

    function handleBtnChangeDateClick() {
      if (selectedMachineryData) {
        addOverlay.classList.toggle("active");
        calendarSection.style.display = "block";
        displayCalendar(selectedMachineryData);
      }
    }

    function displayTools() {
      const tBody = toolsContainer.querySelector(".tools-tbody");
      tBody.innerHTML = "";

      const toolsRef = ref(database, "tools");

      get(toolsRef).then((snapshot) => {
        if (snapshot.exists()) {
          const toolsData = snapshot.val();

          for (const toolID in toolsData) {
            const data = toolsData[toolID];

            const tr = document.createElement("tr");

            const tdRadio = document.createElement("td");
            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = "tools-radio";
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
            tr.appendChild(tdPrice);
            tr.appendChild(tdActions);

            tBody.appendChild(tr);

            radio.addEventListener("change", () => {
              selectedMachineryData = { ...data, ID: toolID };
            });

            btnDelete.addEventListener("click", async () => {
              try {
                const c = confirm("Proceed to delete item?");
                if (!c) {
                  return;
                }

                const toolRef = ref(database, `tools/${toolID}`);
                const imgRef = storageRef(
                  storage,
                  `tools/${toolID}/${data.imageName}`
                );

                await remove(toolRef);
                await deleteObject(imgRef);

                tBody.removeChild(tr);
                // alert("Tool has been deleted.");
                // displayTools();
              } catch (error) {
                console.error(`Error deleting tool: ${data.owner}`, error);
              }
            });

            btnEdit.addEventListener("click", async () => {
              if (tdOwner.contentEditable === "false") {
                tdOwner.contentEditable = "true";
                tdContact.contentEditable = "true";
                tdLocation.contentEditable = "true";
                tdPrice.contentEditable = "true";
                btnEditImg.src = "./../media/icons/icons8-check-black.png";
              } else {
                tdOwner.contentEditable = "false";
                tdContact.contentEditable = "false";
                tdLocation.contentEditable = "false";
                tdPrice.contentEditable = "false";
                btnEditImg.src = "./../media/icons/icons8-edit-black.png";

                try {
                  const updatedData = {
                    owner: tdOwner.textContent,
                    contact: tdContact.textContent,
                    location: tdLocation.textContent,
                    price: tdPrice.textContent,
                  };
                  const toolRef = ref(database, `tools/${toolID}`);
                  await update(toolRef, updatedData);

                  // alert("Tool has been updated.");
                  displayTools();
                } catch (error) {
                  console.error(`Error updating tool: ${data.owner}`, error);
                }
              }
            });
          }
        }
      });
    }
  } else {
    window.location.href = "./../index.html";
  }
});
