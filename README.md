# Importer la base de données dans MySQL Workbench

1) Ouvrez MySQL Workbench  
2) Créez un nouveau schéma  
3) Exécutez le script SQL `database/base.sql` pour créer les tables et les données :  



# Configuration

Configurez le port et les paramètres de connexion à la base de données dans `main.py` :

conn = mysql.connector.connect(
    host="localhost",
    port=3310,
    user="root",
    password="amine",
    database="stage",
    autocommit=True,
    ssl_disabled=True
)

Remplacez ces valeurs par votre propre configuration si nécessaire.


# Comment démarrer

- Démarrer le serveur Angular :  
  ng serve

- Démarrer le backend FastAPI :  
  python -m uvicorn main:app --reload
