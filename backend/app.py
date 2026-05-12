from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
import random
import sqlite3

app = Flask(__name__)

CORS(app)
# =========================
# DATABASE
# =========================

def get_db_connection():

    conn = sqlite3.connect(
        "database.db"
    )

    conn.row_factory = sqlite3.Row

    return conn
# =========================
# SIGNUP
# =========================

@app.route("/signup", methods=["POST"])

def signup():

    data = request.json

    username = data.get("username")

    password = data.get("password")

    if not username or not password:

        return jsonify({

            "success":False,
            "message":"Missing fields"

        })

    try:

        conn = get_db_connection()

        cursor = conn.cursor()

        cursor.execute(

            "INSERT INTO users (username, password) VALUES (?, ?)",

            (username, password)

        )

        conn.commit()

        conn.close()

        return jsonify({

            "success":True,
            "message":"Account Created"

        })

    except:

        return jsonify({

            "success":False,
            "message":"Username already exists"

        })
    
# =========================
# LOGIN
# =========================

@app.route("/login", methods=["POST"])

def login():

    data = request.json

    username = data.get("username")

    password = data.get("password")

    conn = get_db_connection()

    cursor = conn.cursor()

    cursor.execute(

        "SELECT * FROM users WHERE username=? AND password=?",

        (username, password)

    )

    user = cursor.fetchone()

    conn.close()

    if user:

        return jsonify({

            "success":True,
            "username":username

        })

    return jsonify({

        "success":False,
        "message":"Invalid Credentials"

    })

# =========================
# TEAMS
# =========================

teams = {

    "CSK":{"purse":100,"players":[]},
    "MI":{"purse":100,"players":[]},
    "RCB":{"purse":100,"players":[]},
    "KKR":{"purse":100,"players":[]},
    "SRH":{"purse":100,"players":[]},
    "RR":{"purse":100,"players":[]},
    "DC":{"purse":100,"players":[]},
    "LSG":{"purse":100,"players":[]},
    "GT":{"purse":100,"players":[]},
    "PBKS":{"purse":100,"players":[]}

}

# =========================
# LOAD PLAYERS
# =========================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

players_path = os.path.join(
    BASE_DIR,
    "players.json"
)

with open(players_path,"r",encoding="utf-8") as file:

    original_players = json.load(file)

players = original_players.copy()

# =========================
# PLAYER DEFAULTS
# =========================

for player in players:

    player["sold"] = False
    player["unsold"] = False
    player["shown"] = False

# =========================
# UNSOLD PLAYERS
# =========================

unsold_players = []

# =========================
# AUCTION ORDER
# =========================

auction_order = [

    "MA1",
    "M1",
    "M2",

    "BA1",
    "BA2",
    "BA3",

    "AL1",
    "AL2",
    "AL3",
    "AL4",

    "WK1",
    "WK2",
    "WK3",

    "FA1",
    "FA2",
    "FA3",
    "FA4",
    "FA5",

    "SP1",
    "SP2",
    "SP3",

    "UBA1",
    "UBA2",
    "UBA3",

    "UAL1",
    "UAL2",
    "UAL3",
    "UAL4",
    "UAL5",
    "UAL6",
    "UAL7",
    "UAL8",
    "UAL9",
    "UAL10",
    "UAL11",
    "UAL12",
    "UAL13",
    "UAL14",
    "UAL15",

    "UWK1",
    "UWK2",
    "UWK3",

    "UFA1",
    "UFA2",
    "UFA3",
    "UFA4",
    "UFA5",
    "UFA6",

    "USP1",
    "USP2",
    "USP3"

]

current_pool_index = 0

current_player = None

# =========================
# GET PLAYER
# =========================

@app.route("/get-player")

