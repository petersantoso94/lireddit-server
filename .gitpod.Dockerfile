FROM gitpod/workspace-full

# Install postgres & Redis
USER root
RUN apt-get update && apt-get install -y \
        postgresql \
        postgresql-contrib \
        redis-server \
    && apt-get clean && rm -rf /var/cache/apt/* && rm -rf /var/lib/apt/lists/* && rm -rf /tmp/*

# Setup postgres server for user gitpod
USER postgres
RUN /etc/init.d/postgresql start &&\
    createdb -O postgres pireddit
