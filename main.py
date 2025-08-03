

from fastapi import FastAPI,HTTPException
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector
from datetime import date
from fastapi import Form, Query


app = FastAPI()


conn = mysql.connector.connect(
    host="localhost",
    port=3310,
    user="root",
    password="amine",
    database="stage",
    autocommit=True,
    ssl_disabled=True
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/get-agence-nom/{agence_id}")
def get_agence_nom(agence_id: int):
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT nom FROM agence WHERE id_agence = %s", (agence_id,))
    result = cursor.fetchone()
    if not result:
        return {"error": "Agence not found"}
    return {"nom": result["nom"]}

@app.post("/login")
def login(username: str = Form(...), password: str = Form(...)):
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id_agence FROM agence WHERE username = %s AND password = %s", (username, password))
    agence = cursor.fetchone()
    if not agence:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"id_agence": agence["id_agence"]}

@app.delete("/delete_card/{num_carte}/{agence_id}")
def delete_card(num_carte: str,agence_id: int):
    cursor = conn.cursor()
    cursor.execute("SELECT emplacement FROM carte WHERE num_carte = %s", (num_carte,))
    row = cursor.fetchone()
    if not row:
        return {"error": "Carte not found"}
    emplacement_id = row[0]
    cursor.execute("DELETE FROM carte WHERE num_carte = %s", (num_carte,))
    if emplacement_id:
        cursor.execute("UPDATE emplacement_agence SET occupe = 0 WHERE id_emplacement  = %s AND id_agence=%s", (emplacement_id,agence_id,))
    conn.commit()
    return {"message": "Carte supprimée avec succès"}


@app.delete("/delete_card_client/{num_carte}/{agence_id}")
def delete_card(num_carte: str, agence_id: int):
    cursor = conn.cursor()

    # Step 1: Get client ID from num_carte
    cursor.execute("SELECT id_client FROM carte WHERE num_carte = %s", (num_carte,))
    result = cursor.fetchone()
    if not result:
        return {"error": "Carte introuvable"}
    client_id = result[0]

    cursor.execute("SELECT emplacement FROM carte WHERE id_client = %s", (client_id,))
    emplacements = cursor.fetchall()

    for row in emplacements:
        emplacement = row[0]
        cursor.execute(
            "UPDATE emplacement_agence SET occupe = 0 WHERE id_emplacement = %s AND id_agence = %s",
            (emplacement, agence_id)
        )

    cursor.execute("DELETE FROM carte WHERE id_client = %s", (client_id,))

    cursor.execute("DELETE FROM client WHERE id = %s", (client_id,))

    conn.commit()
    return {"message": "Toutes les cartes et le client ont été supprimés avec succès"}





@app.get("/get_occupe/{agence_id}")
def get_suggestions(agence_id: int):
    cursor = conn.cursor(dictionary=True)
    
    query = "SELECT ea.*, emp.nom FROM emplacement_agence ea JOIN emplacement emp ON emp.id_emplacement = ea.id_emplacement WHERE ea.occupe = 1 AND ea.id_agence = %s ORDER BY emp.nom ASC"
    cursor.execute(query,(agence_id,))
    records = cursor.fetchall()
    return records 


@app.get("/get_emplacements/{new_emplacement}/{agence_id}")
def get_emplacements(new_emplacement: str,agence_id: int):
    cursor = conn.cursor(dictionary=True)
    query = """SELECT ea.occupe FROM emplacement_agence ea JOIN emplacement emp ON emp.id_emplacement = ea.id_emplacement WHERE emp.nom = %s AND ea.id_agence= %s"""
    cursor.execute(query, (new_emplacement,agence_id,))
    result = cursor.fetchone()
    while cursor.nextset():
        pass
    if not result:
        return False

    if result["occupe"] == 0:
        return True
    else:
        return False


@app.get("/get_suggestions/{agence_id}")
def get_suggestions(agence_id: int):
    cursor = conn.cursor(dictionary=True)
    
    query = "SELECT ea.*, emp.nom FROM emplacement_agence ea JOIN emplacement emp ON emp.id_emplacement = ea.id_emplacement WHERE ea.occupe = 0 AND ea.id_agence = %s "
    cursor.execute(query,(agence_id,))
    records = cursor.fetchall()
    return records 


