const form = document.getElementById("loginForm");
const message = document.getElementById("message");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const id = document.getElementById("username").value;
  const pw = document.getElementById("password").value;

  if (id === "admin" && pw === "1234") {
    message.textContent = "로그인 성공!";
    message.style.color = "green";
  } else {
    message.textContent = "아이디 또는 비밀번호 오류";
    message.style.color = "red";
  }
});

document.querySelector(".forgot a").addEventListener("click", (e) => {
  e.preventDefault();
  alert("비밀번호 찾기 페이지로 이동");
});
