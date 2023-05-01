const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");
const { Posts } = require("../models");

// ===================================게시글 생성 api ===================================
router.post("/posts", authMiddleware, async (req, res) => {
  try {
    const { userId, nickname } = res.locals.user;
    const { title, content } = req.body;

    if (!title) {
      return res
        .status(412)
        .json({ errorMessage: "게시글 제목의 형식이 일치하지 않습니다" });
    }
    if (!content) {
      return res
        .status(412)
        .json({ errorMessage: "게시글 내용의 형식이 일치하지 않습니다" });
    }

    const createPost = await Posts.create({
      userId: userId,
      nickname: nickname,
      title,
      content,
    });
    return res
      .status(201)
      .json({ message: "게시글 등록완료", data: createPost });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      errorMessage: "게시글 작성에 실패하였습니다.",
    });
  }
});

// ===================================게시글목록 조회 api ===================================
router.get("/posts", async (req, res) => {
  try {
    const posts = await Posts.findAll({
      attributes: [
        "postId",
        "userId",
        "nickname",
        "title",
        "createdAt",
        "updatedAt",
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ data: posts });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      errorMessage: "게시글 조회에 실패하였습니다.",
    });
  }
});

// ===================================게시글 상세조회 api ===================================
router.get("/posts/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    if (!postId) {
      return res.status(404).json({ errorMessage: "게시글이 존재하지않습니다." });
    };
    const post = await Posts.findOne({
      attributes: [
        "postId",
        "userId",
        "nickname",
        "title",
        "createdAt",
        "updatedAt",
      ],
      where: { postId },
    });

    return res.status(200).json({ data: post });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      errorMessage: "게시글 상세조회에 실패하였습니다.",
    });
  }
});
// ===================================게시글 수정 api ===================================
router.put("/posts/:postId", authMiddleware, async (req, res) => {
  try {
    const { userId } = res.locals.user;
    const { postId } = req.params;
    const { title, content } = req.body;
    const post = await Posts.findOne({ where: { postId } });

    if (!title) {
      return res.status(412).json({ errorMessage: "게시글 제목의 형식이 일치하지 않습니다." });
    };
    if (!content) {
      return res.status(412).json({ errorMessage: "게시글 내용의 형식이 일치하지 않습니다." });
    };
    if (userId !== post.userId) {
      return res.status(403).json({ errorMessage: "게시글을 수정의 권한이 존재하지 않습니다." });
    };
    // 게시글 업데이트
    const updatePost = await Posts.update(
      { title, content, updatedAt: new Date() },
      { where: {postId} } //findByIdAndUpdate메서드가 수정된 데이터를 반환할지 결정한다
      //기본값으론 수정전 데이터를 반환하지만 new: true를 사용하면 수정된 문서가 반환된다.
    );

    res.status(200).json({message: "게시글이 수정되었습니다."});
  } catch (error) {
    console.error(error);
    res.status(401).json({
      success: false,
      errorMessage: "게시글 수정에 실패하였습니다.",
    });
  }
});

// ===================================게시글 삭제 api ===================================
router.delete("/posts/:postId", authMiddleware, async (req, res) => {
    try{
    const { userId } = res.locals.user;
    const { postId } = req.params;
    const post = await Posts.findOne({where:{postId}});

    if(!post){
        return res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." });
    }
    if(userId !== post.userId){
        return res.status(403).json({ errorMessage: "게시글을 삭제의 권한이 없습니다." });
    }

    await Posts.destroy({where: {postId}});
    res.status(200).json({message: "게시글이 삭제되었습니다."});
    
} catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      errorMessage: "게시글 삭제에 실패하였습니다.",
    });
  }
});
module.exports = router;