@app.get("/get_client/{cin}/{agence_id}")
def get_client(cin: str,agence_id: int):
    cursor = conn.cursor(dictionary=True)
    query = '''
        SELECT p.*, cl.*
        FROM personne p
        JOIN client cl ON p.id = cl.id_personne
        WHERE p.cin LIKE %s AND cl.agence = %s
    '''
    cursor.execute(query, (f"%{cin}%",agence_id,))
    records = cursor.fetchall()
    return records
    




@app.get("/get-cartes/{num_agence}")
def get_all_cartes(num_agence:str):
    cursor = conn.cursor(dictionary=True)

    query = """
        SELECT p.nom, p.prenom, p.cin,
               c.type, c.num_carte, c.date_validite, c.date_ajout, c.etat,
               e.nom AS emplacement,
               cl.num_compte, cl.date_naissance, cl.contact
        FROM carte c
        JOIN client cl ON c.id_client = cl.id
        JOIN personne p ON cl.id_personne = p.id
        JOIN emplacement e ON c.emplacement = e.id_emplacement
        WHERE cl.agence = %s
    """
    cursor.execute(query, (num_agence,))
    results = cursor.fetchall()

    today = date.today()
    cartes = []
    for result in results:
        date_ajout = result["date_ajout"]
        jour = (today - date_ajout).days if date_ajout else 0
        if jour>25 and result["etat"]=="valable":
            cursor.execute(""" UPDATE carte SET etat = 'nonvalable' WHERE num_carte = %s""", (result["num_carte"],))
        if jour<25 and result["etat"]=="nonvalable":
            cursor.execute(""" UPDATE carte SET etat = 'valable' WHERE num_carte = %s""", (result["num_carte"],))
        
    for result in results:
        date_ajout = result["date_ajout"]
        jour = (today - date_ajout).days if date_ajout else 0
        cartes.append({
            
            "nom": result["nom"],
            "prenom": result["prenom"],
            "cin": result["cin"],
            "type": result["type"],
            "numCarte": result["num_carte"],
            "dateValidite": result["date_validite"].isoformat(),
            "existe": result["etat"],
            "emplacement": result["emplacement"],
            "jour": jour,
            "date_ajout": date_ajout.isoformat() if date_ajout else "",
            "numero_compte": result["num_compte"],
            "date_naissance": result["date_naissance"].isoformat() if result["date_naissance"] else "",
            "contact": result["contact"]
        })

    return cartes


@app.put("/update-carte-form/{cin}/{emplacement}/{agence_id}/{old_num_carte}")
def update_carte_form(
    old_num_carte: str,
    agence_id: int,
    cin: str,
    emplacement: str,
    new_cin: str = Form(...),    
    nom: str = Form(...),
    prenom: str = Form(...),
    type: str = Form(...),
    numCarte: str = Form(...),
    dateValidite: str = Form(...),
    existe: str = Form(...),
    new_emplacement: str = Form(...),
    date_ajout: str = Form(None),
    numero_compte: str = Form(...),
    date_naissance: str = Form(...),
    contact: str = Form(...)
):
    cursor = conn.cursor()
    print("mesaaaaaaaageeeeeeeeeeeeeeeeee",numCarte)

    from datetime import datetime, timedelta
    if date_ajout:
        try:
            date_ajout_dt = datetime.fromisoformat(date_ajout)
        except Exception:
            date_ajout_dt = None
        today = datetime.today()
        if date_ajout_dt:
            days_diff = (today - date_ajout_dt).days
            if days_diff > 25 and existe == "valable":
                existe = "nonvalable"
        if date_ajout_dt:
            days_diff = (today - date_ajout_dt).days
            if days_diff < 25 and existe == "nonvalable":
                existe = "valable"
        

    cursor.execute("""
        UPDATE personne
        SET nom = %s, prenom = %s, cin = %s
        WHERE cin = %s
    """, (nom, prenom, new_cin, cin))
    cursor.execute(""" select id from client where id_personne = (select id from personne where cin = %s) and agence = %s """, (new_cin,agence_id))
    client__id= cursor.fetchone()[0]

    cursor.execute("""
        UPDATE client
        SET num_compte = %s, date_naissance = %s, contact = %s
        WHERE id_personne = (SELECT id FROM personne WHERE cin = %s) AND agence = %s
    """, (numero_compte, date_naissance, contact, new_cin,agence_id))  # ← use new_cin

    cursor.execute("SELECT id_emplacement FROM emplacement WHERE nom = %s", (new_emplacement,))
    new_emplacement_result = cursor.fetchone()
    if not new_emplacement_result:
        return {"error": "New emplacement not found"}
    new_emplacement_id = new_emplacement_result[0]

    cursor.execute("SELECT id_emplacement FROM emplacement WHERE nom = %s", (emplacement,))
    old_emplacement_result = cursor.fetchone()
    old_emplacement_id = old_emplacement_result[0] if old_emplacement_result else None

    if new_emplacement != emplacement:
        if old_emplacement_id:
            cursor.execute("UPDATE emplacement_agence SET occupe = 0 WHERE id_emplacement = %s AND id_agence=%s ", (old_emplacement_id,agence_id))
        cursor.execute("UPDATE emplacement_agence SET occupe = 1 WHERE id_emplacement = %s AND id_agence=%s ", (new_emplacement_id,agence_id))

    
    cursor.execute("""
        UPDATE carte
        SET type = %s, num_carte = %s, date_validite = %s,
            date_ajout = %s, etat = %s, emplacement = %s
        WHERE id_client = %s AND num_carte= %s
    """, (
        type,
        numCarte,
        dateValidite,
        date_ajout,
        existe,
        new_emplacement_id,
        client__id ,# ← use new_cin here too
        old_num_carte,
    ))


    conn.commit()
    return {"message": "Carte updated successfully"}
