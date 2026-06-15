FROM nginx:alpine

# Copy static files to Nginx directory
COPY . /usr/share/nginx/html

# Expose port 80 (default Nginx port)
EXPOSE 80
