// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Follow this pattern to import other Firebase services
// import { } from 'firebase/<service>';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA_wlv8e5ROU1AxyF0lndIxFoYpYCvTyVQ",
  authDomain: "fir-test-f3db1.firebaseapp.com",
  projectId: "fir-test-f3db1",
  storageBucket: "fir-test-f3db1.firebasestorage.app",
  messagingSenderId: "832570323461",
  appId: "1:832570323461:web:8426820dd84ae0ece4226c",
  measurementId: "G-Q40YLBSGX0",
  databaseURL: "https://fir-test-f3db1-default-rtdb.firebaseio.com/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Function to generate a random coordinate
function getRandomCoordinate(min, max) {
    return (Math.random() * (max - min) + min).toFixed(6);
}

// Generate random Lat (-90 to 90) and Lng (-180 to 180)
const randomLat = parseFloat(getRandomCoordinate(-90, 90));
const randomLng = parseFloat(getRandomCoordinate(-180, 180));

// Reference to 'clicks' node in the database
const clicksRef = ref(db, 'clicks');

// Push the random coordinates to Firebase
push(clicksRef, {
    lat: randomLat,
    lng: randomLng,
    timestamp: Date.now()
}).then(() => {
    // Update HTML text once the write succeeds
    const statusHeading = document.getElementById('status');
    statusHeading.textContent = `I placed lat (${randomLat}) and lng (${randomLng}) into the database`;
}).catch((error) => {
    console.error("Error writing to database: ", error);
    document.getElementById('status').textContent = "Failed to write data. Check console for details.";
});