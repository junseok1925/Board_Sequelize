const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");
const { Comments } = require("../models");
// const { Posts} = require("../models");

// ==================================== 댓글 생성하기 ====================================
router.post("/posts/:postId/comments", authMiddleware, async (req, res) => {
  try {
    const postId = req.params.postId;
    const { userId, nickname } = res.locals.user;
    const { comment } = req.body;

    if (!postId) {
      return res
        .status(404)
        .json({ errorMessage: "게시글이 존재하지 않습니다." });
    }
    if (!comment) {
      return res
        .status(412)
        .json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
    }

    const createComments = await Comments.create({
      postId: postId,
      userId: userId,
      nickname: nickname,
      comment,
    });
    return res
      .status(201)
      .json({ message: "게시글 등록완료", data: createComments });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      errorMessage: "게시글 작성에 실패하였습니다.",
    });
  }
});

module.exports = router;