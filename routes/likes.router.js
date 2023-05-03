const express = require("express");
const router = express.Router();
const { Likes, Posts } = require("../models");
const authMiddleware = require("../middlewares/auth-middleware");

// ========================= 게시물에 좋아요 등록, 취소 =========================
router.post("/posts/:postId/like", authMiddleware, async (req, res) => {
  try {
    const { userId } = res.locals.user;
    const { postId } = req.params;

    const post = await Posts.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: "게시물이 존재하지 않습니다." });
    }

    const likeFn = await Likes.findOne({
      where: { postId: postId, userId: userId },
    });

    if (!likeFn) {
      await Likes.create({ postId: postId, userId: userId });
      res.status(200).json({ message: "게시글의 좋아요를 등록하였습니다." });
    } else {
      await likeFn.destroy();
      res.status(200).json({ message: "게시글의 좋아요를 취소하였습니다." });
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "게시글 좋아요에 실패하였습니다." });
  }
});
// ========================= 좋아요 게시물 조회 =========================
router.get("/posts/like", authMiddleware, async (req, res) => {
  try {
    const { userId } = res.locals.user;
    //userId가 지금 locals에 저장된(로그인된) userId와 같은 값을 가진 Likes데이터를 저장
    const likes = await Likes.findAll({ where: { userId } });
  
    if (!likes) {
      res.status(400).json({ message: "좋아요 게시글이 존재하지 않습니다." });
    }

    const likePosts = await Likes.findAll({
      attributes: ["postId"], // 조회결과에서 가져올 속성 ('postId')
      include: [
        {
          model: Posts,
          required: true,
          attributes:['postId','userId','nickname','title','createdAt','updatedAt','likes'], // "content"컬럼값만 빼고 가져옴
        },
      ],
      where: { userId }, //locals의 userId가 같은 userId를 가진 데이터만 뽑아온다
    });

    // likePosts배열의 객체를 이용해 posts배열을 생성
    const postsLiked = likePosts.map((post) => {
      return {
        postId: post.postId,
        userId: post.Post.userId,
        nickname: post.Post.nickname,
        title: post.Post.title,
        likes: post.Post.likes,
        createdAt: post.Post.createdAt,
        updatedAt: post.Post.updatedAt,
      };
    });

    return res.status(200).json({ postsLiked });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "게시글 좋아요에 실패하였습니다." });
  }
});

module.exports = router;
