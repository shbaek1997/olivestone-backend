# **Project Upload and Download Olivestone Lab (Server)**

## 서비스 소개

- 어떤한 종류의 파일이든 상관 없이 파일을 서버 디렉토리에 업로드, 다운로드를 할 수 있게 하는 웹페이지

- 이러한 서비스의 Backend 서버 Repository
- 브라우저에서 뿐만 아니라, POST 요청으로 터미널에서도 파일 다운로드 가능
- 클라이언트 Repository는 이 [링크](http://swrnd.olivestonelab.com:32790/shbaek1997/project-upload-download/-/blob/develop/README.md)를 참조
- Docker와 nginx를 활용한 배포는 이 [링크](http://swrnd.olivestonelab.com:32790/shbaek1997/project-upload-download-deploy)를 참조

## 서비스 설명

#### 자세한 서비스 설명은 클라이언트 Repository인 이 [링크](http://swrnd.olivestonelab.com:32790/shbaek1997/project-upload-download/-/blob/develop/README.md)를 참조

#### 서버 관련 특이사항

- 서버에 파일 업로드 시, 파일 정보는 MongoDB에 저장되고, 파일 자체는 서버 directory (uploads 폴더)에 저장됨
- 파일 업로드 시, 파일의 유효기간이 설정됨, 이 때의 유효기간은 day단위 이고, 한국 00시 기준으로 유효 상태가 변경됨
  - 예를 들어서, 23시 25분에 파일 A의 유효기간을 하루로 설정하면 그 날 24시 00분 (다음날 00시00분)에 파일이 만료되면서 디렉토리의 파일이 삭제됨
- 파일의 유효 기간이 끝나서 디렉토리에서 파일이 삭제가 되어도, 파일 정보가 DB에서 삭제가 되지는 않음
- 따라서 클라이언트에서 파일 삭제 버튼을 눌러도, 이때의 삭제 개념은 디렉토리의 파일 삭제와 DB의 파일 만료가 동시에 일어남
- 파일의 유효기간은 app.js 파일의 setInterval 기능으로 서버가 켜져있는 상태에서 서버 시작할 때와 정한 시간(현재는 1시간) 단위 마다 디렉토리의 파일들의 정보를 확인하는 과정을 통하여 파일을 삭제함.

## 기술 스텍

- 서버 프레임워크 : NodeJs 기반의 [Express JS](https://expressjs.com/)
- Database : [MongoDB Atlas](https://www.mongodb.com/atlas), [Mongoose (ODM)](https://mongoosejs.com/docs/guide.html)
- 환경 변수 사용: [dotenv](https://github.com/motdotla/dotenv)
- 유저 인증 모듈: [bcrypt](https://www.npmjs.com/package/bcrypt), [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken), [passport](https://www.passportjs.org/docs/), [passport-local](https://www.passportjs.org/howtos/password/), [passport-jwt](http://www.passportjs.org/packages/passport-jwt/)
- 파일 업로드 기능: [multer](https://github.com/expressjs/multer/blob/master/README.md)
- 파일 다운로드 기능: [file system- fs](https://nodejs.org/api/fs.html#filehandlecreatereadstreamoptions)
- 파일명 문자열 깨짐 인코딩/디코딩: [iconv-lite](https://github.com/ashtuchkin/iconv-lite)
- 이메일 전송 기능: [nodemailer](https://nodemailer.com/about/)

## 개발 환경

- Node version: v18.11.0
- Express version: ~4.16.1
- MongoDB Atlas: 5.0.13

## Set Up & 실행 방법

- 환경 변수 설정 (.env 파일 생성)
  - Localhost PORT 값 설정 - 예: PORT = 5000;
  - MongoDB Atlas URL 설정 - 예: MONGO_DB_URL = "mongodb+srv://USERNAME:PASSWORD@uploadcluster.i7h86cz.mongodb.net/?retryWrites=true&w=majority"
  - JWT secret key 설정 - 예: JWT_SECRET_KEY = "MY SECRET KEY";
  - HOME_PAGE 설정 - 예: http://localhost:3000
  - MAIL_ID, PASSWORD 설정 - 예: gmail id 와 관련 app 비밀번호
- 환경 변수 설정 예:
  ```
  PORT= 5000
  JWT_SECRET_KEY=your_secret_key
  MONGO_DB_URL=mongodb+srv://MONGO_USERNAME:MONGO_PW@uploadcluster.i7h86cz.mongodb.net/?retryWrites=true&w=majority
  MAIL_ID=gmail_account
  MAIL_PASSWORD=app_password
  HOME_PAGE=http://localhost:80
  ```
- terminal에 `npm run start`로 프로젝트 실행
- http://localhost:5000/ 접속/실행 여부 확인
- API test Tool (예- postman)로 API 동작 여부 확인
  - 유저 인증을 위해서는 Header에는 Authorization: Bearer token 설정이 필요
  - 업로드 시, Body는 Form Data로 설정하고, key/value 쌍 중 file을 가장 마지막으로 form에 등록해야 함
- API response가 정상이라면, MongoDB의 Collection이 정상적으로 업데이트 되었나 확인
- 클라이언트를 실행하므로써 간편하게 API의 동작여부 확인 가능
- 터미널로 파일 다운로드 시,`curl -X POST http://localhost:5000/api/files/download -H "Content-Type: application/json" -d '{"fileId":"MongoDBFileId","plainPassword":"FilePassword"}' -O -J` 으로 현재 디렉토리에 다운로드 가능