def get_player():

    global current_player
    global current_pool_index

    # =========================
    # MAIN AUCTION
    # =========================

    while current_pool_index < len(auction_order):

        current_pool = auction_order[
            current_pool_index
        ]

        pool_players = [

            player for player in players

            if player.get("pool") == current_pool
            and player.get("sold") == False
            and player.get("shown") == False

        ]

        # =========================
        # SHOW PLAYER
        # =========================

        if len(pool_players) > 0:

            current_player = random.choice(
                pool_players
            )

            current_player["shown"] = True

            return jsonify({

                "pool":current_pool,

                "name":current_player.get(
                    "name",
                    "Unknown Player"
                ),

                "role":current_player.get(
                    "role",
                    "Unknown Role"
                ),

                "basePrice":current_player.get(
                    "basePrice",
                    0
                ),

                "image":current_player.get(
                    "image",
                    "https://documents.iplt20.com/ipl/assets/images/ipl-logo-new-old.png"
                )

            })

        # =========================
        # NEXT POOL
        # =========================

        current_pool_index += 1

    # =========================
    # UNSOLD ROUND
    # =========================

    unsold_available = [

        player for player in unsold_players

        if player.get("sold") == False
        and player.get("shown") == False

    ]

    if len(unsold_available) > 0:

        current_player = random.choice(
            unsold_available
        )

        current_player["shown"] = True

        return jsonify({

            "pool":"UNSOLD SET",

            "name":current_player.get(
                "name",
                "Unknown Player"
            ),

            "role":current_player.get(
                "role",
                "Unknown Role"
            ),

            "basePrice":current_player.get(
                "basePrice",
                0
            ),

            "image":current_player.get(
                "image",
                "https://documents.iplt20.com/ipl/assets/images/ipl-logo-new-old.png"
            )

        })

    return jsonify({

        "message":"Auction Finished"

    })

# =========================
# IPL RETENTION RULES
# =========================

RETENTION_SLABS = [

    15,  # 1st capped
    11,  # 2nd capped
    8,  # 3rd capped
    8,  # 4th capped
    7   # 5th capped

]

UNCAPPED_PRICE = 4

# =========================
# RETAIN PLAYER
# =========================

@app.route("/retain", methods=["POST"])

def retain_player():

    global teams
    global players

    data = request.json

    team_name = data["team"]

    player_name = data["player"]

    # =========================
    # TEAM EXISTS
    # =========================

    if team_name not in teams:

        return jsonify({

            "success":False,
            "message":"Invalid Team"

        })

    team = teams[team_name]

    # =========================
    # FIND PLAYER
    # =========================

    player = None

    for p in players:

        if p["name"] == player_name:

            player = p
            break

    if player is None:

        return jsonify({

            "success":False,
            "message":"Player not found"

        })

    # =========================
    # ALREADY SOLD / RETAINED
    # =========================

    if player.get("sold") == True:

        return jsonify({

            "success":False,
            "message":"Player already retained"

        })

    # =========================
    # COUNTS
    # =========================

    capped_count = 0
    uncapped_count = 0

    for retained_player in team["players"]:

        if retained_player.get("uncapped"):

            uncapped_count += 1

        else:

            capped_count += 1

    total_retentions = len(
        team["players"]
    )

    # =========================
    # MAX 6 RETENTIONS
    # =========================

    if total_retentions >= 6:

        return jsonify({

            "success":False,
            "message":"Maximum 6 retentions allowed"

        })

    # =========================
    # UNCAPPED PLAYER
    # =========================

    if player.get("uncapped") == True:

        if uncapped_count >= 2:

            return jsonify({

                "success":False,
                "message":"Only 2 uncapped players allowed"

            })

        retention_price = UNCAPPED_PRICE

    else:

        # =========================
        # MAX 5 CAPPED
        # =========================

        if capped_count >= 5:

            return jsonify({

                "success":False,
                "message":"Only 5 capped players allowed"

            })

        retention_price = RETENTION_SLABS[
            capped_count
        ]

    # =========================
    # CHECK PURSE
    # =========================

    if team["purse"] < retention_price:

        return jsonify({

            "success":False,
            "message":"Not enough purse"

        })

    # =========================
    # UPDATE PLAYER
    # =========================

    player["sold"] = True
    player["retained"] = True
    player["team"] = team_name
    player["price"] = retention_price

    # =========================
    # ADD TO TEAM
    # =========================

    team["players"].append({

        "name":player.get(
            "name"
        ),

        "role":player.get(
            "role"
        ),

        "price":retention_price,

        "image":player.get(
            "image",
            "https://documents.iplt20.com/ipl/assets/images/ipl-logo-new-old.png"
        ),

        "retained":True,

        "uncapped":player.get(
            "uncapped",
            False
        ),

        "overseas":player.get(
            "overseas",
            False
        )

    })

    # =========================
    # DEDUCT PURSE
    # =========================

    team["purse"] -= retention_price

    team["purse"] = round(
        team["purse"],
        2
    )

    # =========================
    # SUCCESS
    # =========================

    return jsonify({

        "success":True,

        "message":"Player retained",

        "player":player_name,

        "team":team_name,

        "price":retention_price,

        "purse_left":team["purse"]

    })

# =========================
# SELL PLAYER
# =========================

@app.route("/sell", methods=["POST"])

