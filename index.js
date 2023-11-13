// Express와 관련 모듈 및 라이브러리를 가져옴
const express = require("express"); // Express 웹 프레임워크
const cors = require("cors"); // Cross-Origin Resource Sharing을 처리하기 위한 모듈
const app = express(); // Express 인스턴스 생성
const mysql = require("mysql"); // MySQL과의 연결을 위한 모듈
const PORT = process.env.port || 8000; // 포트 설정
const bodyParser = require("body-parser"); // 요청 바디의 데이터를 파싱하는 미들웨어

// CORS 설정
let corsOptions = {
  origin: "http://localhost:3000", // 출처 허용 옵션 - 특정 도메인만 허용
  credentials: true, // 사용자 인증이 필요한 리소스(쿠키 등) 접근 허용
};

// CORS 미들웨어 적용
app.use(cors(corsOptions));

// JSON 파싱 미들웨어 적용
app.use(express.json());

// URL-encoded 파싱 미들웨어 적용
app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "bbs",
});

app.get("/list", (req, res) => {
  const sqlQuery =
    "SELECT BOARD_ID, BOARD_TITLE, BOARD_CONTENT, REGISTER_ID, DATE_FORMAT(REGISTER_DATE, '%Y-%m-%d') AS REGISTER_DATE FROM BOARD;";
  db.query(sqlQuery, (err, result) => {
    res.send(result);
  });
});

// 게시글 등록
app.post("/insert", (req, res) => {
  const title = req.body.title; // 요청 바디에서 게시글 제목을 가져옴
  const content = req.body.content; // 요청 바디에서 게시글 내용을 가져옴
  const registerId = req.body.registerId; // 요청 바디에서 게시글 작성자 ID를 가져옴

  //  게시글 정보를 데이터베이스에 삽입하는 쿼리
  const sqlQuery =
    "INSERT INTO BOARD (BOARD_TITLE, BOARD_CONTENT, REGISTER_ID) VALUES (?,?,?);";
  db.query(sqlQuery, [title, content, registerId], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    } else {
      res.send(result);
    }
  });
});

// 게시글 조회
app.get("/getPost/:id", (req, res) => {
  const id = req.params.id; // 파라미터로 전달된 게시글 ID를 가져옴

  // 게시글 ID로 데이터 조회하는 쿼리
  const sqlQuery =
    "SELECT BOARD_TITLE, BOARD_CONTENT, UPDATER_ID, REGISTER_ID FROM BOARD WHERE BOARD_ID = ?;";
  db.query(sqlQuery, [id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    } else {
      res.send(result[0]);
    }
  });
});

// 게시글 수정
app.post("/update", (req, res) => {
  const id = req.body.id; // 요청 바디에서 수정할 게시글 ID를 가져옴
  const title = req.body.title; // 요청 바디에서 수정할 게시글 제목을 가져옴
  const content = req.body.content; // 요청 바디에서 수정할 게시글 내용을 가져옴
  const updaterId = req.body.updaterId; // 요청 바디에서 수정한 사용자 ID를 가져옴
  // 게시글 정보를 수정하는 쿼리
  const sqlQuery =
    "UPDATE BOARD SET BOARD_TITLE = ?, BOARD_CONTENT = ?, UPDATER_ID = ? WHERE BOARD_ID = ?;";
  db.query(sqlQuery, [title, content, updaterId, id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    } else {
      res.send(result);
    }
  });
});

app.post("/delete", (req, res) => {
  const id = req.body.boardIdList //요청 바디에서 삭제할 게시글 ID리스틀 받아옴

  // 게시글 ID로 데이터 삭제하는 쿼리
  const sqlQuery = `DELETE FROM BOARD WHERE BOARD_ID IN(${id})`;
  db.query(sqlQuery, (err,result) => {
    res.send(result);
  });
});

app.listen(PORT, () => {
  console.log(`running on port ${PORT}`);
});
