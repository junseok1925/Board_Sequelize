const express = require("express");
const router = express.Router();
const { Likes, Posts } = require("../models");
const authMiddleware = require("../middlewares/auth-middleware");

// ========================= 게시물에 좋아요 등록, 취소 =========================
router.post("/posts/:postId/like", authMiddleware, async (req, res) => {
  try {
	  // 현재 locals에 저장된 userId = 로그인된 유저
    const { userId } = res.locals.user;
    const { postId } = req.params;
		
		// 기본키(primary key)를 사용하여 모델을 조회하는 메서드
    // Posts 모델에서 postId가 기본키일 경우 postId를 가진 게시물 데이터를 조회
    const post = await Posts.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: "게시물이 존재하지 않습니다." });
    }
		// 이미 좋아요를 눌렀는지 확인하기위해
		// Likes모델에 해당 postId와 userId가 일치하는 데이터를 찾아 리턴
    const likeFn = await Likes.findOne({
      where: { postId: postId, userId: userId },
    });
		
    if (!likeFn) {
			//likeFn에 postId와 userId가 같은 데이터가 없으면 등록
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
// ========================= 좋아요 게시물 조회 =========================
router.get("/posts/like", authMiddleware, async (req, res) => {
  try {
    const { userId } = res.locals.user;
    //userId가 지금 locals에 저장된(로그인된) userId와 같은 값을 가진 Likes데이터를 저장
    const likes = await Likes.findAll({ where: { userId } });
  
    if (!likes) {
      res.status(400).json({ message: "좋아요 게시글이 존재하지 않습니다." });
    }
		// likePosts에는 해당 userId의 모든 좋아요 데이터가 저장
    // 각 데이터는 postId를 가지고 있으며, 
    // Posts 모델과 inner join하여 postId에 해당하는 Posts 데이터를 가져오게 된다
    // likePosts에는 현재 로그인된 userId가 좋아요를 누른 게시물의 postId를 가져오고,
    // 이 postId를 가진 게시물과 관련된 정보를 가져오는 것
    const likePosts = await Likes.findAll({
      attributes: ["postId"], // 조회결과에서 가져올 속성 ('postId')
      include: [
        {
          model: Posts, // Posts 모델을 조인
          required: true,
          attributes:['postId','userId','nickname','title','createdAt','updatedAt','likes'], // "content"컬럼값만 빼고 가져옴
        },
      ],
      where: { userId }, //locals의 userId가 같은 userId를 가진 데이터만 뽑아온다
    });

    // likePosts배열의 객체를 이용해 posts배열을 생성
    // ikePosts는 현재 로그인된 사용자가 좋아요를 누른 Posts 데이터를 가져온 후,
		//해당 데이터를 가진 Likes 테이블의 정보를 포함하여 조회한 결과
		//따라서 likePosts에는 현재 로그인된 사용자가 좋아요를 누른 Posts 데이터와 Likes 테이블의 정보가 모두 담겨있다
    const postsLiked = likePosts.map((post) => {
		// likePosts배열을 순회하면서 postLiked에 객체를 추가
		// post는 likePosts 배열의 각 요소를 담아져있다
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
