// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, query, limitToLast, onValue, push } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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
const initCenter = { lat: 40.3430942, lng:-74.6550739 };
const initZoom = 14.9;

async function init() {
    // Import the needed libraries
    const { Map } = await google.maps.importLibrary('maps');
    // Create a new map from the div with id="map".
    map = new Map(document.getElementById('google-map'), {
        center: initCenter,
        zoom:initZoom,
        disableDefaultUI:true,
        styles: [{
            "featureType": "all",
            "elementType": "all",
            "stylers": [{
                    "hue": "#ff8900"
                },
                {
                    "weight": "0.81"
                },
                {
                    "visibility": "on"
                },
                {
                    "saturation": "-7"
                },
                {
                    "lightness": "10"
                },
                {
                    "gamma": "1.02"
                }
            ]
        }]
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
const centerPin = document.getElementById("center-pin");
const confirmLocCont = document.getElementById("confirm-loc-ctn");
const addLocOutput = document.getElementById("add-loc-output");

const form = document.getElementById('loc-form');
let locName;
let yourName;
let imgInput;

// Uploads coords to database
button.addEventListener('click', function(event) {
    event.preventDefault();
    locName = document.getElementById('locName').value;
    yourName = document.getElementById('yourName').value;
    imgInput = document.getElementById('uploadImg');
  // Push the random coordinates to Firebase
  push(clicksRef, {
      lat: centerLat,
      lng: centerLng,
      timestamp: dateString
  }).then(() => {
      // Update HTML text once the write succeeds
      const statusHeading = document.getElementById('status');
      statusHeading.textContent = `I placed lat (${centerLat}) and lng (${centerLng}) into the database. locname = ${locName}. yourname = ${yourName}. img = ${imgInput}`;
  }).catch((error) => {
      console.error("Error writing to database: ", error);
      document.getElementById('status').textContent = "Failed to write data. Check console for details.";
  });
  button.style.display = 'none';
  confirmLocCont.style.display = 'none';
  addLocOutput.style.display = 'block';
  backButton.style.display = 'none';
  centerPin.style.display = 'none';
});


const recentClicksQuery = query(clicksRef, limitToLast(10));
let markers;

onValue(recentClicksQuery, (snapshot) => {
    
    if (snapshot.exists()) {
        const data = snapshot.val();
        
        // Loop through the 10 items
        markers = Object.values(data).map(entry => ({
            lat: entry.lat,
            lng: entry.lng,
            timestamp: entry.timestamp
        }));

        // Create markers
        markers.forEach(data => {
            new google.maps.Marker({
                map: map,
                position: { lat: data.lat, lng: data.lng },
                title: `Logged: ${data.timestamp}`
            });
        });
    } else {
        console.log("No data found.");
    }
});

const addLocButton = document.getElementById("add-loc");
const backButton = document.getElementById("back-btn");
const homeButtonsCont = document.getElementById("home-buttons-container");

addLocButton.addEventListener('click', ()=> {
    confirmLocCont.style.display = 'flex';
    backButton.style.display = 'block';
    centerPin.style.display = 'block';
    homeButtonsCont.style.display = 'none';
    myButton.style.display = 'block';
})

backButton.addEventListener('click', ()=> {
    confirmLocCont.style.display = 'none';
    backButton.style.display = 'none';
    centerPin.style.display = 'none';
    homeButtonsCont.style.display = 'flex';
})

const backToHome = document.getElementById("back-to-home");
backToHome.addEventListener('click', ()=> {
    confirmLocCont.style.display = 'none';
    addLocOutput.style.display = 'none';
    homeButtonsCont.style.display = 'flex';
})

const centerLocBtn = document.getElementById("center-loc");
centerLocBtn.addEventListener('click', ()=> {
    map.panTo(initCenter);
    map.setZoom(initZoom);
})

const terrainBtn = document.getElementById("terrain");
let isTerrainView = false;
terrainBtn.addEventListener('click', ()=> {
    isTerrainView = !isTerrainView;
    if (isTerrainView) {
        // Switch to topographic/terrain view
        map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
    } else {
        // Switch back to standard roadmap view
        map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
    }
})
