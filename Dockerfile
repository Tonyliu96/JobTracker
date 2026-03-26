FROM ubuntu:latest
LABEL authors="tony"

ENTRYPOINT ["top", "-b"]