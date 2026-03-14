# Express Blog API 🚀

Un'API RESTful costruita con **Node.js** ed **Express** per la gestione completa dei post di un blog. Il progetto segue l'architettura **MVC** (Model-View-Controller) e include sistemi di validazione, gestione dinamica degli ID e middleware personalizzati per il controllo degli errori.

## 🛠️ Tecnologie e Strumenti

- **Node.js**: Ambiente di runtime Javascript.
- **Express.js**: Framework web per la gestione di rotte e middleware.
- **Nodemon**: Utility per il riavvio automatico del server durante lo sviluppo.
- **mysql2**: Driver MySQL per Node.js.
- **Postman**: Strumento utilizzato per il testing degli endpoint CRUD.

---

## 📂 Struttura della Repository

La struttura segue la separazione delle responsabilità per garantire scalabilità e manutenibilità:

- `/controllers`: Contiene la logica di manipolazione dei dati (`postController.js`).
- `/data`: Contiene l'array dei post che funge da database temporaneo (`posts.js`).
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
     cd express-blog-routing
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

| Metodo     | Rotta        | Descrizione                      | Validazione / Bonus                     |
| :--------- | :----------- | :------------------------------- | :-------------------------------------- |
| **GET**    | `/posts`     | Ritorna la lista di tutti i post | Supporta filtro per tag: `?tag=Dolci`   |
| **GET**    | `/posts/:id` | Dettagli di un singolo post      | Risponde con **404** se l'ID non esiste |
| **POST**   | `/posts`     | Crea e aggiunge un nuovo post    | Genera l'ID più alto esistente + 1      |
| **PUT**    | `/posts/:id` | Aggiornamento totale             | Sostituisce l'intera risorsa            |
| **PATCH**  | `/posts/:id` | Aggiornamento parziale           | Modifica solo i campi inviati nel body  |
| **DELETE** | `/posts/:id` | Elimina un post                  | Risponde con stato **204 No Content**   |

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
I dati sono gestiti in **memoria volatile (RAM)**. Poiché l'array viene caricato all'avvio dal file `data/posts.js`, ogni modifica apportata tramite le API (`POST`, `PUT`, `DELETE`) verrà resettata ai valori iniziali ogni volta che il server viene riavviato (ad esempio tramite *Nodemon* dopo una modifica al codice).

---

## 📂 Esclusione file con .gitignore
Per evitare di caricare file non necessari o pesanti su GitHub, è stato configurato un file `.gitignore` che esclude:
* `node_modules/` (le dipendenze vengono reinstallate con `npm install`)
* `.env` (eventuali variabili d'ambiente sensibili)
* `.DS_Store` (file di sistema macOS)

---

## 🚀 Sviluppi Futuri
Per rendere il progetto pronto per la produzione, potrebbe essere utile incrementare i prossimi step:
1. **Persistenza su File**: Utilizzo del modulo `fs` di Node.js per scrivere le modifiche direttamente su un file JSON.
2. **Database Reale**: Integrazione con MongoDB o MySQL per una gestione dati persistente e professionale.
3. **Autenticazione**: Implementazione di JWT (JSON Web Tokens) per proteggere le rotte di creazione, modifica ed eliminazione.

---

## 👤 Autore
**Studente Full Stack Web Developer** *Progetto realizzato durante il modulo di Express.js*

```
