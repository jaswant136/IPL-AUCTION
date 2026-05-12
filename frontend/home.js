function createRoom(){

const roomCode =
"IPL" +
Math.floor(
1000 + Math.random()*9000
);

localStorage.setItem(
"roomCode",
roomCode
);

window.location.href =
"teamselect.html";
}

function joinRoom(){

const room =
prompt(
"Enter Room Code"
);

if(!room){

return;
}

localStorage.setItem(
"roomCode",
room
);

window.location.href =
"teamselect.html";
}