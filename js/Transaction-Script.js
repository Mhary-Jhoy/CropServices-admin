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

auth.onAuthStateChanged((user) => {
  if (user) {
    const tBody = document.getElementById("transaction-tbody");

    document
      .getElementById("btn-dashboard-transactions")
      .addEventListener("click", () => {
        document.getElementById("btn-transaction").click();
      });

    document.getElementById("btn-transaction").addEventListener("click", () => {
      displayTransactions();
    });

    displayTransactions();

    async function displayTransactions() {
      tBody.innerHTML = "";

      const snapshot = await get(ref(database, "transactions"));
      const snapshotData = snapshot.val();

      if (!snapshotData) {
        return;
      }

      for (const ID in snapshotData) {
        const data = snapshotData[ID];

        const tr = document.createElement("tr");

        const tdType = document.createElement("td");
        tdType.textContent = data.type
          ? data.type[0].toUpperCase() + data.type.slice(1)
          : "";

        const tdOwner = document.createElement("td");
        tdOwner.textContent = data.nameOwner;

        const tdLocation = document.createElement("td");
        tdLocation.textContent = data.location;

        const tdDate = document.createElement("td");
        if (data.type === "land") {
          tdDate.textContent = data.duration;
        } else {
          tdDate.textContent = `${data.dateStart} - ${data.dateEnd}`;
        }

        const tdUserName = document.createElement("td");
        tdUserName.textContent = data.userName;

        const tdAmount = document.createElement("td");
        tdAmount.textContent = data.amount;

        const tdActions = document.createElement("td");

        if (data.accepted) {
          const h1 = document.createElement("td");
          h1.textContent = "Accepted";

          tdActions.appendChild(h1);
        } else {
          const btnAccept = document.createElement("button");
          btnAccept.textContent = "ACCEPT";
          btnAccept.classList.add("btn-transaction-accept");

          const btnDecline = document.createElement("button");
          btnDecline.textContent = "DECLINE";
          btnDecline.classList.add("btn-transaction-decline");

          tdActions.appendChild(btnAccept);
          tdActions.appendChild(btnDecline);

          let info = {};

          if (data.type === "machinery") {
            info = `
                    Name: ${data.nameOwner}
                    Brand: ${data.brand}
                    Location: ${data.location}
                    Duration: ${data.duration}
                    Date: ${data.dateStart} - ${data.dateEnd}
                    Amount: ${data.amount}
                  `;
          } else if (data.type === "land") {
            info = `
                    Owner: ${data.nameOwner}
                    Contact: ${data.contact}
                    Location: ${data.location}
                    Duration: ${data.duration}
                    Amount: ${data.amount}
                  `;
          } else if (data.type === "machinery") {
            info = `
                    Name: ${data.nameOwner}
                    Contact: ${data.contact}
                    Location: ${data.location}
                    Duration: ${data.duration}
                    Date: ${data.dateStart} - ${data.dateEnd}
                    Amount: ${data.amount}
                  `;
          }

          btnAccept.addEventListener("click", async () => {
            if (data.type !== "land") {
              const notAvailableDatesRef = ref(
                database,
                `${data.type}/${data.productID}/notAvailableDates`
              );

              const snapshot = await get(notAvailableDatesRef);
              const existingDates = snapshot.exists()
                ? Object.values(snapshot.val())
                : [];

              const newDateStart = new Date(data.dateStart + "T00:00:00");
              const newDateEnd = new Date(data.dateEnd + "T00:00:00");

              const isOverlapping = existingDates.some((date) => {
                const existingStart = new Date(date.dateStart + "T00:00:00");
                const existingEnd = new Date(date.dateEnd + "T00:00:00");

                return (
                  (newDateStart >= existingStart &&
                    newDateStart <= existingEnd) ||
                  (newDateEnd >= existingStart && newDateEnd <= existingEnd) ||
                  (newDateStart <= existingStart && newDateEnd >= existingEnd)
                );
              });

              if (!isOverlapping) {
                await set(push(notAvailableDatesRef), {
                  dateStart: data.dateStart,
                  dateEnd: data.dateEnd,
                });
              } else {
                const confirmOverlap = confirm(
                  "The new date range overlaps with existing unavailable dates."
                );

                if (!confirmOverlap) {
                  return; // Exit the function if the user cancels
                }

                // If user confirms, insert the overlapping date
                await set(push(notAvailableDatesRef), {
                  dateStart: data.dateStart,
                  dateEnd: data.dateEnd,
                });
              }
            }

            // Update the transaction if no return was triggered above
            await update(ref(database, `transactions/${ID}`), {
              accepted: true,
            });

            (function () {
              emailjs.init({
                publicKey: "FZeLmVYPaR2cqbE65",
              });
            })();

            emailjs
              .send("service_vbpdcl7", "template_74nbjc5", {
                to_email: data.userEmail,
                to_name: data.userName,
                information: info,
                accepted: "Accepted",
              })
              .then(
                (response) => {
                  console.log("SUCCESS!", response.status, response.text);
                  alert(
                    `The confirmation email has been sent to ${data.userEmail}`
                  );
                  window.location.reload();
                },
                (error) => {
                  console.log("FAILED...", error);
                  alert("Failed to send email");
                }
              );
          });

          btnDecline.addEventListener("click", async () => {
            const c = confirm(
              "This will delete the transaction record, proceed?"
            );

            if (c) {
              await remove(ref(database, `transactions/${ID}`));

              (function () {
                emailjs.init({
                  publicKey: "FZeLmVYPaR2cqbE65",
                });
              })();

              emailjs
                .send("service_vbpdcl7", "template_74nbjc5", {
                  to_email: data.userEmail,
                  to_name: data.userName,
                  information: info,
                  accepted: "Declined",
                })
                .then(
                  (response) => {
                    console.log("SUCCESS!", response.status, response.text);
                    alert(
                      `The confirmation email has been sent to ${data.userEmail}`
                    );
                    window.location.reload();
                  },
                  (error) => {
                    console.log("FAILED...", error);
                    alert("Failed to send email");
                  }
                );
            }
          });
        }

        tr.appendChild(tdType);
        tr.appendChild(tdOwner);
        tr.appendChild(tdLocation);
        tr.appendChild(tdDate);
        tr.appendChild(tdUserName);
        tr.appendChild(tdAmount);
        tr.appendChild(tdActions);

        tBody.appendChild(tr);
      }
    }
  } else {
    window.location.href = "./../index.html";
  }
});
