FROM ubuntu:mantic as builder
ARG CHISEL_VER=0.9.0
WORKDIR /opt
ADD https://github.com/canonical/chisel/releases/download/v${CHISEL_VER}/chisel_v${CHISEL_VER}_linux_arm64.tar.gz chisel.tar.gz
RUN apt update \
    && apt install -y ca-certificates \
    && tar -xvf chisel.tar.gz -C /usr/bin/ \
    && mkdir rootfs \
    && install -d -m 0755 -o 33 -g 33 rootfs/var/www
RUN chisel cut --release ubuntu-23.10 --root $PWD/rootfs \
    base-files_var \
    base-passwd_data \
    nginx_bins \
    nginx-common_index
RUN rm -rf /opt/rootfs/etc/nginx/nginx.conf

FROM scratch
COPY --from=builder /opt/rootfs /
COPY nginx /etc/nginx
COPY dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
