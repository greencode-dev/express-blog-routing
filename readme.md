# Express Blog API 🚀

Un'API RESTful costruita con **Node.js** ed **Express** per la gestione completa dei post di un blog. Il progetto segue l'architettura **MVC** (Model-View-Controller) e integra un **Database MySQL** reale per la persistenza dei dati, sia utilizzando le classiche callback che le più moderne espressioni Promise.

## 🛠️ Tecnologie e Strumenti

- **Node.js**: Ambiente di runtime Javascript.
- **Express.js**: Framework web per la gestione di rotte e middleware.
- **Nodemon**: Utility per il riavvio automatico del server durante lo sviluppo.
- **mysql2**: Driver MySQL per Node.js.
- **Postman**: Strumento utilizzato per il testing degli endpoint CRUD.

---

## 📂 Struttura della Repository

La struttura segue la separazione delle responsabilità per garantire scalabilità e manutenibilità:

- `/controllers`: Contiene la logica di manipolazione dei dati usando il database (`postController.js` con callback e `postControllerPromise.js` con Promise).
- `/data`: Contiene la configurazione per la connessione al database MySQL (`db.js`).
- `/middlewares`: Gestione degli errori (500), rotte non trovate (404) e logger delle richieste.
- `/routers`: Definizione dei percorsi API e associazione ai metodi del controller.
- `app.js`: Punto di ingresso dell'applicazione e configurazione del server.

---

## 📦 Installazione e Avvio

1. **Clona la repository**:
   ```bash
   git clone https://github.com/greencode-dev/express-blog-sql.git
   ```
2. **Entra nella cartella del progetto**:

   ```bash
    cd express-blog-sql
   ```

3. **Installa le dipendenze**:
   ```bash
   npm install
   ```
4. **Avvia il server in modalità sviluppo**:
   ```bash
   npx nodemon app.js
   ```

## Il server sarà attivo all'indirizzo: **http://localhost:3000**

---

## ⚙️ Configurazione Database

Assicurati di aver configurato correttamente il tuo database MySQL. Le impostazioni di connessione si trovano nel file `/data/db.js`. Modifica le credenziali secondo le tue necessità.

---

## 🛣️ Endpoint API (CRUD)

Il progetto espone due set di rotte per interagire con il database, dimostrando l'utilizzo sia delle chiamate asincrone classiche che delle Promise:

- **Rotte classiche (Callback)**: `/posts`
- **Rotte moderne (Promise)**: `/posts/promise`

| Metodo     | Rotta        | Descrizione                      | Dettagli sul DB                         |
| :--------- | :----------- | :------------------------------- | :-------------------------------------- |
| **GET**    | `/`          | Ritorna la lista di tutti i post | Esegue `SELECT * FROM posts`            |
| **GET**    | `/:id`       | Dettagli di un singolo post      | Risponde con **404** se l'ID non esiste |
| **POST**   | `/`          | Crea e aggiunge un nuovo post    | `INSERT INTO posts` e ritorna record    |
| **PUT**    | `/:id`       | Aggiornamento totale             | Modifica intera riga e aggiorna il DB   |
| **PATCH**  | `/:id`       | Aggiornamento parziale           | Aggiorna solo i campi inviati           |
| **DELETE** | `/:id`       | Elimina un post                  | Elimina la riga e ritorna **204**       |

---

## 🛡️ Funzionalità e Middlewares

### 1. Gestione Errori e Sicurezza

- **NotFound Middleware**: Intercetta chiamate a endpoint inesistenti e risponde con status **404**.
- **Global Error Handler**: Gestisce eccezioni impreviste rispondendo con status **500**.

### 2. Validazione Dati (Bonus)

In fase di creazione (`POST`), il server controlla che:

- Il **title** sia presente e lungo almeno **3 caratteri**.
- Il campo **content** sia obbligatorio.

### 3. Logger delle Richieste

Middleware personalizzato che logga nel terminale ogni chiamata: `[DATA] METODO su /percorso`.

---

## 🧪 Esempio di Testing con Postman

Per creare un post, invia una richiesta **POST** a `/posts` con questo JSON nel Body:

```json
{
    "title": "Torta di Mele",
    "content": "La ricetta perfetta per una colazione sana e gustosa...",
    "image": "torta_mele.jpg",
    "tags": ["Dolci", "Colazione", "Fatto in casa"]
}

---

## 📝 Note sulla Persistenza
I dati sono gestiti in un **Database MySQL** reale. Ogni operazione CRUD (`POST`, `PUT`, `PATCH`, `DELETE`) esegue direttamente una query SQL (es. `INSERT`, `UPDATE`, `DELETE`), garantendo la persistenza definitiva dei dati tra le varie sessioni e al riavvio del server.

---

## 📂 Esclusione file con .gitignore
Per evitare di caricare file non necessari o pesanti su GitHub, è stato configurato un file `.gitignore` che esclude:
* `node_modules/` (le dipendenze vengono reinstallate con `npm install`)
* `.env` (eventuali variabili d'ambiente sensibili)
* `.DS_Store` (file di sistema macOS)

---

## 🚀 Sviluppi Futuri
Per rendere il progetto pronto per la produzione, potrebbe essere utile incrementare i prossimi step:
1. **Frontend Dedicato**: Creazione di una UI in React o Vue.js per consumare le API.
2. **Autenticazione**: Implementazione di JWT (JSON Web Tokens) per proteggere le rotte di creazione, modifica ed eliminazione.
3. **Upload Immagini**: Gestione dell'upload fisico di file immagine completando il sistema multer.

---

## 👤 Autore
**Studente Full Stack Web Developer** *Progetto realizzato durante il modulo di Express.js*

```
