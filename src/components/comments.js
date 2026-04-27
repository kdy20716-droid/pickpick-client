export const commentSeedItems = [
  {
    id: 1,
    name: "지나가던 픽커",
    text: "이건 너무 어렵다.",
    hoursAgo: 24,
    likes: 54,
    dislikes: 0,
    replyItems: [],
  },
  {
    id: 2,
    name: "밸런스 장인",
    text: "처음엔 왼쪽이었는데 다시 보니까 오른쪽도 끌림.",
    hoursAgo: 5,
    likes: 128,
    dislikes: 3,
    replyItems: [
      {
        id: 201,
        name: "고민중",
        text: "나도 계속 바뀌는 중.",
        hoursAgo: 4,
        likes: 12,
      },
      {
        id: 202,
        name: "구경꾼",
        text: "그래서 더 재밌음.",
        hoursAgo: 3,
        likes: 7,
      },
    ],
  },
  {
    id: 3,
    name: "익명",
    text: "댓글 보니까 더 못 고르겠네.",
    minutesAgo: 30,
    likes: 23,
    dislikes: 1,
    replyItems: [],
  },
];
