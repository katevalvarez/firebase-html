// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, query, limitToLast, onValue, push } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getStorage, uploadBytes } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { ref as stoRef } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

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
    const { Map, RenderingType } = await google.maps.importLibrary('maps');
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
const storage = getStorage(app);
const storageRef = stoRef(storage, 'fox-images');

// Generate lat and long
const dateString = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
});

// Add Location form handling 
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
    imgInput = document.getElementById('uploadImg'); // DOM element
    const img = imgInput.files[0]; // File data type, has .type, .name, .size
    const imgName = img.name;

    // handle uploading image
    const imgRef = ref(storage, '${yourName}_${imgName}');
    const imgImagesRef = ref(storage, 'images/${yourName}_${imgName}');
    uploadBytes(storageRef, img);

  // Push the coordinates to Firebase
  push(clicksRef, {
      lat: centerLat,
      lng: centerLng,
      timestamp: dateString,
      locname: locName,
      yourname: yourName,
      imginput: imgName,
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

// Fetch and display markers
const recentClicksQuery = query(clicksRef, limitToLast(10));
let markers;
let isViewing;

onValue(recentClicksQuery, (snapshot) => {
    
    if (snapshot.exists()) {
        const data = snapshot.val();
        
        // Extract from database and map to Markers array
        markers = Object.values(data).map(entry => ({
            lat: entry.lat,
            lng: entry.lng,
            timestamp: entry.timestamp,
        }));

        // Place Markers onto map
        markers.forEach(data => {
            const marker = new google.maps.Marker({
                map: map,
                position: { lat: data.lat, lng: data.lng },
                title: `Logged: ${data.timestamp}`
            });

            // Create Info Window 
            const infoWindow = new google.maps.InfoWindow({
                maxWidth:200,
            });

            function createInfoWindow(){
                const infoWindowContent = `
                    <div class="info-window-content">
                        <div id="info-img-ctn">
                            <img id="info-window-img" src="sg-car.png">
                        </div>
                        
                        <a href="#" style="font-size:13px;margin-bottom:0px" id="view-sighting">view sighting</a>
                    </div>
                `;

                google.maps.event.addListener(marker, 'click', function() {
                    infoWindow.setContent(infoWindowContent);
                    infoWindow.open(map, marker);
                    // View Sighting
                    infoWindow.addListener('domready', () => {
                        const viewSighting = document.getElementById("view-sighting");
                        const viewContent = document.getElementById("view-content");
                        isViewing = false;
                        viewSighting.addEventListener('click', ()=> {
                            event.preventDefault();
                            isViewing = !isViewing;
                            if (isViewing) {
                                viewContent.style.display = 'flex';
                            }
                        })
                    })
                });
            }

            createInfoWindow();
        });

    } else {
        console.log("No data found.");
    }
});

let longerMarkers
const longerClicksQuery = query(clicksRef, limitToLast(50));
const listContainer = document.getElementById('location-list');
if (listContainer) listContainer.innerHTML = '';
onValue(longerClicksQuery, (snapshot) => {
    
    if (snapshot.exists()) {
        const data = snapshot.val();
        
        // Loop through the 10 items
        longerMarkers = Object.values(data).map(entry => ({
            lat: entry.lat,
            lng: entry.lng,
            timestamp: entry.timestamp
        }));
        longerMarkers.forEach(data => {
            if (listContainer) {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'location-item';
                itemDiv.textContent = `Lat: ${data.lat}, Lng: ${data.lng} | Time: ${data.timestamp}`;
                listContainer.appendChild(itemDiv);
            }
        });
    }
});


/* ------------------------------------------------------
*
* Buttons
* 
* ---------------------------------------------------- */ 

const addLocButton = document.getElementById("add-loc");
const backButton = document.getElementById("back-btn");
const homeButtonsCont = document.getElementById("home-buttons-container");
const aboutBtn = document.getElementById("about-btn");
addLocButton.addEventListener('click', ()=> {
    confirmLocCont.style.display = 'flex';
    backButton.style.display = 'block';
    centerPin.style.display = 'block';
    homeButtonsCont.style.display = 'none';
    myButton.style.display = 'block';
    aboutBtn.style.display = 'none';
})

backButton.addEventListener('click', ()=> {
    confirmLocCont.style.display = 'none';
    backButton.style.display = 'none';
    centerPin.style.display = 'none';
    homeButtonsCont.style.display = 'flex';
    aboutBtn.style.display = 'block';
})

const backToHome = document.getElementById("back-to-home");
backToHome.addEventListener('click', ()=> {
    confirmLocCont.style.display = 'none';
    addLocOutput.style.display = 'none';
    homeButtonsCont.style.display = 'flex';
    aboutBtn.style.display = 'block';
    map.setZoom(initZoom);
    map.panTo(initCenter);
})

// Center Location Button
const centerLocBtn = document.getElementById("center-loc");
centerLocBtn.addEventListener('click', ()=> {
    map.setZoom(initZoom);
    map.panTo(initCenter);
})

// Terrain Button 
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
});

// About Button
const aboutContent = document.getElementById("about-content");
const googleMap = document.getElementById('google-map');
let isAbout = false;
aboutBtn.addEventListener('click', ()=> {
    isAbout = !isAbout;
    if (isAbout) {
        aboutContent.style.display = 'block';
        googleMap.style.display = 'none';
        aboutBtn.textContent = "✖️";
    } else {
        aboutContent.style.display = 'none';
        googleMap.style.display = 'block';
        aboutBtn.textContent = "ℹ️";
    }
})

// Archives
const archive = document.getElementById("archive");
const closeArchive = document.getElementById("close-archive");
const archiveContent = document.getElementById("archive-content");
let isArchive = false;
archive.addEventListener('click', ()=> {
    isArchive = !isArchive;
    if (isArchive) {
        archiveContent.style.display = 'flex';
        googleMap.style.display = 'none';
        closeArchive.style.display = 'block';
    }
})
closeArchive.addEventListener('click', ()=> {
    isArchive = !isArchive;
    if (!isArchive) {
        archiveContent.style.display = 'none';
        googleMap.style.display = 'block';
        closeArchive.style.display = 'none';
        aboutBtn.style.display = 'block';
    }
})

// Share
const share = document.getElementById("share");
const closeShare = document.getElementById("close-share");
const shareContent = document.getElementById("share-content");
let isShare = false;
share.addEventListener('click', ()=> {
    isShare = !isShare;
    if (isShare) {
        shareContent.style.display = 'flex';
        googleMap.style.display = 'none';
        closeShare.style.display = 'block';
    }
})
closeShare.addEventListener('click', ()=> {
    isShare = !isShare;
    if (!isShare) {
        shareContent.style.display = 'none';
        googleMap.style.display = 'block';
        closeShare.style.display = 'none';
        aboutBtn.style.display = 'block';
    }
})

// Expanded View Sighting
const closeView = document.getElementById("close-expanded");
const viewContent = document.getElementById("view-content");
closeView.addEventListener('click', ()=> {
    isViewing = !isViewing;
    if (!isViewing) {
        viewContent.style.display = 'none';
    }
})
