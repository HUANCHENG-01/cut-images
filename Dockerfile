FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 1996
RUN echo 'server { listen 1996; root /usr/share/nginx/html; index index.html; }' > /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]
