// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Import Google Maps
(g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=`https://maps.${c}apis.com/maps/api/js?`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({
key: "AIzaSyCoCXtc1E_jk_DrT-ypXjszx_ObmKPW7JM",
v: "weekly",
});

/*
* Google Map
*/
let map;
let currentCenter;
let centerLat;
let centerLng;
async function init() {
    // Import the needed libraries
    const { Map } = await google.maps.importLibrary('maps');

    // Create a new map from the div with id="map".
    map = new Map(document.getElementById('google-map'), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8,
    });

    console.log(map);

    currentCenter = map.getCenter();
    centerLat = currentCenter.lat();
    centerLng = currentCenter.lng();

    map.addListener("center_changed", () => {
        currentCenter = map.getCenter();
        centerLat = currentCenter.lat();
        centerLng = currentCenter.lng();
        console.log(`New Lat: ${centerLat}, New Lng: ${centerLng}`);
    });
}
void init();

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

// Generate lat and long
const dateString = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
});

// Reference to 'clicks' node in the database
const clicksRef = ref(db, 'clicks');
const button = document.getElementById('myButton');

// Uploads coords to database
button.addEventListener('click', () => {
  // Push the random coordinates to Firebase
  push(clicksRef, {
      lat: centerLat,
      lng: centerLng,
      timestamp: dateString
  }).then(() => {
      // Update HTML text once the write succeeds
      const statusHeading = document.getElementById('status');
      statusHeading.textContent = `I placed lat (${centerLat}) and lng (${centerLng}) into the database`;
  }).catch((error) => {
      console.error("Error writing to database: ", error);
      document.getElementById('status').textContent = "Failed to write data. Check console for details.";
  });
});

