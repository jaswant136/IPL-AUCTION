let currentPlayer = null;

let currentBid = 0;

let timer = 10;

let timerInterval = null;

let highestBidder = null;

let auctionPaused = false;

let lastBidTeam = null;

const selectedTeam =
localStorage.getItem("selectedTeam");

// ======================
// ALL TEAMS
// ======================

const allTeams = [

"CSK",
"MI",
"RCB",
"KKR",
"SRH",
"RR",
"DC",
"GT",
"LSG",
"PBKS"

];

// ======================
// TEAM NAME
// ======================

const myTeam =
document.getElementById("my-team");

if(myTeam){

myTeam.innerText =
selectedTeam || "No Team";

}

// ======================
// LOAD TEAMS
// ======================

async function loadTeams(){

try{

const response = await fetch(
"http://127.0.0.1:5000/teams"
);

const teams =
await response.json();

const teamsContainer =
document.getElementById("teams");

if(!teamsContainer){
return;
}

teamsContainer.innerHTML = "";

Object.keys(teams).forEach(team => {

const teamData = teams[team];

const card =
document.createElement("div");

card.className = "team-card";

card.innerHTML = `

<div class="team-card-top">

<h2>${team}</h2>

<h3>
₹${Number(teamData.purse || 0).toFixed(2)} Cr
</h3>

</div>

<p>
${teamData.players.length}/25 Players
</p>

`;

teamsContainer.appendChild(card);

});

}catch(error){

console.log(error);

}

}

// ======================
// UPDATE HIGHEST BIDDER
// ======================

function updateHighestBidder(){

const bidder =
document.getElementById(
"highest-bidder"
);

if(!bidder){
return;
}

if(highestBidder){

bidder.innerHTML = `
Highest Bidder :
<span style="
color:#4ade80;
font-weight:800;
">
${highestBidder}
</span>
`;

}else{

bidder.innerHTML = `
Highest Bidder :
<span style="
color:#9ca3af;
font-weight:700;
">
No Bids Yet
</span>
`;

}

}

// ======================
// LOAD PLAYER
// ======================

async function loadPlayer(){

try{

clearInterval(timerInterval);

const response = await fetch(
"http://127.0.0.1:5000/get-player"
);

const data =
await response.json();

console.log(data);

if(data.message){

document.getElementById(
"player-name"
).innerText =
data.message;

document.getElementById(
"player-role"
).innerText = "";

return;

}

currentPlayer = data;

highestBidder = null;

lastBidTeam = null;

currentBid =
Number(data.basePrice || 0);

// =====================
// PLAYER DETAILS
// =====================

document.getElementById(
"player-name"
).innerText =
data.name || "Unknown Player";

document.getElementById(
"player-role"
).innerText =
data.role || "Unknown Role";

document.getElementById(
"base-price"
).innerText =
currentBid.toFixed(2);

document.getElementById(
"current-bid"
).innerText =
currentBid.toFixed(2);

document.getElementById(
"current-pool"
).innerText =
data.pool || "POOL";

// =====================
// IMAGE
// =====================

const playerImg =
document.getElementById(
"player-img"
);

playerImg.src =
data.image ||
"https://documents.iplt20.com/ipl/assets/images/ipl-logo-new-old.png";

playerImg.onerror = function(){

this.src =
"https://documents.iplt20.com/ipl/assets/images/ipl-logo-new-old.png";

};

// =====================
// RESET BIDDER UI
// =====================

updateHighestBidder();

// =====================
// START TIMER
// =====================

startTimer();

}catch(error){

console.log(error);

}

}

// ======================
// TIMER
// ======================

function startTimer(){

clearInterval(timerInterval);

timer = 10;

document.getElementById(
"timer"
).innerText = timer;

timerInterval = setInterval(() => {

if(auctionPaused){
return;
}

timer--;

document.getElementById(
"timer"
).innerText = timer;

if(timer <= 0){

clearInterval(timerInterval);

// PLAYER SOLD

if(highestBidder){

sellPlayer();

}else{

// UNSOLD

showUnsoldPopup();

setTimeout(() => {

loadPlayer();

},2500);

}

}

},1000);

}

// ======================
// USER BID
// ======================

async function bid(){

if(!currentPlayer){

return;

}

// SAME TEAM CANNOT BID TWICE

if(lastBidTeam === selectedTeam){

return;

}

let increase = 0.5;

if(currentBid >= 5){

increase = 1;

}

if(currentBid >= 10){

increase = 2;

}

currentBid =
Number(
(currentBid + increase)
.toFixed(2)
);

highestBidder =
selectedTeam;

lastBidTeam =
selectedTeam;

// UPDATE UI

document.getElementById(
"current-bid"
).innerText =
currentBid.toFixed(2);

updateHighestBidder();

// RESET TIMER

timer = 10;

// AI RESPONSE

setTimeout(() => {

aiBid();

},1800);

}

document.getElementById(
"bid-btn"
).addEventListener(
"click",
bid
);

