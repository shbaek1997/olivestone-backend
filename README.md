# **Project Upload and Download Olivestone Lab (Server)**

## 서비스 소개

- 어떤한 종류의 파일이든 상관 없이 파일을 서버 디렉토리에 업로드, 다운로드를 할 수 있게 하는 웹페이지

- 이러한 서비스의 Backend 서버 Repository
- 브라우저에서 뿐만 아니라, POST 요청으로 터미널에서도 파일 다운로드 가능
- 클라이언트 Repository는 이 [링크](http://swrnd.olivestonelab.com:32790/shbaek1997/project-upload-download/-/blob/develop/README.md)를 참조

## 서비스 설명

- 서버에 파일 업로드 시, 이미 가입된 유저네임과 비밀번호를 입력하여 로그인을 한 경우에만 업로드가 가능
- 유저 로그인 시, JWT token을 생성 후, SessionStorage에 토큰 저장 (회원가입 기능은 미구현, user register api로 회원 추가는 가능)
- 서버에 파일 업로드 시, 유저가 업로드 되는 파일의 파일 비밀번호를 설정
- 성공적으로 파일 업로드 시, DB에 저장되는 파일의 아이디 값 (MongoDB id)을 유저에게 전달
- 서버에서 파일 다운로드 시, 파일 아이디와 유저가 업로드 할 때 입력하였던 비밀번호를 입력 받고, 파일 아이디와 비밀번호가 일치할 경우에만 파일이 다운로드 됨.

## 기술 스텍

- 서버 프레임워크 : NodeJs 기반의 [Express JS](https://expressjs.com/)
- Database : [MongoDB Atlas](https://www.mongodb.com/atlas), [Mongoose (ODM)](https://mongoosejs.com/docs/guide.html)
- 유저 인증 모듈: [bcrypt](https://www.npmjs.com/package/bcrypt), [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken), [passport](https://www.passportjs.org/docs/), [passport-local](https://www.passportjs.org/howtos/password/), [passport-jwt](http://www.passportjs.org/packages/passport-jwt/)
- 파일 업로드 기능: [multer](https://github.com/expressjs/multer/blob/master/README.md)
- 파일 다운로드 기능: [file system- fs](https://nodejs.org/api/fs.html#filehandlecreatereadstreamoptions)
- 파일명 문자열 깨짐 인코딩/디코딩: [iconv-lite](https://github.com/ashtuchkin/iconv-lite)

## 개발 환경

- Node version: v18.11.0
- Express version: ~4.16.1
- MongoDB Atlas: 5.0.13

## Set Up & 실행 방법

- 환경 변수 설정 (.env 파일 생성)
  - Localhost PORT 값 설정 - 예: PORT = 5000;
  - MongoDB Atlas URL 설정 - 예: MONGO_DB_URL = "mongodb+srv://USERNAME:PASSWORD@uploadcluster.i7h86cz.mongodb.net/?retryWrites=true&w=majority"
  - JWT secret key 설정 - 예: JWT_SECRET_KEY = "MY SECRET KEY";
- terminal에 npm run start로 프로젝트 실행
- http://localhost:5000/ 접속/실행 여부 확인
- API test Tool (예- postman)로 API 동작 여부 확인
  - 유저 인증을 위해서는 Header에는 Authorization: Bearer token 설정이 필요
  - 업로드 시, Body는 Form Data로 설정하고, key/value 쌍 중 file을 가장 마지막으로 form에 등록해야 함
- API response가 정상이라면, MongoDB의 Collection이 정상적으로 업데이트 되었나 확인
- 클라이언트를 실행하므로써 간편하게 API의 동작여부 확인 가능
- 터미널로 파일 다운로드 시,`curl -X POST http://localhost:5000/files/download -H "Content-Type: application/json" -d '{"fileId":"MongoDBFileId","plainPassword":"FilePassword"}' --output downloadFileName` 으로 현재 디렉토리에 다운로드 가능
