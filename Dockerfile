FROM arm64v8/nginx:latest
RUN rm -rf /etc/nginx/conf.d
COPY nginx /etc/nginx
COPY build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
