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
  listAll,
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
    const tBody = document.getElementById("hiring-tbody");
    tBody.innerHTML = "";
    displayHiringPost();

    async function displayHiringPost() {
      tBody.innerHTML = "";

      const hiringRef = ref(database, "farmers");

      const snapshot = await get(hiringRef);
      const snapshotData = snapshot.val();

      if (!snapshotData) {
        return;
      }

      for (const ID in snapshotData) {
        const data = snapshotData[ID];

        const tr = document.createElement("tr");

        const tdName = document.createElement("td");
        tdName.textContent = data.ownerName;

        const tdLocation = document.createElement("td");
        tdLocation.textContent = data.postLocation;

        const tdLookingFor = document.createElement("td");
        tdLookingFor.textContent = data.postLookingFor;

        const tdNoOfPeople = document.createElement("td");
        tdNoOfPeople.textContent = `${data.accepted} / ${data.postPeopleNum}`;

        const tdSalary = document.createElement("td");
        tdSalary.textContent = data.postSalary;

        const tdActions = document.createElement("td");
        const btnDelete = document.createElement("button");
        btnDelete.classList.add("btn-delete");
        const btnDeleteImg = document.createElement("img");
        btnDeleteImg.src = "./../media/icons/icons8-delete-black.png";
        btnDeleteImg.alt = "delete";
        btnDelete.appendChild(btnDeleteImg);
        tdActions.appendChild(btnDelete);

        tr.appendChild(tdName);
        tr.appendChild(tdLocation);
        tr.appendChild(tdLookingFor);
        tr.appendChild(tdNoOfPeople);
        tr.appendChild(tdSalary);
        tr.appendChild(tdActions);

        tBody.appendChild(tr);

        btnDelete.addEventListener("click", () => {
          if (confirm("Proceed to delete Hiring Post?")) {
            remove(ref(database, `farmers/${ID}`)).then(() => {
              tBody.removeChild(tr);
            });
          }
        });
      }
    }
  }
});