@app.post("/ajouter-carte-form/{agence_id}")
def ajouter_carte_form(
    agence_id: int,
    new_cin: str = Form(...),
    nom: str = Form(...),
    prenom: str = Form(...),
    type: str = Form(...),
    numCarte: str = Form(...),
    dateValidite: str = Form(...),
    existe: str = Form(...),
    new_emplacement: str = Form(...),
    date_ajout: str = Form(None),
    numero_compte: str = Form(...),
    date_naissance: str = Form(...),
    contact: str = Form(...)
):
    from datetime import datetime, timedelta
    cursor = conn.cursor()
    try:
        if date_ajout:
            try:
                date_ajout_dt = datetime.fromisoformat(date_ajout)
            except Exception:
                date_ajout_dt = None
            today = datetime.today()
            if date_ajout_dt:
                days_diff = (today - date_ajout_dt).days
                if days_diff > 25 and existe == "valable":
                    existe = "nonvalable"
            if date_ajout_dt:
                days_diff = (today - date_ajout_dt).days
                if days_diff < 25 and existe == "nonvalable":
                    existe = "valable"

        cursor.execute("SELECT id FROM personne WHERE cin = %s", (new_cin,))
        personne_row = cursor.fetchone()
        if personne_row:
            personne_id = personne_row[0]
            print("messageeeeee" ,personne_row[0])
        else:
            cursor.execute("INSERT INTO personne (nom, prenom, cin) VALUES (%s, %s, %s)", (nom, prenom, new_cin))
            personne_id = cursor.lastrowid

        cursor.execute("SELECT id FROM client WHERE id_personne = %s AND agence=%s", (personne_id,agence_id))
        client_row = cursor.fetchone()
        print("client_row",client_row )
        if client_row:
            client_id=client_row[0]
        if not client_row:
            cursor.execute("INSERT INTO client (id_personne, num_compte, date_naissance, contact,agence) VALUES (%s, %s, %s, %s,%s)", (personne_id, numero_compte, date_naissance, contact,agence_id))
            client_id = cursor.lastrowid
        cursor.execute("SELECT id_emplacement FROM emplacement WHERE nom = %s ", (new_emplacement,))
        emplacement_row = cursor.fetchone()
        if not emplacement_row:
            return {"error": "Emplacement not found"}
        emplacement_id = emplacement_row[0]

        cursor.execute("""
            INSERT INTO carte (type, num_carte, date_validite, date_ajout, etat, emplacement, id_client)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            type,
            numCarte,
            dateValidite,
            date_ajout,
            existe,
            emplacement_id,
            client_id,  
        ))

        cursor.execute("UPDATE emplacement_agence SET occupe = 1 WHERE id_emplacement = %s and id_agence=%s", (emplacement_id,agence_id))

        conn.commit()
        return {"message": "Carte ajoutée avec succès"}
    except Exception as e:
        conn.rollback()
        return {e}



