import leftCandidateImage from "../assets/candidate-left.jpg";
import rightCandidateImage from "../assets/candidate-right.jpg";

export const voteTemplates = [
  {
    id: "oshi-no-ko",
    title: "최애는 누구?",
    leftCandidate: {
      id: "akane",
      name: "쿠로카와 아카네",
      image: leftCandidateImage,
      tone: "blue",
    },
    rightCandidate: {
      id: "kana",
      name: "아리마 카나",
      image: rightCandidateImage,
      tone: "pink",
    },
    shares: {
      left: 47,
      right: 53,
    },
  },
  {
    id: "duo-stage",
    title: "듀엣 무대는 누가 더 잘 어울려?",
    leftCandidate: {
      id: "stage-akane",
      name: "아카네",
      image: leftCandidateImage,
      tone: "blue",
    },
    rightCandidate: {
      id: "stage-kana",
      name: "카나",
      image: rightCandidateImage,
      tone: "pink",
    },
    shares: {
      left: 58,
      right: 42,
    },
  },
  {
    id: "visual-match",
    title: "비주얼 원픽은 누구?",
    leftCandidate: {
      id: "visual-akane",
      name: "푸른빛 아카네",
      image: leftCandidateImage,
      tone: "blue",
    },
    rightCandidate: {
      id: "visual-kana",
      name: "핑크빛 카나",
      image: rightCandidateImage,
      tone: "pink",
    },
    shares: {
      left: 36,
      right: 64,
    },
  },
  {
    id: "ending-fairy",
    title: "엔딩 요정 느낌은 누구?",
    leftCandidate: {
      id: "ending-akane",
      name: "차분한 아카네",
      image: leftCandidateImage,
      tone: "blue",
    },
    rightCandidate: {
      id: "ending-kana",
      name: "당찬 카나",
      image: rightCandidateImage,
      tone: "pink",
    },
    shares: {
      left: 51,
      right: 49,
    },
  },
];

export const featuredVote = voteTemplates[0];
