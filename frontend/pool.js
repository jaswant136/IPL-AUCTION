async function loadPools(){

const response = await fetch(
"https://ipl-auction-8h1w.onrender.com/pools"
);

const data = await response.json();

document.getElementById(
"current-player"
).innerText =
data.current_pool;

let html = "";

for(const pool in data.pools){

html += `

<div class="single-pool">

<h2 class="pool-name">

${pool}

</h2>

<div class="pool-players">

`;

data.pools[pool].forEach(player => {

let status = "";

if(player.team !== ""){

status =
`<span class="retained-tag">
RETAINED (${player.team})
</span>`;

}

else if(player.sold){

status =
`<span class="sold-tag">
SOLD
</span>`;

}

html += `

<div class="pool-player-card">

<div>

<h3>

${player.name}

</h3>

<p>

${player.role}

</p>

</div>

<div>

₹${player.basePrice} Cr

${status}

</div>

</div>

`;

});

html += `

</div>
</div>

`;

}

document.querySelector(
".pool-grid"
).innerHTML = html;

}

loadPools();