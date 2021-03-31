/* inserted by pull.js */
import _twAsset0 from "./icon--mute.svg";
const _twGetAsset = (path) => {
  if (path === "/icon--mute.svg") return _twAsset0;
  throw new Error(`Unknown asset: ${path}`);
};

export default async function ({ addon, global, console }) {
  const vm = addon.tab.traps.vm;
  let muted = false;
  let icon = document.createElement("img");
  icon.loading = "lazy";
  icon.src = _twGetAsset("/icon--mute.svg");
  icon.style.display = "none";
  let ctrlPressesCount = 0;
  let ctrlPressedRecently = false;

  window.addEventListener("keydown", (event) => {
    if (event.ctrlKey) {
      ctrlPressesCount++;
      const pressCount = ctrlPressesCount;
      ctrlPressedRecently = true;
      setTimeout(() => {
        if (pressCount === ctrlPressesCount) ctrlPressedRecently = false;
      }, 2500);
    }
  });

  while (true) {
    let button = await addon.tab.waitForElement("[class^='green-flag_green-flag']", { markAsSeen: true });
    let container = button.parentElement;
    container.appendChild(icon);
    const clickListener = (e) => {
      if (ctrlPressedRecently) {
        e.cancelBubble = true;
        e.preventDefault();
        muted = !muted;
        if (muted) {
          vm.runtime.audioEngine.inputNode.gain.value = 0;
          icon.style.display = "block";
        } else {
          vm.runtime.audioEngine.inputNode.gain.value = 1;
          icon.style.display = "none";
        }
      }
    };
    button.addEventListener("click", clickListener);
    button.addEventListener("contextmenu", clickListener);
  }
}