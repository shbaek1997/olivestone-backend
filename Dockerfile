# node 서버의 node 환경 설정..
FROM node:18.12-alpine3.15

# /app 디렉토리를 생성
RUN mkdir -p /app

# /app에서 작업 실행
WORKDIR /app

# 현재 디렉토리의 package.json, package.lock.json을 app 폴더로 복사
COPY package*.json /app/

# Dependency node module 설치
RUN npm install

# 현재 디렉토리의 서버 관련 파일들을 app으로 복사
COPY ./ /app

# npm run start
CMD ["npm","start"]

