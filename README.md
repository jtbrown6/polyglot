# Getting Started with Create React App
To prepare your application for production and run it in Docker, follow these steps:

Build the React App:

Run the build command to create an optimized production build of your React app.
npm run build
Create a Dockerfile:

Create a Dockerfile in the root of your project to define the Docker image.
Use a multi-stage build to first build the React app and then serve it using a lightweight web server like nginx.
# Stage 1: Build the React app
FROM node:14 as build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve the app with nginx
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx configuration
# Stage 1: Build the React app
FROM node:14 as build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

COPY . .
RUN npm run build

# Stage 2: Serve the app with nginx
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


Build the Docker Image:

Build the Docker image using the Dockerfile.
docker build --build-arg REACT_APP_API_BASE_URL=http://192.168.1.250:5001 -t polyglot .

Run the Docker Container:

Run the Docker container, mapping port 80 in the container to port 3000 on your host.
docker run -p 3000:80 polyglot
Set Environment Variables:

Ensure that the REACT_APP_API_BASE_URL environment variable is set to http://192.168.1.250:5000 when building the Docker image or running the container.
By following these steps, you can build and run your React app in a Docker container, serving it on 0.0.0.0:3000 and proxying API requests to the FastAPI endpoint at 192.168.1.250:5000.