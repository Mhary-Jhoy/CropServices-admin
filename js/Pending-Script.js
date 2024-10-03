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
    const pendingTBody = document.getElementById("pending-tbody");
    pendingTBody.innerHTML = "";
    displayPending();

    async function moveFolder(oldPath, newPath) {
      const oldRef = ref(database, oldPath);
      const newRef = ref(database, newPath);

      const snapshot = await get(oldRef);
      const data = snapshot.val();

      if (data) {
        try {
          await update(newRef, data);
          await remove(oldRef);
        } catch (error) {
          console.error("Error moving folder:", error);
        }
      }
    }

    async function getUniqueNumber(type) {
      let uniqueNumber;
      let isUnique = false;

      while (!isUnique) {
        uniqueNumber = Math.floor(1000 + Math.random() * 9000);

        const querySnapshot = await get(ref(database, type));
        if (querySnapshot.exists()) {
          const data = querySnapshot.val();
          isUnique = !Object.values(data).some(
            (data) => data.uniqueNumber === uniqueNumber
          );
        } else {
          isUnique = true;
        }
      }
      return uniqueNumber;
    }

    async function displayPending() {
      pendingTBody.innerHTML = "";
      const currentMonth = new Date().getMonth() + 1;

      const snapshot = await get(ref(database, "pending"));
      const snapshotData = snapshot.val();

      if (!snapshotData) {
        return;
      }

      for (const ID in snapshotData) {
        const data = snapshotData[ID];

        const tr = document.createElement("tr");

        const tdType = document.createElement("td");
        tdType.textContent = data.type;

        const tdOwner = document.createElement("td");
        tdOwner.textContent = data.ownerName ? data.ownerName : data.owner;

        const tdDate = document.createElement("td");
        tdDate.textContent = data.dateSubmitted;

        const tdActions = document.createElement("td");

        const btnDetails = document.createElement("button");
        btnDetails.textContent = "DETAILS";
        btnDetails.style.backgroundColor = "var(--color-btn-blue)";

        const btnAccept = document.createElement("button");
        btnAccept.textContent = "ACCEPT";
        btnAccept.style.backgroundColor = "var(--color-btn-green)";

        const btnDecline = document.createElement("button");
        btnDecline.textContent = "DECLINE";
        btnDecline.style.backgroundColor = "var(--color-btn-red)";

        tdActions.appendChild(btnDetails);
        tdActions.appendChild(btnAccept);
        tdActions.appendChild(btnDecline);

        tr.appendChild(tdType);
        tr.appendChild(tdOwner);
        tr.appendChild(tdDate);
        tr.appendChild(tdActions);

        pendingTBody.appendChild(tr);

        btnAccept.addEventListener("click", async () => {
          const oldFolderPath = `pending/${ID}`;
          let newFolderPath;

          if (data.type === "post") {
            newFolderPath = `farmers/${ID}`;
            await update(ref(database, oldFolderPath), {
              approved: true,
            });
          } else {
            newFolderPath = `${data.type}/${ID}`;

            await update(ref(database, oldFolderPath), {
              uniqueNumber: await getUniqueNumber(data.type),
              monthAccepted: currentMonth,
            });

            if (data.type === "land") {
              await update(ref(database, oldFolderPath), {
                available: true,
              });
            }

            // console.log(getUniqueNumber(data.type));
          }

          await moveFolder(oldFolderPath, newFolderPath)
            .then(async () => {
              pendingTBody.removeChild(tr);

              if (data.type !== "post") {
                const graphSnapshot = await get(ref(database, "graphData"));
                const graphSnapshotData = graphSnapshot.val();

                await update(ref(database, `graphData`), {
                  accepted: (graphSnapshotData?.accepted || 0) + 1,
                  acceptedRejectedTotal:
                    (graphSnapshotData?.acceptedRejectedTotal || 0) + 1,
                });

                const productType = data.type;

                const productTypeData = graphSnapshotData?.[productType] || {};

                await update(ref(database, `graphData/${productType}`), {
                  [currentMonth]: (productTypeData[currentMonth] || 0) + 1,
                });
              }
            })
            .catch((err) => {
              alert(err);
            });
        });

        btnDecline.addEventListener("click", async () => {
          if (data.type !== "post") {
            const imgFolderRef = storageRef(storage, `${data.type}/${ID}`);
            const imgList = await listAll(imgFolderRef);
            const deletePromises = imgList.items.map((item) =>
              deleteObject(item)
            );
            await Promise.all(deletePromises);
          }

          const folderRef = ref(database, `pending/${ID}`);
          await remove(folderRef)
            .then(async () => {
              pendingTBody.removeChild(tr);

              if (data.type !== "post") {
                const graphSnapshot = await get(ref(database, "graphData"));
                const graphSnapshotData = graphSnapshot.val();

                update(ref(database, `graphData`), {
                  rejected: (graphSnapshotData.rejected || 0) + 1,
                  acceptedRejectedTotal:
                    (graphSnapshotData.acceptedRejectedTotal || 0) + 1,
                });
              }
            })

            .catch((err) => {
              alert(err);
            });
        });
      }
    }

    document.getElementById("btn-pending").addEventListener("click", () => {
      pendingTBody.innerHTML = "";
      displayPending();
    });
  }
});
