const socket = io(
"http://127.0.0.1:5000"
);

const roomCode =
localStorage.getItem(
"roomCode"
);

const coachName =
localStorage.getItem(
"coachName"
);

const selectedTeam =
localStorage.getItem(
"selectedTeam"
);

document.getElementById(
"room-code"
).innerText =
roomCode;

// =======================
// JOIN ROOM
// =======================

socket.emit(
"join_room",
{
room:roomCode,
username:coachName,
team:selectedTeam
}
);

// =======================
// USERS UPDATE
// =======================

socket.on(
"room_users",
(data) => {

let html = "";

data.users.forEach(user => {

html += `

<div class="joined-user">

<div class="joined-team">

${user.team}

</div>

<div>

<h2>
${user.name}
</h2>

<p>
${user.team}
</p>

</div>

</div>

`;

});

document.getElementById(
"users-list"
).innerHTML = html;

}
);

// =======================
// START AUCTION
// =======================

function startAuction(){

socket.emit(
"start_auction",
{
room:roomCode
}
);

}

// =======================
// REDIRECT
// =======================

socket.on(
"auction_started",
() => {

window.location.href =
"index.html";

}
);