FROM postgres:18.6-alpine3.24@sha256:77f585114c32fbca283dc835b0596f4e52b51b4c6662d7810b2f4084f60a1873

# The upstream entrypoint uses gosu only to drop privileges when it starts as root.
# Run as the built-in postgres user directly and remove the vulnerable unused helper.
USER root
RUN test -x /usr/local/bin/gosu && rm /usr/local/bin/gosu
COPY create-app-role.sh /docker-entrypoint-initdb.d/10-create-app-role.sh
USER postgres
