FROM ghcr.io/yong-space/nginx-tiny
COPY dist /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
