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
      postId,
      userId: userId,
      nickname: nickname,
      comment,
    });
    return res
      .status(201)
      .json({ message: "댓글을 작성하였습니다", data: createComments });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      errorMessage: "댓글 작성에 실패하였습니다.",
    });
  }
});

// ==================================== 댓글 목록 조회하기 ====================================
router.get("/posts/:postId/comments", authMiddleware, async (req, res) => {
  try {
    const postId = req.params.postId;

    if (!postId) {
      return res
        .status(404)
        .json({ errorMessage: "게시글이 존재하지않습니다." });
    }
    const comments = await Comments.findAll({
      attributes: [
        "commentId",
        "userId",
        "nickname",
        "comment",
        "createdAt",
        "updatedAt",
      ],
      where: { postId },
    });
    return res.status(200).json({ data: comments });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      errorMessage: "댓글 조회에 실패하였습니다.",
    });
  }
});

// ==================================== 댓글 수정하기 ====================================
router.put('/posts/:postId/comments/:commentId', authMiddleware, async (req, res) => {
  try {
    const { userId } = res.locals.user;
    const commentId = req.params.commentId;
    const postId = req.params.postId;
    const { comment } = req.body;

    if (!comment) {
      return res.status(412).json({
        message: '데이터 형식이 올바르지 않습니다.',
      });
    }

    if (!postId) {
      return res.status(404).json({
        message: '게시글이 존재하지 않습니다.',
      });
    }

    // Primary Key (기본 키)를 사용하여 특정 레코드를 찾는 메서드. 여기서는 commentId를 기본 키로 사용하여 댓글을 찾는다.
    const getComment = await Comments.findByPk(commentId);
    if (!getComment) {
      return res.status(404).json({
        success: false,
        errorMessage: '댓글 존재하지 않습니다.',
      });
    }

    if (getComment.userId !== userId) {
      return res.status(403).json({
        success: false,
        errorMessage: '해당 댓글을 수정할 권한이 없습니다.',
      });
    }
    // Comments의 데이터중 commentId가 같은 데이터의 comment값을 입력값으로 업데이트
    const [updateComments] = await Comments.update(
      { comment },
      { where: { commentId: commentId } }
    );

    if (updateComments === 0) {
      return res.status(400).json({
        success: false,
        errorMessage: '댓글 수정에 실패하였습니다.',
      });
    }

    const updatedComments = await Comments.findByPk(commentId);

    res.json({
      message: '댓글이 수정되었습니다.',
      수정완료: {
        comment: updatedComments.comment,
        createdAt: updatedComments.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      errorMessage: '댓글 수정에 실패하였습니다.',
    });
  }
});
// ==================================== 댓글 삭제하기 ====================================

router.delete("/posts/:postId/comments/:commentId", authMiddleware, async (req, res) => {
  try{
  const { userId } = res.locals.user;
  const  postId  = req.params.postId;
  const commentId= req.params.commentId;
  const comment = await Comments.findOne({where:{commentId}});

  if(!postId){
      return res.status(404).json({ errorMessage: "게시물이 존재하지 않습니다." });
  }
  if(!commentId){
    return res.status(404).json({ errorMessage: "댓글이 존재하지 않습니다." });
}
  if(userId !== comment.userId){
      return res.status(403).json({ errorMessage: "댓글을 삭제의 권한이 없습니다." });
  }

  await Comments.destroy({where: {commentId}});
  res.status(200).json({message: "댓글이 삭제되었습니다."});
  
} catch (error) {
  console.error(error);
  res.status(400).json({
    success: false,
    errorMessage: "댓글 삭제에 실패하였습니다.",
  });
}
});
module.exports = router;
