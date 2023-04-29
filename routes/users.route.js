const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { Users } = require("../models");

// ================================================ 회원가입 ================================================
router.post("/signup", async (req, res) => {
  try {
    const { nickname, password, confirmPassword } = req.body;
    const isExistUser = await Users.findOne({ where: { nickname } });

    // # 412 닉네임 형식이 비정상인 경우
    if (!/^[a-zA-Z0-9]+$/.test(nickname) || nickname.length < 3) {
      return res.status(412).json({
        errorMessage: "닉네임의 형식이 일치하지 않습니다.",
      });
    }

    // # 412 password 형식이 비정상인 경우
    if (password.length < 4) {
      return res.status(412).json({
        errorMessage: "패스워드 형식이 일치하지 않습니다.",
      });
    }

    // # 412 password에 nickname이 포함되어있는 경우
    if (password.includes(nickname)) {
      return res.status(412).json({
        errorMessage: "패스워드에 닉네임이 포함되어 있습니다.",
      });
    }

    // # 412 password와 confirmPassword가 일치하지않는 경우
    if (password !== confirmPassword) {
      return res.status(412).json({
        errorMessage: "패스워드가 패스워드 확인란과 다릅니다.",
      });
    }

    // #412 nickname이 중복된 경우
    if (isExistUser) {
      return res.status(412).json({
        errorMessage: "중복된 닉네임입니다.",
      });
    }

    const user = await Users.create({ nickname, password });
    await user.save();

    res.status(201).json({ message: "회원가입에 성공했습니다." });

    // #400 예외 케이스에서 처리하지 못한 에러
  } catch (error) {
    console.error(error);
    res.status(400).json({
      errorMessage: "요청한 데이터 형식이 올바르지 않습니다.",
    });
  }
});

//================================ 로그인 API //================================
// 로그인이면 get을 쓰는게 맞지 않는가?
// -> 모든 get메서드로 보내는 api는 전부 다 주소에 해당하는 데이터가 노출이 되게 되는 문제가 발생할 수 있다
// 그래서 보안적으로도 post가 더 좋다
// 그리고 인증정보를 생성해서 받아온다는 내용이기 떄문에 post가 더 적합하다.
router.post('/login', async (req, res) => {
  try {
    const { nickname, password } = req.body;
    const user = await Users.findOne({ where: { nickname } });
    // #412 해당하는 유저가 존재하지 않는 경우
    if (!user || user.password !== password) {
      res.status(412).json({
        errorMessage: "닉네임 또는 패스워드를 확인해주세요.",
      });
      return;
    }
    // JWT 생성하기
    const token = jwt.sign({ userId: user.userId }, "customized-secret-key");
    res.cookie("Authorization", `Bearer ${token}`);
  
    return res.status(200).json({ token });

  } catch (error) {
    console.error(error);
    res.status(400).json({
      errorMessage: '로그인에 실패하였습니다.',
    });
  }
});
module.exports = router;

