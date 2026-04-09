import leftCandidateImage from "../assets/candidate-left.jpg";
import rightCandidateImage from "../assets/candidate-right.jpg";
import rizeImage from "../assets/리제.jpg";
import ricoImage from "../assets/리코.jpg";
import shibukiImage from "../assets/시부키.jpg";
import tabiImage from "../assets/타비.jpg";

export const voteTemplates = [
  {
    id: "oshi-no-ko",
    title: "최애는 누구?",
    leftCandidate: {
      id: "akane",
      name: "사쵸",
      image: leftCandidateImage,
      tone: "blue",
    },
    rightCandidate: {
      id: "kana",
      name: "유니",
      image: rightCandidateImage,
      tone: "pink",
    },
    shares: {
      left: 47,
      right: 53,
    },
  },
  {
    id: "more-stone",
    title: "누가 더 돌멩인지?",
    leftCandidate: {
      id: "rize",
      name: "리제",
      image: rizeImage,
      tone: "blue",
    },
    rightCandidate: {
      id: "tabi",
      name: "타비",
      image: tabiImage,
      tone: "pink",
    },
    shares: {
      left: 61,
      right: 39,
    },
  },
  {
    id: "hero-vs-fox-god",
    title: "용사 vs 여우신",
    leftCandidate: {
      id: "rico",
      name: "리코",
      image: ricoImage,
      tone: "blue",
    },
    rightCandidate: {
      id: "shibuki",
      name: "시부키",
      image: shibukiImage,
      tone: "pink",
    },
    shares: {
      left: 54,
      right: 46,
    },
  },
];

export const featuredVote = voteTemplates[0];
