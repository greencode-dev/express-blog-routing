# Ciao studente, oggi lavoriamo nella repo: express-blog-sql

## ESERCIZIO

Prendiamo le API precedentemente create per il vostro blog ed aggiungiamo la persistenza tramite la connessione a un DB.

### MILESTONE 1

- Importiamo il db in allegato su MySQL Workbench
- Installiamo il client mysql2 con `npm i mysql2` nell’app Express
- Creiamo un file di configurazione per connettere il database
- Inseriamo un console.log nella logica di connessione e proviamo ad avviare l’applicazione per verificare che non ci siano errori.

### MILESTONE 2

- Facciamo sì che l’API di INDEX restituisca la lista di post recuperata dal database in formato JSON
- Verifichiamo su Postman che la risposta sia corretta

### MILESTONE 3

- Facciamo sì che l’API di DESTROY permetta di eliminare un post dal database
- Verifichiamo su Postman che la chiamata non dia errore e risponda 204
- Verifichiamo su MySQL Workbench che il post venga effettivamente rimosso

### BONUS

- Facciamo sì che l’API di SHOW restituisca il post desiderato in formato JSON
- Verifichiamo su Postman che la risposta sia corretta

Buon lavoro!
