window.onload = function(){

// ===== STATE =====
let mode = "manual";
let currentLevel = 2;

// ===== LEVEL =====
window.setLevel = function(val){
    if(val === "auto"){
        mode = "auto";
    }else{
        mode = "manual";
        currentLevel = parseInt(val);
        applyLevel(currentLevel);
    }
}

function applyLevel(lvl){
    let text = document.getElementById("statusText");
    let rs = document.getElementById("rs");

    if(lvl==1){
        text.innerText = "NORMAL (LEVEL I)";
        document.body.style.background="#001a00";
        rs.innerText="LOW";
    }
    else if(lvl==2){
        text.innerText = "WASPADA (LEVEL II)";
        document.body.style.background="#1a1a00";
        rs.innerText="MEDIUM";
    }
    else{
        text.innerText = "SIAGA (LEVEL III)";
        document.body.style.background="#1a0000";
        rs.innerText="HIGH";
    }
}

// ===== AMBIL CANVAS SEKALI =====
const wave1 = document.getElementById("wave1");
const wave2 = document.getElementById("wave2");
const spec1 = document.getElementById("spec1");
const spec2 = document.getElementById("spec2");
const thermal = document.getElementById("thermal");

// ===== WAVE =====
function drawWave(canvas,color){
    let ctx = canvas.getContext("2d");

    canvas.width = canvas.offsetWidth || 300;
    canvas.height = 70;

    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.beginPath();
    ctx.strokeStyle=color;
    ctx.lineWidth=2;

    let y = 35;

    for(let x=0;x<canvas.width;x++){
        y += (Math.random()-0.5)*8;
        ctx.lineTo(x,y);
    }

    ctx.stroke();
}

// ===== SPECTROGRAM =====
function drawSpec(canvas){
    let ctx = canvas.getContext("2d");

    canvas.width = canvas.offsetWidth || 300;
    canvas.height = 110;

    let img = ctx.getImageData(2,0,canvas.width,canvas.height);
    ctx.putImageData(img,0,0);

    for(let y=0;y<canvas.height;y+=3){
        let colors = ["#001aff","#00eaff","#00ff66","#ffaa00","#ff0000"];
        ctx.fillStyle = colors[Math.floor(Math.random()*colors.length)];
        ctx.fillRect(canvas.width-2,y,2,3);
    }
}

// ===== THERMAL =====
function drawThermal(){
    let ctx = thermal.getContext("2d");

    thermal.width = thermal.offsetWidth || 300;
    thermal.height = 120;

    ctx.clearRect(0,0,thermal.width,thermal.height);

    ctx.beginPath();
    ctx.strokeStyle="#ff3d00";

    for(let x=0;x<thermal.width;x++){
        let y = 80 - Math.sin(x*0.05 + Date.now()/300)*20;
        ctx.lineTo(x,y);
    }

    ctx.stroke();
}

let popup = document.getElementById("sensorPopup");

// 🔥 ZONA DINAMIS
function updateZones(){
    let bahaya = document.getElementById("zonaBahaya");
    let waspada = document.getElementById("zonaWaspada");

    if(level == 1){
        bahaya.setAttribute("r", 80);
        waspada.setAttribute("r", 150);
    }
    else if(level == 2){
        bahaya.setAttribute("r", 120);
        waspada.setAttribute("r", 220);
    }
    else{
        bahaya.setAttribute("r", 180);
        waspada.setAttribute("r", 300);
    }
}

// 🎯 SENSOR WARNA
function updateSensorZoneColors(){
    let rBahaya = document.getElementById("zonaBahaya").getAttribute("r");
    let rWaspada = document.getElementById("zonaWaspada").getAttribute("r");

    sensors.forEach((s,i)=>{
        let x = s.cx.baseVal.value;
        let y = s.cy.baseVal.value;

        let dx = x - 400;
        let dy = y - 260;
        let dist = Math.sqrt(dx*dx + dy*dy);

        let status = "";

        if(dist < rBahaya){
            s.setAttribute("fill","red");
            status = "BAHAYA";
        } else if(dist < rWaspada){
            s.setAttribute("fill","yellow");
            status = "WASPADA";
        } else{
            s.setAttribute("fill","lime");
            status = "AMAN";
        }

        // 🔥 CLICK POPUP
        s.onclick = (e)=>{
            popup.style.display = "block";
            popup.style.left = (e.offsetX + 10) + "px";
            popup.style.top = (e.offsetY + 10) + "px";

            popup.innerHTML = `
            <b>${sensorNames[i]}</b><br>
            Status: ${status}<br>
            Getaran: ${Math.floor(Math.random()*100)}<br>
            Suhu: ${Math.floor(Math.random()*300)}°C
            `;
        };
    });
}

// ❌ KLIK LUAR = TUTUP POPUP
mapBox.addEventListener("click", ()=>{
    popup.style.display="none";
});

function updateSensorColors(level){
    let color = level==1 ? 'lime' : level==2 ? 'yellow' : 'red';
    sensors.forEach(s=>{
        s.setAttribute("fill",color);
    });
}

function autoUpdateStatus(){
    let e = parseInt(eruptionInput.value);

    let rsam = "low";
    let levelBaru = 1;
    let radius = 2;

    if(e < 5){
        rsam = "low";
        levelBaru = 1;
        radius = 2;
    } else if(e < 15){
        rsam = "medium";
        levelBaru = 2;
        radius = 4;
    } else {
        rsam = "high";
        levelBaru = 3;
        radius = 6;
    }

    // update RSAM dropdown
    rsamSelect.value = rsam == "high" ? "high" : "low";

    // update level
    level = levelBaru;

    // update zona radius di map
    let zonaBahaya = document.querySelector("svg circle:nth-of-type(2)");
    let zonaWaspada = document.querySelector("svg circle:nth-of-type(3)");

    if(zonaBahaya){
        zonaBahaya.setAttribute("r", radius * 20);
    }
    if(zonaWaspada){
        zonaWaspada.setAttribute("r", radius * 35);
    }
}

// Update analysis berdasarkan data real-time
function updateAnalysis() {
    const eruption = parseInt(elements.eruptionInput.value) || 0;
    const rockfall = parseInt(elements.rockfallInput.value) || 0;
    
    elements.analysisElements.analysisSeismic.textContent = 
        `High-freq (${(8 + eruption*3).toFixed(0)}Hz) - ${eruption} eruptions`;
    elements.analysisElements.analysisInfrasound.textContent = 
        `Pressure ${(12 + rockfall*2).toFixed(0)}Pa - ${rockfall} rockfalls`;
    elements.analysisElements.analysisThermal.textContent = 
        `Kawah ${(420 + eruption*8).toFixed(0)}°C (↑${(eruption*8/420*100).toFixed(0)}%)`;
    elements.analysisElements.analysisRisk.textContent = 
        rockfall > 50 ? 'Pyroclastic flow HIGH RISK' : 'Rockfall dominant';
}

// ===== LOOP =====
setInterval(()=>{
    autoUpdateStatus();

    drawWave(wave1,"#ffae00");
    drawWave(wave2,"#00eaff");

    drawSpec(spec1);
    drawSpec(spec2);

    drawThermal();

    // update angka
    document.getElementById("e").innerText = Math.floor(Math.random()*20);
    document.getElementById("r").innerText = Math.floor(Math.random()*50);

    // AUTO LEVEL
    if(mode==="auto"){
        let val=Math.random()*100;
        if(val<30) applyLevel(1);
        else if(val<70) applyLevel(2);
        else applyLevel(3);
    }

    // 🔥 TAMBAHAN MAP SYSTEM (JANGAN DIHAPUS)
    updateZones();
    updateSensorZoneColors();

},100);

};