FROM python:3 

MAINTAINER Z4HD <Z4HD@outlook.com>

WORKDIR /usr/src/app 

RUN apt update &&\ 
    apt -y upgrade &&\
    curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | bash &&\
    apt -y install git git-lfs ssh-client ca-certificates &&\
    git lfs install

RUN pip install --no-cache-dir mkdocs