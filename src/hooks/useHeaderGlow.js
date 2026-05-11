import { useScroll, useVelocity, useSpring, useTransform } from "framer-motion";

export const useHeaderGlow = () => {
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  
  // 스크롤 속도 변화를 스프링처럼 부드럽게 처리
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400
  });

  // 애니메이션 수치 강화: 조금만 스크롤해도 확실하게 보이도록 범위를 좁힘(-400 ~ 400)
  // 속도 < 0 (스크롤 올림): 빛이 아주 길게 퍼짐 (scaleY: 3, 투명도: 1)
  // 속도 = 0 (정지): 기본 상태 (scaleY: 1, 투명도: 0.5)
  // 속도 > 0 (스크롤 내림): 빛이 완전히 숨음 (scaleY: 0, 투명도: 0)
  const scaleY = useTransform(smoothVelocity, [-400, 0, 400], [4, 1, 0]);
  const opacity = useTransform(smoothVelocity, [-400, 0, 400], [1, 0.4, 0]);

  return { scaleY, opacity };
};
