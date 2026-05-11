import { useScroll, useVelocity, useSpring, useTransform } from "framer-motion";

export const useHeaderGlow = () => {
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  
  // 스프링 효과를 더 부드럽고 탄력있게 조정
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 40,
    stiffness: 200
  });

  // 애니메이션 수치를 아주 크게 확장 (최대 15배 길이, 약 450px 이상 뻗어나감)
  // 스크롤 올릴 때 (-1000 이상의 속도): 빛이 화면 중간까지 깊게 뻗어나옴
  // 정지 시: 기본 얇은 빛
  // 스크롤 내릴 때: 빛이 위로 숨음
  const scaleY = useTransform(smoothVelocity, [-1500, 0, 1500], [20, 1, 0]);
  const opacity = useTransform(smoothVelocity, [-1500, 0, 1500], [0.8, 0.3, 0]);

  return { scaleY, opacity };
};