// ======================
// SMART AI BID
// ======================

function aiBid(){

if(!currentPlayer){

return;

}

const strategies = {

"CSK":["All-Rounder","Spinner","Wicket Keeper"],
"MI":["Bowler","All-Rounder"],
"RCB":["Batter","Wicket Keeper"],
"KKR":["Spinner","All-Rounder"],
"SRH":["Bowler","Batter"],
"RR":["Batter","Spinner"],
"DC":["Bowler","Wicket Keeper"],
"GT":["All-Rounder","Bowler"],
"LSG":["Batter","All-Rounder"],
"PBKS":["Batter","Bowler"]

};

// AVAILABLE TEAMS

const aiTeams =
allTeams.filter(team =>

team !== selectedTeam &&
team !== lastBidTeam

);

if(aiTeams.length === 0){

return;

}

// RANDOM TEAM

const aiTeam =

aiTeams[
Math.floor(
Math.random() *
aiTeams.length
)
];

// ROLE MATCH

const teamNeeds =
strategies[aiTeam] || [];

let bidChance = 0.35;

// ROLE MATCH BONUS

if(

teamNeeds.includes(
currentPlayer.role
)

){

bidChance = 0.80;

}

// HIGH PRICE REDUCTION

if(currentBid >= 15){

bidChance -= 0.30;

}

// FINAL DECISION

const willBid =
Math.random() < bidChance;

if(!willBid){

return;

}

// INCREASE

let increase = 0.5;

if(currentBid >= 5){

increase = 1;

}

if(currentBid >= 10){

increase = 2;

}

// UPDATE BID

currentBid =
Number(
(currentBid + increase)
.toFixed(2)
);

highestBidder =
aiTeam;

lastBidTeam =
aiTeam;

// UPDATE UI

document.getElementById(
"current-bid"
).innerText =
currentBid.toFixed(2);

updateHighestBidder();

// RESET TIMER

timer = 10;

// CONTINUE BIDDING WAR

setTimeout(() => {

if(Math.random() < 0.55){

aiBid();

}

},2000);

}

// ======================
// PAUSE BUTTON
// ======================

document.getElementById(
"pause-btn"
).addEventListener(
"click",
() => {

auctionPaused =
!auctionPaused;

const btn =
document.getElementById(
"pause-btn"
);

if(auctionPaused){

btn.innerText =
"Resume";

}else{

btn.innerText =
"Pause";

}

}
);

// ======================
// SKIP BUTTON
// ======================

document.getElementById(
"skip-btn"
).addEventListener(
"click",
() => {

if(highestBidder){

clearInterval(timerInterval);

sellPlayer();

return;

}

// AI GETS CHANCE

setTimeout(() => {

aiBid();

},1000);

// STILL NO BID

setTimeout(() => {

if(!highestBidder){

showUnsoldPopup();

setTimeout(() => {

loadPlayer();

},2000);

}

},5000);

}
);

// ======================
// SELL PLAYER
// ======================

async function sellPlayer(){

try{

const response = await fetch(
"http://127.0.0.1:5000/sell",
{
method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

team:highestBidder,
amount:currentBid

})

}
);

const data =
await response.json();

console.log(data);

// SOLD POPUP

showSoldPopup(
highestBidder,
currentBid
);

// RELOAD TEAMS

loadTeams();

// NEXT PLAYER

setTimeout(() => {

loadPlayer();

},2500);

}catch(error){

console.log(error);

}

}

// ======================
// SOLD POPUP
// ======================

function showSoldPopup(team,amount){

const popup =
document.getElementById(
"auction-popup"
);

document.getElementById(
"popup-icon"
).innerText = "🏆";

document.getElementById(
"popup-status"
).innerText = "SOLD";

document.getElementById(
"popup-status"
).style.color = "#22c55e";

document.getElementById(
"popup-player"
).innerText =
currentPlayer.name;

document.getElementById(
"popup-team"
).innerText =
`Sold To ${team}`;

document.getElementById(
"popup-price"
).innerText =
`₹${amount} Cr`;

popup.classList.remove(
"hidden"
);

setTimeout(() => {

popup.classList.add(
"hidden"
);

},2200);

}

// ======================
// UNSOLD POPUP
// ======================

function showUnsoldPopup(){

const popup =
document.getElementById(
"auction-popup"
);

document.getElementById(
"popup-icon"
).innerText = "❌";

document.getElementById(
"popup-status"
).innerText = "UNSOLD";

document.getElementById(
"popup-status"
).style.color = "#ef4444";

document.getElementById(
"popup-player"
).innerText =
currentPlayer.name;

document.getElementById(
"popup-team"
).innerText =
"No Team Bought";

document.getElementById(
"popup-price"
).innerText = "";

popup.classList.remove(
"hidden"
);

setTimeout(() => {

popup.classList.add(
"hidden"
);

},2200);

}

// ======================
// START
// ======================

loadPlayer();

loadTeams();