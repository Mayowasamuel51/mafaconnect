export const hapticFeedback = (type = "medium") => {
  if ("vibrate" in navigator) {
    switch (type) {
      case "light":
        navigator.vibrate(10);
        break;
      case "medium":
        navigator.vibrate(20);
        break;
      case "heavy":
        navigator.vibrate(40);
        break;
      default:
        navigator.vibrate(15);
        break;
    }
  }
};

// export const hapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'medium') => {
//   if ('vibrate' in navigator) {
//     switch (type) {
//       case 'light':
//         navigator.vibrate(10);
//         break;
//       case 'medium':
//         navigator.vibrate(20);
//         break;
//       case 'heavy':
//         navigator.vibrate(40);
//         break;
//     }
//   }
// };