def sell_player():

    global current_player
    global unsold_players

    data = request.json

    team = data["team"]

    amount = float(
        data["amount"]
    )

    if current_player is None:

        return jsonify({

            "success":False

        })

    if teams[team]["purse"] < amount:

        return jsonify({

            "success":False,
            "message":"Not enough purse"

        })

    # =========================
    # MARK SOLD
    # =========================

    current_player["sold"] = True
    current_player["unsold"] = False

    # =========================
    # REMOVE FROM UNSOLD SET
    # =========================

    unsold_players[:] = [

        p for p in unsold_players

        if p["name"] != current_player["name"]

    ]

    # =========================
    # ADD TO TEAM
    # =========================

    teams[team]["players"].append({

        "name":current_player.get(
            "name"
        ),

        "role":current_player.get(
            "role"
        ),

        "price":amount,

        "image":current_player.get(
            "image",
            "https://documents.iplt20.com/ipl/assets/images/ipl-logo-new-old.png"
        ),

        "retained":False,

        "overseas":current_player.get(
            "overseas",
            False
        )

    })

    teams[team]["purse"] -= amount

    teams[team]["purse"] = round(
        teams[team]["purse"],
        2
    )

    return jsonify({

        "success":True

    })

# =========================
# MARK PLAYER UNSOLD
# =========================

@app.route("/unsold", methods=["POST"])

def unsold():

    global current_player
    global unsold_players

    if current_player is None:

        return jsonify({

            "success":False

        })

    current_player["sold"] = False
    current_player["unsold"] = True
    current_player["shown"] = False

    already_exists = any(

        p["name"] == current_player["name"]

        for p in unsold_players

    )

    if not already_exists:

        unsold_players.append(
            current_player
        )

    return jsonify({

        "success":True

    })

# =========================
# TEAMS
# =========================

@app.route("/teams")

def get_teams():

    return jsonify(teams)

# =========================
# ALL PLAYERS
# =========================

@app.route("/all-players")

def all_players():

    return jsonify(players)

# =========================
# POOLS
# =========================

@app.route("/pools")

def pools():

    grouped = {}

    for pool in auction_order:

        grouped[pool] = []

    grouped["UNSOLD SET"] = []

    # =========================
    # NORMAL POOLS
    # =========================

    for player in players:

        # DON'T SHOW SOLD UNSOLD PLAYERS
        # IN ORIGINAL POOLS

        if player.get("unsold") == True:

            continue

        pool_name = player.get(
            "pool",
            "OTHER"
        )

        if pool_name not in grouped:

            grouped[pool_name] = []

        grouped[pool_name].append({

            "name":player.get(
                "name"
            ),

            "role":player.get(
                "role"
            ),

            "basePrice":player.get(
                "basePrice",
                0
            ),

            "image":player.get(
                "image",
                "https://documents.iplt20.com/ipl/assets/images/ipl-logo-new-old.png"
            ),

            "sold":player.get(
                "sold",
                False
            ),

            "unsold":player.get(
                "unsold",
                False
            )

        })

    # =========================
    # UNSOLD SET
    # =========================

    for player in unsold_players:

        grouped["UNSOLD SET"].append({

            "name":player.get(
                "name"
            ),

            "role":player.get(
                "role"
            ),

            "basePrice":player.get(
                "basePrice",
                0
            ),

            "image":player.get(
                "image",
                "https://documents.iplt20.com/ipl/assets/images/ipl-logo-new-old.png"
            ),

            "sold":player.get(
                "sold",
                False
            ),

            "unsold":True

        })

    return jsonify({

        "current_pool":
        auction_order[current_pool_index]
        if current_pool_index < len(auction_order)
        else "UNSOLD SET",

        "pools":grouped

    })

# =========================
# RESET AUCTION
# =========================

@app.route("/reset")

def reset():

    global players
    global teams
    global current_pool_index
    global current_player
    global unsold_players

    with open(players_path,"r",encoding="utf-8") as file:

        players = json.load(file)

    for player in players:

        player["sold"] = False
        player["unsold"] = False
        player["shown"] = False

    teams = {

        "CSK":{"purse":100,"players":[]},
        "MI":{"purse":100,"players":[]},
        "RCB":{"purse":100,"players":[]},
        "KKR":{"purse":100,"players":[]},
        "SRH":{"purse":100,"players":[]},
        "RR":{"purse":100,"players":[]},
        "DC":{"purse":100,"players":[]},
        "LSG":{"purse":100,"players":[]},
        "GT":{"purse":100,"players":[]},
        "PBKS":{"purse":100,"players":[]}

    }

    current_pool_index = 0

    current_player = None

    unsold_players = []

    return jsonify({

        "success":True

    })

# =========================
# RUN
# =========================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )