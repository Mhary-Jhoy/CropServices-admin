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
    const machineryContainer = document.querySelector(".machinery-container");
    const btnInsertMachinery = document.querySelector(".btn-insert-machinery");
    const btnSetMachineryDate = document.getElementById("set-machinery-date");
    const inpStartDate = document.getElementById("machinery-inp-start-date");
    const inpEndDate = document.getElementById("machinery-inp-end-date");
    const btnChangeDate = document.getElementById("btn-machinery-change-date");

    const calendarSection = document.getElementById("calendar-section");
    const addOverlay = document.getElementById("add-overlay");

    const btnAddMachineOperator = document.getElementById(
      "btn-machinery-add-operator"
    );
    const btnRemoveMachineOperator = document.getElementById(
      "btn-machinery-remove-operator"
    );

    const addMachineOperatorContainer =
      document.forms["add-machinery-operator"];

    // const addMachineOperatorContainer = document.getElementById(
    //   "add-machinery-operator"
    // );
    const machineOperatorContainer = document.getElementById(
      "machine-operators-container"
    );
    const machineOperatorContent = document.getElementById(
      "machine-operators-content"
    );

    document
      .getElementById("btn-add-operator-cancel")
      .addEventListener("click", () => {
        addOverlay.classList.toggle("active");
        addMachineOperatorContainer.classList.toggle("active");
      });

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
              await remove(
                ref(database, `machinery/${data.ID}/notAvailableDates`)
              );

              update(ref(database, `machinery/${data.ID}`), {
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

    const btnAddMachineryNav =
      machineryContainer.querySelector(".btn-add-machinery");
    const addMachineryContainer = machineryContainer.querySelector(
      ".add-machinery-container"
    );

    const inpImg = document.getElementById("machinery-inp-img");
    const inpName = document.getElementById("machinery-inp-name");
    const inpBrand = document.getElementById("machinery-inp-brand");
    const inpLocation = document.getElementById("machinery-inp-location");
    const inpColor = document.getElementById("machinery-inp-color");
    const inpCondition = document.getElementById("machinery-inp-condition");
    const inpPrice = document.getElementById("machinery-inp-price");

    const btnMachinery = document.querySelector(".btn-machinery");

    document
      .getElementById("btn-dashboard-machinery")
      .addEventListener("click", () => btnMachinery.click());

    btnMachinery.addEventListener("click", () => {
      displayMachinery();
    });

    btnInsertMachinery.addEventListener("click", async () => {
      if (
        inpImg.files.length > 0 &&
        inpName.value &&
        inpBrand.value &&
        inpLocation.value &&
        inpColor.value &&
        inpCondition.value &&
        inpStartDate.value &&
        inpEndDate.value &&
        inpPrice.value
      ) {
        const img = inpImg.files[0];

        try {
          const machineryRef = ref(database, "machinery");
          const newMachineryRef = push(machineryRef);
          const machineryID = newMachineryRef.key;

          const imgStorageRef = storageRef(
            storage,
            `machinery/${machineryID}/${img.name}`
          );
          const snapshot = await uploadBytes(imgStorageRef, img);

          let uniqueNumber;
          let isUnique = false;

          while (!isUnique) {
            uniqueNumber = Math.floor(1000 + Math.random() * 9000);

            const querySnapshot = await get(machineryRef);
            if (querySnapshot.exists()) {
              const machineryData = querySnapshot.val();
              isUnique = !Object.values(machineryData).some(
                (data) => data.uniqueNumber === uniqueNumber
              );
            } else {
              isUnique = true;
            }
          }

          const machineryData = {
            machineryID: machineryID,
            uniqueNumber: uniqueNumber,
            name: inpName.value,
            brand: inpBrand.value,
            location: inpLocation.value,
            color: inpColor.value,
            condition: inpCondition.value,
            price: inpPrice.value,
            imageUrl: await getDownloadURL(imgStorageRef),
            imageName: img.name,
            availableStartDate: inpStartDate.value,
            availableEndDate: inpEndDate.value,
          };

          await set(child(machineryRef, `${machineryID}`), machineryData).then(
            () => {
              // alert("Machinery has been added.");
              addMachineryContainer.classList.toggle("active");
              addOverlay.classList.toggle("active");
              displayMachinery();
            }
          );
        } catch (error) {
          console.error(`Error processing the image: ${img.name}`, error);
        }
      } else {
        alert("Please fill all the fields");
      }
    });

    btnAddMachineryNav.addEventListener("click", () => {
      addMachineryContainer.classList.toggle("active");
      addOverlay.classList.toggle("active");

      inpImg.value = "";
      inpName.value = "";
      inpBrand.value = "";
      inpLocation.value = "";
      inpColor.value = "";
      inpCondition.value = "";
      inpPrice.value = "";
      inpStartDate.value = "";
      inpEndDate.value = "";

      btnSetMachineryDate.addEventListener("click", () => {
        calendarSection.style.display = "block";
        displayCalendar(null);
      });
    });

    addMachineryContainer
      .querySelector(".btn-close-add-machinery")
      .addEventListener("click", () => {
        addMachineryContainer.classList.toggle("active");
        addOverlay.classList.toggle("active");
      });

    displayMachinery();

    let selectedMachineryData = null;

    document
      .getElementById("btn-machine-operator-close")
      .addEventListener("click", () => {
        addOverlay.classList.toggle("active");
        machineOperatorContainer.classList.toggle("active");
      });

    btnRemoveMachineOperator.removeEventListener(
      "click",
      handleRemoveMachineOperator
    );
    btnRemoveMachineOperator.addEventListener(
      "click",
      handleRemoveMachineOperator
    );

    async function handleRemoveMachineOperator() {
      if (selectedMachineryData) {
        const snapshot = await get(
          ref(database, `machinery/${selectedMachineryData.ID}`)
        );
        selectedMachineryData = {
          ...snapshot.val(),
          ID: selectedMachineryData.ID,
        };

        addOverlay.classList.toggle("active");
        machineOperatorContainer.classList.toggle("active");
        machineOperatorContent.innerHTML = "";

        if (!selectedMachineryData.machineOperator) {
          return;
        }

        const operatorData = selectedMachineryData.machineOperator;

        for (const ID in operatorData) {
          const data = operatorData[ID];

          const machineOperator = document.createElement("div");
          machineOperator.classList.add("machine-operator");

          const img = document.createElement("img");
          img.src = data.imgUrl;

          const div1 = document.createElement("div");
          const text1 = document.createElement("h1");
          text1.textContent = "Name:";
          const h1Name = document.createElement("h1");
          h1Name.textContent = data.name;
          div1.appendChild(text1);
          div1.appendChild(h1Name);

          const div2 = document.createElement("div");
          const text2 = document.createElement("h1");
          text2.textContent = "Age:";
          const h1Age = document.createElement("h1");
          h1Age.textContent = data.age;
          div2.appendChild(text2);
          div2.appendChild(h1Age);

          const div3 = document.createElement("div");
          const text3 = document.createElement("h1");
          text3.textContent = "Address:";
          const h1address = document.createElement("h1");
          h1address.textContent = data.address;
          div3.appendChild(text3);
          div3.appendChild(h1address);

          const div4 = document.createElement("div");
          const text4 = document.createElement("h1");
          text4.textContent = "Skills:";
          const h1Skills = document.createElement("h1");
          h1Skills.textContent = data.name;
          div4.appendChild(text4);
          div4.appendChild(h1Skills);

          const div5 = document.createElement("div");
          const text5 = document.createElement("h1");
          text5.textContent = "Experience:";
          const h1Experience = document.createElement("h1");
          h1Experience.textContent = data.experience;
          div5.appendChild(text5);
          div5.appendChild(h1Experience);

          const btnRemove = document.createElement("button");
          btnRemove.textContent = "Remove";

          machineOperator.appendChild(img);
          machineOperator.appendChild(div1);
          machineOperator.appendChild(div2);
          machineOperator.appendChild(div3);
          machineOperator.appendChild(div4);
          machineOperator.appendChild(div5);
          machineOperator.appendChild(btnRemove);

          machineOperatorContent.appendChild(machineOperator);

          btnRemove.addEventListener("click", async () => {
            const c = confirm("Proceed to remove operator?");

            if (c) {
              await deleteObject(
                storageRef(
                  storage,
                  `machineOperator/${selectedMachineryData.ID}/${ID}/${data.imgName}`
                )
              );
              await remove(
                ref(
                  database,
                  `machinery/${selectedMachineryData.ID}/machineOperator/${ID}`
                )
              ).then(() => {
                machineOperatorContent.removeChild(machineOperator);
              });
            }
          });
        }
      }
    }

    btnAddMachineOperator.removeEventListener(
      "click",
      handleAddMachineOperator
    );
    btnAddMachineOperator.addEventListener("click", handleAddMachineOperator);

    const operatorImg = document.getElementById("add-operator-img");
    const inpOperatorImg = addMachineOperatorContainer.elements["inp-img"];
    const inpOperatorName = addMachineOperatorContainer.elements["inp-name"];
    const inpOperatorAge = addMachineOperatorContainer.elements["inp-age"];
    const inpOperatorAddress =
      addMachineOperatorContainer.elements["inp-address"];
    const inpOperatorSkills =
      addMachineOperatorContainer.elements["inp-skills"];
    const inpOperatorExperience =
      addMachineOperatorContainer.elements["inp-experience"];

    function handleAddMachineOperator() {
      if (selectedMachineryData) {
        addOverlay.classList.toggle("active");
        addMachineOperatorContainer.classList.toggle("active");

        operatorImg.src = "";
        inpOperatorImg.value = "";
        inpOperatorName.value = "";
        inpOperatorAge.value = "";
        inpOperatorAddress.value = "";
        inpOperatorSkills.value = "";
        inpOperatorExperience.value = "";

        inpOperatorImg.addEventListener("change", () => {
          const img = inpOperatorImg.files[0];
          if (img) {
            operatorImg.src = URL.createObjectURL(img);
          }
        });

        addMachineOperatorContainer.removeEventListener(
          "submit",
          handleMachineOperator
        );
        addMachineOperatorContainer.addEventListener(
          "submit",
          handleMachineOperator
        );
      }
    }

    async function handleMachineOperator(e) {
      e.preventDefault();
      const newOperatorRef = push(
        ref(database, `machinery/${selectedMachineryData.ID}/machineOperator`)
      );
      const operatorID = newOperatorRef.key;

      const imgFolderRef = storageRef(
        storage,
        `machineOperator/${selectedMachineryData.ID}/${operatorID}/${inpOperatorImg.files[0].name}`
      );
      await uploadBytes(imgFolderRef, inpOperatorImg.files[0]);

      set(
        ref(
          database,
          `machinery/${selectedMachineryData.ID}/machineOperator/${operatorID}`
        ),
        {
          name: inpOperatorName.value,
          age: inpOperatorAge.value,
          address: inpOperatorAddress.value,
          skills: inpOperatorSkills.value,
          experience: inpOperatorExperience.value,
          imgUrl: await getDownloadURL(imgFolderRef),
          imgName: inpOperatorImg.files[0].name,
        }
      ).then(() => {
        alert("Operator has been added.");
        addOverlay.classList.toggle("active");
        addMachineOperatorContainer.classList.toggle("active");
        // window.location.reload();
      });
    }

    btnChangeDate.removeEventListener("click", handleBtnChangeDateClick);
    btnChangeDate.addEventListener("click", handleBtnChangeDateClick);

    function handleBtnChangeDateClick() {
      if (selectedMachineryData) {
        addOverlay.classList.toggle("active");
        calendarSection.style.display = "block";
        displayCalendar(selectedMachineryData);
      }
    }

    function displayMachinery() {
      const tBody = machineryContainer.querySelector(".machinery-tbody");
      tBody.innerHTML = "";

      const machineryRef = ref(database, "machinery");

      get(machineryRef).then((snapshot) => {
        if (snapshot.exists()) {
          const machineryData = snapshot.val();

          for (const machineryID in machineryData) {
            const data = machineryData[machineryID];

            const tr = document.createElement("tr");

            const tdRadio = document.createElement("td");
            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = "machinery-radio";
            tdRadio.appendChild(radio);

            const number = document.createElement("p");
            number.textContent = `#${data.uniqueNumber || 0}`;
            tdRadio.appendChild(number);

            const tdImg = document.createElement("td");

            const img = document.createElement("img");
            img.src = `${data.imageUrl}`;

            tdImg.appendChild(img);

            const tdName = document.createElement("td");
            tdName.textContent = `${data.name}`;
            tdName.contentEditable = "false";

            const tdBrand = document.createElement("td");
            tdBrand.textContent = `${data.brand}`;
            tdBrand.contentEditable = "false";

            const tdLocation = document.createElement("td");
            tdLocation.textContent = `${data.location}`;
            tdLocation.contentEditable = "false";

            const tdColor = document.createElement("td");
            tdColor.textContent = `${data.color}`;
            tdColor.contentEditable = "false";

            const tdCondition = document.createElement("td");
            tdCondition.textContent = `${data.condition}`;
            tdCondition.contentEditable = "false";

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
            tr.appendChild(tdName);
            tr.appendChild(tdBrand);
            tr.appendChild(tdLocation);
            tr.appendChild(tdColor);
            tr.appendChild(tdCondition);
            tr.appendChild(tdPrice);
            tr.appendChild(tdActions);

            tBody.appendChild(tr);

            radio.addEventListener("change", () => {
              selectedMachineryData = { ...data, ID: machineryID };
            });

            btnDelete.addEventListener("click", async () => {
              try {
                const c = confirm("Proceed to delete item?");
                if (!c) {
                  return;
                }

                const machineryRef = ref(database, `machinery/${machineryID}`);
                const imgRef = storageRef(
                  storage,
                  `machinery/${machineryID}/${data.imageName}`
                );

                await remove(machineryRef);
                await deleteObject(imgRef);

                tBody.removeChild(tr);
                // displayMachinery();
              } catch (error) {
                console.error(`Error deleting machinery: ${data.name}`, error);
              }
            });

            btnEdit.addEventListener("click", async () => {
              if (tdName.contentEditable === "false") {
                tdName.contentEditable = "true";
                tdBrand.contentEditable = "true";
                tdLocation.contentEditable = "true";
                tdColor.contentEditable = "true";
                tdCondition.contentEditable = "true";
                tdPrice.contentEditable = "true";
                btnEditImg.src = "./../media/icons/icons8-check-black.png";
              } else {
                tdName.contentEditable = "false";
                tdBrand.contentEditable = "false";
                tdLocation.contentEditable = "false";
                tdColor.contentEditable = "false";
                tdCondition.contentEditable = "false";
                tdPrice.contentEditable = "false";
                btnEditImg.src = "./../media/icons/icons8-edit-black.png";

                try {
                  const updatedData = {
                    name: tdName.textContent,
                    brand: tdBrand.textContent,
                    location: tdLocation.textContent,
                    color: tdColor.textContent,
                    condition: tdCondition.textContent,
                    price: tdPrice.textContent,
                  };
                  const machineryRef = ref(
                    database,
                    `machinery/${machineryID}`
                  );
                  await update(machineryRef, updatedData);

                  // alert("Machinery has been updated.");
                  displayMachinery();
                } catch (error) {
                  console.error(
                    `Error updating machinery: ${data.name}`,
                    error
                  );
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
