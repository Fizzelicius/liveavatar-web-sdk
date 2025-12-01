# Deployment Instructions: AI Data Narrator

This guide provides instructions for deploying the AI Data Narrator application using Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your machine.
- A `.env.local` file created inside the `apps/demo` directory with all the required environment variables. You can use the `.env.local.template` as a guide.

---

## Building the Docker Image

1.  **Navigate to the project root directory:**
    Open a terminal and `cd` into the root of the `liveavatar-web-sdk` monorepo.

2.  **Build the Docker image:**
    Run the following command to build the Docker image for the `demo` application. The `-f` flag specifies the path to the Dockerfile, and the `-t` flag tags the image with a name.

    ```bash
    docker build -f apps/demo/Dockerfile -t ai-data-narrator .
    ```

    This command will execute the multi-stage build defined in the Dockerfile. It will install dependencies, build the Next.js application, and create a production-ready image.

---

## Running the Docker Container

1.  **Run the container:**
    Once the image is built, you can run it as a container using the following command.

    ```bash
    docker run -p 3000:3000 --env-file apps/demo/.env.local -d ai-data-narrator
    ```

    - `-p 3000:3000`: This maps port 3000 on your host machine to port 3000 inside the container, which is where the Next.js application runs.
    - `--env-file apps/demo/.env.local`: This command securely passes all the environment variables from your `.env.local` file into the container. **Make sure this file is correctly populated with your API keys and secrets.**
    - `-d`: This runs the container in "detached" mode, meaning it runs in the background.
    - `ai-data-narrator`: This is the name of the image you want to run.

2.  **Access the application:**
    Open your web browser and navigate to `http://localhost:3000`. You should see the AI Data Narrator application running.

3.  **Viewing Logs (Optional):**
    To view the logs from the running container, first find the container ID by running `docker ps`. Then, use the following command:

    ```bash
    docker logs <CONTAINER_ID>
    ```

4.  **Stopping the Container:**
    To stop the container, use the following command:

    ```bash
    docker stop <CONTAINER_ID>
    ```

---

## Environment Variables

The application requires the following environment variables to be set in `apps/demo/.env.local`. Refer to `.env.local.template` for a complete list.

- `LLM_PROVIDER`: `openai` or `gemini`.
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase project anonymous key.
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for server-side use).
- `GEMINI_API_KEY`: Your Google Gemini API key.
- `OPENAI_API_KEY`: Your OpenAI API key.
- `NEXT_PUBLIC_HEYGEN_API_URL`: The API URL for HeyGen LiveAvatar.
- `HEYGEN_API_KEY`: Your HeyGen API key.

Ensure these variables are correctly configured before building and running the Docker image.
