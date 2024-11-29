# **Northcoders News API**

## **Overview**

This project is an API, made for managing new articles, topics, comments and users. It includes the functionality to retrieve, create, update and delete data, with additional features such as sorting and filtering.

### Hosted Version

This API is available [here](https://ethans-nc-backend-news-project.onrender.com/api).

---

## Getting started

### Prerequisites

Before attempting to run this project, please ensure the following are installed:

- **Node.js** v22.9.0 or higher
- **PostgreSQL** v16.4 or higher

### Installation

1. **Clone the repository:**:

   ```bsh
   git clone https://github.com/E-Riley/nc-backend-news-project.git
   ```

2. **Navigate to the project directory:**

   ```bsh
   cd .../be-nc-news
   ```

3. **Install dependencies:**

   ```bsh
   npm install
   ```

4. **Setup the `.env` files:**
   Create two `.env` files in the root directory of the project and populate them with the following:

   - `.env.test`

     ```bsh
     PGDATABASE=nc_news_test
     ```

   - `.env.development`
     ```bsh
     PGDATABASE=nc_news
     ```

5. **Seed the local database:**
   Run the following commands to create and populate your database:

   ```bsh
   npm run setup-dbs
   npm run seed
   ```

6. **Run the server:**

   ```bsh
   npm start
   ```

   The server will run on `http://localhost:9090` by default. This can be changed inside of `listen.js`.

## Running Tests

This project incldues a vast test suite which can be found at `./__tests__/app.test.js`. To run the tests, run the following command:

```bsh
npm run test app
```

## API Endpoints

### Base URL

For the local version:

```bsh
http://localhost:9090/api
```

For the hosted version:

```bsh
https://ethans-nc-backend-news-project.onrender.com/api
```

### Summary of Endpoints

| Method | Endpoint                             | Description                                                             |
| ------ | ------------------------------------ | ----------------------------------------------------------------------- |
| GET    | `/api`                               | Retrieves a list of all available API endpoints                         |
| GET    | `/api/topics`                        | Fetches all topics                                                      |
| GET    | `/api/articles/:article_id`          | Fetches an article by its ID                                            |
| GET    | `/api/articles`                      | Fetches all articles with optional queries for sort_by, order and topic |
| GET    | `/api/articles/:article_id/comments` | Fetches all comments for a sepecific article                            |
| GET    | `/api/users`                         | Fetches all users                                                       |
| GET    | `/api/users/:username`               | Fetches a user object by username                                       |
| POST   | `/api/users/:article_id/comments`    | Posts a new comment to an article                                       |
| PATCH  | `/api/articles/:article_id`          | Updates an article's votes                                              |
| DELETE | `/api/comments/:comment_id`          | Deletes a specific comment                                              |

---

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
