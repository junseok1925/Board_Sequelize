const jwt = require("jsonwebtoken");
const { Users } = require("../models");

module.exports = async (req, res, next) => {
    const { Authorization } = req.cookies;
    // Bearer qweqweqe.qweqweqw.qweqweq
    //authorization가 존재하지 않았을때를 대비
    // null 병합 문자열 : 왼쪽의 값이 비었거나 null일 경우 오른쪽 값으로 대치해준다
    const [authType, authToken] = (Authorization ?? "").split(" ");

  //authType === Bearer값인지 확인
  //authToken 검증
  if (!authToken || authType !== "Bearer") {
      res.status(403).json({
      errorMessage: "로그인이 필요한 기능입니다.",
    });
    return; // 더 이상 다음 코드로 진행 막기위해 리턴
  }

  // 1. authToken이 만료되었는지 확인
  // 2. authToken이  서버가 발급 토큰이 맞는지 검증
  // 3. authToken에 있는 userId에 해당하는 사용자가 실제 DB에 존재하는지 확인

  //J WT 검증
  try {
    // 1. authToken이 만료되었는지 확인
    // 2. authToken이  서버가 발급 토큰이 맞는지 검증
    const { userId } = jwt.verify(authToken, "customized-secret-key");

    // 3. authToken에 있는 userId에 해당하는 사용자가 실제 DB에 존재하는지 확인
    const user = await Users.findOne({where:{userId}});
    // 현재 이 미들웨어 다음으로 넘기기 위해서 우선 locals안에다가 유저정보를 전달한다
    res.locals.user = user;
    next(); // 이 미들웨어 다음으로 보낸다
  } catch (error) {
    console.error(error);
    res.status(403).json({errorMessage: "전달된 쿠키에 오류가 있습니다."});
    return;
  }
};
